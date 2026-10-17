import React from 'react';
import {
  Building2,
  TrendingDown,
  Percent,
  CheckCircle2,
  FileText,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';

interface CommercialViewProps {
  onOpenConsultation: () => void;
}

export const CommercialView: React.FC<CommercialViewProps> = ({ onOpenConsultation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1 rounded-full border border-sky-200">
          Commercial Energy Independence
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif">
          Solar For Commercial Buildings
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Commercial grid tariffs in Uttar Pradesh range from ₹12 to ₹14 per unit. Solar energy slashes your effective power expense to just ₹4 to ₹6 per unit, delivering immediate positive cash flow and massive tax write-offs.
        </p>
      </div>

      {/* 3 Core Commercial Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">1. Substantial Cost Savings</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            Your electricity bills will see a remarkable drop as daytime lighting, air conditioning, computers, and medical equipment are directly powered by solar. Cut your monthly operating overheads and redirect capital into core business growth.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Electricity cost reduced by up to 70%</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Protection against recurring DISCOM tariff hikes</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Percent className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">2. 40% Accelerated Depreciation</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            Under Section 32 of the Indian Income Tax Act, commercial businesses can claim up to 40% accelerated depreciation in the first year itself on the total capitalized cost of the solar system, yielding dramatic corporate tax savings.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Massive reduction in taxable profit</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Shortens effective payback to under 3 years</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">3. RPO Compliance & ESG</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            Meet statutory Renewable Purchase Obligations (RPO) mandated by state electricity regulators while elevating your corporate green credentials for ISO 14001, ESG compliance, and eco-conscious clientele.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Demonstrate real environmental stewardship</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Generate clean solar energy on unused terrace area</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Suitable Segments */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sector Expertise in Prayagraj
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif mt-1">
            Ideal For All Commercial Enterprises
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { title: 'Hospitals & Clinics', desc: 'Continuous daytime HVAC & medical lab power' },
            { title: 'Schools & Colleges', desc: 'Coincides with daytime peak sun hours' },
            { title: 'Hotels & Banquets', desc: 'Air-conditioning, kitchen & laundry' },
            { title: 'Retail Showrooms', desc: 'High display lighting & glass front cooling' },
            { title: 'Offices & IT Parks', desc: 'Desktops, server rooms & workstations' },
            { title: 'Petrol Pumps & Warehouses', desc: 'Canopy & shed solar installations' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h5>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Want a Customized Commercial Feasibility Report?</h4>
            <p className="text-xs text-slate-500">We inspect your sanctioned load, 12-month billing pattern, and roof stability.</p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer"
          >
            Schedule Technical Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
