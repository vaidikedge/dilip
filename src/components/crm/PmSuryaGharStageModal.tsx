import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sun,
  ShieldCheck,
  FileText,
  Zap,
  Save,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import {
  CrmTask,
  CrmUser,
  PmSuryaGharStage,
  PM_SURYA_GHAR_STAGES,
  getPmSuryaGharStageInfo,
} from '../../data/crmData';
import { playActionClickSound } from '../../utils/audioAlert';

interface PmSuryaGharStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CrmTask;
  currentUser: CrmUser;
  onSaveStage: (
    taskId: string,
    updatedStage: PmSuryaGharStage,
    meta: {
      consumerAppNo?: string;
      netMeterChallanNo?: string;
      subsidyAmountClaimed?: number;
      remarkText?: string;
    }
  ) => void;
}

export const PmSuryaGharStageModal: React.FC<PmSuryaGharStageModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onSaveStage,
}) => {
  const [selectedStage, setSelectedStage] = useState<PmSuryaGharStage>(
    task.pmSuryaGharStage || 'site_survey'
  );
  const [consumerAppNo, setConsumerAppNo] = useState<string>(
    task.consumerAppNo || ''
  );
  const [netMeterChallanNo, setNetMeterChallanNo] = useState<string>(
    task.netMeterChallanNo || ''
  );
  const [subsidyClaimed, setSubsidyClaimed] = useState<string>(
    task.subsidyAmountClaimed ? String(task.subsidyAmountClaimed) : '78000'
  );
  const [updateRemark, setUpdateRemark] = useState<string>('');

  if (!isOpen) return null;

  const currentStageIndex = PM_SURYA_GHAR_STAGES.findIndex(
    (s) => s.id === selectedStage
  );

  const handleSave = () => {
    playActionClickSound();
    onSaveStage(task.id, selectedStage, {
      consumerAppNo: consumerAppNo.trim() || undefined,
      netMeterChallanNo: netMeterChallanNo.trim() || undefined,
      subsidyAmountClaimed: subsidyClaimed ? Number(subsidyClaimed) : undefined,
      remarkText: updateRemark.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {task.taskCode}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  PM Surya Ghar & UPPCL Stage Tracker
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {task.customerName} ({task.capacityKw}kW {task.systemType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8-Step Timeline */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>PM Surya Ghar Muft Bijli Yojana - Project Milestone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PM_SURYA_GHAR_STAGES.map((stageItem, index) => {
              const isPassed = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isSelected = selectedStage === stageItem.id;

              return (
                <div
                  key={stageItem.id}
                  onClick={() => {
                    playActionClickSound();
                    setSelectedStage(stageItem.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50 border-[#1a3882] ring-2 ring-blue-300 shadow-sm'
                      : isPassed
                      ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                      isSelected
                        ? 'bg-[#1a3882] text-white'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stageItem.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {stageItem.hindiLabel}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                      {stageItem.label}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {stageItem.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portal Registration & Subsidy Metadata Form */}
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>National Portal & DISCOM Records</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                National Portal App No.
              </label>
              <input
                type="text"
                value={consumerAppNo}
                onChange={(e) => setConsumerAppNo(e.target.value)}
                placeholder="e.g. PMSG-UP-2026-98124"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Net-Meter / Challan No.
              </label>
              <input
                type="text"
                value={netMeterChallanNo}
                onChange={(e) => setNetMeterChallanNo(e.target.value)}
                placeholder="e.g. UPPCL-CH-4482"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subsidy CFA Amount (₹)
              </label>
              <input
                type="number"
                value={subsidyClaimed}
                onChange={(e) => setSubsidyClaimed(e.target.value)}
                placeholder="e.g. 78000"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remark / Update Note for Team
            </label>
            <input
              type="text"
              value={updateRemark}
              onChange={(e) => setUpdateRemark(e.target.value)}
              placeholder="e.g. Joint inspection scheduled with UPPCL JE on Thursday"
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#1a3882] hover:bg-blue-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Update Stage & Save to Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
