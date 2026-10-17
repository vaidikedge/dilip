import React from 'react';
import {
  Sun,
  ShieldCheck,
  Award,
  Users,
  Target,
  Eye,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Building
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';

interface AboutViewProps {
  onOpenConsultation: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenConsultation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
          Who We Are
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-serif">
          About Dilip Enterprises
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Over a decade of trusted engineering excellence in solar power systems across Prayagraj and Uttar Pradesh.
        </p>
      </div>

      {/* Main Story & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Approved UPNEDA Rooftop Solar Firm</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif leading-snug">
            Empowering Prayagraj with Clean, Cost-Effective Solar Energy
          </h2>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
            Established in <strong>2017</strong>, <strong>Dilip Enterprises</strong> operates under the dedicated leadership of <strong>Mr. Devashish</strong>. The firm specializes in retail, wholesale distribution, and turnkey engineering, procurement & construction (EPC) of solar energy systems including rooftop solar panels, on-grid inverters, solar water pumps, street lighting, and solar water heaters.
          </p>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
            Recognized by the <strong>Uttar Pradesh New & Renewable Energy Development Agency (UPNEDA)</strong> as an approved firm for rooftop solar installations, Dilip Enterprises is committed to promoting sustainable energy practices in the region. With over a decade of combined industry experience, we have earned a distinguished reputation for excellence in technical design, safe execution, and post-installation support.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold block uppercase">Leadership</span>
              <span className="text-lg font-bold text-slate-900">{COMPANY_INFO.proprietor}</span>
              <span className="text-[11px] text-slate-500 block">Proprietor & Solar Engineer</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-semibold block uppercase">Established</span>
              <span className="text-lg font-bold text-slate-900">{COMPANY_INFO.established}</span>
              <span className="text-[11px] text-slate-500 block">8+ Years Operating Firm</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80"
              alt="Dilip Enterprises Solar Farm Installation"
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide">Government Approved</span>
              <h4 className="text-lg font-black">Direct Portal Registration with UPNEDA</h4>
            </div>
            <button
              onClick={onOpenConsultation}
              className="bg-slate-950 text-white hover:bg-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shrink-0 transition-all cursor-pointer"
            >
              Request Free Site Survey
            </button>
          </div>
        </div>
      </div>

      {/* Core Values: Quality & Responsibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-serif">Our Commitment to Quality</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            At Dilip Enterprises Solar Solution Prayagraj, we are dedicated to delivering top-notch solar products that exceed industry standards and provide exceptional performance. We exclusively deploy Tier-1 Mono PERC & TopCon solar modules, K-Solare smart MPPT inverters, and hot-dip galvanized mounting structures that withstand up to 150 km/h wind speeds.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>BIS and MNRE certified materials</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Double-insulated Polycab solar DC cables</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>3-layer electrical earthing & lightning arrester</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-serif">Environmental Responsibility</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            Responsibility is at the core of our values. Every kilowatt of solar energy installed reduces over 1.2 tonnes of carbon dioxide emissions annually. We empower homeowners, hospitals, institutions, and village panchayats in Uttar Pradesh to achieve energy independence while fostering a greener, healthier community for future generations.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% clean, non-polluting green energy generation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mitigate global warming and air pollution in eastern UP</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Active participation in PM-KUSUM & PM Surya Ghar Yojana</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white font-serif">Our Mission</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>To offer the best solar products on the market in terms of quality, price, and efficiency and make them easily accessible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>To assist homes, businesses, and farmers with turnkey engineering, procurement, and net-metering liaisoning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>To go above and beyond for customers during installation and throughout the 25-year lifetime of their solar system.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white font-serif">Our Vision</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span>To revolutionize how Prayagraj and Uttar Pradesh access water and electrical energy—reliably, sustainably, and affordably.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span>To eliminate dependency on expensive grid tariffs and diesel generators by offering next-generation solar energy options as an attractive, high-return investment.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
