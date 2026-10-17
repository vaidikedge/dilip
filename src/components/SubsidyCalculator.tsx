import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Zap,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Building2,
  Home,
  FileText,
  Download,
  Landmark
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { QuotationModal } from './QuotationModal';
import { SolarLoanCalculator } from './SolarLoanCalculator';

interface SubsidyCalculatorProps {
  onBookSurvey?: () => void;
}

export const SubsidyCalculator: React.FC<SubsidyCalculatorProps> = ({ onBookSurvey }) => {
  const [activeTab, setActiveTab] = useState<'subsidy' | 'loan'>('subsidy');
  const [selectedKw, setSelectedKw] = useState<number>(3);
  const [consumerType, setConsumerType] = useState<'residential' | 'society'>('residential');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState<boolean>(false);

  // Calculation parameters based on PM Surya Ghar Muft Bijli Yojana & UPNEDA 2026 guidelines
  const calculation = useMemo(() => {
    const kw = selectedKw;

    // Central Subsidy: ₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW & above
    let central = 0;
    if (kw === 1) central = 30000;
    else if (kw === 2) central = 60000;
    else central = 78000;

    // UP State Subsidy (UPNEDA): ₹15,000 for 1kW, ₹30,000 for 2kW and above
    let upState = 0;
    if (kw === 1) upState = 15000;
    else upState = 30000;

    const totalSubsidy = central + upState;

    // Market cost benchmark in UP: approx ₹55,000 - ₹65,000 per kW with tier-1 mono perc & high rise GI structure
    const baseRatePerKw = kw >= 5 ? 52000 : kw >= 3 ? 55000 : 62000;
    const estimatedTotalCost = kw * baseRatePerKw;
    const netCostToPay = Math.max(0, estimatedTotalCost - totalSubsidy);

    // Generation metrics
    const dailyUnits = kw * 4.3; // Avg 4.3 units per kW/day in UP
    const monthlyUnits = dailyUnits * 30;
    const yearlyUnits = dailyUnits * 365;

    // Tariff rate in UPPCL for domestic slabs: ~₹7.2 / unit
    const tariffPerUnit = 7.2;
    const monthlySavings = Math.round(monthlyUnits * tariffPerUnit);
    const yearlySavings = Math.round(yearlyUnits * tariffPerUnit);

    // Payback period
    const paybackYears = netCostToPay > 0 ? (netCostToPay / yearlySavings).toFixed(1) : '1.5';

    // 25 Years lifetime net savings (accounting for slight degradation)
    const lifetimeSavings = Math.round(yearlySavings * 25 * 0.9 - netCostToPay);

    // Roof space required (sq ft)
    const roofAreaSqFt = kw * 90;

    return {
      kw,
      central,
      upState,
      totalSubsidy,
      estimatedTotalCost,
      netCostToPay,
      dailyUnits: dailyUnits.toFixed(1),
      monthlyUnits: Math.round(monthlyUnits),
      yearlyUnits: Math.round(yearlyUnits),
      monthlySavings,
      yearlySavings,
      paybackYears,
      lifetimeSavings,
      roofAreaSqFt
    };
  }, [selectedKw, consumerType]);

  const whatsappMessage = encodeURIComponent(
    `Hello Dilip Enterprises, I used your Solar Subsidy Calculator for a ${calculation.kw} kW solar plant in Prayagraj.\n` +
      `• Estimated Subsidy: ₹${calculation.totalSubsidy.toLocaleString('en-IN')}\n` +
      `• Net Cost to Pay: ₹${calculation.netCostToPay.toLocaleString('en-IN')}\n` +
      `• Expected Annual Savings: ₹${calculation.yearlySavings.toLocaleString('en-IN')}\n` +
      `Please contact me for free site inspection and application.`
  );

  // Quick loan computation for teaser banner
  const quickDownPayment = Math.round(calculation.netCostToPay * 0.1);
  const quickPrincipal = Math.max(0, calculation.netCostToPay - quickDownPayment);
  const quickRate = 0.07 / 12;
  const quickMonths = 60;
  const quickEmi =
    quickPrincipal > 0
      ? Math.round(
          (quickPrincipal * quickRate * Math.pow(1 + quickRate, quickMonths)) /
            (Math.pow(1 + quickRate, quickMonths) - 1)
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Top Two-Mode Tab Selector */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap sm:flex-nowrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('subsidy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'subsidy'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. Subsidy & ROI Calculator</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('loan')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'loan'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>2. Solar Loan & EMI Calculator (Bank @ 7%)</span>
          <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/40">
            Zero Upfront
          </span>
        </button>
      </div>

      {activeTab === 'loan' ? (
        <SolarLoanCalculator initialKw={selectedKw} onBookSurvey={onBookSurvey} />
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                PM Surya Ghar Muft Bijli Yojana + UPNEDA
              </span>
              <span className="hidden sm:inline text-xs text-emerald-400 font-semibold">
                Updated for 2026 Subsidy Rules
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              Solar Subsidy & Savings Calculator
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Calculate your exact Central Government + Uttar Pradesh State subsidy and discover how fast your solar plant pays for itself.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Maximum Total Subsidy
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              ₹1,08,000
            </span>
            <span className="text-[10px] text-emerald-400 block">
              Direct Bank Transfer (DBT)
            </span>
          </div>
        </div>

        {/* Consumer Type Toggle */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setConsumerType('residential')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              consumerType === 'residential'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Individual Home / Villa</span>
          </button>
          <button
            onClick={() => setConsumerType('society')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              consumerType === 'society'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Housing Society / Common Area</span>
          </button>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Selectors */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Select Desired Solar Capacity (kW)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSelectedKw(kw)}
                  className={`py-3 px-2 rounded-xl text-center font-bold text-sm transition-all border ${
                    selectedKw === kw
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-base">{kw} kW</span>
                  <span className="text-[10px] text-slate-600 block">
                    {kw === 3 ? '★ Popular' : kw === 2 ? 'Small Home' : kw >= 5 ? 'Large' : 'Basic'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>Slider Adjustment</span>
              <span className="font-bold text-amber-600">{selectedKw} kW Selected</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={selectedKw}
              onChange={(e) => setSelectedKw(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 kW (100 sq.ft)</span>
              <span>3 kW (Optimal)</span>
              <span>10 kW (1000 sq.ft)</span>
            </div>
          </div>

          {/* Recommended for table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              What you can run on {calculation.kw} kW Solar:
            </h5>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Generation:</strong> Approx. <strong>{calculation.dailyUnits} units/day</strong> (~{calculation.monthlyUnits} units/month)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Ideal for:</strong> Monthly electricity bill between{' '}
                  <strong>₹{((calculation.kw * 800) + 500).toLocaleString('en-IN')} - ₹{((calculation.kw * 1500) + 1000).toLocaleString('en-IN')}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Appliance load:</strong> {calculation.kw >= 3 ? '1.5 Ton ACs, Refrigerator, Washing Machine, Geyser, Water Pump & Lights' : 'Refrigerator, Cooler, Fans, TV & LED Lighting'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Required Rooftop Area:</strong> Approx. <strong>{calculation.roofAreaSqFt} sq. ft.</strong> of shadow-free terrace
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Financial Results */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 rounded-3xl p-6 sm:p-7 border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Box 1: Total Estimated Cost */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block uppercase">
                Estimated System Cost
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                <span>₹{calculation.estimatedTotalCost.toLocaleString('en-IN')}</span>
                <span className="text-xs font-normal text-slate-400">approx.</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes Tier-1 Panels, MPPT Inverter & Hot-dip GI Structure
              </p>
            </div>

            {/* Box 2: Total Govt Subsidy */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold uppercase">
                  Total Govt. Subsidy
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  DBT Bank Credit
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                - ₹{calculation.totalSubsidy.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-1">
                Central: ₹{calculation.central.toLocaleString('en-IN')} + UP State: ₹{calculation.upState.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Big Highlight: Net Customer Investment */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-lg shadow-orange-500/20 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-100 block">
                  Net Effective Cost to You (After Subsidy)
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                  ₹{calculation.netCostToPay.toLocaleString('en-IN')}*
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-100 block">Estimated Payback</span>
                <span className="text-2xl font-black">{calculation.paybackYears} Years</span>
              </div>
            </div>
          </div>

          {/* Key Savings Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Monthly Savings</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                ₹{calculation.monthlySavings.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Annual Bill Savings</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600">
                ₹{calculation.yearlySavings.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 block">25-Yr Net Savings</span>
              <span className="text-base sm:text-lg font-bold text-amber-600">
                ₹{(calculation.lifetimeSavings / 100000).toFixed(1)} Lakh+
              </span>
            </div>
          </div>

          {/* Solar Loan & EMI Teaser Box */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 text-white border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Zero-Burden Solar Loan Scheme</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    7.00% SBI Rate
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  10% Down Payment: <strong>₹{quickDownPayment.toLocaleString('en-IN')}</strong> • Monthly EMI: <strong>₹{quickEmi.toLocaleString('en-IN')}/mo</strong>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('loan')}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <span>Calculate Solar EMI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-5 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Quotation (PDF)</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${COMPANY_INFO.phoneClean}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Calculation on WhatsApp</span>
              </a>
              {onBookSurvey && (
                <button
                  onClick={onBookSurvey}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
                >
                  <span>Book Free Site Survey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            *Final cost and subsidy may vary based on exact roof structure height, cable length & UPNEDA portal documentation.
          </p>
        </div>
      </div>
    </div>
  )}

      {/* Quotation & PDF Download Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        calculation={calculation}
        consumerType={consumerType === 'society' ? 'housing-society' : 'residential'}
      />
    </div>
  );
};
