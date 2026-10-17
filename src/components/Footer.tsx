import React from 'react';
import {
  Sun,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Info Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 mb-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>UPNEDA Approved Solar Firm</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Switch to Solar in Prayagraj & Claim Up to ₹1,08,000 Govt. Subsidy
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                PM Surya Ghar Muft Bijli Yojana provides guaranteed direct bank transfer subsidy for homes & housing societies. Get free electricity and net-metering.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat On WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  onNavigate('calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all text-sm"
              >
                <span>Calculate My Subsidy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: About Firm */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">DILIP ENTERPRISES</h4>
                <p className="text-xs text-amber-400 font-semibold">SOLAR SOLUTION PRAYAGRAJ</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Established in 2017 under the leadership of Mr. Devashish. Authorized & approved by UPNEDA for residential, commercial & institutional rooftop solar projects across Prayagraj and Uttar Pradesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800/40">
              <Award className="w-4 h-4 shrink-0" />
              <span>10+ Years Industry Experience • 150+ Successful Projects</span>
            </div>
          </div>

          {/* Col 2: Solar Rooftop Services */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-amber-500 pl-2.5">
              Rooftop Solar
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('residential')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Homes & Housing Societies</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('commercial')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Commercial Solar Rooftops</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('industrial')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Industrial High-Power Solar</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>PM Surya Ghar Subsidy Matrix</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>On-Grid vs Off-Grid vs Hybrid</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Solar Products */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-amber-500 pl-2.5">
              Solar Products
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('power-plant')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Solar Power Plants (EPC)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pumps')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Solar Water Pumps (PM-KUSUM)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('street-lights')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>All-in-One Solar Street Lights</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('water-heaters')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Solar Water Heaters (ETC/FPC)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inverters, Panels & BOS Kits</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-amber-500 pl-2.5">
              Office & Reach Us
            </h5>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  184/212D, near Kiran Jaiswal Corporator House, Nai Basti, Kydganj, Prayagraj, Uttar Pradesh 211003
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${COMPANY_INFO.phoneClean}`} className="hover:text-amber-400">
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-amber-400">
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-xs">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{COMPANY_INFO.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Dilip Enterprises Solar Solution. All Rights Reserved. Approved UPNEDA Solar Dealer Prayagraj.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onNavigate('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => {
                onNavigate('admin-leads');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors text-amber-500/90 font-semibold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Panel (CRM Leads)</span>
            </button>
            <a
              href="https://upneda.org.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-amber-400 text-slate-400"
            >
              <span>UPNEDA Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
