import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, Sparkles, Send } from 'lucide-react';
import { CrmTask } from '../../data/crmData';

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CrmTask | null;
}

export const WhatsAppTemplatesModal: React.FC<WhatsAppTemplatesModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const cleanPhone = task.customerPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const dealFormatted = task.dealValueRs ? `₹${task.dealValueRs.toLocaleString('en-IN')}` : '';

  const templates = [
    {
      id: 'tmpl-survey',
      title: '1. Site Survey & Shadow Analysis Visit',
      subtitle: 'Technical inspection schedule notice',
      message: `Dear ${task.customerName},
Greetings from Dilip Enterprises Solar Solutions, Prayagraj.

Regarding your ${task.capacityKw}kW ${task.systemType} Solar Project (Ref: ${task.taskCode}), our technical engineering team is scheduled to visit your site at (${task.customerAddress}) for rooftop measurement and shadow analysis.

Please confirm a convenient time slot for the site survey.
Contact: +91 94152 14777 / 98390 12345
Dilip Enterprises - UPNEDA Authorized Solar Partner, Prayagraj`,
    },
    {
      id: 'tmpl-uppcl',
      title: '2. UPPCL Net-Metering & Sanctioned Load Documents',
      subtitle: 'DISCOM documentation request',
      message: `Dear ${task.customerName},
Dilip Enterprises Solar Solutions.

Your application for net-metering approval for your ${task.capacityKw}kW Solar Plant is currently being processed on the UPPCL portal.
Consumer Account No: ${task.uppclAccountNo || 'Pending Confirmation'}

Please share the following documents for verification:
1. Latest UPPCL Electricity Bill
2. Copy of Aadhaar Card and PAN Card
3. Bank Passbook or Cancelled Cheque (for direct subsidy transfer)

Best regards,
Dilip Enterprises, Prayagraj
Phone: +91 94152 14777`,
    },
    {
      id: 'tmpl-subsidy',
      title: '3. PM Surya Ghar Muft Bijli Yojana Subsidy Breakdown',
      subtitle: 'Government subsidy & financial scheme summary',
      message: `Greetings ${task.customerName}! ☀️
Dilip Enterprises Solar Solutions.

Here is the financial & subsidy breakdown for your ${task.capacityKw}kW On-Grid Rooftop Solar System under the PM Surya Ghar: Muft Bijli Yojana:
• Central Government Direct Subsidy: ₹${task.capacityKw >= 3 ? '78,000' : task.capacityKw === 2 ? '60,000' : '30,000'}
• UP State Government Subsidy: ₹${task.capacityKw >= 2 ? '30,000' : '15,000'}
• Total Estimated Subsidy Benefit: ₹${task.capacityKw >= 3 ? '1,08,000' : task.capacityKw === 2 ? '90,000' : '45,000'}
${dealFormatted ? `• Total Project Investment: ${dealFormatted}` : ''}

The subsidy amount will be transferred directly to your bank account post net-metering commissioning.
For questions, contact: +91 94152 14777`,
    },
    {
      id: 'tmpl-fabrication',
      title: '4. Structure Fabrication & Materials Dispatch',
      subtitle: 'Equipment delivery & assembly alert',
      message: `Dear ${task.customerName},
Update from Dilip Enterprises Solar Team.

Hot-dip galvanized rooftop mounting structures and high-efficiency solar modules for your project (${task.taskCode}) have been dispatched. Our fabrication and installation team is en route.

Lead Engineer: ${task.assignedToUserName}
Helpline / Queries: +91 94152 14777`,
    },
    {
      id: 'tmpl-handover',
      title: '5. Plant Commissioning & Handover Certificate',
      subtitle: 'Official commissioning completion notice',
      message: `Congratulations ${task.customerName}! 🎉
Dilip Enterprises Solar Solutions.

We are pleased to inform you that your ${task.capacityKw}kW ${task.systemType} Solar Plant at (${task.customerAddress}) has been fully installed, grid-synchronized, and tested with UPPCL bi-directional net-metering.

Your solar plant is now generating clean and free electricity!
• Project Code: ${task.taskCode}
• Warranty certificates and service helpline details have been provided.

Thank you for choosing renewable green energy!
Dilip Kumar (Proprietor)
Dilip Enterprises - +91 94152 14777`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = (text: string) => {
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official WhatsApp Templates for Client
              </h3>
              <p className="text-xs text-slate-500">
                Auto-filled for <strong className="text-slate-800">{task.customerName}</strong> ({task.customerPhone}) • {task.taskCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates List */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{tmpl.title}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{tmpl.subtitle}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(tmpl.id, tmpl.message)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg shadow-2xs transition-colors"
                    title="Copy message to clipboard"
                  >
                    {copiedId === tmpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(tmpl.message)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95"
                    title="Send via WhatsApp directly"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp</span>
                  </button>
                </div>
              </div>

              <pre className="bg-white p-3 rounded-lg border border-slate-200/80 text-[11px] font-sans text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                {tmpl.message}
              </pre>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Client Phone: <strong className="text-slate-800 font-mono">{task.customerPhone}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
