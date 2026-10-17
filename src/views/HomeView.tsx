import React from 'react';
import {
  Sun,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Phone,
  MessageCircle,
  Clock,
  TrendingUp,
  FileCheck2,
  Wrench,
  Layers,
  Sparkles,
  ChevronRight,
  Star,
  Building,
  Factory,
  Home as HomeIcon,
  Droplets,
  Lightbulb,
  Flame
} from 'lucide-react';
import { COMPANY_INFO, SOLAR_PRODUCTS, TESTIMONIALS, FAQS, SUBSIDY_MATRIX } from '../data/solarData';
import { PageId } from '../types';
import { SubsidyCalculator } from '../components/SubsidyCalculator';
import { UppclBillSection } from '../components/UppclBillSection';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  onOpenConsultation: () => void;
  onOpenAiChat?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenConsultation,
  onOpenAiChat,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Background Gradients & Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1800&q=80')",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>UPNEDA Approved Solar Dealer • Prayagraj (Allahabad)</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-serif">
                Embrace The Power <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  Of The Sun
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to <strong className="text-white">Dilip Enterprises</strong>, your trusted solar EPC partner in Prayagraj since 2017. Cut your electricity bill to zero with rooftop solar under <strong>PM Surya Ghar Muft Bijli Yojana</strong> with up to ₹1,08,000 government subsidy.
              </p>

              {/* Key Value Points */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-400 block font-medium">Govt Subsidy</span>
                  <span className="text-lg font-black text-amber-400">Up to ₹1.08 Lakh</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-400 block font-medium">Panel Warranty</span>
                  <span className="text-lg font-black text-emerald-400">25 Years</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-400 block font-medium">Industry Legacy</span>
                  <span className="text-lg font-black text-sky-400">10+ Years</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={onOpenConsultation}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Sun className="w-5 h-5" />
                  <span>Book Free Site Survey</span>
                </button>

                {onOpenAiChat && (
                  <button
                    onClick={onOpenAiChat}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-amber-500/60 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Ask SuryaMitra AI</span>
                  </button>
                )}

                <a
                  href="#uppcl-bill-upload"
                  className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-amber-500/40 transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  <span>Upload UPPCL Bill</span>
                </a>

                <a
                  href={`tel:${COMPANY_INFO.phoneClean}`}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-slate-700 transition-all hover:border-slate-600"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

              {/* Trust Subtext */}
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Net-Metering Handled</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Discom Paperwork Included</span>
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Year Free AMC</span>
                </span>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">UPNEDA Certified Partner</h3>
                    <p className="text-xs text-amber-400">Prayagraj Division, Uttar Pradesh</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                {/* Interactive preview box */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-slate-850 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Electricity Bill Slashed</span>
                    <span className="text-emerald-400 font-bold">Up to 90%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-850 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Average Payback Period</span>
                    <span className="text-amber-400 font-bold">2.5 - 3.5 Years</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-850 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Panel Efficiency</span>
                    <span className="text-sky-400 font-bold">16-BB Mono PERC / TopCon</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-850 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Govt. Direct Subsidy</span>
                    <span className="text-white font-bold">₹30k to ₹1,08,000 (DBT)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onNavigate('calculator');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Open Subsidy Calculator</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Serving Civil Lines, Kydganj, Naini, Jhunsi, Phaphamau, Kareli, Dhoomanganj & nearby regions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE ROOFTOP SECTORS (Residential, Commercial, Industrial) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Tailored Solar Energy Systems
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 font-serif">
            Solar Solutions for Every Rooftop
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Whether for your individual residence, housing society, showroom, or heavy manufacturing industry—we engineer optimal capacity setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Residential & Society */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HomeIcon className="w-7 h-7" />
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                Up to ₹1,08,000 Subsidy
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Homes & Housing Society</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Installing residential rooftop solar in Prayagraj is now more affordable than ever. Recover your investment in 3-4 years and enjoy 25 years of virtually free power.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>1 kW to 10 kW+ system sizes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>PM Surya Ghar direct bank credit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Bi-directional net-metering synchronization</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('residential')}
              className="inline-flex items-center gap-2 font-bold text-sm text-amber-600 hover:text-amber-700 group-hover:translate-x-1 transition-all"
            >
              <span>Explore Residential Solar & Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Commercial */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-7 h-7" />
              </div>
              <div className="inline-block bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                40% Tax Depreciation
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Commercial Rooftop</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Reduce high commercial tariffs (₹12-14/unit) to just ₹4-5/unit. Ideal for hospitals, schools, hotels, coaching institutes, showrooms & offices.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>CAPEX and OPEX financing models</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Accelerated income tax depreciation benefits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Renewable Purchase Obligation (RPO) compliance</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('commercial')}
              className="inline-flex items-center gap-2 font-bold text-sm text-sky-600 hover:text-sky-700 group-hover:translate-x-1 transition-all"
            >
              <span>Commercial Solutions & ROI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Industrial */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Factory className="w-7 h-7" />
              </div>
              <div className="inline-block bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                High MW/kW Scale Return
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Industrial Solar Plants</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                High-capacity industrial systems for factories, metal sheet warehouses, cold storages, and grain mills across Naini and industrial estates.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Custom brackets for Trapezoidal metal sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Elevated superstructures for RCC roofs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>HT net-metering & 11kV transformer integration</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('industrial')}
              className="inline-flex items-center gap-2 font-bold text-sm text-orange-600 hover:text-orange-700 group-hover:translate-x-1 transition-all"
            >
              <span>Industrial Solar Systems</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. ABOUT DILIP ENTERPRISES STORY */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1000&q=80"
                  alt="Dilip Enterprises Solar Panel Installation"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                      Field Execution & Quality
                    </span>
                    <p className="text-lg font-bold">
                      Over 150+ Rooftop Solar Plants Powering Prayagraj
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-4 sm:bottom-4 sm:-right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl">
                  10+
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Years Experience</span>
                  <span className="text-[11px] text-slate-500">Established in 2017</span>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Our Story & Accreditation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
                Dilip Enterprises – Solar Panel Dealers in Prayagraj
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                Established in 2017, Dilip Enterprises operates as a premier solar energy company under the visionary leadership of <strong>Mr. Devashish</strong>. As an approved firm recognized by the <strong>Uttar Pradesh New & Renewable Energy Development Agency (UPNEDA)</strong>, we specialize in high-efficiency solar panel installations, solar water pumps, street lights, and solar heating systems for homes, businesses, and rural projects.
              </p>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                With a strong technical engineering team, genuine BIS & MNRE certified components, and transparent pricing, we have successfully installed rooftop solar across Civil Lines, Kydganj, Naini, Phaphamau, Jhunsi, and adjoining districts of Uttar Pradesh.
              </p>

              {/* Key Values List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-slate-900 block">UPNEDA Approved Vendor</strong>
                    <span className="text-xs text-slate-500">Guaranteed subsidy processing & portal tracking</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-slate-900 block">BIS & MNRE Certified</strong>
                    <span className="text-xs text-slate-500">Tier-1 panels, hot-dip GI structure & Polycab wire</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  <span>Read Company Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`tel:${COMPANY_INFO.phoneClean}`}
                  className="inline-flex items-center gap-2 text-slate-800 hover:text-amber-600 font-bold text-sm"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call Mr. Devashish: {COMPANY_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Clean Energy Products
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 font-serif">
              Our Certified Solar Products
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mt-1">
              Engineered with world-class photovoltaic efficiency, corrosion protection, and long operational lifespan.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all self-start md:self-auto cursor-pointer"
          >
            <span>Request Catalog & Price List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SOLAR_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                  {prod.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {prod.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {prod.shortDesc}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                    {prod.specs.slice(0, 2).map((sp, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-500">{sp.label}:</span>
                        <span className="font-semibold text-slate-900">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (prod.targetPage) onNavigate(prod.targetPage);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE SUBSIDY CALCULATOR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubsidyCalculator onBookSurvey={onOpenConsultation} />
      </section>

      {/* 5B. ELECTRICITY BILL (UPPCL BILL) UPLOAD SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UppclBillSection />
      </section>

      {/* 6. SECRET FOR SUCCESS / 3-STEP PROCESS */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Secret for Success
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 font-serif">
              Your One-Stop Solution for All Challenges
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From the initial 3D rooftop site survey to UPNEDA subsidy credited to your bank account—everything is executed under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-850 p-8 rounded-3xl border border-slate-800 relative hover:border-amber-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Engineering & Design</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Comprehensive 3D shadow analysis, civil structure load calculations, and electrical single-line diagrams (SLD) engineered for maximum solar energy yield.
              </p>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Custom High-Rise Elevated GI Structures</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-850 p-8 rounded-3xl border border-slate-800 relative hover:border-amber-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-slate-950 font-black text-xl flex items-center justify-center mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Consultancy & Liaisoning</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Expert liaisoning with UPNEDA and UPPCL / Madhyanchal Vidyut Vitran Nigam for bi-directional net-meter approval and swift DBT subsidy disbursement.
              </p>
              <div className="text-xs text-orange-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero hassle documentation for customer</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-850 p-8 rounded-3xl border border-slate-800 relative hover:border-amber-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Operation & Maintenance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Efficient solar care and uninterrupted generation. Wi-Fi cloud inverter monitoring, panel washing guidelines, and free 1st-year complete maintenance support.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>25-Year Long Term Support Guarantee</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              <span>Schedule Free Site Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE DILIP ENTERPRISES (8 Key Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Why Prayagraj Trusts Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 font-serif">
            Why Dilip Enterprises Solar Power Solutions?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            We prioritize your energy independence with guaranteed safety, transparent pricing, and lifetime service support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Government Certified</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approved UPNEDA vendor ensuring strict compliance, quality assurance, and seamless access to central & state subsidies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Superior Quality Products</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              All panels and balance-of-system components meet rigorous BIS & MNRE certifications, ensuring optimal generation for 25+ years.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Technical Expertise</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In-house trained engineers with experience across residential rooftops, multi-story housing societies, and MW-scale installations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Transparent Pricing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hidden costs. Full transparent cost breakdowns including panel wattage, inverter brand, structure height, and meter fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">End-to-End Services</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              From free site survey to CAD structural design, civil anchoring, DISCOM commissioning, and subsidy claim—all handled by one team.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Long-Term Support</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Free maintenance service for the first year, fast response time in Prayagraj, and extended Annual Maintenance Contracts (AMC).
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sun className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Free Solar Consultation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Book a no-obligation rooftop inspection with our technical engineer to evaluate your shadow-free area and electricity bill savings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">One-Stop Provider</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized dealership for solar panels, K-Solare inverters, solar submersible pumps, street lights, and solar water heaters.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS FROM REAL CLIENTS */}
      <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Verified Customers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 font-serif">
              Success Stories in Prayagraj
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Read how homeowners and businesses in Prayagraj have reduced their electricity bills to zero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{t.name}</h5>
                    <p className="text-xs text-slate-500">{t.role} • {t.location}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-md">
                    {t.systemDetails}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQS SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 font-serif">
            Got Questions About Solar in Prayagraj?
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Everything you need to know about rooftop solar, PM Surya Ghar subsidy, and net-metering.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
            >
              <h4 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                <span className="text-amber-500 font-black">{i + 1}.</span>
                <span>{faq.question}</span>
              </h4>
              <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-sm text-slate-700 font-medium">
            Have a custom question about your rooftop, sanctioned load, or meter replacement?
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${COMPANY_INFO.phoneClean}?text=Hello%20Dilip%20Enterprises,%20I%20have%20a%20question%20about%20solar%20installation`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
            >
              <Phone className="w-4 h-4" />
              <span>Direct Call: {COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
