import React, { useState } from 'react';
import {
  X,
  Zap,
  IndianRupee,
  Share2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  Sun,
  Leaf,
  Plus
} from 'lucide-react';
import { calculateSolarQuotationBreakdown, CrmUser } from '../../data/crmData';
import { playActionClickSound } from '../../utils/audioAlert';

interface SolarQuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CrmUser;
  onCreateTaskFromQuote?: (quoteData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    capacityKw: number;
    systemType: 'On-Grid Rooftop' | 'Hybrid Solar' | 'Off-Grid' | 'Commercial HT';
    dealValueRs: number;
    notes: string;
  }) => void;
}

export const SolarQuotationGeneratorModal: React.FC<SolarQuotationGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateTaskFromQuote,
}) => {
  const [capacityKw, setCapacityKw] = useState<number>(3);
  const [systemType, setSystemType] = useState<'On-Grid Rooftop' | 'Hybrid Solar' | 'Off-Grid' | 'Commercial HT'>('On-Grid Rooftop');
  const [isResidentialSuryaGhar, setIsResidentialSuryaGhar] = useState<boolean>(true);
  const [panelBrand, setPanelBrand] = useState<'Waaree' | 'Adani' | 'Tata Solar' | 'Goldi' | 'Vikram Solar'>('Waaree');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('Prayagraj, Uttar Pradesh');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  if (!isOpen) return null;

  const quote = calculateSolarQuotationBreakdown(capacityKw, systemType, isResidentialSuryaGhar);

  const formattedWhatsAppText = `☀️ *DILIP ENTERPRISES - PM SURYA GHAR SOLAR PROPOSAL* ☀️
*Official UPPCL Approved Solar Channel Partner, Prayagraj*
----------------------------------------
👤 *Customer Name:* ${customerName.trim() || 'Sir/Ma\'am'}
📍 *Site Location:* ${customerAddress.trim()}
⚡ *Proposed System:* ${quote.capacityKw}kW ${quote.systemType} (${panelBrand} DCR Modules)
📐 *Required Roof Area:* ~${quote.approxAreaSqFt} Sq. Ft. (Shadow Free)

📊 *FINANCIAL & SUBSIDY BREAKDOWN:*
• Total Estimated Project Cost: ₹${quote.totalGrossCostRs.toLocaleString('en-IN')}
${quote.totalSubsidyRs > 0 ? `• 🏛️ Central Govt CFA Subsidy (PM Surya Ghar): -₹${quote.centralSubsidyCfaRs.toLocaleString('en-IN')}
• 🏛️ UP State Govt Top-up Subsidy: -₹${quote.upStateSubsidyRs.toLocaleString('en-IN')}
• ⭐ *Total Subsidy Benefit:* -₹${quote.totalSubsidyRs.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
💰 *NET EFFECTIVE CUSTOMER COST:* ₹${quote.netPayableRs.toLocaleString('en-IN')}*
━━━━━━━━━━━━━━━━━━━━` : `• Total Net Investment: ₹${quote.netPayableRs.toLocaleString('en-IN')}`}

⚡ *MONTHLY SAVINGS & GENERATION:*
• Monthly Generation: ~${quote.monthlyGenerationUnits} Units (kWh)
• Estimated Monthly Bill Savings: ~₹${quote.monthlySavingsRs.toLocaleString('en-IN')}
• Annual Electricity Savings: ~₹${quote.annualSavingsRs.toLocaleString('en-IN')}
• Payback Period: Just ${quote.paybackYears} Years!
• 25-Year Cumulative Savings: ~₹${(quote.twentyFiveYearSavingsRs / 100000).toFixed(2)} Lakhs
🌿 Environmental Impact: ${quote.carbonSavedTonnesPerYear} Tonnes CO₂ Saved/Year

🛡️ *WARRANTIES INCLUDED:*
✓ 25 Years Performance Warranty on Solar Panels
✓ 5 Years Inverter Replacement Warranty
✓ Full DISCOM (UPPCL) Net Metering & Subsidy Assistance

📞 *Contact Dilip Enterprises:*
Shri Dilip Enterprises (Proprietor): +91 94152 14777 / 94506 14777
Office: 42/18-A/1, Lowther Road, Darbhanga Colony, Prayagraj`;

  const handleShareWhatsApp = () => {
    playActionClickSound();
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(formattedWhatsAppText)}`
      : `https://wa.me/?text=${encodeURIComponent(formattedWhatsAppText)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyProposal = () => {
    playActionClickSound();
    navigator.clipboard.writeText(formattedWhatsAppText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleCreateProjectTask = () => {
    if (!onCreateTaskFromQuote) return;
    playActionClickSound();
    onCreateTaskFromQuote({
      customerName: customerName.trim() || 'Solar Inquiry Lead',
      customerPhone: customerPhone.trim() || '+91 98765 43210',
      customerAddress: customerAddress.trim() || 'Prayagraj, UP',
      capacityKw: quote.capacityKw,
      systemType,
      dealValueRs: quote.netPayableRs,
      notes: `PM Surya Ghar Quote generated. Panel: ${panelBrand} DCR. Subsidy eligible: ₹${quote.totalSubsidyRs.toLocaleString('en-IN')}. Net cost: ₹${quote.netPayableRs.toLocaleString('en-IN')}.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-black">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Solar Quotation & PM Surya Ghar Subsidy Proposal
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  UPPCL Feasible
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate 1-click official solar proposals with MNRE CFA & UP State subsidy calculation
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

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Left Column: Form & Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>1. System Capacity & Type</span>
              </h3>

              {/* Quick Capacity Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Capacity (kW)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 10].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setCapacityKw(kw)}
                      className={`py-2 text-xs font-black rounded-lg cursor-pointer transition-all ${
                        capacityKw === kw
                          ? 'bg-[#1a3882] text-white shadow-md ring-2 ring-blue-400'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {kw} kW
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for custom kW */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Custom Size:</span>
                  <span className="font-bold text-[#1a3882]">{capacityKw} kW</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(Number(e.target.value))}
                  className="w-full accent-[#1a3882] cursor-pointer"
                />
              </div>

              {/* System Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Installation / Grid Type
                </label>
                <select
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="On-Grid Rooftop">On-Grid Rooftop (Net-Metering / Subsidy Eligible)</option>
                  <option value="Hybrid Solar">Hybrid Solar (Grid-Tied + Battery Backup)</option>
                  <option value="Off-Grid">Off-Grid (Standalone Battery System)</option>
                  <option value="Commercial HT">Commercial / Industrial HT Solar</option>
                </select>
              </div>

              {/* PM Surya Ghar Subsidy Toggle */}
              {(systemType === 'On-Grid Rooftop' || systemType === 'Hybrid Solar') && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 block">PM Surya Ghar Subsidy</span>
                    <span className="text-[11px] text-amber-800">Apply Central & UP State CFA</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isResidentialSuryaGhar}
                    onChange={(e) => setIsResidentialSuryaGhar(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              )}

              {/* Panel Brand */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Solar Panel Brand (DCR / ALMM)
                </label>
                <select
                  value={panelBrand}
                  onChange={(e) => setPanelBrand(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                >
                  <option value="Waaree">Waaree Bifacial TOPCon 550Wp DCR</option>
                  <option value="Adani">Adani Solar Mono PERC 545Wp DCR</option>
                  <option value="Tata Solar">Tata Power Solar 545Wp DCR</option>
                  <option value="Goldi">Goldi Solar Mono PERC DCR</option>
                  <option value="Vikram Solar">Vikram Solar High Efficiency DCR</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>2. Customer Information</span>
              </h3>
              <div>
                <input
                  type="text"
                  placeholder="Customer Full Name (e.g. Ramesh Chandra)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Customer Mobile Number (e.g. 9839012345)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Installation Address / Area (e.g. Civil Lines, Prayagraj)"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Quotation Card & Breakdown (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-900/50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Live Proposal Summary
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {quote.capacityKw} kW {quote.systemType}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-blue-200">Required Shadow-Free Roof:</span>
                  <div className="text-sm font-bold text-amber-300">~{quote.approxAreaSqFt} Sq. Ft.</div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-300 border-b border-white/5">
                  <span>Base System & BOS Cost ({quote.capacityKw}kW):</span>
                  <span className="font-semibold text-white">₹{quote.baseCostRs.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 border-b border-white/5">
                  <span>GST (12% MNRE Benchmark):</span>
                  <span className="font-semibold text-white">+₹{quote.gstAmountRs.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-slate-200 border-b border-white/10">
                  <span>Gross Project Cost:</span>
                  <span className="text-base text-white">₹{quote.totalGrossCostRs.toLocaleString('en-IN')}</span>
                </div>

                {quote.totalSubsidyRs > 0 && (
                  <>
                    <div className="flex justify-between py-1 text-emerald-300 font-semibold">
                      <span>Central Govt Subsidy (CFA PM Surya Ghar):</span>
                      <span>-₹{quote.centralSubsidyCfaRs.toLocaleString('en-IN')}</span>
                    </div>
                    {quote.upStateSubsidyRs > 0 && (
                      <div className="flex justify-between py-1 text-emerald-300 font-semibold border-b border-white/5">
                        <span>UP State Govt Subsidy (Top-up):</span>
                        <span>-₹{quote.upStateSubsidyRs.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 text-emerald-400 font-black bg-emerald-950/40 px-2 rounded-lg border border-emerald-500/30">
                      <span>Total Subsidy Benefit:</span>
                      <span>-₹{quote.totalSubsidyRs.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                {/* Final Net Amount */}
                <div className="mt-3 pt-3 border-t-2 border-amber-400/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 block uppercase">
                      Net Customer Payable Amount:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Direct out-of-pocket investment after subsidy)
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400">
                    ₹{quote.netPayableRs.toLocaleString('en-IN')}*
                  </div>
                </div>
              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-blue-200 block">Monthly Generation</span>
                  <span className="text-sm font-black text-emerald-400">
                    ~{quote.monthlyGenerationUnits} Units
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-blue-200 block">Monthly Bill Savings</span>
                  <span className="text-sm font-black text-amber-300">
                    ~₹{quote.monthlySavingsRs.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-blue-200 block">Payback Period</span>
                  <span className="text-sm font-black text-white">
                    {quote.paybackYears} Years
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send Quotation to WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyProposal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs border border-slate-300 cursor-pointer transition-colors"
                  title="Copy formatted quotation to clipboard"
                >
                  {copiedNotification ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <span>Copy Text</span>
                  )}
                </button>
              </div>

              {onCreateTaskFromQuote && (
                <button
                  type="button"
                  onClick={handleCreateProjectTask}
                  className="w-full bg-[#1a3882] hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Convert this Quote into a CRM Project Task</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
