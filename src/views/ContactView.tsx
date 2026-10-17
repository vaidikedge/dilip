import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Building,
  Database,
  Loader2
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';
import { saveContactMessageToFirestore } from '../lib/firebase';
import { BillUploadBox, BillUploadData } from '../components/BillUploadBox';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    systemType: 'Residential Rooftop Solar',
    message: '',
  });

  const [billUpload, setBillUpload] = useState<BillUploadData | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [sanctionedLoad, setSanctionedLoad] = useState('3 kW');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageDocId, setMessageDocId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    let docId = '';
    try {
      docId = await saveContactMessageToFirestore({
        ...formData,
        uppclAccountNumber: accountNumber.trim() || billUpload?.accountNumber || '',
        billFileName: billUpload?.fileName || '',
        billFileType: billUpload?.fileType || '',
        billFileData: billUpload?.fileData || '',
      });
      setMessageDocId(docId);
    } catch (err) {
      console.error('Failed to save contact message to Firestore:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }

    const refTag = docId ? `[Ticket: #${docId.slice(-6).toUpperCase()}]` : '';
    const message =
      `*New Solar Inquiry from Website* ${refTag}\n\n` +
      `• *Name:* ${formData.name}\n` +
      `• *Phone:* ${formData.phone}\n` +
      (formData.email ? `• *Email:* ${formData.email}\n` : '') +
      `• *Interested In:* ${formData.systemType}\n` +
      (formData.message ? `• *Message:* ${formData.message}\n` : '');

    const whatsappUrl = `https://wa.me/${COMPANY_INFO.phoneClean}?text=${encodeURIComponent(
      message
    )}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
          Get in Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-serif">
          Contact Dilip Enterprises
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Have questions about rooftop solar subsidy, on-grid inverters, or need a free site survey in Prayagraj? Our engineering team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 space-y-6 shadow-xl">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Head Office & Experience Center
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">
                Dilip Enterprises
              </h3>
              <p className="text-xs text-slate-400">
                UPNEDA Approved Solar Dealer & EPC Contractor
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block">Office Address:</strong>
                  <span>{COMPANY_INFO.address}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">
                    Landmark: Near Kydganj Police Station, Prayagraj
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block">Direct Call & WhatsApp:</strong>
                  <a
                    href={`tel:${COMPANY_INFO.phoneClean}`}
                    className="text-amber-400 hover:underline font-bold text-base block"
                  >
                    {COMPANY_INFO.phone}
                  </a>
                  <span className="text-xs text-slate-400">Mr. Devashish (Proprietor)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block">Email:</strong>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-slate-300 hover:text-white"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block">Business Hours:</strong>
                  <span>{COMPANY_INFO.workingHours}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant WhatsApp Chat</span>
              </a>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>UPNEDA Subsidy Assistance Desk</span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-800">
              Need help tracking your online PM Surya Ghar national portal application or Discom net-metering status? Visit our Kydganj office with your electricity consumer number (CA Number) for free liaisoning guidance.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500">
              Fill out the form below and we will contact you within 2 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>Saved into Dilip Enterprises CRM Database</span>
              </div>
              <h4 className="text-xl font-bold text-emerald-950">Inquiry Received Successfully!</h4>
              <p className="text-sm text-emerald-800 max-w-md mx-auto">
                Thank you, <strong>{formData.name}</strong>. Your solar project inquiry has been securely stored in our system
                {messageDocId && (
                  <> with Ticket ID <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">#{messageDocId.slice(-6).toUpperCase()}</span></>
                )}.
                We have also opened WhatsApp to connect you directly with our engineering team in Prayagraj.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      systemType: 'Residential Rooftop Solar',
                      message: '',
                    });
                  }}
                  className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-emerald-100/60"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Srivastava"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Interested Product
                  </label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Residential Rooftop Solar (1-10kW)">Residential Rooftop Solar (1-10kW)</option>
                    <option value="Housing Society Solar Setup">Housing Society Solar Setup</option>
                    <option value="Commercial Rooftop (Hospitals, Hotels, Schools)">Commercial Rooftop</option>
                    <option value="Industrial Solar Power Plant">Industrial Solar Power Plant</option>
                    <option value="Solar Submersible Water Pump">Solar Submersible Water Pump</option>
                    <option value="Solar Street Lights">Solar Street Lights</option>
                    <option value="Solar Water Heater (ETC/FPC)">Solar Water Heater</option>
                  </select>
                </div>
              </div>

              {/* UPPCL Electricity Bill Upload Option */}
              <div className="pt-2">
                <BillUploadBox
                  value={billUpload}
                  onChange={setBillUpload}
                  accountNumber={accountNumber}
                  onAccountNumberChange={setAccountNumber}
                  sanctionedLoad={sanctionedLoad}
                  onSanctionedLoadChange={setSanctionedLoad}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message / Project Requirements
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your rooftop area, current monthly electricity bill, or location in Prayagraj..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-75 disabled:cursor-not-allowed text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Saving Inquiry to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Embedded Google Map */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Dilip Enterprises Location Map • Kydganj, Prayagraj, UP</span>
          </div>
          <a
            href="https://maps.google.com/?q=Kydganj,+Prayagraj,+Uttar+Pradesh+211003"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 font-bold hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="w-full h-80 bg-slate-200">
          <iframe
            title="Dilip Enterprises Prayagraj Location"
            src="https://maps.google.com/maps?q=Kydganj%2C%20Prayagraj%2C%20Uttar%20Pradesh%20211003&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};
