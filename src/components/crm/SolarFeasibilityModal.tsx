import React, { useState } from 'react';
import {
  X,
  Compass,
  Zap,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Ruler,
  Cable,
  Flame
} from 'lucide-react';
import { CrmTask, CrmUser, SolarFeasibilityData } from '../../data/crmData';
import { playActionClickSound } from '../../utils/audioAlert';

interface SolarFeasibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CrmTask;
  currentUser: CrmUser;
  onSaveFeasibility: (taskId: string, feasibility: SolarFeasibilityData) => void;
}

export const SolarFeasibilityModal: React.FC<SolarFeasibilityModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onSaveFeasibility,
}) => {
  const [formData, setFormData] = useState<SolarFeasibilityData>({
    roofAreaSqFt: task.feasibility?.roofAreaSqFt || Math.round(task.capacityKw * 85),
    roofType: task.feasibility?.roofType || task.roofType || 'RCC Flat Roof',
    phase: task.feasibility?.phase || (task.capacityKw >= 5 ? 'Three Phase (415V)' : 'Single Phase (230V)'),
    sanctionedLoadKw: task.feasibility?.sanctionedLoadKw || task.capacityKw,
    inverterDistanceM: task.feasibility?.inverterDistanceM || 10,
    meterDistanceM: task.feasibility?.meterDistanceM || 15,
    earthingPits: task.feasibility?.earthingPits || (task.capacityKw >= 5 ? 3 : 2),
    feederName: task.feasibility?.feederName || 'Local 11kV Substation Feeder',
    surveyRemarks: task.feasibility?.surveyRemarks || 'South-facing unobstructed shadow-free roof. Structural strength confirmed.',
    surveyDate: task.feasibility?.surveyDate || new Date().toISOString().split('T')[0],
    surveyorName: task.feasibility?.surveyorName || currentUser.name,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    playActionClickSound();
    onSaveFeasibility(task.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {task.taskCode}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Site Technical Feasibility Audit
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {task.customerName} - {task.customerAddress}
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

        {/* Form Fields */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shadow-Free Roof Area (Sq. Ft.)
              </label>
              <input
                type="number"
                value={formData.roofAreaSqFt || ''}
                onChange={(e) => setFormData({ ...formData, roofAreaSqFt: Number(e.target.value) })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. 450"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roof Type & Elevation
              </label>
              <select
                value={formData.roofType}
                onChange={(e) => setFormData({ ...formData, roofType: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="RCC Flat Roof">RCC Flat Roof</option>
                <option value="Tin / Metal Sheet">Tin / Metal Sheet Roof</option>
                <option value="Elevated Structure">Elevated Structure (Pergola / 7-ft)</option>
                <option value="Ground Mount">Ground Mount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Electrical Grid Phase
              </label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Single Phase (230V)">Single Phase (230V - Up to 3kW)</option>
                <option value="Three Phase (415V)">Three Phase (415V - 5kW & above)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UPPCL Sanctioned Load (kW)
              </label>
              <input
                type="number"
                value={formData.sanctionedLoadKw || ''}
                onChange={(e) => setFormData({ ...formData, sanctionedLoadKw: Number(e.target.value) })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. 5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inverter to Panel Distance (Meters)
              </label>
              <input
                type="number"
                value={formData.inverterDistanceM || ''}
                onChange={(e) => setFormData({ ...formData, inverterDistanceM: Number(e.target.value) })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. 10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Earthing Pits Required
              </label>
              <input
                type="number"
                value={formData.earthingPits || ''}
                onChange={(e) => setFormData({ ...formData, earthingPits: Number(e.target.value) })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. 3 (AC + DC + Lightning)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              DISCOM 11kV Feeder / Substation
            </label>
            <input
              type="text"
              value={formData.feederName || ''}
              onChange={(e) => setFormData({ ...formData, feederName: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              placeholder="e.g. Kalyani Devi 11kV Town Feeder"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Surveyor Technical Remarks
            </label>
            <textarea
              rows={3}
              value={formData.surveyRemarks || ''}
              onChange={(e) => setFormData({ ...formData, surveyRemarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
              placeholder="Structure anchorage notes, cable route details, shadow objects..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Surveyor In-Charge:</span>
              <span className="font-bold text-slate-800">{formData.surveyorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Survey Date:</span>
              <span className="font-bold text-slate-800">{formData.surveyDate}</span>
            </div>
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
            <span>Save Feasibility Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
