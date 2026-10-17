import React, { useState, useEffect, useMemo } from 'react';
import { X, Edit3, Save, User, Calendar, IndianRupee, MapPin, Phone, Zap, ShieldAlert } from 'lucide-react';
import { CrmTask, CrmTaskStatus, CrmUser } from '../../data/crmData';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CrmTask | null;
  staffUsers?: CrmUser[];
  users?: CrmUser[];
  currentUser?: CrmUser | null;
  onSave?: (updatedTask: CrmTask, editNotes?: string) => void;
  onSaveTask?: (updatedTask: CrmTask, editNotes?: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  staffUsers,
  users,
  currentUser,
  onSave,
  onSaveTask,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [capacityKw, setCapacityKw] = useState<number>(3);
  const [systemType, setSystemType] = useState<CrmTask['systemType']>('On-Grid Rooftop');
  const [monthlyBillRs, setMonthlyBillRs] = useState('');
  const [uppclAccountNo, setUppclAccountNo] = useState('');
  const [roofType, setRoofType] = useState<CrmTask['roofType']>('RCC Flat Roof');
  const [priority, setPriority] = useState<CrmTask['priority']>('High');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [status, setStatus] = useState<CrmTaskStatus>('not started');
  const [dealValueRs, setDealValueRs] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [ownerInstructions, setOwnerInstructions] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const isOwner = currentUser?.role === 'owner';

  const allStaff = useMemo(() => {
    if (Array.isArray(staffUsers) && staffUsers.length > 0) return staffUsers;
    if (Array.isArray(users) && users.length > 0) return users;
    return [];
  }, [staffUsers, users]);

  useEffect(() => {
    if (task) {
      setCustomerName(task.customerName || '');
      setCustomerPhone(task.customerPhone || '');
      setCustomerAddress(task.customerAddress || '');
      setCapacityKw(task.capacityKw || 3);
      setSystemType(task.systemType || 'On-Grid Rooftop');
      setMonthlyBillRs(task.monthlyBillRs || '');
      setUppclAccountNo(task.uppclAccountNo || '');
      setRoofType(task.roofType || 'RCC Flat Roof');
      setPriority(task.priority || 'Normal');
      setAssignedToUserId(task.assignedToUserId || '');
      setStatus(task.status || 'not started');
      setDealValueRs(task.dealValueRs ? String(task.dealValueRs) : '');
      setDueDate(task.dueDate || '');
      setOwnerInstructions(task.ownerInstructions || '');
      setEditNotes('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = allStaff.find((u) => u.id === assignedToUserId);

    let updatedUserIds = task.assignedUserIds || [];
    let updatedUserNames = task.assignedUserNames || [];
    if (isOwner && assignedUser) {
      updatedUserIds = Array.from(
        new Set([assignedUser.id, ...((task.assignedUserIds || []).filter((id) => id !== task.assignedToUserId))])
      );
      updatedUserNames = updatedUserIds.map((uid) => allStaff.find((u) => u.id === uid)?.name || uid);
    }

    const updated: CrmTask = {
      ...task,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      capacityKw: Number(capacityKw) || 3,
      systemType,
      monthlyBillRs: monthlyBillRs.trim(),
      uppclAccountNo: uppclAccountNo.trim(),
      roofType,
      priority,
      assignedToUserId: isOwner ? assignedToUserId : task.assignedToUserId,
      assignedToUserName: isOwner
        ? (assignedUser ? assignedUser.name : task.assignedToUserName)
        : task.assignedToUserName,
      assignedUserIds: updatedUserIds,
      assignedUserNames: updatedUserNames,
      status,
      dealValueRs: dealValueRs ? Number(dealValueRs) : undefined,
      dueDate: dueDate || undefined,
      ownerInstructions: isOwner ? ownerInstructions.trim() : (task.ownerInstructions || ''),
      title: `${capacityKw}kW ${systemType} - ${customerName.trim()}`,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: currentUser?.name || 'CRM User',
    };

    const saveFn = onSaveTask || onSave;
    if (saveFn) {
      saveFn(updated, editNotes.trim());
    }
    onClose();
  };

  const employees = allStaff.filter((u) => u.status === 'active');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a3882] flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Edit Task & Project Details</h3>
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {task.taskCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">Modify client information, capacity, pricing, or assigned staff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-blue-700" />
              <span>Customer / Client Profile</span>
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-mono focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPPCL 10-Digit Account #</label>
                <input
                  type="text"
                  value={uppclAccountNo}
                  onChange={(e) => setUppclAccountNo(e.target.value)}
                  placeholder="e.g. 7218492019"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-mono focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Site Address in Prayagraj *</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-[#1a3882] focus:outline-none"
              />
            </div>
          </div>

          {/* Technical & Commercial Specs */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Plant Specifications & Financial Value</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plant Capacity (kW) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Type</label>
                <select
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="On-Grid Rooftop">On-Grid Rooftop</option>
                  <option value="Hybrid Solar">Hybrid Solar</option>
                  <option value="Off-Grid">Off-Grid</option>
                  <option value="Solar Water Pump">Solar Water Pump</option>
                  <option value="Commercial HT">Commercial HT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Roof Type</label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="RCC Flat Roof">RCC Flat Roof</option>
                  <option value="Tin / Metal Sheet">Tin / Metal Sheet</option>
                  <option value="Elevated Structure">Elevated Structure</option>
                  <option value="Ground Mount">Ground Mount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Deal Value (₹)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 185000"
                    value={dealValueRs}
                    onChange={(e) => setDealValueRs(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white font-bold text-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Bill (₹)</label>
                <input
                  type="number"
                  placeholder="3500"
                  value={monthlyBillRs}
                  onChange={(e) => setMonthlyBillRs(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Workflow Status & Assignment */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-indigo-700" />
              <span>Assignment & Status Pipeline</span>
            </h4>

            <div className={`grid grid-cols-1 ${isOwner ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              {isOwner && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#1a3882]">Assigned Engineer *</label>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">Owner Authority</span>
                  </div>
                  <select
                    required
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="w-full border-2 border-blue-300 bg-white rounded-lg p-2 text-xs font-bold text-blue-900 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CrmTaskStatus)}
                  className="w-full border border-slate-300 bg-white rounded-lg p-2 text-xs font-bold text-slate-800 capitalize focus:outline-none"
                >
                  <option value="not started">1. not started</option>
                  <option value="in progress">2. in progress</option>
                  <option value="pending">3. pending</option>
                  <option value="on hold">4. on hold</option>
                  <option value="compleated">5. compleated</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border border-slate-300 bg-white rounded-lg p-2 text-xs font-bold focus:outline-none"
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            {!isOwner && (
              <div className="flex items-center justify-between bg-slate-100/90 px-3 py-2 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-700">
                  Assigned Engineer: <strong className="text-slate-900">{task.assignedToUserName || 'Unassigned'}</strong>
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  🔒 Project Transfer Authority: Owner Only
                </span>
              </div>
            )}

            {isOwner ? (
              <div>
                <label className="block font-semibold text-amber-900 mb-1">
                  Owner's Direct Instruction to Engineer:
                </label>
                <textarea
                  rows={2}
                  value={ownerInstructions}
                  onChange={(e) => setOwnerInstructions(e.target.value)}
                  placeholder="Specific guidance for the assigned engineer..."
                  className="w-full border border-amber-300 bg-amber-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            ) : (
              task.ownerInstructions ? (
                <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    Owner's Instructions:
                  </span>
                  <p className="text-amber-800">{task.ownerInstructions}</p>
                </div>
              ) : null
            )}

            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Reason / Note for this Edit (Recorded in Audit Trail):
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Customer upgraded from 3kW to 5kW / Updated phone number"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Last updated: {new Date(task.lastUpdatedAt).toLocaleString('en-IN')} by {task.lastUpdatedBy}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
