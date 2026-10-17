import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Trash2,
  Save,
  Plus,
  AlertTriangle,
  Building2,
  Check,
} from 'lucide-react';
import {
  BusinessWorkspace,
  BusinessPipelineStage,
} from '../../data/businessTemplatesData';
import { renderBusinessIcon } from './BusinessSelectorBar';

interface ManageBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessWorkspace | null;
  totalBusinessesCount: number;
  onUpdateBusiness: (updatedBusiness: BusinessWorkspace) => void;
  onDeleteBusiness: (businessId: string) => void;
}

export const ManageBusinessModal: React.FC<ManageBusinessModalProps> = ({
  isOpen,
  onClose,
  business,
  totalBusinessesCount,
  onUpdateBusiness,
  onDeleteBusiness,
}) => {
  const [name, setName] = useState(business?.name || '');
  const [tagline, setTagline] = useState(business?.tagline || '');
  const [industry, setIndustry] = useState(business?.industry || 'Solar Rooftop & Renewable Energy');
  const [category, setCategory] = useState(business?.category || 'Energy & Utilities');
  const [badge, setBadge] = useState(business?.badge || 'Solar TMS');
  const [currency, setCurrency] = useState(business?.currency || '₹');
  const [ownerName, setOwnerName] = useState(business?.ownerName || '');
  const [phone, setPhone] = useState(business?.contactPhone || '');
  const [email, setEmail] = useState(business?.email || '');
  const [address, setAddress] = useState(business?.address || '');
  const [gstNumber, setGstNumber] = useState(business?.gstNumber || '');
  const [colorTheme, setColorTheme] = useState(business?.colorTheme || '#1a3882');
  const [systemTypesStr, setSystemTypesStr] = useState(business?.systemTypes?.join(', ') || '');
  const [stages, setStages] = useState<BusinessPipelineStage[]>(business?.stages || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (business && isOpen) {
      setName(business.name);
      setTagline(business.tagline);
      setIndustry(business.industry);
      setCategory(business.category);
      setBadge(business.badge);
      setCurrency(business.currency);
      setOwnerName(business.ownerName);
      setPhone(business.contactPhone);
      setEmail(business.email);
      setAddress(business.address);
      setGstNumber(business.gstNumber || '');
      setColorTheme(business.colorTheme);
      setSystemTypesStr(business.systemTypes?.join(', ') || '');
      setStages(business.stages || []);
      setShowDeleteConfirm(false);
    }
  }, [business, isOpen]);

  if (!isOpen || !business) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTypes = systemTypesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: BusinessWorkspace = {
      ...business,
      name: name.trim() || business.name,
      tagline: tagline.trim() || business.tagline,
      industry: industry.trim() || business.industry,
      category: category.trim() || business.category,
      badge: badge.trim() || business.badge,
      currency: currency.trim() || '₹',
      ownerName: ownerName.trim() || business.ownerName,
      contactPhone: phone.trim() || business.contactPhone,
      email: email.trim() || business.email,
      address: address.trim() || business.address,
      gstNumber: gstNumber.trim() || undefined,
      colorTheme: colorTheme as any,
      systemTypes: parsedTypes.length > 0 ? parsedTypes : business.systemTypes,
      stages,
      updatedAt: new Date().toISOString(),
    };

    onUpdateBusiness(updated);
    onClose();
  };

  const handleAddStage = () => {
    const nextStep = stages.length + 1;
    setStages([
      ...stages,
      {
        id: `stage_${Date.now()}`,
        step: nextStep,
        label: `${nextStep}. New Stage`,
        description: 'Stage milestone description',
      },
    ]);
  };

  const handleUpdateStage = (index: number, field: 'label' | 'description', value: string) => {
    const next = [...stages];
    next[index] = { ...next[index], [field]: value };
    setStages(next);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 2) return;
    const filtered = stages.filter((_, i) => i !== index);
    const reindexed = filtered.map((st, i) => ({
      ...st,
      step: i + 1,
      label: st.label.replace(/^\d+\.\s*/, `${i + 1}. `),
    }));
    setStages(reindexed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
              {renderBusinessIcon(business.iconName, 'w-5 h-5')}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Manage Workspace: {business.name}
              </h3>
              <p className="text-xs text-slate-400">
                Update enterprise branding, contact details, product lines, and workflow pipeline stages.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* General Information */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Enterprise Profile & Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Title</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Owner / CMD</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">GST Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                Product Lines / Service Offerings (Comma Separated)
              </label>
              <input
                type="text"
                value={systemTypesStr}
                onChange={(e) => setSystemTypesStr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Workflow Pipeline Stages Editor */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Workflow Pipeline Stages ({stages.length} Steps)
                </h4>
                <p className="text-xs text-slate-400">
                  Tasks in this workspace progress through these specific milestone steps.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {stages.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => handleUpdateStage(idx, 'label', e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-hidden focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={st.description}
                      onChange={(e) => handleUpdateStage(idx, 'description', e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  {stages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded cursor-pointer"
                      title="Remove step"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Workspace Danger Zone */}
          {!business.isDefault && totalBusinessesCount > 1 && (
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Delete this Business Workspace</span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  Removes this business workspace and its isolated configuration.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-rose-900/50 hover:bg-rose-800 text-rose-200 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Delete Workspace
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteBusiness(business.id);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-md cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Workspace Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
