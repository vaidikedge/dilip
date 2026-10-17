import { jsPDF } from 'jspdf';
import { COMPANY_INFO } from '../data/solarData';

export interface QuotationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation: string;
  kw: number;
  consumerType: 'residential' | 'housing-society';
  estimatedTotalCost: number;
  centralSubsidy: number;
  upStateSubsidy: number;
  totalSubsidy: number;
  netCostToPay: number;
  monthlySavings: number;
  yearlySavings: number;
  lifetimeSavings: number;
  paybackYears: string;
  monthlyUnits: number;
  roofAreaSqFt: number;
  loanDetails?: {
    downPayment: number;
    loanPrincipal: number;
    interestRate: number;
    tenureYears: number;
    monthlyEmi: number;
    netMonthlyProfit: number;
  };
}

export function generateSolarQuotationPDF(data: QuotationData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const qtnNumber = `DE/PRG/${new Date().getFullYear()}/Q-${Math.floor(1000 + Math.random() * 9000)}`;
  const qtnDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Top decorative header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  // Amber accent bar
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 36, 210, 2.5, 'F');

  // Company Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DILIP ENTERPRISES', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('UPNEDA APPROVED SOLAR DEALER | MNRE REGISTERED VENDOR', 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Prayagraj Division, Uttar Pradesh • Estd. 2017 • PM Surya Ghar Channel Partner', 14, 27);
  doc.text(`Contact: ${COMPANY_INFO.phone} | Head: Mr. Devashish`, 14, 32);

  // Right side of header: Document Badge
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(140, 7, 56, 23, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL ESTIMATE', 144, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Estimate No: ${qtnNumber}`, 144, 19);
  doc.text(`Date: ${qtnDate}`, 144, 24);
  doc.text('Valid for: 15 Days', 144, 28);

  // Section 1: Customer Details & Project Scope
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PROPOSAL PREPARED FOR:', 14, 46);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 182, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 48, 182, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Customer Name: ${data.customerName || 'Valued Resident'}`, 18, 54);
  doc.text(`Phone: ${data.customerPhone || 'As provided'}`, 18, 60);
  doc.text(`Location: ${data.customerLocation || 'Prayagraj / Uttar Pradesh'}`, 18, 66);

  doc.setFont('helvetica', 'normal');
  doc.text(`Application: ${data.consumerType === 'housing-society' ? 'Housing Society / Common Area' : 'Residential Rooftop (Grid-Tied)'}`, 108, 54);
  doc.text(`Plant Capacity: ${data.kw} kWp On-Grid System`, 108, 60);
  doc.text(`Rooftop Area Required: ~${data.roofAreaSqFt} Sq. Ft. shadow-free`, 108, 66);

  // Section 2: Technical Bill of Materials (BOM)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('SYSTEM SPECIFICATIONS & BILL OF MATERIALS (BOM):', 14, 78);

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 81, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('COMPONENT', 18, 85.5);
  doc.text('SPECIFICATION / BRAND', 65, 85.5);
  doc.text('STANDARDS / WARRANTY', 140, 85.5);

  const bomItems = [
    {
      comp: 'Solar PV Modules',
      spec: `Tier-1 Mono PERC / TopCon Bifacial DCR (${Math.round(data.kw * 2)} Panels approx.)`,
      war: '25 Years Performance Warranty (ALMM Approved)',
    },
    {
      comp: 'Solar Inverter',
      spec: `${data.kw} kW On-Grid String Inverter, MPPT, WiFi Remote Monitoring`,
      war: '5-8 Years Manufacturer Replacement Warranty',
    },
    {
      comp: 'Mounting Structure',
      spec: 'Hot-Dip Galvanized (HDG) GI Structure (150 km/h wind rated)',
      war: 'Rust-Proof 80-Micron Coating, Elevated / Flat Roof',
    },
    {
      comp: 'Electrical Safety',
      spec: 'ACDB + DCDB with Type-II SPD, MCB & Fuse Protection',
      war: 'IP65 Enclosure with surge suppression',
    },
    {
      comp: 'Earthing & Protection',
      spec: '3 Dedicated Chemical Earthing Pits + Copper Bonded Electrodes',
      war: 'Class-B Lightning Arrestor (LA) Included',
    },
    {
      comp: 'Net Metering & Subsidy',
      spec: 'UPPCL Net Meter Approval & PM Surya Ghar Portal Documentation',
      war: 'Turnkey Execution by Dilip Enterprises',
    },
  ];

  let currentY = 88;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  bomItems.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.text(item.comp, 18, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(item.spec, 65, currentY + 4.5);
    doc.text(item.war, 140, currentY + 4.5);
    currentY += 6.5;
  });

  // Section 3: Financial & Subsidy Breakdown Table
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('FINANCIAL ESTIMATE & DIRECT SUBSIDY BENEFIT:', 14, currentY);

  currentY += 3;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('FINANCIAL HEAD', 18, currentY + 4.5);
  doc.text('DETAILS / BENEFIT TYPE', 80, currentY + 4.5);
  doc.text('AMOUNT (INR)', 158, currentY + 4.5);

  const finRows = [
    {
      label: 'Estimated Turnkey System Cost',
      desc: `Complete EPC, Tier-1 Panels, Structure, Cabling & Installation for ${data.kw} kW`,
      amt: `Rs. ${data.estimatedTotalCost.toLocaleString('en-IN')}`,
      isHighlight: false,
    },
    {
      label: 'Central Govt. Subsidy (MNRE)',
      desc: 'PM Surya Ghar Muft Bijli Yojana (Direct Bank Credit)',
      amt: `- Rs. ${data.centralSubsidy.toLocaleString('en-IN')}`,
      isHighlight: true,
      color: [16, 185, 129], // emerald
    },
    {
      label: 'UP State Govt. Subsidy (UPNEDA)',
      desc: 'Uttar Pradesh Solar Energy Policy 2022 (State DBT)',
      amt: `- Rs. ${data.upStateSubsidy.toLocaleString('en-IN')}`,
      isHighlight: true,
      color: [16, 185, 129],
    },
    {
      label: 'Total Direct Government Subsidy',
      desc: 'Direct Bank Transfer (DBT) directly credited to customer account',
      amt: `- Rs. ${data.totalSubsidy.toLocaleString('en-IN')}`,
      isHighlight: true,
      color: [5, 150, 105],
    },
  ];

  currentY += 7;
  finRows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setFont('helvetica', row.isHighlight ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row.label, 18, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row.desc, 80, currentY + 4.5);

    if (row.color) {
      doc.setTextColor(row.color[0], row.color[1], row.color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(row.amt, 158, currentY + 4.5);
    currentY += 6.5;
  });

  // Net Customer Investment Highlight Box
  currentY += 2;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(14, currentY, 182, 12, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, currentY, 182, 12, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('NET EFFECTIVE INVESTMENT (After Total Subsidy):', 18, currentY + 7.5);
  doc.setFontSize(12);
  doc.text(`Rs. ${data.netCostToPay.toLocaleString('en-IN')}*`, 146, currentY + 7.5);

  // Section 4: Return on Investment & Generation Forecast
  currentY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ESTIMATED ENERGY GENERATION & FINANCIAL RETURN:', 14, currentY);

  currentY += 3;
  // 4 metric boxes
  const boxWidth = 43;
  const metrics = [
    { label: 'Monthly Generation', val: `~${data.monthlyUnits} Units` },
    { label: 'Monthly Bill Savings', val: `Rs. ${data.monthlySavings.toLocaleString('en-IN')}` },
    { label: 'Annual Bill Savings', val: `Rs. ${data.yearlySavings.toLocaleString('en-IN')}` },
    { label: 'Estimated Payback', val: `${data.paybackYears} Years` },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * (boxWidth + 3.3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(xPos, currentY, boxWidth, 14, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, currentY, boxWidth, 14, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos + 3, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, xPos + 3, currentY + 10.5);
  });

  // Section 5: Terms & Bank Loan Note
  currentY += 17;
  const hasLoan = !!data.loanDetails;
  const boxHeight = hasLoan ? 24 : 18;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, boxHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('NATIONALIZED BANK LOAN & FINANCING (PM SURYA GHAR SCHEME):', 18, currentY + 4.5);

  if (hasLoan && data.loanDetails) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Financing Summary: Down Payment: Rs. ${data.loanDetails.downPayment.toLocaleString('en-IN')} | Loan Principal: Rs. ${data.loanDetails.loanPrincipal.toLocaleString('en-IN')} @ ${data.loanDetails.interestRate}% p.a. for ${data.loanDetails.tenureYears} Years`,
      18,
      currentY + 8.5
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(
      `Monthly EMI: Rs. ${data.loanDetails.monthlyEmi.toLocaleString('en-IN')}/mo  |  Expected Bill Savings: Rs. ${data.monthlySavings.toLocaleString('en-IN')}/mo  |  Net Monthly Benefit: +Rs. ${data.loanDetails.netMonthlyProfit.toLocaleString('en-IN')}/mo`,
      18,
      currentY + 12.5
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Collateral-free loan via SBI, Canara Bank, PNB & Bank of Baroda. Zero foreclosure fee. Dilip Enterprises provides vendor document kit.',
      18,
      currentY + 16.5
    );
    doc.text(
      'Terms: Net metering subject to UPPCL line feasibility. Final quote valid for 15 days from issue date.',
      18,
      currentY + 20
    );
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      '1. Collateral-Free Bank Loans: Available at ~7.00% p.a. through SBI, Canara Bank & nationalized banks with only 10% margin money.',
      18,
      currentY + 8.5
    );
    doc.text(
      '2. Net Metering: Dilip Enterprises assists in UPPCL discom feasibility, bi-directional net meter installation and inspection.',
      18,
      currentY + 12
    );
    doc.text(
      '3. Terms: Final costing subject to physical roof height, structure elevation, and cable run distance verified during site survey.',
      18,
      currentY + 15.5
    );
  }

  // Signatory & Footer
  currentY += boxHeight + 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, 196, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('DILIP ENTERPRISES', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Office: South Malaka / Kydganj Road, Prayagraj, UP - 211003', 14, currentY + 4);
  doc.text('Contact: +91 94509 60325 | Email: contact@dilipenterprises.in', 14, currentY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED SIGNATORY', 148, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Mr. Devashish (Technical Director)', 148, currentY + 4);
  doc.text('UPNEDA Approved Solar Dealer, Prayagraj', 148, currentY + 7.5);

  // Save the PDF
  const filename = `Dilip_Enterprises_Solar_Quotation_${data.kw}kW_${(data.customerName || 'Customer').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
