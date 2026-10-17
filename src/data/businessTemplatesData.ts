import { CrmTask } from './crmData';

export interface BusinessPipelineStage {
  id: string;
  step: number;
  label: string;
  description: string;
}

export interface BusinessTemplatePreset {
  id: string;
  name: string;
  category: string;
  industry: string;
  tagline: string;
  iconName: string;
  badge: string;
  currency: string;
  colorTheme: 'amber' | 'blue' | 'emerald' | 'violet' | 'rose' | 'cyan' | 'indigo' | 'orange';
  systemTypes: string[];
  stages: BusinessPipelineStage[];
  description: string;
  sampleTasks: Omit<CrmTask, 'id' | 'assignedAt' | 'lastUpdatedAt' | 'lastUpdatedBy' | 'remarksHistory'>[];
}

export interface BusinessWorkspace {
  id: string;
  name: string;
  templatePresetId?: string;
  industry: string;
  category: string;
  tagline: string;
  iconName: string;
  badge: string;
  currency: string;
  ownerName: string;
  contactPhone: string;
  email: string;
  address: string;
  gstNumber?: string;
  isDefault?: boolean;
  colorTheme: 'amber' | 'blue' | 'emerald' | 'violet' | 'rose' | 'cyan' | 'indigo' | 'orange';
  stages: BusinessPipelineStage[];
  systemTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export const BUSINESS_TEMPLATE_PRESETS: BusinessTemplatePreset[] = [
  {
    id: 'preset-solar-epc',
    name: 'Solar & Renewable Energy EPC',
    category: 'Renewable Energy',
    industry: 'Solar EPC & Power Solutions',
    tagline: 'PM Surya Ghar: Muft Bijli Yojana & Solar EPC Operations',
    iconName: 'Sun',
    badge: 'UPNEDA Approved EPC',
    currency: '₹',
    colorTheme: 'amber',
    systemTypes: [
      'On-Grid Rooftop',
      'Hybrid Solar',
      'Off-Grid',
      'Solar Water Pump',
      'Commercial HT Solar'
    ],
    stages: [
      { id: 'site_survey', step: 1, label: '1. Site Survey & Roof Feasibility', description: 'Roof measurement, shadow analysis, electrical feasibility' },
      { id: 'portal_registration', step: 2, label: '2. National Portal Registration', description: 'PM Surya Ghar application submitted with UPPCL consumer no.' },
      { id: 'feasibility_approved', step: 3, label: '3. DISCOM Feasibility Approved', description: 'Technical feasibility sanctioned by local DISCOM division' },
      { id: 'material_dispatched', step: 4, label: '4. DCR Material Dispatch', description: 'ALMM approved DCR panels, inverter and mounting dispatched' },
      { id: 'installation_done', step: 5, label: '5. Installation & Earthing Done', description: 'Solar structure fabricated, panels mounted, earthing pits ready' },
      { id: 'meter_commissioned', step: 6, label: '6. Net Meter Commissioned', description: 'DISCOM inspection passed, bi-directional net meter installed' },
      { id: 'jir_pcr_uploaded', step: 7, label: '7. PCR & JIR Uploaded', description: 'Joint Inspection Report & Project Completion Report submitted' },
      { id: 'subsidy_credited', step: 8, label: '8. CFA Subsidy Credited', description: 'Central Financial Assistance subsidy credited to customer bank' }
    ],
    description: 'Complete end-to-end solar EPC management with PM Surya Ghar milestones, DISCOM net-metering, and subsidy tracking.',
    sampleTasks: [
      {
        taskCode: 'SLR-101',
        title: '5kW On-Grid Rooftop Solar - Ramesh Chandra',
        customerName: 'Ramesh Chandra Gupta',
        customerPhone: '9839012345',
        customerAddress: 'Civil Lines, Prayagraj',
        capacityKw: 5,
        systemType: 'On-Grid Rooftop',
        monthlyBillRs: '6500',
        uppclAccountNo: '1098456721',
        roofType: 'RCC Flat Roof',
        priority: 'High',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: 'Dilip Kumar (Owner)',
        ownerInstructions: 'Ensure South-facing 24 degree tilt and ALMM DCR Bi-facial modules.',
        status: 'in progress',
        dealValueRs: 285000,
        leadSource: 'Website Survey'
      }
    ]
  },
  {
    id: 'preset-electrical-contracting',
    name: 'Electrical Contracting & Supplies',
    category: 'Electrical & Power',
    industry: 'High Voltage & Commercial Electricals',
    tagline: 'Commercial Substation, LT/HT Panels, DG Sets & Building Electrification',
    iconName: 'Zap',
    badge: 'Licensed Class-A Contractor',
    currency: '₹',
    colorTheme: 'blue',
    systemTypes: [
      'Substation HT/LT Panel',
      'Commercial Building Wiring',
      'DG Synchronization & AMF',
      'Industrial Earthing & Lightning',
      'Smart Metering & AMR Integration'
    ],
    stages: [
      { id: 'inquiry_survey', step: 1, label: '1. Lead & Site Inspection', description: 'Site load calculation and electrical Single Line Diagram (SLD)' },
      { id: 'boq_quotation', step: 2, label: '2. BOQ & Technical Costing', description: 'Bill of quantities prepared with cable schedules & switchgear specs' },
      { id: 'discom_sanction', step: 3, label: '3. DISCOM Electrical Sanction', description: 'Load sanction and electrical inspectorate drawings submitted' },
      { id: 'panel_fabrication', step: 4, label: '4. Panel Fabrication & Materials', description: 'LT/HT panels fabricated, tested at factory and dispatched' },
      { id: 'cable_laying', step: 5, label: '5. Cable Laying & Erection', description: 'Trenching, tray laying, glanding, termination & busbar links' },
      { id: 'testing_megger', step: 6, label: '6. Megger & Safety Testing', description: 'Insulation resistance, contact resistance & trip relay calibration' },
      { id: 'charging_energization', step: 7, label: '7. DISCOM Energization', description: 'CEIG safety clearance inspection and final charging' },
      { id: 'handover_billing', step: 8, label: '8. Handover & Final Settlement', description: 'As-built SLD handover, warranty certification and final billing' }
    ],
    description: 'Designed for electrical contractors, panel manufacturers, substation engineers, and industrial electricians.',
    sampleTasks: [
      {
        taskCode: 'ELC-101',
        title: '250 kVA Substation & LT Panel - Apex Hospital',
        customerName: 'Dr. Alok Srivastava',
        customerPhone: '9415288990',
        customerAddress: 'Tagore Town, Prayagraj',
        capacityKw: 250,
        systemType: 'Substation HT/LT Panel',
        monthlyBillRs: '85000',
        uppclAccountNo: '8849201944',
        roofType: 'Elevated Structure',
        priority: 'Urgent',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Ensure CEIG compliance certificate before energizing breaker busbars.',
        status: 'in progress',
        dealValueRs: 840000,
        leadSource: 'Direct Tender'
      }
    ]
  },
  {
    id: 'preset-hvac-solutions',
    name: 'HVAC & Air Conditioning Solutions',
    category: 'Climate Control',
    industry: 'HVAC, Chillers & Refrigeration',
    tagline: 'VRF/VRV Central AC, Commercial Chillers, Ducting & Cold Chain',
    iconName: 'Wind',
    badge: 'Certified Daikin/BlueStar Partner',
    currency: '₹',
    colorTheme: 'cyan',
    systemTypes: [
      'VRF/VRV Multi-Split Inverter',
      'Central Water-Cooled Chiller',
      'Commercial Ducting & Ventilation',
      'Cold Storage & Walk-in Chiller',
      'Cleanroom Precision AC (PAC)'
    ],
    stages: [
      { id: 'heat_load_survey', step: 1, label: '1. Heat Load Survey (TR Sizing)', description: 'CFM, thermal envelope and tonnage calculation based on floor area' },
      { id: 'equipment_boq', step: 2, label: '2. Equipment Sizing & Proposal', description: 'Refrigerant piping layout, indoor unit layout and power specs' },
      { id: 'ducting_layout', step: 3, label: '3. Ducting & Piping Installation', description: 'GI sheet ducting, acoustic insulation, copper piping and drains' },
      { id: 'unit_rigging', step: 4, label: '4. Outdoor/Indoor Unit Rigging', description: 'Vibration isolators, condenser placement and air distribution grilles' },
      { id: 'pressure_nitrogen', step: 5, label: '5. Nitrogen Pressure & Vacuum Test', description: '500 PSI nitrogen holding for 24h followed by deep vacuum check' },
      { id: 'gas_charging', step: 6, label: '6. R410A/R32 Gas Charging', description: 'Precision electronic scale refrigerant charging and valve checks' },
      { id: 'air_balancing', step: 7, label: '7. Air Balancing & CFM Calibration', description: 'Anemometer airflow balance, temperature split and thermostat config' },
      { id: 'handover_amc', step: 8, label: '8. Handover & Preventive AMC', description: 'Client training, filter warranty certificates and annual service AMC' }
    ],
    description: 'Tailored for HVAC contractors, commercial chiller installations, AC repair networks, and refrigeration dealers.',
    sampleTasks: [
      {
        taskCode: 'HVC-101',
        title: '32 TR VRV System - Grand Emerald Hotel',
        customerName: 'Sanjay Mehrotra',
        customerPhone: '9838045678',
        customerAddress: 'MG Marg, Civil Lines, Prayagraj',
        capacityKw: 32,
        systemType: 'VRF/VRV Multi-Split Inverter',
        monthlyBillRs: '120000',
        roofType: 'RCC Flat Roof',
        priority: 'High',
        assignedToUserId: 'usr-emp-2',
        assignedToUserName: 'Amit Patel',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Double check nitrogen pressure hold on 4th floor copper riser lines.',
        status: 'in progress',
        dealValueRs: 650000,
        leadSource: 'Commercial Referral'
      }
    ]
  },
  {
    id: 'preset-real-estate-construction',
    name: 'Real Estate & Civil Construction',
    category: 'Construction & Real Estate',
    industry: 'Architecture, Civil Works & Turnkey Projects',
    tagline: 'Residential Villas, Commercial Towers, Renovations & Turnkey Building',
    iconName: 'Building2',
    badge: 'RERA Certified Builder',
    currency: '₹',
    colorTheme: 'emerald',
    systemTypes: [
      'Residential Villa Turnkey',
      'Commercial Complex Building',
      'Architectural Renovation & Interiors',
      'Structural Retrofitting & Repair',
      'Pre-Engineered Steel Shed (PEB)'
    ],
    stages: [
      { id: 'arch_planning', step: 1, label: '1. Architectural Plan & Map Approval', description: '2D/3D floor layout, structural drawings and municipal sanction' },
      { id: 'soil_excavation', step: 2, label: '2. Soil Test & Deep Excavation', description: 'Soil bearing capacity test, site boundary marking and footing trenching' },
      { id: 'rcc_foundation', step: 3, label: '3. RCC Foundation & Column Casting', description: 'Raft foundation, anti-termite chemical barrier and column reinforcement' },
      { id: 'brickwork_framing', step: 4, label: '4. Slab Casting & Brick Masonry', description: 'Slab shuttering, M25 concrete curing and outer brickwork walls' },
      { id: 'mep_roughin', step: 5, label: '5. MEP Concealed Conduiting', description: 'Concealed CPVC/UPVC plumbing lines and PVC electrical conduit grooves' },
      { id: 'plaster_flooring', step: 6, label: '6. Plastering, Tiles & Flooring', description: 'Sponge plaster, Italian marble / vitrified tile laying and waterproofing' },
      { id: 'finishing_paint', step: 7, label: '7. Painting, Doors & Modular Woodwork', description: 'Putty, primer, emulsion coats, teak frames and modular kitchen fittings' },
      { id: 'completion_handover', step: 8, label: '8. Completion Certificate & Key Handover', description: 'Final snag list audit, municipal completion certificate & formal possession' }
    ],
    description: 'Complete construction management CRM for builders, civil contractors, interior designers, and architects.',
    sampleTasks: [
      {
        taskCode: 'CST-101',
        title: '3500 Sq.Ft Luxury Villa Turnkey - Singh Residence',
        customerName: 'Col. K.P. Singh (Retd.)',
        customerPhone: '9450912345',
        customerAddress: 'Kalyani Devi, Prayagraj',
        capacityKw: 3500,
        systemType: 'Residential Villa Turnkey',
        monthlyBillRs: '0',
        roofType: 'RCC Flat Roof',
        priority: 'High',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Verify M25 concrete cube compression test report for 1st floor slab.',
        status: 'in progress',
        dealValueRs: 4800000,
        leadSource: 'Client Referral'
      }
    ]
  },
  {
    id: 'preset-automotive-ev',
    name: 'Automotive & EV Mobility Hub',
    category: 'Automotive & Mobility',
    industry: 'Automobile Service, EV Chargers & Fleet Care',
    tagline: 'Commercial Fleet Maintenance, EV Fast Chargers & Multi-Brand Workshop',
    iconName: 'Car',
    badge: 'Bosch & EV Certified',
    currency: '₹',
    colorTheme: 'rose',
    systemTypes: [
      'Commercial EV Fast Charger Setup',
      'Fleet Preventive Maintenance',
      'Engine & Transmission Overhaul',
      'Automotive Battery Diagnostic Hub',
      'Body Shop & Ceramic Coating'
    ],
    stages: [
      { id: 'job_card_inward', step: 1, label: '1. Customer Inward & Job Card', description: 'Vehicle inventory, fuel level, odometer reading and primary complaints logged' },
      { id: 'obd_diagnostics', step: 2, label: '2. OBD Scan & Multi-Point Check', description: 'Engine ECU scanning, suspension, brakes and battery health diagnostics' },
      { id: 'parts_estimate', step: 3, label: '3. Parts Requisition & Estimate Signoff', description: 'OEM parts pricing, labor cost estimate approved by customer via WhatsApp' },
      { id: 'repair_service', step: 4, label: '4. Mechanical & Electrical Repairs', description: 'Engine oil flush, brake pad replacement, wiring repair and EV battery balancing' },
      { id: 'wheel_alignment', step: 5, label: '5. 3D Wheel Alignment & Balancing', description: 'Camber/caster adjustment, tire rotation and pressure calibration' },
      { id: 'detailing_wash', step: 6, label: '6. High-Pressure Wash & Interior Detailing', description: 'Underbody anti-rust wash, foam wash, vacuuming and dashboard polish' },
      { id: 'road_test_qc', step: 7, label: '7. Final Road Test & QC Inspection', description: 'Chief technician road trial, OBD fault clearing and final QC signoff' },
      { id: 'invoicing_delivery', step: 8, label: '8. Tax Invoice & Vehicle Gatepass', description: 'Itemized invoice, digital service book entry and key handover' }
    ],
    description: 'Engineered for multi-brand auto workshops, EV charging station installers, and fleet maintenance companies.',
    sampleTasks: [
      {
        taskCode: 'AUT-101',
        title: '60kW CCS2 EV Fast Charger - Highway Plaza',
        customerName: 'Vikramaditya Transport',
        customerPhone: '9839912001',
        customerAddress: 'Prayagraj-Varanasi Highway NH-19',
        capacityKw: 60,
        systemType: 'Commercial EV Fast Charger Setup',
        monthlyBillRs: '45000',
        roofType: 'Ground Mount',
        priority: 'Urgent',
        assignedToUserId: 'usr-emp-2',
        assignedToUserName: 'Amit Patel',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Ensure 3-phase 415V dedicated neutral and dual chemical earthing < 1 ohm.',
        status: 'in progress',
        dealValueRs: 1250000,
        leadSource: 'Commercial Contract'
      }
    ]
  },
  {
    id: 'preset-it-digital-agency',
    name: 'IT Services & Digital Agency',
    category: 'Software & Technology',
    industry: 'Software Development & Cloud Engineering',
    tagline: 'Custom Web Apps, Mobile Systems, Cloud Infrastructure & CRM Solutions',
    iconName: 'Laptop',
    badge: 'GCP & AWS Certified Partner',
    currency: '₹',
    colorTheme: 'violet',
    systemTypes: [
      'Full-Stack Cloud Web App',
      'Mobile Application (iOS/Android)',
      'Enterprise ERP / CRM Modernization',
      'DevOps & Cloud Migration',
      'API & Database Architecture'
    ],
    stages: [
      { id: 'discovery_scope', step: 1, label: '1. Discovery & PRD Scoping', description: 'Product requirement document, user stories, tech stack and scope signoff' },
      { id: 'uiux_wireframe', step: 2, label: '2. UI/UX Figma Design & Prototype', description: 'Design system, interactive click-through mockups and user flow signoff' },
      { id: 'sprint_architecture', step: 3, label: '3. Database Schema & Core Architecture', description: 'Entity relationship design, authentication workflows and API routing setup' },
      { id: 'sprint_frontend', step: 4, label: '4. Sprint Development & UI Build', description: 'Component development, responsive layouts and real-time state integrations' },
      { id: 'qa_security', step: 5, label: '5. QA, Regression & Security Audit', description: 'Unit tests, end-to-end testing, OWASP vulnerability check and speed audit' },
      { id: 'staging_acceptance', step: 6, label: '6. Staging Review & UAT Signoff', description: 'User acceptance testing, client feedback fixes and final staging demo' },
      { id: 'cloud_deployment', step: 7, label: '7. Cloud Production Deployment', description: 'CI/CD pipeline rollout, SSL certification, domain DNS and live monitoring' },
      { id: 'sla_support', step: 8, label: '8. SLA Retainer & Handover', description: 'Source code repository transfer, documentation wiki and maintenance SLA' }
    ],
    description: 'Designed for software development firms, digital marketing agencies, SaaS companies, and IT consultancies.',
    sampleTasks: [
      {
        taskCode: 'DEV-101',
        title: 'Multi-Tenant Supply Chain ERP - Apex Logistics',
        customerName: 'Sameer Singhania',
        customerPhone: '9918234567',
        customerAddress: 'Naini Industrial Area, Prayagraj',
        capacityKw: 10,
        systemType: 'Full-Stack Cloud Web App',
        monthlyBillRs: '0',
        roofType: 'RCC Flat Roof',
        priority: 'High',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Deliver milestone 2 with automated PDF invoice generator and SMS webhook.',
        status: 'in progress',
        dealValueRs: 450000,
        leadSource: 'Direct Pitch'
      }
    ]
  },
  {
    id: 'preset-fmcg-trading',
    name: 'Wholesale FMCG & Distribution',
    category: 'Wholesale & Logistics',
    industry: 'Bulk Goods, Distribution & Super Stockist',
    tagline: 'FMCG Wholesale, Institutional Distribution, Warehouse & Retail Supply',
    iconName: 'Package',
    badge: 'GST & FSSAI Registered',
    currency: '₹',
    colorTheme: 'orange',
    systemTypes: [
      'FMCG Grocery Super Stockist',
      'Industrial Hardware Wholesale',
      'Packaging Consumables Supply',
      'Chemical & Fertilizer Distribution',
      'Commercial Stationery & Paper'
    ],
    stages: [
      { id: 'order_received', step: 1, label: '1. Purchase Order & Ledger Verification', description: 'Retailer PO verification, credit limit check and stock availability' },
      { id: 'stock_allocation', step: 2, label: '2. Warehouse Inventory Allocation', description: 'FIFO batch selection, expiry date check and warehouse bin assignment' },
      { id: 'picking_packing', step: 3, label: '3. Pallet Picking & Protective Packing', description: 'Barcode barcode scanning, carton boxing, shrink-wrapping and labeling' },
      { id: 'eway_bill', step: 4, label: '4. E-Way Bill & Tax Invoice Generation', description: 'GST e-way bill generation, delivery challan and carrier consignment note' },
      { id: 'fleet_dispatch', step: 5, label: '5. Vehicle Loading & Fleet Dispatch', description: 'Vehicle loading manifest, driver signature and GPS route tracking' },
      { id: 'transit_tracking', step: 6, label: '6. In-Transit Monitoring & Delivery', description: 'Real-time delivery status updates and customer ETA communication' },
      { id: 'delivery_ack', step: 7, label: '7. Retailer POD & Material Acceptance', description: 'Signed proof of delivery, damage inspection and return stock reconciliation' },
      { id: 'payment_settlement', step: 8, label: '8. Payment Settlement & Bank Clearance', description: 'NEFT/Cheque realization, discount calculation and credit ledger closing' }
    ],
    description: 'Built for distributors, wholesale merchants, warehouse operators, and FMCG super-stockists.',
    sampleTasks: [
      {
        taskCode: 'TRD-101',
        title: '500-Carton Bulk FMCG Order - Vishal Mega Mart',
        customerName: 'Sunil Agrawal (Procurement Head)',
        customerPhone: '9415112233',
        customerAddress: 'Katra, Prayagraj',
        capacityKw: 500,
        systemType: 'FMCG Grocery Super Stockist',
        monthlyBillRs: '0',
        roofType: 'RCC Flat Roof',
        priority: 'High',
        assignedToUserId: 'usr-emp-2',
        assignedToUserName: 'Amit Patel',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Ensure batch number verification on E-way bill before truck dispatch.',
        status: 'in progress',
        dealValueRs: 620000,
        leadSource: 'Key Account Contract'
      }
    ]
  },
  {
    id: 'preset-steel-fabrication',
    name: 'Metal Fabrication & Manufacturing',
    category: 'Industrial Manufacturing',
    industry: 'Steel Works, Machining & Heavy Engineering',
    tagline: 'Structural Steel Trusses, Laser CNC Cutting, Heavy Machine Bases & Tanks',
    iconName: 'Wrench',
    badge: 'ISO 9001:2015 Certified',
    currency: '₹',
    colorTheme: 'indigo',
    systemTypes: [
      'Factory Shed Structural Trusses',
      'CNC Laser Sheet Metal Cutting',
      'Heavy Machine Foundation Bases',
      'Industrial Storage Silos & Tanks',
      'Hot-Dip Galvanized Towers & Poles'
    ],
    stages: [
      { id: 'cad_signoff', step: 1, label: '1. Engineering CAD & BOQ Signoff', description: 'Structural load analysis, material grade specification and client drawing signoff' },
      { id: 'raw_material', step: 2, label: '2. Raw Steel Staging & Ultrasonic Test', description: 'IS 2062 Grade steel procurement, mill test certificates and dimensional audit' },
      { id: 'cnc_cutting', step: 3, label: '3. CNC Laser Cutting & Profile Bending', description: 'High precision laser cutting, CNC shearing, beveling and hydraulic brake bending' },
      { id: 'welding_fabrication', step: 4, label: '4. Certified MIG/TIG Welding & Assembly', description: 'WPS certified multi-pass welding, gusset plate alignment and tack assembly' },
      { id: 'ndt_inspection', step: 5, label: '5. NDT Weld Testing & Alignment Check', description: 'Dye penetrant and magnetic particle test on critical structural weld joints' },
      { id: 'sandblast_paint', step: 6, label: '6. Shot Blasting & Epoxy Coating', description: 'SA 2.5 shot blast, zinc-rich primer and polyurethane topcoat 120 micron finish' },
      { id: 'dispatch_erection', step: 7, label: '7. Logistics Dispatch & Site Rigging', description: 'Trailer transport, hydraulic crane rigging and anchor bolt alignment' },
      { id: 'final_qc_handover', step: 8, label: '8. Load Test Signoff & Final Handover', description: 'Deflection test audit, third-party inspection report and client signoff' }
    ],
    description: 'Perfect for steel fabricators, sheet metal works, CNC machine shops, and heavy manufacturing plants.',
    sampleTasks: [
      {
        taskCode: 'FAB-101',
        title: '120 MT Structural Steel Factory Shed - Hindalco Ancillary',
        customerName: 'Rajeev Singhal (Plant GM)',
        customerPhone: '9450099881',
        customerAddress: 'Industrial Area Phase 2, Prayagraj',
        capacityKw: 120,
        systemType: 'Factory Shed Structural Trusses',
        monthlyBillRs: '0',
        roofType: 'Tin / Metal Sheet',
        priority: 'Urgent',
        assignedToUserId: 'usr-emp-1',
        assignedToUserName: 'Er. Devashish',
        assignedBy: 'Super Admin',
        ownerInstructions: 'Ensure hot-dip galvanizing thickness complies with minimum 85 microns.',
        status: 'in progress',
        dealValueRs: 3600000,
        leadSource: 'Industrial Tender'
      }
    ]
  }
];

export const INITIAL_BUSINESSES: BusinessWorkspace[] = [
  {
    id: 'biz-solar-dilip',
    name: 'Dilip Enterprises - Solar EPC',
    templatePresetId: 'preset-solar-epc',
    industry: 'Solar Energy & Power Solutions',
    category: 'Renewable Energy',
    tagline: 'PM Surya Ghar: Muft Bijli Yojana & Solar EPC Operations',
    iconName: 'Sun',
    badge: 'UPNEDA Approved EPC',
    currency: '₹',
    ownerName: 'Dilip Kumar',
    contactPhone: '+91 94152 14777',
    email: 'dilipenterprises.solar@gmail.com',
    address: 'Dilip Enterprises, MG Marg / Civil Lines, Prayagraj, UP',
    gstNumber: '09AAECD8271C1ZK',
    isDefault: true,
    colorTheme: 'amber',
    stages: BUSINESS_TEMPLATE_PRESETS[0].stages,
    systemTypes: BUSINESS_TEMPLATE_PRESETS[0].systemTypes,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const BUSINESS_STORAGE_KEY = 'dilip_crm_businesses_v2';
export const ACTIVE_BUSINESS_ID_STORAGE_KEY = 'dilip_crm_active_biz_id_v2';

export function getStoredBusinesses(): BusinessWorkspace[] {
  try {
    if (typeof window === 'undefined') return INITIAL_BUSINESSES;
    const saved = localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Remove deleted businesses: Balaji Electricals and Prime Buildcon
        const cleaned = parsed.filter(
          (b: BusinessWorkspace) =>
            b &&
            b.id !== 'biz-balaji-electrical' &&
            b.id !== 'biz-prime-buildcon' &&
            !b.name?.toLowerCase().includes('balaji electrical') &&
            !b.name?.toLowerCase().includes('prime buildcon')
        );

        if (cleaned.length > 0) {
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse businesses from localStorage:', e);
  }
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    }
  } catch (e) {}
  return INITIAL_BUSINESSES;
}

export function saveStoredBusinesses(businesses: BusinessWorkspace[]): void {
  try {
    if (typeof window !== 'undefined') {
      const cleaned = (businesses || []).filter(
        (b) =>
          b &&
          b.id !== 'biz-balaji-electrical' &&
          b.id !== 'biz-prime-buildcon' &&
          !b.name?.toLowerCase().includes('balaji electrical') &&
          !b.name?.toLowerCase().includes('prime buildcon')
      );
      localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(cleaned.length > 0 ? cleaned : INITIAL_BUSINESSES));
    }
  } catch (e) {
    console.warn('Failed to save businesses to localStorage:', e);
  }
}

export function getStoredActiveBusinessId(): string {
  try {
    if (typeof window === 'undefined') return INITIAL_BUSINESSES[0].id;
    const saved = localStorage.getItem(ACTIVE_BUSINESS_ID_STORAGE_KEY);
    if (
      saved &&
      saved !== 'biz-balaji-electrical' &&
      saved !== 'biz-prime-buildcon'
    ) {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to read active business id:', e);
  }
  return INITIAL_BUSINESSES[0].id;
}

export function saveStoredActiveBusinessId(id: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_BUSINESS_ID_STORAGE_KEY, id);
    }
  } catch (e) {
    console.warn('Failed to save active business id:', e);
  }
}
