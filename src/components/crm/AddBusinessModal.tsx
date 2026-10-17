import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Plus,
  Check,
  Building2,
  Zap,
  Sun,
  Wind,
  Car,
  Laptop,
  Package,
  Wrench,
  Shield,
  Heart,
  Store,
  Briefcase,
  Truck,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  BUSINESS_TEMPLATE_PRESETS,
  BusinessTemplatePreset,
  BusinessWorkspace,
  BusinessPipelineStage,
} from '../../data/businessTemplatesData';
import { CrmTask } from '../../data/crmData';
import { renderBusinessIcon } from './BusinessSelectorBar';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBusiness: (newBusiness: BusinessWorkspace, sampleTask?: Partial<CrmTask>) => void;
  currentOwnerName: string;
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onAddBusiness,
  currentOwnerName,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<BusinessTemplatePreset>(BUSINESS_TEMPLATE_PRESETS[1]); // Default: Electrical
  const [seedSampleProject, setSeedSampleProject] = useState(true);

  // Preset Customization Overrides
  const [presetBusinessName, setPresetBusinessName] = useState(selectedPreset.name);
  const [presetOwnerName, setPresetOwnerName] = useState(currentOwnerName || 'Dilip Enterprises');
  const [presetPhone, setPresetPhone] = useState('+91 98390 12345');
  const [presetEmail, setPresetEmail] = useState('balajicompany.in@gmail.com');
  const [presetAddress, setPresetAddress] = useState('Prayagraj, Uttar Pradesh');
  const [presetGst, setPresetGst] = useState('09ABCDE1234F1Z5');

  // Custom Business Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Retail & Services');
  const [customIndustry, setCustomIndustry] = useState('General Commercial Enterprise');
  const [customTagline, setCustomTagline] = useState('Quality products & client-first services');
  const [customIcon, setCustomIcon] = useState('Briefcase');
  const [customBadge, setCustomBadge] = useState('Certified Enterprise');
  const [customCurrency, setCustomCurrency] = useState('₹');
  const [customTheme, setCustomTheme] = useState<BusinessWorkspace['colorTheme']>('blue');
  const [customOwnerName, setCustomOwnerName] = useState(currentOwnerName || 'Dilip Enterprises');
  const [customPhone, setCustomPhone] = useState('+91 94152 14777');
  const [customEmail, setCustomEmail] = useState('');
  const [customAddress, setCustomAddress] = useState('Prayagraj, Uttar Pradesh');
  const [customGst, setCustomGst] = useState('');
  const [customSystemTypesStr, setCustomSystemTypesStr] = useState(
    'Standard Service, Premium Contract, Maintenance AMC, Emergency Dispatch'
  );
  const [customStages, setCustomStages] = useState<BusinessPipelineStage[]>([
    { id: 'stage_1', step: 1, label: '1. Lead Received & Inward', description: 'Customer requirements and preliminary inquiry registered' },
    { id: 'stage_2', step: 2, label: '2. Site Survey & Cost Estimate', description: 'Technical inspection and commercial pricing proposal' },
    { id: 'stage_3', step: 3, label: '3. Order Booking & Material Staging', description: 'Advance received and supplies dispatched from warehouse' },
    { id: 'stage_4', step: 4, label: '4. Execution & Service Delivery', description: 'Work in progress on-site with quality checks' },
    { id: 'stage_5', step: 5, label: '5. Quality Audit & Testing', description: 'Inspection and customer verification completed' },
    { id: 'stage_6', step: 6, label: '6. Final Invoicing & Handover', description: 'Final payment received and completion certificate handed over' },
  ]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: BusinessTemplatePreset) => {
    setSelectedPreset(preset);
    setPresetBusinessName(preset.name);
  };

  const handleCreateFromPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const newBizId = `biz-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newBusiness: BusinessWorkspace = {
      id: newBizId,
      name: presetBusinessName.trim() || selectedPreset.name,
      templatePresetId: selectedPreset.id,
      industry: selectedPreset.industry,
      category: selectedPreset.category,
      tagline: selectedPreset.tagline,
      iconName: selectedPreset.iconName,
      badge: selectedPreset.badge,
      currency: selectedPreset.currency,
      ownerName: presetOwnerName.trim() || 'Dilip Enterprises',
      contactPhone: presetPhone.trim() || '+91 94152 14777',
      email: presetEmail.trim() || 'business@gmail.com',
      address: presetAddress.trim() || 'Prayagraj, Uttar Pradesh',
      gstNumber: presetGst.trim() || undefined,
      isDefault: false,
      colorTheme: selectedPreset.colorTheme,
      stages: selectedPreset.stages,
      systemTypes: selectedPreset.systemTypes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let sampleTaskToSeed: Partial<CrmTask> | undefined;
    if (seedSampleProject && selectedPreset.sampleTasks && selectedPreset.sampleTasks.length > 0) {
      const sample = selectedPreset.sampleTasks[0];
      sampleTaskToSeed = {
        ...sample,
        businessId: newBizId,
        businessName: newBusiness.name,
        taskCode: `${selectedPreset.id.substring(7, 10).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      };
    }

    onAddBusiness(newBusiness, sampleTaskToSeed);
    onClose();
  };

  const handleCreateCustomBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newBizId = `biz-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const parsedSystemTypes = customSystemTypesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newBusiness: BusinessWorkspace = {
      id: newBizId,
      name: customName.trim(),
      industry: customIndustry.trim() || 'Commercial Enterprise',
      category: customCategory.trim() || 'Commercial & Services',
      tagline: customTagline.trim() || 'Professional Enterprise Operations',
      iconName: customIcon,
      badge: customBadge.trim() || 'Verified Enterprise',
      currency: customCurrency.trim() || '₹',
      ownerName: customOwnerName.trim() || 'Dilip Enterprises',
      contactPhone: customPhone.trim() || '+91 94152 14777',
      email: customEmail.trim() || '',
      address: customAddress.trim() || 'Prayagraj, Uttar Pradesh',
      gstNumber: customGst.trim() || undefined,
      isDefault: false,
      colorTheme: customTheme,
      stages: customStages,
      systemTypes: parsedSystemTypes.length > 0 ? parsedSystemTypes : ['Standard Work', 'Custom Project'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let sampleTaskToSeed: Partial<CrmTask> | undefined;
    if (seedSampleProject) {
      sampleTaskToSeed = {
        title: `Initial Project 01 - ${customName.trim()}`,
        customerName: 'Prime Client Enterprise',
        customerPhone: '9839012345',
        customerAddress: customAddress.trim() || 'Civil Lines, Prayagraj',
        capacityKw: 10,
        systemType: parsedSystemTypes[0] || 'Standard Work',
        monthlyBillRs: '5000',
        priority: 'High',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: customOwnerName.trim() || 'Owner',
        ownerInstructions: 'Initiate site survey and execute project according to custom workflow steps.',
        status: 'in progress',
        dealValueRs: 150000,
        leadSource: 'Direct Inward',
        businessId: newBizId,
        businessName: newBusiness.name,
        taskCode: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      };
    }

    onAddBusiness(newBusiness, sampleTaskToSeed);
    onClose();
  };

  const handleAddCustomStage = () => {
    const nextStep = customStages.length + 1;
    setCustomStages([
      ...customStages,
      {
        id: `stage_${Date.now()}`,
        step: nextStep,
        label: `${nextStep}. New Stage`,
        description: 'Describe milestones and responsibilities for this workflow stage',
      },
    ]);
  };

  const handleUpdateCustomStage = (index: number, field: 'label' | 'description', value: string) => {
    const updated = [...customStages];
    updated[index] = { ...updated[index], [field]: value };
    setCustomStages(updated);
  };

  const handleRemoveCustomStage = (index: number) => {
    if (customStages.length <= 2) return; // Keep minimum 2 stages
    const filtered = customStages.filter((_, i) => i !== index);
    // Re-index steps
    const reindexed = filtered.map((st, i) => ({
      ...st,
      step: i + 1,
      label: st.label.replace(/^\d+\.\s*/, `${i + 1}. `),
    }));
    setCustomStages(reindexed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Add Business / Workspace Template
                </h3>
                <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Multi-Business
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Choose an industry pre-configured template or build a 100% custom business of any type.
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

        {/* Tab Selection */}
        <div className="shrink-0 px-5 pt-3 bg-slate-900 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-amber-400 text-amber-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Industry Ready Templates ({BUSINESS_TEMPLATE_PRESETS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'border-amber-400 text-amber-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Create Custom Business (Any Type)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PRESET INDUSTRY TEMPLATES */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span>Select an Industry Template Preset</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (Preloaded with verified workflow stages, product types, and initial tasks)
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  {BUSINESS_TEMPLATE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-700 text-amber-400'
                              }`}
                            >
                              {renderBusinessIcon(preset.iconName, 'w-4 h-4')}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                              {preset.category}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white leading-snug">{preset.name}</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {preset.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-medium font-mono">
                            {preset.stages.length} Workflow Steps
                          </span>
                          {isSelected ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : (
                            <span className="text-slate-500">Click to choose</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Preset Detailed Inspection & Customizer Form */}
              <form onSubmit={handleCreateFromPreset} className="space-y-5 bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold">
                      {renderBusinessIcon(selectedPreset.iconName, 'w-5 h-5')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Configure & Activate: {selectedPreset.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {selectedPreset.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    Currency: {selectedPreset.currency} (INR)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Business Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={presetBusinessName}
                      onChange={(e) => setPresetBusinessName(e.target.value)}
                      required
                      placeholder="e.g. Balaji Electricals & Supplies"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Owner / CMD Name</label>
                    <input
                      type="text"
                      value={presetOwnerName}
                      onChange={(e) => setPresetOwnerName(e.target.value)}
                      placeholder="Dilip Enterprises"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={presetPhone}
                      onChange={(e) => setPresetPhone(e.target.value)}
                      placeholder="+91 94152 14777"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      value={presetEmail}
                      onChange={(e) => setPresetEmail(e.target.value)}
                      placeholder="contact@business.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">GST / Business Reg. No.</label>
                    <input
                      type="text"
                      value={presetGst}
                      onChange={(e) => setPresetGst(e.target.value)}
                      placeholder="09ABCDE1234F1Z5"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Office / Works Address</label>
                    <input
                      type="text"
                      value={presetAddress}
                      onChange={(e) => setPresetAddress(e.target.value)}
                      placeholder="Transport Nagar, Prayagraj, UP"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Workflow Stages Preview */}
                <div>
                  <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>Workflow Pipeline Stages for this Business ({selectedPreset.stages.length} Steps)</span>
                    <span className="text-[11px] text-emerald-400 font-mono">Auto-Configured</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {selectedPreset.stages.map((st) => (
                      <div
                        key={st.id}
                        className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1"
                      >
                        <div className="font-bold text-amber-400">{st.label}</div>
                        <div className="text-slate-400 text-[10px] line-clamp-2">{st.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System / Service Types Preview */}
                <div>
                  <h5 className="text-xs font-bold text-slate-300 mb-1.5">
                    Pre-Configured Service Lines & Project Types:
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPreset.systemTypes.map((st, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seed Sample Project Option */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={seedSampleProject}
                      onChange={(e) => setSeedSampleProject(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      Include 1 initial sample project ({selectedPreset.sampleTasks[0]?.title}) in this workspace
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
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
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create & Activate Business</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CREATE 100% CUSTOM BUSINESS (ANY BUSINESS TYPE) */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustomBusiness} className="space-y-6">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Custom Business Identity (Add Any Business Whatever It Is)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Business Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                      placeholder="e.g. Apex Security Solutions / Royal Sweet Mart"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Industry / Domain</label>
                    <input
                      type="text"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      placeholder="e.g. Facility Management & Security"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Services / Retail / Manufacturing"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tagline / Mission</label>
                    <input
                      type="text"
                      value={customTagline}
                      onChange={(e) => setCustomTagline(e.target.value)}
                      placeholder="e.g. Trusted 24/7 Security Guarding & Surveillance"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Title</label>
                    <input
                      type="text"
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      placeholder="e.g. ISO Certified / Govt. Registered"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Currency Symbol</label>
                    <select
                      value={customCurrency}
                      onChange={(e) => setCustomCurrency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-400 font-bold"
                    >
                      <option value="₹">₹ - Indian Rupee (INR)</option>
                      <option value="$">$ - US Dollar (USD)</option>
                      <option value="€">€ - Euro (EUR)</option>
                      <option value="£">£ - British Pound (GBP)</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                    </select>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Business Icon</label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {['Briefcase', 'Store', 'Building2', 'Zap', 'Sun', 'Wind', 'Car', 'Laptop', 'Package', 'Wrench', 'Shield', 'Heart', 'Truck'].map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setCustomIcon(ic)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer ${
                            customIcon === ic
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title={ic}
                        >
                          {renderBusinessIcon(ic, 'w-4 h-4')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Theme Selector */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Theme Accent Color</label>
                    <div className="flex items-center gap-1.5">
                      {(['amber', 'blue', 'emerald', 'violet', 'rose', 'cyan', 'orange', 'indigo'] as const).map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => setCustomTheme(clr)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            customTheme === clr ? 'scale-125 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                          } ${
                            clr === 'amber'
                              ? 'bg-amber-400'
                              : clr === 'blue'
                              ? 'bg-blue-500'
                              : clr === 'emerald'
                              ? 'bg-emerald-500'
                              : clr === 'violet'
                              ? 'bg-violet-500'
                              : clr === 'rose'
                              ? 'bg-rose-500'
                              : clr === 'cyan'
                              ? 'bg-cyan-400'
                              : clr === 'orange'
                              ? 'bg-orange-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Owner / CMD Name</label>
                    <input
                      type="text"
                      value={customOwnerName}
                      onChange={(e) => setCustomOwnerName(e.target.value)}
                      placeholder="Dilip Enterprises"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+91 94152 14777"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="info@mybusiness.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Office / Works Address</label>
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="Prayagraj, Uttar Pradesh"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">
                    Product Lines / Service Offerings (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={customSystemTypesStr}
                    onChange={(e) => setCustomSystemTypesStr(e.target.value)}
                    placeholder="e.g. Industrial Security, CCTV Surveillance, Armed Escort, Event Bouncers"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Custom Workflow Stages Builder */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Custom Workflow Pipeline Stages ({customStages.length} Steps)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Define the exact progression steps for projects under this business workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomStage}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {customStages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={stage.label}
                          onChange={(e) => handleUpdateCustomStage(idx, 'label', e.target.value)}
                          placeholder="Stage Name"
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-hidden focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={stage.description}
                          onChange={(e) => handleUpdateCustomStage(idx, 'description', e.target.value)}
                          placeholder="Stage description / requirements"
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                      {customStages.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomStage(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded cursor-pointer"
                          title="Remove stage"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seed Checkbox & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={seedSampleProject}
                    onChange={(e) => setSeedSampleProject(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Create initial starter demo project in this business workspace</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create & Activate Custom Business</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
