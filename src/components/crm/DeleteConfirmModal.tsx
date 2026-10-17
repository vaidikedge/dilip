import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemCode?: string;
  itemDescription?: string;
  onConfirmDelete: (reason: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  itemCode,
  itemDescription,
  onConfirmDelete,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDelete(reason.trim() || 'Deleted by Owner');
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              {itemCode && (
                <span className="font-mono text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {itemCode}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-slate-600">
          {itemDescription && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium text-slate-800">
              {itemDescription}
            </div>
          )}

          <div className="flex items-center gap-2 text-rose-700 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action will remove the record and will be documented in the permanent audit logs.</span>
          </div>

          <form onSubmit={handleConfirm} className="space-y-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reason for Deletion (Recorded in Audit Trail):
              </label>
              <input
                type="text"
                placeholder="e.g. Duplicate entry / Test project / Customer cancelled"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
