import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageCircle,
  ArrowRight,
  FileText,
  Calendar,
  Zap,
  MapPin,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  Eye,
  X,
  UserCheck
} from 'lucide-react';
import {
  fetchAllLeads,
  updateLeadStatus,
  deleteLeadRecord,
  saveLeadToFirestore,
  subscribeToLeadsFromFirestore,
  StoredLeadRecord
} from '../../lib/firebase';
import { CrmUser } from '../../data/crmData';
import {
  TaskWorkflowTemplate,
  ActiveLeadWorkflow,
  createLeadWorkflowFromTemplate,
} from '../../data/workflowTemplateData';

interface InboundLeadsPipelineProps {
  currentUser?: CrmUser;
  staffUsers?: CrmUser[];
  onConvertToTask?: (lead: StoredLeadRecord) => void;
  onRecordAudit?: (action: string, details: string) => void;
  taskWorkflowTemplates?: TaskWorkflowTemplate[];
  onAttachLeadWorkflow?: (workflow: ActiveLeadWorkflow) => void;
}

const SAMPLE_STARTER_LEADS: StoredLeadRecord[] = [
  {
    id: 'lead-live-1',
    fullName: 'Er. Rajeshwar Nath Pandey',
    phone: '+91 94152 77890',
    email: 'rajeshwar.pandey@gmail.com',
    location: '12/B Tagore Town, Near Colonelganj Inter College, Prayagraj',
    propertyType: 'Home / Residential',
    monthlyBillRs: '4800',
    desiredCapacityKw: '4',
    roofType: 'RCC Flat Roof',
    uppclAccountNumber: '7219803412',
    sanctionedLoadKw: '5',
    status: 'new',
    source: 'site-survey-modal',
    message: 'Looking for 4kW on-grid solar system under PM Surya Ghar Muft Bijli Yojana with Net Metering.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'lead-live-2',
    fullName: 'Shri Manoj Kumar Jaiswal',
    phone: '+91 98390 44521',
    email: 'manoj.jaiswal.alld@yahoo.com',
    location: 'Opposite High Court Gate No 3, Nyaya Marg, Cantonment, Prayagraj',
    propertyType: 'Commercial',
    monthlyBillRs: '14200',
    desiredCapacityKw: '10',
    roofType: 'Tin / Metal Sheet',
    uppclAccountNumber: '7108924376',
    sanctionedLoadKw: '12',
    status: 'contacted',
    source: 'commercial-calculator',
    message: 'Need rooftop solar for legal office & commercial complex. High daytime AC consumption.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'lead-live-3',
    fullName: 'Smt. Shashi Prabha Mishra',
    phone: '+91 99180 33419',
    email: 'shashi.mishra1968@gmail.com',
    location: 'Plot 88, Sector 3, Awas Vikas Colony, Jhalwa, Prayagraj',
    propertyType: 'Home / Residential',
    monthlyBillRs: '3200',
    desiredCapacityKw: '3',
    roofType: 'RCC Flat Roof',
    uppclAccountNumber: '7392817409',
    sanctionedLoadKw: '3',
    status: 'survey_scheduled',
    source: 'uppcl-bill-upload-section',
    message: 'Electricity bill uploaded. Urgent rooftop shadow analysis requested.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const InboundLeadsPipeline: React.FC<InboundLeadsPipelineProps> = ({
  currentUser,
  staffUsers = [],
  onConvertToTask,
  onRecordAudit,
  taskWorkflowTemplates = [],
  onAttachLeadWorkflow,
}) => {
  const [leads, setLeads] = useState<StoredLeadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'survey_scheduled' | 'installed' | 'cancelled'>('all');
  const [selectedBillLead, setSelectedBillLead] = useState<StoredLeadRecord | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => taskWorkflowTemplates?.[0]?.id || ''
  );

  // Sync default template when templates load
  useEffect(() => {
    if (!selectedTemplateId && taskWorkflowTemplates && taskWorkflowTemplates.length > 0) {
      setSelectedTemplateId(taskWorkflowTemplates[0].id);
    }
  }, [taskWorkflowTemplates, selectedTemplateId]);

  // New Lead Form state
  const [newLead, setNewLead] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    propertyType: 'Home / Residential',
    monthlyBillRs: '3500',
    desiredCapacityKw: '3',
    roofType: 'RCC Flat Roof',
    uppclAccountNumber: '',
    sanctionedLoadKw: '3',
    message: '',
  });

  const loadLeads = async () => {
    setLoading(true);
    try {
      const live = await fetchAllLeads(100);
      const localStr = localStorage.getItem('dilip_crm_inbound_leads_v2');
      const localList: StoredLeadRecord[] = localStr ? JSON.parse(localStr) : SAMPLE_STARTER_LEADS;

      // Smart merge: ensure no local manual lead is overwritten by remote snapshot
      const map = new Map<string, StoredLeadRecord>();
      (localList || []).forEach((l) => map.set(l.id, l));
      (live || []).forEach((l) => map.set(l.id, l));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeads(merged);
      localStorage.setItem('dilip_crm_inbound_leads_v2', JSON.stringify(merged));
    } catch (err) {
      console.warn('Firestore leads fetch fallback:', err);
      const local = localStorage.getItem('dilip_crm_inbound_leads_v2');
      setLeads(local ? JSON.parse(local) : SAMPLE_STARTER_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    // Real-time listener for incoming leads
    const unsubscribe = subscribeToLeadsFromFirestore((remoteLeads) => {
      if (remoteLeads && remoteLeads.length > 0) {
        setLeads((prevLeads) => {
          const map = new Map<string, StoredLeadRecord>();
          (prevLeads || []).forEach((l) => map.set(l.id, l));
          remoteLeads.forEach((l) => map.set(l.id, l));
          const updated = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          try {
            localStorage.setItem('dilip_crm_inbound_leads_v2', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: StoredLeadRecord['status']) => {
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch (e) {
      // Local fallback
    }

    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);
    localStorage.setItem('dilip_crm_inbound_leads_v2', JSON.stringify(updated));

    const lead = leads.find((l) => l.id === leadId);
    if (onRecordAudit) {
      onRecordAudit(
        'LEAD_STATUS_UPDATED',
        `${currentUser?.name || 'User'} changed lead "${lead?.fullName || leadId}" status to "${newStatus}"`
      );
    }
  };

  const handleDeleteLead = async (lead: StoredLeadRecord) => {
    if (!window.confirm(`Are you sure you want to completely delete "${lead.fullName}"?\n\nThis will perform a Complete Cascade Delete removing all associated tasks, active workflow SOPs, and directives across all staff panels.`)) return;
    try {
      await deleteLeadRecord(lead.id, {
        fullName: lead.fullName,
        phone: lead.phone,
      });
    } catch (e) {}
    const filtered = leads.filter((l) => l.id !== lead.id);
    setLeads(filtered);
    localStorage.setItem('dilip_crm_inbound_leads_v2', JSON.stringify(filtered));
    if (onRecordAudit) {
      onRecordAudit(
        'LEAD_DELETED',
        `${currentUser?.name || 'User'} deleted lead inquiry with Cascade Delete for "${lead.fullName}" (${lead.phone})`
      );
    }
  };

  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdRecord: StoredLeadRecord = {
      id: `lead-manual-${Date.now()}`,
      fullName: newLead.fullName.trim(),
      phone: newLead.phone.trim(),
      email: newLead.email.trim(),
      location: newLead.location.trim() || 'Prayagraj',
      propertyType: newLead.propertyType as any,
      monthlyBillRs: newLead.monthlyBillRs,
      desiredCapacityKw: newLead.desiredCapacityKw,
      roofType: newLead.roofType as any,
      uppclAccountNumber: newLead.uppclAccountNumber.trim(),
      sanctionedLoadKw: newLead.sanctionedLoadKw,
      message: newLead.message.trim(),
      status: 'new',
      source: 'manual-crm-entry',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveLeadToFirestore(createdRecord, 'manual-crm-entry');
    } catch (e) {}

    const updated = [createdRecord, ...leads];
    setLeads(updated);
    localStorage.setItem('dilip_crm_inbound_leads_v2', JSON.stringify(updated));

    // Also IMMEDIATELY synchronize and add as an active CRM Task so it is visible in "All Tasks & Leads" and pipeline!
    if (onConvertToTask) {
      onConvertToTask(createdRecord);
    } else if (onAttachLeadWorkflow && taskWorkflowTemplates && taskWorkflowTemplates.length > 0) {
      // Fallback: If not converted to task, instantiate standalone workflow
      const tmpl =
        (selectedTemplateId && selectedTemplateId !== 'none'
          ? taskWorkflowTemplates.find((t) => t.id === selectedTemplateId)
          : undefined) ||
        taskWorkflowTemplates.find((t) => t.category?.toLowerCase().includes('solar')) ||
        taskWorkflowTemplates[0];

      if (tmpl) {
        const newWf = createLeadWorkflowFromTemplate(
          tmpl,
          {
            leadId: createdRecord.id,
            customerName: createdRecord.fullName,
            customerPhone: createdRecord.phone,
            customerAddress: createdRecord.location,
            capacityKw: parseFloat(createdRecord.desiredCapacityKw) || 3,
          },
          staffUsers || []
        );
        onAttachLeadWorkflow(newWf);
      }
    }

    onRecordAudit(
      'LEAD_CREATED',
      `${currentUser?.name || 'Owner'} created new lead inquiry for "${createdRecord.fullName}" (${createdRecord.phone})`
    );

    setIsAddLeadOpen(false);
    setSelectedTemplateId(taskWorkflowTemplates?.[0]?.id || '');
    setNewLead({
      fullName: '',
      phone: '',
      email: '',
      location: '',
      propertyType: 'Home / Residential',
      monthlyBillRs: '3500',
      desiredCapacityKw: '3',
      roofType: 'RCC Flat Roof',
      uppclAccountNumber: '',
      sanctionedLoadKw: '3',
      message: '',
    });
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        l.fullName.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        (l.uppclAccountNumber && l.uppclAccountNumber.includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (st: StoredLeadRecord['status']) => {
    switch (st) {
      case 'new':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold';
      case 'contacted':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'survey_scheduled':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'installed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner & Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-700" />
            <span>Website Customer Inquiries & Inbound Leads</span>
            <span className="bg-indigo-100 text-indigo-900 text-xs px-2 py-0.5 rounded-full font-bold">
              {leads.length} Leads
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time consultation requests, UPPCL bill uploads & quotation inquiries. Click "Convert to Project Task" to assign to an engineer!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Live</span>
          </button>

          {currentUser?.role === 'owner' && (
            <button
              type="button"
              onClick={() => setIsAddLeadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs shadow cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead Manually</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by customer, phone, location, UPPCL #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {(['all', 'new', 'contacted', 'survey_scheduled', 'installed', 'cancelled'] as const).map((st) => {
            const count = st === 'all' ? leads.length : leads.filter((l) => l.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize font-bold cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 text-xs ${
                  statusFilter === st
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{st === 'survey_scheduled' ? 'Survey Scheduled' : st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredLeads.map((lead) => {
          const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
          const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{lead.fullName}</h4>
                    <span className="text-[10px] font-medium text-slate-500">
                      Received: {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize cursor-pointer focus:outline-none ${getStatusBadge(
                      lead.status
                    )}`}
                  >
                    <option value="new">1. New</option>
                    <option value="contacted">2. Contacted</option>
                    <option value="survey_scheduled">3. Survey Scheduled</option>
                    <option value="installed">4. Installed</option>
                    <option value="cancelled">5. Cancelled</option>
                  </select>
                </div>

                {/* Key Specs */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {lead.desiredCapacityKw} kW • {lead.propertyType}
                    </span>
                    {lead.monthlyBillRs && (
                      <span className="text-slate-700">
                        Bill: ₹{Number(lead.monthlyBillRs).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-1 text-slate-600 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{lead.location}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-slate-700">
                    <span className="font-bold">{lead.phone}</span>
                    {lead.uppclAccountNumber && (
                      <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        UPPCL: {lead.uppclAccountNumber}
                      </span>
                    )}
                  </div>

                  {lead.message && (
                    <div className="mt-1 pt-1 border-t border-slate-200/80 text-[11px] text-slate-600 italic line-clamp-2">
                      "{lead.message}"
                    </div>
                  )}

                  {/* Uploaded Bill Indicator */}
                  {lead.billFileName && (
                    <div className="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-blue-800 font-semibold flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>Bill Uploaded: {lead.billFileName}</span>
                      </span>
                      {lead.billFileData && (
                        <button
                          type="button"
                          onClick={() => setSelectedBillLead(lead)}
                          className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Hello ${lead.fullName}! Regarding your ${lead.desiredCapacityKw}kW rooftop solar inquiry with Dilip Enterprises Solar Solutions, Prayagraj.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {currentUser?.role === 'owner' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete lead record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* THE 1-CLICK CONVERT TO TASK BUTTON */}
                {onConvertToTask && (
                  <button
                    type="button"
                    onClick={() => onConvertToTask(lead)}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs py-2 rounded-lg shadow-xs cursor-pointer transition-all active:scale-98"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Convert to Active Project & Assign</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No customer inquiries found matching the selected filter.
        </div>
      )}

      {/* Bill Preview Modal */}
      {selectedBillLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Customer Electricity Bill Document</h4>
                <p className="text-xs text-slate-500">
                  {selectedBillLead.fullName} • UPPCL: {selectedBillLead.uppclAccountNumber || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedBillLead(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-50 rounded-xl my-2 p-2">
              {selectedBillLead.billFileData?.startsWith('data:image') ? (
                <img
                  src={selectedBillLead.billFileData}
                  alt="Customer Bill"
                  className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
                />
              ) : selectedBillLead.billFileData?.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedBillLead.billFileData}
                  title="PDF Bill Viewer"
                  className="w-full h-[60vh] rounded-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p>Document: {selectedBillLead.billFileName}</p>
                  <a
                    href={selectedBillLead.billFileData}
                    download={selectedBillLead.billFileName || 'uppcl_bill'}
                    className="mt-3 inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBillLead(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">Add Customer Lead Manually</h3>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Swaroop"
                  value={newLead.fullName}
                  onChange={(e) => setNewLead({ ...newLead, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9415..."
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desired Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={newLead.desiredCapacityKw}
                    onChange={(e) => setNewLead({ ...newLead, desiredCapacityKw: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Location / Area in Prayagraj *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Lines, Near Subhash Chauraha"
                  value={newLead.location}
                  onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={newLead.propertyType}
                    onChange={(e) => setNewLead({ ...newLead, propertyType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none"
                  >
                    <option value="Home / Residential">Home / Residential</option>
                    <option value="Commercial Enterprise">Commercial Enterprise</option>
                    <option value="Industrial Factory">Industrial Factory</option>
                    <option value="Agricultural Farm">Agricultural Farm</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Electricity Bill (₹)</label>
                  <input
                    type="number"
                    value={newLead.monthlyBillRs}
                    onChange={(e) => setNewLead({ ...newLead, monthlyBillRs: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UPPCL 10-Digit Account #</label>
                  <input
                    type="text"
                    placeholder="e.g. 7218492019"
                    value={newLead.uppclAccountNumber}
                    onChange={(e) => setNewLead({ ...newLead, uppclAccountNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roof Type</label>
                  <select
                    value={newLead.roofType}
                    onChange={(e) => setNewLead({ ...newLead, roofType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none"
                  >
                    <option value="RCC Flat Roof">RCC Flat Roof</option>
                    <option value="Tin / Metal Sheet">Tin / Metal Sheet</option>
                    <option value="Ground Mount">Ground Mount</option>
                    <option value="Elevated Structure">Elevated Structure</option>
                  </select>
                </div>
              </div>

              {/* Task Template (2-Step Flowchart) Selector */}
              {taskWorkflowTemplates && taskWorkflowTemplates.length > 0 && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                  <label className="block text-xs font-bold text-blue-950">
                    Attach Task Template (Automated 2-Step Flowchart)
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full text-xs font-semibold border border-blue-300 rounded-lg p-2 bg-white focus:outline-none"
                  >
                    <option value="none">-- No Workflow Template (Standard Lead) --</option>
                    {taskWorkflowTemplates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title} ({tmpl.steps.length} Steps)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-blue-800 leading-tight">
                    ⚡ On creation, notification triggers <strong>only for Task 1 and Task 2 assigned staff</strong>. All tasks default to <em>1. Not Started</em>, and cascade upon work progress updates.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Inquiries / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wants 3-phase connection check and subsidy information."
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg font-bold shadow-xs"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
