import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle, Phone, MapPin, Edit3, Briefcase, Search, CheckCircle2, RotateCcw } from 'lucide-react';
import { ComplaintTicket, CrmUser, CrmTask } from '../../data/crmData';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUsers: CrmUser[];
  currentUser: CrmUser;
  userTasks?: CrmTask[];
  complaintToEdit?: ComplaintTicket | null;
  onSaveComplaint: (complaintData: Partial<ComplaintTicket>) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  staffUsers,
  currentUser,
  userTasks = [],
  complaintToEdit,
  onSaveComplaint,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Retained state with sensible defaults for backward compatibility
  const [systemCapacity, setSystemCapacity] = useState('5 kW On-Grid');
  const [issueType, setIssueType] = useState('Customer Complaint');
  const [priority, setPriority] = useState<ComplaintTicket['priority']>('High');
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [ownerInstructions, setOwnerInstructions] = useState('');

  const employees = useMemo(
    () => staffUsers.filter((u) => u.status === 'active'),
    [staffUsers]
  );

  const availableProjects = useMemo(() => {
    return userTasks || [];
  }, [userTasks]);

  // Instant search filtering by Customer Name, Phone Number, or Task Code
  const filteredProjects = useMemo(() => {
    if (!projectSearchTerm.trim()) return availableProjects;
    const q = projectSearchTerm.toLowerCase().trim();
    return availableProjects.filter((p) => {
      const name = (p.customerName || '').toLowerCase();
      const ph = (p.customerPhone || '').toLowerCase();
      const code = (p.taskCode || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const addr = (p.customerAddress || '').toLowerCase();
      return name.includes(q) || ph.includes(q) || code.includes(q) || title.includes(q) || addr.includes(q);
    });
  }, [availableProjects, projectSearchTerm]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return availableProjects.find((p) => p.id === selectedProjectId) || null;
  }, [availableProjects, selectedProjectId]);

  useEffect(() => {
    if (!isOpen) return;

    if (complaintToEdit) {
      setSelectedProjectId(complaintToEdit.taskId || '');
      setProjectSearchTerm('');
      setCustomerName(complaintToEdit.customerName || '');
      setPhone(complaintToEdit.phone || '');
      setAddress(complaintToEdit.address || '');
      setSystemCapacity(complaintToEdit.systemCapacity || '5 kW On-Grid');
      setIssueType(complaintToEdit.issueType || 'Customer Complaint');
      setDescription(complaintToEdit.description || '');
      setPriority(complaintToEdit.priority || 'High');
      setAssignedToUserId(complaintToEdit.assignedToUserId || employees[0]?.id || '');
      setOwnerInstructions(complaintToEdit.ownerInstructions || '');
    } else {
      setSelectedProjectId('');
      setProjectSearchTerm('');
      setCustomerName('');
      setPhone('');
      setAddress('Prayagraj');
      setSystemCapacity('5 kW On-Grid');
      setIssueType('Customer Complaint');
      setDescription('');
      setPriority('High');
      setAssignedToUserId(currentUser?.id || (employees[0]?.id || ''));
      setOwnerInstructions('');
    }
  }, [complaintToEdit, isOpen]);

  // When user selects a project from search/dropdown
  const handleProjectSelect = (taskId: string) => {
    setSelectedProjectId(taskId);
    if (!taskId) {
      return;
    }
    const proj = availableProjects.find((p) => p.id === taskId);
    if (proj) {
      setCustomerName(proj.customerName || '');
      setPhone(proj.customerPhone || '');
      setAddress(proj.customerAddress || 'Prayagraj');
      setSystemCapacity(`${proj.capacityKw || 5} kW ${proj.systemType || 'On-Grid'}`);
    }
  };

  const handleClearProject = () => {
    setSelectedProjectId('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = staffUsers.find((u) => u.id === assignedToUserId);
    const chosenProject = availableProjects.find((p) => p.id === selectedProjectId);

    onSaveComplaint({
      taskId: chosenProject ? chosenProject.id : complaintToEdit?.taskId,
      taskCode: chosenProject ? chosenProject.taskCode : complaintToEdit?.taskCode,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      systemCapacity: chosenProject ? `${chosenProject.capacityKw || 5} kW ${chosenProject.systemType || 'On-Grid'}` : systemCapacity,
      issueType: issueType || 'Customer Complaint',
      description: description.trim(),
      priority,
      assignedToUserId: assignedToUserId || (currentUser?.id || ''),
      assignedTo: assignedUser ? assignedUser.name : (currentUser?.name || 'Unassigned'),
      assignedBy: currentUser?.name || 'Staff',
      ownerInstructions: ownerInstructions.trim() || (complaintToEdit?.ownerInstructions || ''),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              {complaintToEdit ? <Edit3 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {complaintToEdit
                  ? `Edit Ticket ${complaintToEdit.ticketNo}`
                  : 'Register Customer Complaint'}
              </h3>
              <p className="text-xs text-slate-500">
                {complaintToEdit
                  ? 'Update customer details or complaint description.'
                  : 'Customer ki complaint details fill karein. Sabhi team members ko notification mil jayega.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* PROJECT AVAILABLE (OPTIONAL) - SEARCH BY CUSTOMER NAME OR PHONE */}
          <div className="p-3.5 bg-blue-50/80 dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                <Briefcase className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Project Available (Optional)</span>
              </label>
              <span className="text-[10px] bg-blue-200/90 dark:bg-blue-900/60 text-blue-950 dark:text-blue-200 font-extrabold px-2 py-0.5 rounded-full">
                {availableProjects.length} Projects Available
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Customer ka <strong>Name</strong> ya <strong>Phone Number</strong> daal kar search karein. Select karne par Name, Phone aur Address apne aap fill ho jayenge:
            </p>

            {/* Quick Search Box for Customer Name or Phone Number */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                placeholder="🔍 Customer ka Name ya Phone Number type karein (e.g. Anju, 98380, Dwivedi)..."
                className="w-full bg-white dark:bg-slate-900 border border-blue-300 dark:border-slate-600 rounded-lg pl-8 pr-7 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {projectSearchTerm && (
                <button
                  type="button"
                  onClick={() => setProjectSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Matching Results Chips (if user typed search term) */}
            {projectSearchTerm.trim() && filteredProjects.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Matching Projects ({filteredProjects.length}):
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {filteredProjects.slice(0, 5).map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    return (
                      <button
                        key={`chip-${proj.id}`}
                        type="button"
                        onClick={() => handleProjectSelect(proj.id)}
                        className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{proj.customerName}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {proj.taskCode}
                            </span>
                          </div>
                          <div className={`text-[10px] flex items-center gap-2 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {proj.customerPhone && <span>📞 {proj.customerPhone}</span>}
                            {proj.customerAddress && <span className="truncate max-w-[200px]">📍 {proj.customerAddress}</span>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isSelected ? '✓ Selected' : 'Select'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project Dropdown (Filtered by Search) */}
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full border border-blue-300 dark:border-slate-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Standalone Customer Complaint (No Project Link) --</option>
              {filteredProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.customerName} {proj.customerPhone ? `(${proj.customerPhone})` : ''} - {proj.taskCode} ({proj.capacityKw || 5}kW)
                </option>
              ))}
            </select>

            {/* Selected Project Highlight Chip */}
            {selectedProject ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg px-2.5 py-1.5 text-[11px] text-emerald-950 dark:text-emerald-200">
                <span className="flex items-center gap-1.5 font-semibold truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Auto-filled from <strong>{selectedProject.customerName}</strong> ({selectedProject.taskCode})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleClearProject}
                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-[10px] font-bold underline shrink-0 ml-2 cursor-pointer flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Link
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                Tip: New customer ya out-of-warranty customer ke liye seedhe neeche fields fill karein.
              </p>
            )}
          </div>

          {/* 1. CUSTOMER FULL NAME */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Customer Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ashok Agrawal"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* 2. PHONE NUMBER */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone Number <span className="text-rose-600">*</span></span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 94151 XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* 3. INSTALLATION SITE ADDRESS */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Installation Site Address (Prayagraj) <span className="text-rose-600">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Near Medical College, Lowther Road, Prayagraj"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* 4. CUSTOM COMPLAINTS DESCRIPTION */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Custom Complaints Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Inverter display shows 'Grid Overvoltage' error 02. Inverter turns off in afternoon. Please check site urgently."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              {complaintToEdit ? 'Save Ticket Changes' : 'Register Complaint Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


