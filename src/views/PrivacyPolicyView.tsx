import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3 border-b border-slate-200 pb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last Updated: March 2026 • Dilip Enterprises Solar Solutions
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 text-sm space-y-8 leading-relaxed">
        {/* 1. Introduction */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
          <p>
            Welcome to <strong>Dilip Enterprises</strong> ("we," "our," "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website, use our solar energy products, or engage our engineering and installation services in Prayagraj and Uttar Pradesh.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
          <p>We may collect information directly from you, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>Personal Information:</strong> Name, phone number, email address, postal address, and electricity bill consumer account number (CA Number) for subsidy and net-metering applications.
            </li>
            <li>
              <strong>Technical Site Details:</strong> Rooftop area, building structural type, connected load, electricity sanction details, and photographs of your terrace for solar engineering assessments.
            </li>
            <li>
              <strong>Automatically Collected Data:</strong> Device IP address, browser type, operating system, and website usage statistics collected via basic web analytics.
            </li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. How We Use Your Information</h2>
          <p>We utilize collected information strictly to:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Design customized solar plant engineering layouts and calculate accurate subsidy figures.</li>
            <li>Facilitate government subsidy processing under PM Surya Ghar and UPNEDA portals.</li>
            <li>Coordinate Discom (UPPCL) net-metering inspection and meter installation.</li>
            <li>Provide post-installation maintenance, technical warranty support, and system monitoring.</li>
            <li>Respond to your direct inquiries submitted via our website or WhatsApp.</li>
          </ul>
        </section>

        {/* 4. Sharing & Disclosure */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Sharing and Disclosure of Information</h2>
          <p>
            We respect your privacy and never sell or rent your personal data to any third party. We only share relevant details with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>Government Authorities & DISCOMs:</strong> UPNEDA, Ministry of New and Renewable Energy (MNRE), and Madhyanchal Vidyut Vitran Nigam / UPPCL as strictly necessary for official solar subsidy disbursement and net-metering.
            </li>
            <li>
              <strong>Certified Technicians & Installers:</strong> Authorized technicians performing structural site surveys, civil grouting, and electrical commissioning.
            </li>
          </ul>
        </section>

        {/* 5. Data Security */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Data Security</h2>
          <p>
            We implement industry-standard physical, electronic, and procedural safeguards to protect your personal information against unauthorized access, loss, alteration, or misuse.
          </p>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">6. Your Rights and Choices</h2>
          <p>
            You have the right to request access to the personal data we hold about you, request corrections or updates, or request the deletion of your inquiry data at any time by contacting our office.
          </p>
        </section>

        {/* 7. Cookies */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">7. Cookies and Tracking Technologies</h2>
          <p>
            Our website uses minimal session cookies solely to enhance navigation, retain calculator preference state during your visit, and improve overall user experience.
          </p>
        </section>

        {/* 8. Third-Party Links */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">8. Third-Party Links</h2>
          <p>
            Our website may contain links to official government portals (such as pmsuryaghar.gov.in and upneda.org.in). We are not responsible for the privacy practices or content of these external sites.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Contact Us Regarding Privacy</h2>
          <p className="text-xs text-slate-600">
            If you have questions or concerns about this policy or how your data is handled, please reach out to us:
          </p>
          <div className="text-xs space-y-1 text-slate-700">
            <p><strong>Dilip Enterprises</strong> (Attn: Mr. Devashish)</p>
            <p>147B/68A, Kydganj, Prayagraj - 211003, Uttar Pradesh, India</p>
            <p>Email: {COMPANY_INFO.email} | Phone: {COMPANY_INFO.phone}</p>
          </div>
        </section>
      </div>
    </div>
  );
};
