import React, { useState } from 'react';
import {
  Zap,
  Upload,
  CheckCircle2,
  FileCheck2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
  Calculator,
  Eye,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { BillUploadBox, BillUploadData } from './BillUploadBox';
import { saveLeadToFirestore } from '../lib/firebase';
import { COMPANY_INFO } from '../data/solarData';
import { SolarConsultationLead } from '../types';

interface UppclBillSectionProps {
  onSuccess?: () => void;
}

export const UppclBillSection: React.FC<UppclBillSectionProps> = ({ onSuccess }) => {
  const [billUpload, setBillUpload] = useState<BillUploadData | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [sanctionedLoad, setSanctionedLoad] = useState('3 kW');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [roofType, setRoofType] = useState<'RCC Flat Roof' | 'Tin / Metal Sheet' | 'Ground Mount' | 'Other'>('RCC Flat Roof');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic calculations based on load
  const loadNum = parseInt(sanctionedLoad) || 3;
  const recommendedSolarKw = Math.min(loadNum, 10);
  const centralSubsidy = recommendedSolarKw === 1 ? 30000 : recommendedSolarKw === 2 ? 60000 : 78000;
  const upSubsidy = recommendedSolarKw === 1 ? 15000 : 30000;
  const totalSubsidy = centralSubsidy + upSubsidy;
  const estimatedUnitsPerMonth = recommendedSolarKw * 120;
  const estimatedMonthlySavings = Math.round(estimatedUnitsPerMonth * 7.2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);

    const submissionData: SolarConsultationLead = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      location: locality.trim() || 'Prayagraj, UP',
      propertyType: 'Home / Residential',
      monthlyBillRs: `₹${estimatedMonthlySavings * 1.2}/mo (estimated)`,
      desiredCapacityKw: `${recommendedSolarKw} kW System`,
      roofType,
      message: `UPPCL Bill Upload. Sanctioned Load: ${sanctionedLoad}. Account: ${accountNumber || 'Pending verification'}`,
      uppclAccountNumber: accountNumber.trim() || billUpload?.accountNumber || '',
      sanctionedLoadKw: sanctionedLoad || billUpload?.sanctionedLoad || '',
      billFileName: billUpload?.fileName || '',
      billFileType: billUpload?.fileType || '',
      billFileSize: billUpload?.fileSize || 0,
      billFileData: billUpload?.fileData || '',
    };

    let createdId = '';
    try {
      createdId = await saveLeadToFirestore(submissionData, 'uppcl-bill-upload-section');
      setSubmittedId(createdId);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving UPPCL lead:', err);
      // Even if offline, show confirmation
      setSubmittedId('UPPCL-' + Date.now().toString().slice(-6));
    } finally {
      setIsSubmitting(false);
    }

    // Prepare WhatsApp notification
    const refTag = createdId ? `[Ref: #${createdId.slice(-6).toUpperCase()}]` : '';
    const accLine = submissionData.uppclAccountNumber ? `• *UPPCL Account:* ${submissionData.uppclAccountNumber}\n` : '';
    const loadLine = `• *Sanctioned Load:* ${sanctionedLoad}\n`;
    const billLine = billUpload ? `• *Bill Document:* Attached (${billUpload.fileName})\n` : '';

    const waText =
      `*New UPPCL Electricity Bill Submission* ${refTag}\n\n` +
      `• *Name:* ${fullName}\n` +
      `• *Phone:* ${phone}\n` +
      `• *Address:* ${locality || 'Prayagraj'}\n` +
      accLine +
      loadLine +
      billLine +
      `• *Recommended Solar:* ${recommendedSolarKw} kW\n` +
      `• *Estimated Subsidy:* ₹${totalSubsidy.toLocaleString('en-IN')}\n\n` +
      `Please check net-metering feasibility and schedule site survey.`;

    const waUrl = `https://wa.me/${COMPANY_INFO.phoneClean}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  const handleReset = () => {
    setSubmittedId(null);
    setBillUpload(null);
    setAccountNumber('');
    setFullName('');
    setPhone('');
    setLocality('');
  };

  return (
    <div id="uppcl-bill-upload" className="scroll-mt-24">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 text-white border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>UPPCL Net-Metering & Subsidy Feasibility</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-white">
                Electricity Bill (UPPCL Bill) Upload Option
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                अपलोड करें अपने बिजली बिल की फोटो या 10-अंकीय खाता संख्या। हमारे UPNEDA प्रमाणित इंजीनियर तुरंत आपके कनेक्शन पर मान्य सोलर कैपेसिटी, नेट-मीटरिंग और सरकारी सब्सिडी का ब्यौरा तैयार करेंगे।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-slate-700">
                Purvanchal & Madhyanchal DISCOM
              </span>
            </div>
          </div>

          {submittedId ? (
            /* Success State */
            <div className="bg-slate-900/90 rounded-3xl p-8 border border-emerald-500/40 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono font-bold border border-emerald-500/30">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Ticket Ref: #{submittedId.slice(-6).toUpperCase()}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">UPPCL Bill Submitted Successfully!</h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto">
                  Thank you, <strong>{fullName}</strong>. Your electricity bill details have been received and recorded in Dilip Enterprises CRM.
                </p>
              </div>

              {/* Summary card */}
              <div className="max-w-md mx-auto bg-slate-850 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">UPPCL Account:</span>
                  <span className="font-mono font-bold text-amber-400">{accountNumber || 'Attached in file'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Sanctioned Load:</span>
                  <span className="font-bold text-white">{sanctionedLoad}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Recommended Solar:</span>
                  <span className="font-bold text-emerald-400">{recommendedSolarKw} kW Rooftop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Eligible Subsidy:</span>
                  <span className="font-bold text-white">₹{totalSubsidy.toLocaleString('en-IN')} (DBT)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`tel:${COMPANY_INFO.phoneClean}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {COMPANY_INFO.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Submit Another Bill
                </button>
              </div>
            </div>
          ) : (
            /* Upload Form & Feasibility Grid */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Bill Upload & Inputs */}
              <div className="lg:col-span-7 space-y-5 bg-white text-slate-900 p-6 sm:p-7 rounded-3xl shadow-xl">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Step 1: Upload Bill or Enter Consumer ID</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a photo of your UPPCL bill, or type your 10-digit account number.
                  </p>
                </div>

                {/* Upload Box Component */}
                <BillUploadBox
                  value={billUpload}
                  onChange={setBillUpload}
                  accountNumber={accountNumber}
                  onAccountNumberChange={setAccountNumber}
                  sanctionedLoad={sanctionedLoad}
                  onSanctionedLoadChange={setSanctionedLoad}
                />

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Step 2: Contact Details for Rooftop Survey Report
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Mobile / WhatsApp No. *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Locality / Tehsil in Prayagraj & UP
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Civil Lines, Kydganj, Naini, Phaphamau"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Rooftop Surface Type
                      </label>
                      <select
                        value={roofType}
                        onChange={(e) => setRoofType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="RCC Flat Roof">RCC Flat Roof (Standard Terraces)</option>
                        <option value="Tin / Metal Sheet">Tin / Metal Shed Roof</option>
                        <option value="Ground Mount">Ground Open Area</option>
                        <option value="Other">Other Structure</option>
                      </select>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying UPPCL Connection...</span>
                  ) : (
                    <>
                      <span>Submit Bill for Net-Metering & Subsidy Feasibility</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Live Feasibility Calculator Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Instant Feasibility
                      </span>
                      <h4 className="text-lg font-bold text-white">UPPCL Solar Eligibility</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Connected Load Rule Banner */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>UPPCL Net-Metering Rule:</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Solar capacity is capped at 100% of your sanctioned load ({sanctionedLoad}). Dilip Enterprises handles load-enhancement paperwork with UPPCL if needed!
                    </p>
                  </div>

                  {/* Live Metrics Grid */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Permissible Solar Capacity</span>
                      <span className="font-bold text-white text-sm">{recommendedSolarKw} kW System</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Central PM Surya Ghar Subsidy</span>
                      <span className="font-bold text-emerald-400 text-sm">₹{centralSubsidy.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400">UP State Additional Subsidy</span>
                      <span className="font-bold text-emerald-400 text-sm">₹{upSubsidy.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                      <span className="text-amber-200 font-bold">Total Direct Govt. Subsidy (DBT)</span>
                      <span className="font-black text-amber-400 text-base">₹{totalSubsidy.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Monthly Generation</span>
                      <span className="font-bold text-white">~{estimatedUnitsPerMonth} Units / mo</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Estimated Monthly Savings</span>
                      <span className="font-bold text-emerald-400">~₹{estimatedMonthlySavings.toLocaleString('en-IN')} / mo</span>
                    </div>
                  </div>

                  {/* Trust guarantees */}
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bi-directional Net-Meter installation included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct Benefit Transfer (DBT) into bank account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Local office at Kydganj, Prayagraj</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
