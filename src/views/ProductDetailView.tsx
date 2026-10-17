import React from 'react';
import {
  Sun,
  Droplets,
  Lightbulb,
  Flame,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Calendar
} from 'lucide-react';
import { SOLAR_PRODUCTS, COMPANY_INFO } from '../data/solarData';
import { PageId, SolarProduct } from '../types';

interface ProductDetailViewProps {
  productId: 'power-plant' | 'pumps' | 'street-lights' | 'water-heaters';
  onNavigate: (page: PageId) => void;
  onOpenConsultation: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate,
  onOpenConsultation,
}) => {
  const product: SolarProduct =
    SOLAR_PRODUCTS.find((p) => p.id === productId) || SOLAR_PRODUCTS[0];

  const getIcon = () => {
    switch (product.id) {
      case 'pumps':
        return <Droplets className="w-8 h-8 text-sky-500" />;
      case 'street-lights':
        return <Lightbulb className="w-8 h-8 text-amber-500" />;
      case 'water-heaters':
        return <Flame className="w-8 h-8 text-orange-500" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Dilip Enterprises Authorized Dealership • Prayagraj</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shadow-sm">
              {getIcon()}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif">
                {product.title}
              </h1>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mt-1">
                Category: {product.category}
              </p>
            </div>
          </div>

          <p className="text-slate-700 text-base sm:text-lg leading-relaxed text-justify">
            {product.fullDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenConsultation}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Price Quote & Specs
            </button>
            <a
              href={`https://wa.me/${COMPANY_INFO.phoneClean}?text=Hello%20Dilip%20Enterprises,%20I%20am%20interested%20in%20${encodeURIComponent(
                product.title
              )}%20in%20Prayagraj`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[420px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Product Highlights & Key Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
            Key Components & Features
          </h3>
          <ul className="space-y-3">
            {product.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-sm space-y-5">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-serif border-b border-slate-800 pb-3">
            Technical Specifications
          </h3>
          <div className="space-y-4 text-sm">
            {product.specs.map((sp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-slate-800/80 last:border-0"
              >
                <span className="text-slate-400 font-medium">{sp.label}</span>
                <span className="font-bold text-amber-400 text-right">{sp.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Warranty Support</span>
                <span className="text-sm font-bold text-emerald-400">Complete On-Site Service</span>
              </div>
              <a
                href={`tel:${COMPANY_INFO.phoneClean}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-white"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Other Products Strip */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-lg font-bold text-slate-900 mb-6 font-serif">
          Other Solar Energy Solutions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SOLAR_PRODUCTS.filter((p) => p.id !== product.id).map((other) => (
            <button
              key={other.id}
              onClick={() => {
                if (other.targetPage) onNavigate(other.targetPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group flex items-center gap-3 cursor-pointer"
            >
              <img
                src={other.image}
                alt={other.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div>
                <h5 className="text-sm font-bold text-slate-900 group-hover:text-amber-600">
                  {other.title}
                </h5>
                <p className="text-xs text-slate-500 line-clamp-1">{other.shortDesc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
