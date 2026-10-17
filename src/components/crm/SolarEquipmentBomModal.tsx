import React, { useState } from 'react';
import {
  X,
  Layers,
  Save,
  ShieldCheck,
  Zap,
  Barcode,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { CrmTask, CrmUser, SolarEquipmentBOM } from '../../data/crmData';
import { playActionClickSound } from '../../utils/audioAlert';

interface SolarEquipmentBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CrmTask;
  currentUser: CrmUser;
  onSaveBOM: (taskId: string, bom: SolarEquipmentBOM) => void;
}

export const SolarEquipmentBomModal: React.FC<SolarEquipmentBomModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onSaveBOM,
}) => {
  const [bom, setBom] = useState<SolarEquipmentBOM>({
    panelBrand: task.equipmentBOM?.panelBrand || 'Waaree Bifacial TOPCon DCR',
    panelWattageWp: task.equipmentBOM?.panelWattageWp || 550,
    panelCount: task.equipmentBOM?.panelCount || Math.ceil((task.capacityKw * 1000) / 550),
    inverterBrand: task.equipmentBOM?.inverterBrand || 'Growatt On-Grid',
    inverterCapacityKw: task.equipmentBOM?.inverterCapacityKw || task.capacityKw,
    inverterSerialNo: task.equipmentBOM?.inverterSerialNo || '',
    netMeterSerialNo: task.equipmentBOM?.netMeterSerialNo || '',
    discomSealNo: task.equipmentBOM?.discomSealNo || '',
    structureType: task.equipmentBOM?.structureType || 'Hot-Dip Galvanized 80mm',
    batteryCapacityAh: task.equipmentBOM?.batteryCapacityAh || '',
  });

  if (!isOpen) return null;

  const totalDckWp = ((bom.panelCount || 0) * (bom.panelWattageWp || 0)) / 1000;

  const handleSave = () => {
    playActionClickSound();
    onSaveBOM(task.id, bom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {task.taskCode}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Equipment BOM & Serial / Warranty Tracker
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

        {/* Form Fields */}
        <div className="mt-5 space-y-4">
          {/* Solar PV Modules Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>1. Solar PV Modules (DCR / ALMM)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Panel Brand & Model
                </label>
                <input
                  type="text"
                  value={bom.panelBrand || ''}
                  onChange={(e) => setBom({ ...bom, panelBrand: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  placeholder="e.g. Waaree 550Wp Bifacial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wattage per Panel (Wp)
                </label>
                <input
                  type="number"
                  value={bom.panelWattageWp || ''}
                  onChange={(e) => setBom({ ...bom, panelWattageWp: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  placeholder="550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Panel Count (Qty)
                </label>
                <input
                  type="number"
                  value={bom.panelCount || ''}
                  onChange={(e) => setBom({ ...bom, panelCount: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  placeholder="e.g. 6"
                />
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
              <span>Calculated Total DC Array Capacity:</span>
              <span className="font-bold text-[#1a3882]">{totalDckWp.toFixed(2)} kWp</span>
            </div>
          </div>

          {/* Inverter & Electronics Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>2. Solar Inverter & Serial Number</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inverter Brand / Make
                </label>
                <input
                  type="text"
                  value={bom.inverterBrand || ''}
                  onChange={(e) => setBom({ ...bom, inverterBrand: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  placeholder="e.g. Growatt / Solis / Sungrow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inverter Serial Number (S/N)
                </label>
                <input
                  type="text"
                  value={bom.inverterSerialNo || ''}
                  onChange={(e) => setBom({ ...bom, inverterSerialNo: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono uppercase"
                  placeholder="e.g. GRW-5K-998241"
                />
              </div>
            </div>
          </div>

          {/* Net Metering & Structure Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-emerald-600" />
              <span>3. UPPCL Net Metering & Structure</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Net Meter Serial No.
                </label>
                <input
                  type="text"
                  value={bom.netMeterSerialNo || ''}
                  onChange={(e) => setBom({ ...bom, netMeterSerialNo: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  placeholder="e.g. SEC-3PH-40192"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DISCOM Official Seal No.
                </label>
                <input
                  type="text"
                  value={bom.discomSealNo || ''}
                  onChange={(e) => setBom({ ...bom, discomSealNo: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  placeholder="e.g. UPPCL-SL-9021"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Structure Specification
                </label>
                <input
                  type="text"
                  value={bom.structureType || ''}
                  onChange={(e) => setBom({ ...bom, structureType: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  placeholder="e.g. Hot-Dip GI 80mm"
                />
              </div>
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
            <span>Save BOM & Warranty Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
