import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Wrench, AlertTriangle, MessageSquare, Send, User, MapPin, Phone, History } from 'lucide-react';
import { ComplaintTicket, CrmUser, CrmTaskStatus } from '../../data/crmData';

interface ComplaintServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintTicket | null;
  currentUser: CrmUser;
  onUpdateComplaint: (
    complaintId: string,
    newStatus: CrmTaskStatus,
    reportData: {
      message?: string;
      rootCause?: string;
      partsReplaced?: string;
      resolutionNotes?: string;
    }
  ) => void;
}

export const ComplaintServiceReportModal: React.FC<ComplaintServiceReportModalProps> = ({
  isOpen,
  onClose,
  complaint,
  currentUser,
  onUpdateComplaint,
}) => {
  const currentTaskStatus: CrmTaskStatus =
    (complaint?.status as CrmTaskStatus) === 'compleated' ||
    complaint?.status === 'Resolved' ||
    complaint?.status === 'Closed'
      ? 'compleated'
      : (complaint?.status as CrmTaskStatus) === 'in progress' ||
        complaint?.status === 'In Progress'
      ? 'in progress'
      : (complaint?.status as CrmTaskStatus) === 'pending'
      ? 'pending'
      : (complaint?.status as CrmTaskStatus) === 'on hold'
      ? 'on hold'
      : 'not started';

  const [selectedStatus, setSelectedStatus] = useState<CrmTaskStatus>(currentTaskStatus);
  const [progressMessage, setProgressMessage] = useState('');
  const [rootCause, setRootCause] = useState(complaint?.rootCause || '');
  const [partsReplaced, setPartsReplaced] = useState(complaint?.partsReplaced || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || '');

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateComplaint(complaint.id, selectedStatus, {
      message: progressMessage.trim() || undefined,
      rootCause: rootCause.trim() || undefined,
      partsReplaced: partsReplaced.trim() || undefined,
      resolutionNotes: resolutionNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {complaint.ticketNo}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {complaint.priority} Priority
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Service Progress & Technician Report: {complaint.customerName}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Complaint Info Banner */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer</span>
              <span className="font-bold text-slate-900">{complaint.customerName}</span>
              <div className="flex items-center gap-1 text-slate-600 text-[11px] mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <a href={`tel:${complaint.phone}`} className="hover:underline text-blue-600 font-medium">
                  {complaint.phone}
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Installation Site</span>
              <div className="flex items-start gap-1 text-slate-700 font-medium text-[11px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>{complaint.address}</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded inline-block mt-1">
                {complaint.systemCapacity}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Technician</span>
              <span className="font-bold text-slate-900">{complaint.assignedTo}</span>
              <span className="block text-[11px] text-slate-500">Logged: {complaint.createdAt}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-rose-900">Reported Problem ({complaint.issueType}): </span>
            <span className="text-slate-800">{complaint.description}</span>
          </div>

          {complaint.ownerInstructions && (
            <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-950 font-medium text-[11px]">
              <span className="font-bold">Dilip Enterprises (Owner)'s Instruction: </span>
              {complaint.ownerInstructions}
            </div>
          )}
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Status Selection (The exact 5 CRM statuses) */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span>Update Ticket Status *</span>
              <span className="text-[11px] text-slate-500 font-normal">Current: {complaint.status}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(['not started', 'in progress', 'pending', 'on hold', 'compleated'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer border text-center ${
                    selectedStatus === st
                      ? st === 'compleated'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                        : st === 'in progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                        : st === 'pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-300'
                        : st === 'on hold'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-300'
                        : 'bg-slate-700 text-white border-slate-700 shadow-xs ring-2 ring-slate-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            {selectedStatus === 'compleated' && (
              <p className="mt-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Marking as &ldquo;compleated&rdquo; will resolve this ticket, clearing it from the complaints section.</span>
              </p>
            )}
          </div>

          {/* Progress / Work Done Note */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Progress Note / Action Taken *</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Visited Lowther Road site. Verified line voltage at 268V with multimeter. Inverter tripped due to DISCOM grid high voltage."
              value={progressMessage}
              onChange={(e) => setProgressMessage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Root Cause Diagnosed
              </label>
              <input
                type="text"
                placeholder="e.g. Local transformer phase unbalance / Burnt MC4 / Heavy dust"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Materials / Parts Replaced or Adjusted
              </label>
              <input
                type="text"
                placeholder="e.g. 1000V DC Fuse replaced, re-crimped 4 sqmm solar cable"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedStatus === 'compleated' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <label className="block font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Final Resolution Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Grid voltage adjusted with JE, inverter restarted, customer satisfied with 4.8kW live power."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full border border-emerald-300 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Past Remarks & Audit Trail */}
          {complaint.remarksHistory && complaint.remarksHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" /> Previous Progress Updates ({complaint.remarksHistory.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {complaint.remarksHistory.map((rem) => (
                  <div key={rem.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-800">{rem.authorName} ({rem.authorRole})</span>
                      <span>{new Date(rem.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                    </div>
                    {rem.statusChangedTo && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded font-bold text-[10px] bg-blue-100 text-blue-800 capitalize">
                        Status → {rem.statusChangedTo}
                      </span>
                    )}
                    {rem.message && <p className="text-slate-700 mt-1 font-medium">{rem.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Progress Report & Update Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
