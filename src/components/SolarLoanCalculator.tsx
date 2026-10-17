import React, { useState, useMemo } from 'react';
import {
  Landmark,
  IndianRupee,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Download,
  ShieldCheck,
  Zap,
  Info,
  Building,
  HelpCircle,
  Clock,
  BadgeCheck,
  ChevronRight
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { QuotationModal } from './QuotationModal';

interface SolarLoanCalculatorProps {
  initialKw?: number;
  onBookSurvey?: () => void;
}

export const SolarLoanCalculator: React.FC<SolarLoanCalculatorProps> = ({
  initialKw = 3,
  onBookSurvey,
}) => {
  const [selectedKw, setSelectedKw] = useState<number>(initialKw);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(10); // Standard 10% minimum
  const [tenureYears, setTenureYears] = useState<number>(5); // 3, 5, 7, 10
  const [interestRate, setInterestRate] = useState<number>(7.0); // 7.0% PM Surya Ghar SBI standard
  const [financeBasis, setFinanceBasis] = useState<'net-cost' | 'total-cost'>('net-cost');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('sbi');

  // Base system calculations
  const plantMetrics = useMemo(() => {
    const kw = selectedKw;
    let central = 0;
    if (kw === 1) central = 30000;
    else if (kw === 2) central = 60000;
    else central = 78000;

    let upState = kw === 1 ? 15000 : 30000;
    const totalSubsidy = central + upState;

    const baseRatePerKw = kw >= 5 ? 52000 : kw >= 3 ? 55000 : 62000;
    const totalCost = kw * baseRatePerKw;
    const netCost = Math.max(0, totalCost - totalSubsidy);

    const monthlyUnits = Math.round(kw * 4.3 * 30);
    const monthlySavings = Math.round(monthlyUnits * 7.2);
    const yearlySavings = monthlySavings * 12;

    return {
      kw,
      totalCost,
      central,
      upState,
      totalSubsidy,
      netCost,
      monthlyUnits,
      monthlySavings,
      yearlySavings,
      roofAreaSqFt: kw * 90,
      paybackYears: (netCost / yearlySavings).toFixed(1),
      lifetimeSavings: Math.round(yearlySavings * 25 * 0.9 - netCost),
    };
  }, [selectedKw]);

  // Loan & EMI Calculations
  const loanMetrics = useMemo(() => {
    // Project cost considered for loan
    const costToFinance =
      financeBasis === 'net-cost' ? plantMetrics.netCost : plantMetrics.totalCost;

    const downPaymentAmount = Math.round((costToFinance * downPaymentPercent) / 100);
    const loanPrincipal = Math.max(0, costToFinance - downPaymentAmount);

    const tenureMonths = tenureYears * 12;
    const monthlyRate = interestRate / (12 * 100);

    let monthlyEmi = 0;
    if (loanPrincipal > 0 && monthlyRate > 0) {
      monthlyEmi = Math.round(
        (loanPrincipal *
          monthlyRate *
          Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      );
    }

    const totalRepayment = monthlyEmi * tenureMonths;
    const totalInterest = Math.max(0, totalRepayment - loanPrincipal);
    const totalExpenditure = downPaymentAmount + totalRepayment;

    // Monthly Cash Flow: Bill Savings minus Monthly EMI
    const netMonthlyCashFlow = plantMetrics.monthlySavings - monthlyEmi;
    const isCashFlowPositive = netMonthlyCashFlow >= 0;

    return {
      costToFinance,
      downPaymentAmount,
      loanPrincipal,
      tenureMonths,
      monthlyEmi,
      totalInterest,
      totalRepayment,
      totalExpenditure,
      netMonthlyCashFlow,
      isCashFlowPositive,
    };
  }, [plantMetrics, downPaymentPercent, tenureYears, interestRate, financeBasis]);

  const bankPartners = [
    {
      id: 'sbi',
      name: 'State Bank of India (SBI)',
      scheme: 'SBI Surya Ghar Rooftop Solar Loan',
      rate: '7.00% p.a.',
      maxTenure: '10 Years',
      features: 'Collateral-free up to ₹2 Lakh for 3kW. Zero foreclosure penalty.',
      badge: 'Most Popular in UP',
    },
    {
      id: 'canara',
      name: 'Canara Bank',
      scheme: 'Canara Solar Scheme',
      rate: '7.00% p.a.',
      maxTenure: '7 Years',
      features: 'Quick branch processing in Prayagraj. Direct vendor disbursement.',
      badge: 'Quick Approval',
    },
    {
      id: 'pnb',
      name: 'Punjab National Bank (PNB)',
      scheme: 'PNB Solar Rooftop Scheme',
      rate: '7.00% p.a.',
      maxTenure: '7 Years',
      features: 'Minimal margin money (10%), zero processing fee on Surya Ghar portal.',
      badge: 'Digital Process',
    },
    {
      id: 'baroda',
      name: 'Bank of Baroda',
      scheme: 'Baroda Surya Ghar Loan',
      rate: '7.00% p.a.',
      maxTenure: '10 Years',
      features: 'Hassle-free documentation with Dilip Enterprises UPNEDA registration.',
      badge: 'Doorstep Assist',
    },
  ];

  const loanWhatsAppMsg = encodeURIComponent(
    `Hello Dilip Enterprises, I checked the Solar Loan & EMI Calculator for a ${plantMetrics.kw} kW plant in Prayagraj.\n` +
      `• Estimated Net Cost: ₹${plantMetrics.netCost.toLocaleString('en-IN')}\n` +
      `• Down Payment (${downPaymentPercent}%): ₹${loanMetrics.downPaymentAmount.toLocaleString('en-IN')}\n` +
      `• Loan Amount: ₹${loanMetrics.loanPrincipal.toLocaleString('en-IN')}\n` +
      `• Monthly EMI (${tenureYears} Yrs @ ${interestRate}%): ₹${loanMetrics.monthlyEmi.toLocaleString('en-IN')}/mo\n` +
      `• Expected Monthly Bill Savings: ₹${plantMetrics.monthlySavings.toLocaleString('en-IN')}/mo\n` +
      `Please assist me with nationalized bank loan application & site survey.`
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                Collateral-Free Nationalized Bank Loans
              </span>
              <span className="text-xs text-amber-400 font-semibold hidden sm:inline">
                Special 7.00% Subsidized Rate
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              Solar Loan & Monthly EMI Calculator
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl">
              Install a high-efficiency solar plant today with just <strong>10% down payment</strong>. Your monthly electricity bill savings will pay off your EMI!
            </p>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Concessional Interest
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              7.00%
              <span className="text-sm font-normal text-slate-300"> p.a.</span>
            </span>
            <span className="text-[10px] text-emerald-400 block font-medium">
              SBI, PNB & Canara Bank
            </span>
          </div>
        </div>

        {/* Finance Mode Toggle */}
        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 max-w-xl">
          <button
            type="button"
            onClick={() => setFinanceBasis('net-cost')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              financeBasis === 'net-cost'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Option A: Finance Net Cost (After Subsidy)
          </button>
          <button
            type="button"
            onClick={() => setFinanceBasis('total-cost')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              financeBasis === 'total-cost'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Option B: Finance 90% Gross Cost (Subsidy to Bank)
          </button>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Capacity selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-900">
                1. System Capacity (kW)
              </label>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {selectedKw} kW Selected
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSelectedKw(kw)}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    selectedKw === kw
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black">{kw} kW</span>
                  <span className="text-[10px] text-slate-500">
                    {kw === 3 ? 'Popular' : kw < 3 ? 'Basic' : 'Commercial'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Down Payment Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-900">
                2. Down Payment (Margin Money)
              </label>
              <span className="text-xs font-bold text-slate-700">
                {downPaymentPercent}% (₹{loanMetrics.downPaymentAmount.toLocaleString('en-IN')})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[10, 15, 20, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    downPaymentPercent === pct
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pct}% {pct === 10 ? '(Min)' : ''}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>10% (Zero burden)</span>
              <span>30%</span>
              <span>50% (Low EMI)</span>
            </div>
          </div>

          {/* Tenure Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-900">
                3. Loan Repayment Tenure
              </label>
              <span className="text-xs font-bold text-slate-700">
                {tenureYears} Years ({tenureYears * 12} Months)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map((yrs) => (
                <button
                  key={yrs}
                  type="button"
                  onClick={() => setTenureYears(yrs)}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    tenureYears === yrs
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">{yrs} Years</span>
                  <span className="text-[10px] text-slate-600 block">
                    {yrs === 5 ? '★ Recommended' : `${yrs * 12} mo`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>Annual Interest Rate</span>
              </label>
              <span className="text-xs font-black text-amber-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {interestRate.toFixed(2)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="6.5"
              max="9.5"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>6.5% (Special Green)</span>
              <span className="font-bold text-emerald-700">7.0% (SBI Surya Ghar)</span>
              <span>9.5%</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              *PM Surya Ghar nationalized bank rate is capped at ~7.00% p.a. for residential plants up to 3kW.
            </p>
          </div>
        </div>

        {/* Right Column: Calculations & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Highlight Card: Monthly EMI vs Bill Savings */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Estimated Monthly EMI
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  ₹{loanMetrics.monthlyEmi.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold block">
                  Expected Monthly Bill Savings
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  + ₹{plantMetrics.monthlySavings.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </div>
              </div>
            </div>

            {/* Zero-Burden Cash Flow Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                loanMetrics.isCashFlowPositive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/50 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {loanMetrics.isCashFlowPositive ? (
                      <>
                        <span>Net Monthly Profit:</span>
                        <span className="text-emerald-400 font-black text-base">
                          + ₹{loanMetrics.netMonthlyCashFlow.toLocaleString('en-IN')} / month
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Minimal Net Monthly Outflow:</span>
                        <span className="text-amber-400 font-black text-base">
                          ₹{Math.abs(loanMetrics.netMonthlyCashFlow).toLocaleString('en-IN')} / month
                        </span>
                      </>
                    )}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {loanMetrics.isCashFlowPositive
                      ? `Your electricity bill savings exceed your loan EMI by ₹${loanMetrics.netMonthlyCashFlow.toLocaleString(
                          'en-IN'
                        )} every month! The solar plant pays for itself from Month 1 with ZERO extra financial burden.`
                      : `Your monthly power bill is virtually eliminated, leaving you with almost zero electricity expenses while repaying your loan.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Down Payment</span>
                <span className="font-bold text-white text-sm">
                  ₹{loanMetrics.downPaymentAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Loan Principal</span>
                <span className="font-bold text-white text-sm">
                  ₹{loanMetrics.loanPrincipal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Total Interest</span>
                <span className="font-bold text-amber-400 text-sm">
                  ₹{loanMetrics.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Total Repayment</span>
                <span className="font-bold text-white text-sm">
                  ₹{loanMetrics.totalRepayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Nationalized Bank Partners In Prayagraj */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-600" />
                <span>Solar Loan Bank Partners in Prayagraj (UP)</span>
              </h4>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Pre-Approved Schemes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bankPartners.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedBank === bank.id
                      ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-400'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{bank.name}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {bank.rate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{bank.features}</p>
                </div>
              ))}
            </div>

            {/* Document Checklist Accordion / Note */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Simple Documentation Checklist for Approval:</span>
              </div>
              <p className="text-[11px] text-slate-500">
                1. Electricity Bill (latest 2 months) • 2. Aadhaar & PAN Card • 3. House Ownership / Tax Receipt • 4. 6 Months Bank Statement • 5. Dilip Enterprises Vendor Quotation
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsQuotationModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Quotation with Loan (PDF)</span>
              </button>

              <a
                href={`https://wa.me/${COMPANY_INFO.phoneClean}?text=${loanWhatsAppMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-xs sm:text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Apply for Loan Assistance</span>
              </a>
            </div>

            {onBookSurvey && (
              <button
                onClick={onBookSurvey}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Book Free Site Measurement & Bank Liaison Support</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quotation PDF Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        calculation={{
          kw: plantMetrics.kw,
          central: plantMetrics.central,
          upState: plantMetrics.upState,
          totalSubsidy: plantMetrics.totalSubsidy,
          estimatedTotalCost: plantMetrics.totalCost,
          netCostToPay: plantMetrics.netCost,
          monthlySavings: plantMetrics.monthlySavings,
          yearlySavings: plantMetrics.yearlySavings,
          lifetimeSavings: plantMetrics.lifetimeSavings,
          paybackYears: plantMetrics.paybackYears,
          monthlyUnits: plantMetrics.monthlyUnits,
          roofAreaSqFt: plantMetrics.roofAreaSqFt,
        }}
        consumerType="residential"
      />
    </div>
  );
};
