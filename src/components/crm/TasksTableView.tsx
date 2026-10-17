import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  User,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  Clock,
  Lock,
  Shield
} from 'lucide-react';
import { CrmTask, CrmTaskStatus, CrmUser, formatTimeAgo } from '../../data/crmData';
import { playActionClickSound } from '../../utils/audioAlert';

interface TasksTableViewProps {
  tasks?: CrmTask[];
  currentUser?: CrmUser | null;
  staffUsers?: CrmUser[];
  users?: CrmUser[];
  onUpdateStatus?: (taskId: string, newStatus: CrmTaskStatus, optionalMessage: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: CrmTaskStatus, optionalMessage?: string) => void;
  onEditTask?: (task: CrmTask) => void;
  onDeleteTask?: (task: CrmTask) => void;
  onOpenWhatsApp?: (task: CrmTask) => void;
  onOpenWhatsAppModal?: (task: CrmTask) => void;
  onBulkStatusChange?: (taskIds: string[], status: CrmTaskStatus) => void;
  onBulkReassign?: (taskIds: string[], staffId: string, staffName: string) => void;
}

export const TasksTableView: React.FC<TasksTableViewProps> = ({
  tasks = [],
  currentUser,
  staffUsers,
  users,
  onUpdateStatus,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenWhatsApp,
  onOpenWhatsAppModal,
  onBulkStatusChange,
  onBulkReassign,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'taskCode' | 'customerName' | 'capacityKw' | 'status' | 'dealValueRs' | 'dueDate' | 'assignedAt'>('assignedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const allStaff = (Array.isArray(staffUsers) && staffUsers.length > 0) ? staffUsers : (Array.isArray(users) ? users : []);
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const handleUpdate = onUpdateStatus || onUpdateTaskStatus;
  const handleWhatsApp = onOpenWhatsApp || onOpenWhatsAppModal;

  const handleSelectAll = () => {
    playActionClickSound();
    if (selectedIds.length === safeTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(safeTasks.map((t) => t.id));
    }
  };

  const handleToggleRow = (id: string) => {
    playActionClickSound();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sortedTasks = [...safeTasks].sort((a, b) => {
    if (sortField === 'assignedAt') {
      const timeA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const timeB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      return sortAsc ? timeA - timeB : timeB - timeA;
    }
    let valA = a[sortField];
    let valB = b[sortField];
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: typeof sortField) => {
    playActionClickSound();
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadgeClass = (status: CrmTaskStatus) => {
    switch (status) {
      case 'not started':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'on hold':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'compleated':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-2 text-xs">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <CheckSquare className="w-4 h-4 text-[#1a3882]" />
            <span>{selectedIds.length} tasks selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Status Select */}
            {onBulkStatusChange && (
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">Change Status:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkStatusChange(selectedIds, e.target.value as CrmTaskStatus);
                      setSelectedIds([]);
                    }
                  }}
                  defaultValue=""
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold capitalize cursor-pointer"
                >
                  <option value="" disabled>Select Status...</option>
                  <option value="not started">not started</option>
                  <option value="in progress">in progress</option>
                  <option value="pending">pending</option>
                  <option value="on hold">on hold</option>
                  <option value="compleated">compleated</option>
                </select>
              </div>
            )}

            {/* Bulk Reassign Select (Owner) */}
            {onBulkReassign && currentUser?.role === 'owner' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">Reassign:</span>
                <select
                  onChange={(e) => {
                    const u = allStaff.find((user) => user.id === e.target.value);
                    if (u) {
                      onBulkReassign(selectedIds, u.id, u.name);
                      setSelectedIds([]);
                    }
                  }}
                  defaultValue=""
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer"
                >
                  <option value="" disabled>Select Staff...</option>
                  {allStaff
                    .filter((u) => u.role === 'employee')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                playActionClickSound();
                setSelectedIds([]);
              }}
              className="text-slate-500 hover:text-slate-800 text-[11px] underline px-2 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="cursor-pointer text-slate-500 hover:text-slate-800"
                  >
                    {selectedIds.length === tasks.length && tasks.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 w-12 text-center text-slate-500 font-bold">
                  #
                </th>
                <th
                  onClick={() => toggleSort('assignedAt')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Added
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('taskCode')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Code
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('customerName')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Customer & Location
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('capacityKw')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    System / kW
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('dealValueRs')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Deal Value
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="p-3">Assigned To</th>
                <th
                  onClick={() => toggleSort('dueDate')}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Due Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTasks.map((task, index) => {
                const isSelected = selectedIds.includes(task.id);
                const cleanPhone = task.customerPhone.replace(/[^0-9]/g, '');

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleRow(task.id)}
                        className="cursor-pointer text-slate-400 hover:text-slate-800"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Sequential Pipeline Order */}
                    <td className="p-3 text-center text-xs font-black text-slate-600 font-mono">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{index + 1}
                      </span>
                    </td>

                    {/* Added / Assigned Time */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatTimeAgo(task.assignedAt)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(task.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Code & Priority */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-blue-900 bg-blue-100/70 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                          {task.taskCode}
                        </span>
                        <div>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-600 text-white'
                                : task.priority === 'High'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{task.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={task.customerAddress}>
                        {task.customerAddress}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5 flex items-center gap-1">
                        <span>{task.customerPhone}</span>
                        {task.uppclAccountNo && (
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200 text-[10px]">
                            UPPCL: {task.uppclAccountNo}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* System & Capacity */}
                    <td className="p-3">
                      <div className="font-extrabold text-amber-900">{task.capacityKw} kW</div>
                      <div className="text-[11px] text-slate-500">{task.systemType}</div>
                    </td>

                    {/* Deal Value */}
                    <td className="p-3 font-mono font-bold text-emerald-800">
                      {task.dealValueRs ? `₹${task.dealValueRs.toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {task.isOwnerOverride && currentUser?.role !== 'owner' ? (
                        <div
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-900"
                          title="Updated by Dilip Enterprises (Owner) - Locked against modification"
                        >
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span className="capitalize">{task.status}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {task.isOwnerOverride && currentUser?.role === 'owner' && (
                            <span title="Owner Master Override Active">
                              <Shield className="w-3 h-3 text-amber-600 shrink-0" />
                            </span>
                          )}
                          <select
                            value={task.status}
                            onChange={(e) =>
                              onUpdateStatus && onUpdateStatus(task.id, e.target.value as CrmTaskStatus, 'Status changed via table grid')
                            }
                            className={`text-[11px] font-bold px-2 py-1 rounded-full border capitalize cursor-pointer focus:outline-none ${getStatusBadgeClass(
                              task.status
                            )}`}
                          >
                            <option value="not started">not started</option>
                            <option value="in progress">in progress</option>
                            <option value="pending">pending</option>
                            <option value="on hold">on hold</option>
                            <option value="compleated">compleated</option>
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Assigned User */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <User className="w-3 h-3 text-blue-700" />
                        <span>{task.assignedToUserName}</span>
                      </div>
                      {Array.isArray(task.assignedUserNames) && task.assignedUserNames.length > 1 && (
                        <div className="text-[10px] text-blue-700 font-medium truncate max-w-[180px]" title={task.assignedUserNames.join(', ')}>
                          Team: {task.assignedUserNames.join(', ')}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">By: {task.assignedBy}</div>
                    </td>

                    {/* Due Date */}
                    <td className="p-3 text-[11px]">
                      {task.dueDate ? (
                        <span
                          className={`font-medium px-1.5 py-0.5 rounded ${
                            new Date(task.dueDate) < new Date() && task.status !== 'compleated'
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {new Date(task.dueDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right pr-4">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={() => playActionClickSound()}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600"
                          title="Call client"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {handleWhatsApp && (
                          <button
                            type="button"
                            onClick={() => {
                              playActionClickSound();
                              handleWhatsApp(task);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-[#25D366]"
                            title="WhatsApp Solar Templates"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onEditTask && (
                          <button
                            type="button"
                            onClick={() => {
                              playActionClickSound();
                              onEditTask(task);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600"
                            title="Edit task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {task.status !== 'compleated' && handleUpdate && (
                          <button
                            type="button"
                            onClick={() => {
                              playActionClickSound();
                              handleUpdate(task.id, 'compleated', 'Marked completed from data table');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                            title="Mark as Compleated"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteTask && currentUser?.role === 'owner' && (
                          <button
                            type="button"
                            onClick={() => {
                              playActionClickSound();
                              onDeleteTask(task);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedTasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs italic">
                    No tasks found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
