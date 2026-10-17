import React from 'react';
import {
  Home,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Phone,
  MessageCircle,
  HelpCircle,
  Calculator,
  Percent,
  Download,
  Landmark
} from 'lucide-react';
import { COMPANY_INFO, SUBSIDY_MATRIX, FAQS } from '../data/solarData';

interface ResidentialViewProps {
  onOpenConsultation: () => void;
  onNavigateToCalculator: () => void;
}

export const ResidentialView: React.FC<ResidentialViewProps> = ({
  onOpenConsultation,
  onNavigateToCalculator,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
          PM Surya Ghar Muft Bijli Yojana
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif">
          Solar for Homes & Housing Societies
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Switching to solar energy in residential areas and societies is a factual, environmentally responsible, and lucrative choice. Cut your power bills to zero with up to ₹1,08,000 in total subsidies in Uttar Pradesh.
        </p>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Zero Electricity Bills</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            The upfront investment is recovered in 3 to 4 years, delivering over 20+ years of free daytime electricity for common area utilities and home appliances.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Rooftop Protection</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Solar panels shade your rooftop from direct heat, preventing thermal cracks, extending terrace waterproofing life, and keeping top-floor rooms 3-5°C cooler!
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Direct Bank Subsidy</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct Benefit Transfer (DBT) credited straight to your bank account after net-meter installation under PM Surya Ghar & UPNEDA schemes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Home className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Elevated Headroom</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            We provide elevated GI structures with 7-9 ft headroom so you retain 100% of your rooftop terrace for walking, gatherings, and gardening.
          </p>
        </div>
      </div>

      {/* Official Subsidy Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Uttar Pradesh Official Scheme
            </span>
            <h3 className="text-2xl font-bold font-serif mt-1">
              Residential Solar Rooftop Subsidy Rates
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comparison of revised PM Surya Ghar + UPNEDA State Subsidy for Prayagraj consumers
            </p>
          </div>

          <button
            onClick={onNavigateToCalculator}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm self-start md:self-auto cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Interactive Calculator</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Central Subsidy</th>
                <th className="py-3.5 px-4">UP State Subsidy</th>
                <th className="py-3.5 px-4 text-emerald-700">Total Subsidy</th>
                <th className="py-3.5 px-4">Estimated Total Cost</th>
                <th className="py-3.5 px-4 font-black text-slate-900">Net Cost to Pay</th>
                <th className="py-3.5 px-4 text-right">Annual Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {SUBSIDY_MATRIX.map((row) => (
                <tr
                  key={row.capacityKw}
                  className={`hover:bg-amber-50/50 transition-colors ${
                    row.capacityKw === 3 ? 'bg-amber-50/30 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{row.capacityKw} kWp</span>
                    {row.capacityKw === 3 && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                        Most Popular
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">₹{row.centralSubsidy.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">₹{row.upStateSubsidy.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    ₹{row.totalSubsidy.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    ₹{row.estimatedCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ₹{row.netCost.toLocaleString('en-IN')}*
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                    ₹{row.annualSavingsRs.toLocaleString('en-IN')} / yr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>*Net cost varies according to structure height, cable length & site survey.</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToCalculator}
              className="inline-flex items-center gap-1.5 text-slate-900 font-bold bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Download PDF Estimate</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Book Free On-Site Measurement in Prayagraj</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 0% Out-of-Pocket Solar Loan & EMI Financing Highlight */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                Collateral-Free Bank Financing
              </span>
              <span className="text-xs text-amber-400 font-semibold">
                7.00% SBI Concessional Rate
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-serif text-white">
              Install Rooftop Solar with ZERO Out-of-Pocket Burden
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Under PM Surya Ghar Muft Bijli Yojana, nationalized banks (SBI, Canara Bank, PNB, Bank of Baroda) provide collateral-free loans up to 90% project cost. Your monthly electricity bill savings are greater than your loan EMI, making it cash-flow positive from Month 1!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Down Payment</span>
                <span className="font-bold text-white text-sm">Only 10% Margin</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Interest Rate</span>
                <span className="font-bold text-amber-400 text-sm">7.00% p.a.</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px]">Loan Tenure</span>
                <span className="font-bold text-emerald-400 text-sm">Up to 7-10 Years</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onNavigateToCalculator}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Your Monthly EMI</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <span>Get Bank Liaison Help</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Housing Society Specific Benefits */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold font-serif">
          Special Benefits for Housing Societies & Resident Welfare Associations (RWAs)
        </h3>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Common area electricity loads (lifts, borewells, corridor illumination, perimeter lighting, club houses) often cost residential societies thousands of rupees every month. Installing a shared rooftop solar plant eliminates this recurring maintenance burden.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h5 className="font-bold text-amber-400 text-base">Slash Maintenance Charges</h5>
            <p className="text-xs text-slate-300">
              Lowers common area maintenance (CAM) fee for all society flat owners by substituting grid power with solar.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h5 className="font-bold text-emerald-400 text-base">Subsidy Up to 500 kW</h5>
            <p className="text-xs text-slate-300">
              Housing societies are eligible for central government financial assistance up to ₹18,000 per kW for common facilities.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h5 className="font-bold text-sky-400 text-base">Increase Property Value</h5>
            <p className="text-xs text-slate-300">
              Green buildings with certified solar setups enjoy higher appreciation, premium rental yields, and modern environmental appeal.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={onOpenConsultation}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3 rounded-xl text-sm transition-all cursor-pointer"
          >
            Request Housing Society Solar Proposal
          </button>
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discuss with Solar Engineer</span>
          </a>
        </div>
      </div>
    </div>
  );
};
