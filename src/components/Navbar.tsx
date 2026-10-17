import React, { useState } from 'react';
import {
  Sun,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Calculator,
  ShieldCheck,
  Send,
  MessageCircle,
  Zap,
  FileCheck2,
  Sparkles,
  Lock
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenConsultation: () => void;
  onOpenAiChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenConsultation,
  onOpenAiChat,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rooftopDropdownOpen, setRooftopDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setRooftopDropdownOpen(false);
    setProductsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadBillClick = () => {
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById('uppcl-bill-upload');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          onOpenConsultation();
        }
      }, 150);
    } else {
      const el = document.getElementById('uppcl-bill-upload');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onOpenConsultation();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-slate-100">
      {/* Top Notification / Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UPNEDA Approved Vendor • Prayagraj</span>
            </span>
            <a
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{COMPANY_INFO.phone}</span>
            </a>
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="hidden md:flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>{COMPANY_INFO.email}</span>
            </a>
          </div>

          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <span className="hidden lg:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Kydganj, Prayagraj, UP</span>
            </span>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Chat</span>
            </a>
            <button
              onClick={() => handleNavClick('admin-leads')}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-400 text-xs px-2 py-0.5 rounded border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer"
              title="Admin Panel / CRM Leads (For Owner & Staff)"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Admin CRM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sun className="w-7 h-7 animate-[spin_16s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
                  DILIP ENTERPRISES
                </span>
              </div>
              <p className="text-[11px] font-semibold text-amber-600 tracking-wider uppercase">
                Embrace The Power Of The Sun
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentPage === 'about'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              About Us
            </button>

            {/* Solar Rooftop Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setRooftopDropdownOpen(!rooftopDropdownOpen)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                  ['residential', 'commercial', 'industrial'].includes(currentPage)
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <span>Solar Rooftop</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => handleNavClick('residential')}
                  className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex flex-col"
                >
                  <span className="text-sm font-semibold text-slate-900">Homes & Housing Society</span>
                  <span className="text-xs text-slate-500">With PM Surya Ghar Subsidy (Up to ₹1.08 Lakh)</span>
                </button>
                <button
                  onClick={() => handleNavClick('commercial')}
                  className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex flex-col"
                >
                  <span className="text-sm font-semibold text-slate-900">Commercial Rooftop</span>
                  <span className="text-xs text-slate-500">Offices, Hospitals & 40% Tax Depreciation</span>
                </button>
                <button
                  onClick={() => handleNavClick('industrial')}
                  className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex flex-col"
                >
                  <span className="text-sm font-semibold text-slate-900">Industrial Solar</span>
                  <span className="text-xs text-slate-500">10 kW to 100+ kW MW plants for factories</span>
                </button>
              </div>
            </div>

            {/* Products Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                  ['power-plant', 'pumps', 'street-lights', 'water-heaters'].includes(currentPage)
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <span>Products</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => handleNavClick('power-plant')}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                >
                  Solar Power Plants
                </button>
                <button
                  onClick={() => handleNavClick('pumps')}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                >
                  Solar Water Pumps
                </button>
                <button
                  onClick={() => handleNavClick('street-lights')}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                >
                  Solar Street Lights
                </button>
                <button
                  onClick={() => handleNavClick('water-heaters')}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                >
                  Solar Water Heaters
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentPage === 'how-it-works'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              How Solar Works
            </button>

            <button
              onClick={() => handleNavClick('calculator')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                currentPage === 'calculator'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Subsidy & Loan EMI</span>
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentPage === 'contact'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Button */}
          <div className="hidden lg:flex items-center gap-2.5">
            {onOpenAiChat && (
              <button
                onClick={onOpenAiChat}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-950 border border-amber-400 text-xs font-bold px-3 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
                title="Ask SuryaMitra AI: Subsidies, Sizing & Feasibility"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>AI Assistant</span>
              </button>
            )}

            <button
              onClick={handleUploadBillClick}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              title="Upload your UPPCL electricity bill for instant solar feasibility"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Upload Bill</span>
            </button>

            <button
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-md shadow-amber-500/20 transition-all hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Free Site Survey</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenConsultation}
              className="text-xs bg-amber-500 text-white font-bold px-3 py-2 rounded-lg"
            >
              Get Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 max-h-[80vh] overflow-y-auto shadow-2xl">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
              currentPage === 'home' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-800'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
              currentPage === 'about' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-800'
            }`}
          >
            About Us
          </button>

          <div className="pt-1 pb-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Solar Rooftop Solutions
            </p>
            <div className="pl-3 mt-1 space-y-1">
              <button
                onClick={() => handleNavClick('residential')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Homes & Housing Society (Subsidy)
              </button>
              <button
                onClick={() => handleNavClick('commercial')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Commercial Solar
              </button>
              <button
                onClick={() => handleNavClick('industrial')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Industrial Solar
              </button>
            </div>
          </div>

          <div className="pt-1 pb-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Solar Products
            </p>
            <div className="pl-3 mt-1 space-y-1">
              <button
                onClick={() => handleNavClick('power-plant')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Solar Power Plant
              </button>
              <button
                onClick={() => handleNavClick('pumps')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Solar Water Pumps (Agriculture)
              </button>
              <button
                onClick={() => handleNavClick('street-lights')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Solar LED Street Lights
              </button>
              <button
                onClick={() => handleNavClick('water-heaters')}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:text-amber-600"
              >
                • Solar Water Heaters
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNavClick('calculator')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              currentPage === 'calculator' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-500" />
            <span>Subsidy & Solar Loan EMI Calculator</span>
          </button>

          <button
            onClick={() => handleNavClick('how-it-works')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
              currentPage === 'how-it-works' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-800'
            }`}
          >
            How Solar Works
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
              currentPage === 'contact' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-slate-800'
            }`}
          >
            Contact Us
          </button>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {onOpenAiChat && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAiChat();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-400/80 text-amber-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>SuryaMitra AI Solar Assistant</span>
                </div>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">
                  Ask AI
                </span>
              </button>
            )}

            <button
              onClick={handleUploadBillClick}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>Upload UPPCL Bill (Instant Feasibility)</span>
              </div>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                Subsidy Check
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2.5 rounded-lg shadow cursor-pointer text-xs"
            >
              Book Free Site Inspection
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('admin-leads');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-amber-600 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Owner & Staff Admin CRM Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
