import React, { useState } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Cable,
  Wrench,
  HelpCircle,
  Phone,
  MessageCircle
} from 'lucide-react';
import { SOLAR_ESSENTIALS, COMPANY_INFO } from '../data/solarData';

interface HowSolarWorksViewProps {
  onOpenConsultation: () => void;
}

export const HowSolarWorksView: React.FC<HowSolarWorksViewProps> = ({ onOpenConsultation }) => {
  const [activeSystemType, setActiveSystemType] = useState<'on-grid' | 'off-grid' | 'hybrid'>('on-grid');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
          Solar Engineering Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif">
          How Solar Power Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Learn how sunlight is converted into usable 230V AC electricity for your home or factory, how net-metering works with UPPCL, and which system configuration fits your needs.
        </p>
      </div>

      {/* System Type Selector & Visual Flow */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold font-serif">
              Solar System Architecture Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a system type below to understand component connections and energy flow.
            </p>
          </div>

          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveSystemType('on-grid')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSystemType === 'on-grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              On-Grid System (Recommended)
            </button>
            <button
              onClick={() => setActiveSystemType('off-grid')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSystemType === 'off-grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Off-Grid (With Battery)
            </button>
            <button
              onClick={() => setActiveSystemType('hybrid')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSystemType === 'hybrid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Hybrid (Best of Both)
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {/* Active System Description */}
          {activeSystemType === 'on-grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase">
                  Eligible for PM Surya Ghar Subsidy
                </span>
                <h4 className="text-2xl font-bold text-slate-900 font-serif">
                  On-Grid (Grid-Tied) Solar System
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed text-justify">
                  The most economical and popular solar system for cities like Prayagraj with reliable grid electricity. Solar panels generate DC power, which is converted to 230V AC by a grid-tie string inverter. Power is first used by home appliances; any surplus electricity is automatically exported to the grid via the <strong>Bi-directional Net Meter</strong>, spinning your meter backward!
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Lowest initial capital cost (no recurring battery replacement)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Maximum government subsidy (Up to ₹1,08,000 in UP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Zero maintenance; panels last 25+ years</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    On-Grid Power Flow Diagram
                  </span>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Sun className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Solar Panels</span>
                      <span className="text-[10px] text-slate-400">Generates DC</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Cpu className="w-6 h-6 text-sky-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">On-Grid Inverter</span>
                      <span className="text-[10px] text-slate-400">Converts to AC</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Net Meter / Grid</span>
                      <span className="text-[10px] text-slate-400">Import / Export</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center pt-2">
                    *Note: On-grid systems shut down during power outages for lineman safety (Anti-Islanding Protection).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSystemType === 'off-grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase">
                  100% Independent Power
                </span>
                <h4 className="text-2xl font-bold text-slate-900 font-serif">
                  Off-Grid Solar System with Battery Bank
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed text-justify">
                  Ideal for rural farms, farmhouses, tube-well pumps, and remote areas with frequent power outages. Solar panels charge a battery bank (Tubular C10 or Lithium LiFePO4) through a Solar PCU. When the grid fails, your home continues to run smoothly on stored solar power day and night.
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Provides continuous backup during power cuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>No reliance on grid availability or DISCOM meter approval</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Off-Grid Power Flow Diagram
                  </span>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Sun className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Solar Panels</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <BatteryCharging className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Battery Bank</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Home Load</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSystemType === 'hybrid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">
                  The Premium All-in-One Solution
                </span>
                <h4 className="text-2xl font-bold text-slate-900 font-serif">
                  Hybrid Solar System (On-Grid + Battery)
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed text-justify">
                  A Hybrid Solar System combines the best of both worlds: net-metering to export excess energy and cut your electricity bill, combined with a high-capacity lithium battery bank for uninterrupted backup during blackouts.
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Never face a blackout while still saving electricity bills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Smart energy management: solar first, battery second, grid third</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Hybrid Power Flow Diagram
                  </span>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Sun className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Solar Panels</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Cpu className="w-6 h-6 text-sky-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Hybrid Inverter</span>
                      <span className="text-[10px] text-indigo-500">+ Battery</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 sm:rotate-0" />
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                      <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <span className="text-xs font-bold block">Net Meter + Load</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Solar Essentials: 6 Core Engineering Components */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
            Hardware Quality Standards
          </span>
          <h3 className="text-3xl font-bold text-slate-900 mt-2 font-serif">
            Solar Essentials: What Makes Our Systems Last 25 Years
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            We never compromise on balance-of-system (BOS) quality. Here are the core building blocks of our installations in Prayagraj.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLAR_ESSENTIALS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  0{idx + 1}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                {item.desc}
              </p>

              <div className="pt-2 text-[11px] font-semibold text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{item.specs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold font-serif max-w-xl mx-auto">
          Need Guidance on the Right Solar System for Your Roof?
        </h3>
        <p className="text-slate-300 text-sm max-w-lg mx-auto">
          Our engineering team visits your site in Prayagraj, inspects your existing electrical wiring, and recommends the perfect system size.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenConsultation}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-7 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
          >
            Book Free Rooftop Survey
          </button>
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
