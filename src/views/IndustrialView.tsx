import React from 'react';
import {
  Factory,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
  ArrowRight,
  Phone,
  MessageCircle,
  FileCheck2
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';

interface IndustrialViewProps {
  onOpenConsultation: () => void;
}

export const IndustrialView: React.FC<IndustrialViewProps> = ({ onOpenConsultation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
          Heavy Power & High Efficiency
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif">
          Solar For Industrial Facilities
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          High-yield solar power systems from 10 kW to 25 kW, 50 kW, and beyond for industrial sheds, factories, processing plants, and cold storage units across Prayagraj.
        </p>
      </div>

      {/* Industrial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Transform Factory Rooftops into High-Yield Power Plants
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
            At Dilip Enterprises, we specialize in turnkey industrial rooftop solar panel systems. As a proven solar installer with MW-scale track record across Uttar Pradesh, we ensure that every industrial roof—whether heavy RCC or corrugated metal sheet—can smoothly transition to solar power with zero disruption to daily factory operations.
          </p>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
            India's abundant sunshine, with nearly 300 sunny days annually, makes Prayagraj a prime location for solar energy generation. By installing a solar plant on your industrial shed, you hedge against recurring energy tariff spikes, reduce peak demand charges (MD), and enjoy 25 years of virtually free daytime manufacturing power.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
            <strong>Example ROI:</strong>
            <p>
              A 40 kW industrial setup generates approx. 170-180 units daily (~5,200 units/month). At ₹9/unit industrial tariff, this yields over <strong>₹5,60,000 in annual savings</strong>, fully paying back initial investment in under 3.5 years!
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white font-serif border-b border-slate-800 pb-3">
              Industrial Engineering Highlights
            </h3>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Custom Non-Penetrative Sheet Clamps:</strong> Klip-Lok and trapezoidal seam clamps ensuring 100% leak-proof roof integrity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Elevated Superstructures:</strong> High-rise columns on RCC slabs providing ample clearance for maintenance, skylights & walking space.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>HT / LT Line Integration:</strong> Seamless interconnection with internal transformers, DG sets, and synchronization relays.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Real-Time SCADA / IoT Monitoring:</strong> String-level monitoring to track peak generation, performance ratio (PR), and temperature coefficients.
                </span>
              </li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenConsultation}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm text-center cursor-pointer"
              >
                Request Industrial Proposal
              </button>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Technical Team</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
