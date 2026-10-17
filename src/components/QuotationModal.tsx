import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  MessageCircle,
  X,
  CheckCircle2,
  ShieldCheck,
  Building,
  Home,
  Sparkles,
  Zap,
  Phone,
  User,
  MapPin,
  Loader2,
  Landmark
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { generateSolarQuotationPDF, QuotationData } from '../lib/pdfGenerator';
import { saveLeadToFirestore } from '../lib/firebase';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: {
    kw: number;
    central: number;
    upState: number;
    totalSubsidy: number;
    estimatedTotalCost: number;
    netCostToPay: number;
    monthlySavings: number;
    yearlySavings: number;
    lifetimeSavings: number;
    paybackYears: string;
    monthlyUnits: number;
    roofAreaSqFt: number;
  };
  consumerType: 'residential' | 'housing-society';
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  calculation,
  consumerType,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('Prayagraj');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate standard 5-year loan EMI @ 7%
  const downPayment = Math.round(calculation.netCostToPay * 0.1);
  const loanPrincipal = Math.max(0, calculation.netCostToPay - downPayment);
  const monthlyRate = 0.07 / 12;
  const tenureMonths = 60;
  let monthlyEmi = 0;
  if (loanPrincipal > 0) {
    monthlyEmi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
  }
  const netMonthlyProfit = Math.max(0, calculation.monthlySavings - monthlyEmi);

  const quotationData: QuotationData = {
    customerName: customerName.trim() || 'Valued Resident',
    customerPhone: customerPhone.trim() || 'Not Provided',
    customerLocation: customerLocation.trim() || 'Prayagraj',
    kw: calculation.kw,
    consumerType,
    estimatedTotalCost: calculation.estimatedTotalCost,
    centralSubsidy: calculation.central,
    upStateSubsidy: calculation.upState,
    totalSubsidy: calculation.totalSubsidy,
    netCostToPay: calculation.netCostToPay,
    monthlySavings: calculation.monthlySavings,
    yearlySavings: calculation.yearlySavings,
    lifetimeSavings: calculation.lifetimeSavings,
    paybackYears: calculation.paybackYears,
    monthlyUnits: calculation.monthlyUnits,
    roofAreaSqFt: calculation.roofAreaSqFt,
    loanDetails: {
      downPayment,
      loanPrincipal,
      interestRate: 7.0,
      tenureYears: 5,
      monthlyEmi,
      netMonthlyProfit,
    },
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // 1. Log lead in Firebase Firestore if phone is provided
      if (customerPhone) {
        saveLeadToFirestore(
          {
            fullName: customerName.trim() || 'Quotation Visitor',
            phone: customerPhone.trim(),
            location: customerLocation.trim() || 'Prayagraj',
            propertyType:
              consumerType === 'housing-society'
                ? 'Housing Society'
                : 'Home / Residential',
            monthlyBillRs: `Rs. ${Math.round(calculation.monthlySavings * 1.2)} approx`,
            desiredCapacityKw: `${calculation.kw} kW`,
            roofType: 'RCC Flat Roof',
            message: `Downloaded official PDF estimate for ${calculation.kw} kW plant (${calculation.roofAreaSqFt} sq.ft. required). Net cost: Rs. ${calculation.netCostToPay}`,
          },
          'quotation-pdf-download'
        ).catch((err) => console.warn('Background lead record note:', err));
      }

      // 2. Generate and download PDF
      generateSolarQuotationPDF(quotationData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToWhatsApp = () => {
    const text =
      `*Request for Official Solar Quotation & Site Visit*\n\n` +
      `• *Name:* ${customerName || 'Customer'}\n` +
      `• *Phone:* ${customerPhone || 'N/A'}\n` +
      `• *Location:* ${customerLocation}\n` +
      `• *System Capacity:* ${calculation.kw} kW On-Grid Solar Plant\n` +
      `• *Estimated Total Cost:* ₹${calculation.estimatedTotalCost.toLocaleString('en-IN')}\n` +
      `• *Govt. Subsidy:* ₹${calculation.totalSubsidy.toLocaleString('en-IN')} (Central + UPNEDA)\n` +
      `• *Net Payable:* ₹${calculation.netCostToPay.toLocaleString('en-IN')}\n` +
      `• *Expected Monthly Savings:* ₹${calculation.monthlySavings.toLocaleString('en-IN')}\n\n` +
      `Please send me the detailed proposal on WhatsApp.`;

    window.open(
      `https://wa.me/${COMPANY_INFO.phoneClean}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Official Turnkey Estimate
            </span>
            <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">
              UPNEDA Authorized
            </span>
          </div>

          <h3 className="text-2xl font-black text-white font-serif">
            Download Solar Quotation (PDF)
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Get an official, branded project cost estimate for a{' '}
            <strong className="text-amber-400 font-bold">{calculation.kw} kW On-Grid Solar Plant</strong> in Prayagraj.
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Customer info form */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-600" />
              <span>Personalize Your Quotation (Optional)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Prayagraj Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Civil Lines / Naini"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              *Your name & location will appear on the generated estimate letterhead.
            </p>
          </div>

          {/* Quotation Summary Card */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">System Capacity</div>
                <div className="text-lg font-black text-slate-900">
                  {calculation.kw} kWp Grid-Tied Solar Plant
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-semibold uppercase">Roof Space Required</div>
                <div className="text-sm font-bold text-slate-700">
                  ~{calculation.roofAreaSqFt} Sq. Ft. shadow-free
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Estimated Gross System Cost:</span>
                <span className="font-bold text-slate-900">
                  ₹{calculation.estimatedTotalCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50 text-emerald-700">
                <span>Central Govt. Subsidy (PM Surya Ghar):</span>
                <span className="font-bold">
                  - ₹{calculation.central.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50 text-emerald-700">
                <span>UP State Govt. Subsidy (UPNEDA):</span>
                <span className="font-bold">
                  - ₹{calculation.upState.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-emerald-800 bg-emerald-50/70 px-2 rounded-lg">
                <span>Total Direct Bank Subsidy (DBT):</span>
                <span className="text-sm">- ₹{calculation.totalSubsidy.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-2 items-center bg-amber-50 px-3 rounded-xl border border-amber-200">
                <div>
                  <span className="font-bold text-amber-900 block text-xs">
                    Net Investment (Cost to You):
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Payback period: <strong>{calculation.paybackYears} Years</strong>
                  </span>
                </div>
                <span className="text-xl font-black text-amber-900">
                  ₹{calculation.netCostToPay.toLocaleString('en-IN')}*
                </span>
              </div>

              {/* Nationalized Bank Loan Box */}
              <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Landmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Collateral-Free Solar Loan (SBI / Canara @ 7%)</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Only 10% Down Payment (₹{downPayment.toLocaleString('en-IN')}) • 5 Yrs
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">Monthly EMI</div>
                  <div className="text-base font-black text-emerald-400">
                    ₹{monthlyEmi.toLocaleString('en-IN')}/mo
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Included in this quotation:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tier-1 TopCon / Mono PERC DCR Panels</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>On-Grid Inverter with Remote Wi-Fi App</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hot-Dip Galvanized Heavy Structure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UPPCL Net-Metering & Portal Subsidy Filing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success notice */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quotation PDF downloaded successfully! Check your browser downloads.</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSendToWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-xs sm:text-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send to My WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valid for 15 days • PM Surya Ghar 2026</span>
              </span>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
