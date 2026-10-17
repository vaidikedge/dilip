import { SolarProduct, SubsidyRow, Testimonial } from '../types';

export const COMPANY_INFO = {
  name: 'Dilip Enterprises',
  subTitle: 'Solar Solution Prayagraj',
  tagline: 'Embrace The Power Of The Sun',
  established: '2017',
  experienceYears: '10+',
  proprietor: 'Mr. Devashish',
  accreditation: 'Approved Vendor under UPNEDA (Uttar Pradesh New & Renewable Energy Development Agency)',
  phone: '+91-76074 07159',
  phoneClean: '917607407159',
  email: 'info@dilipenterprises.in',
  backupEmail: 'balajicompany.in@gmail.com',
  address: '184/212D, near Kiran Jaiswal Corporator House, Nai Basti, Kydganj, Prayagraj, Uttar Pradesh 211003',
  googleMapUrl: 'https://maps.google.com/?q=Nai+Basti+Kydganj+Prayagraj+Uttar+Pradesh+211003',
  workingHours: 'Mon - Sat: 9:30 AM - 7:30 PM (Sunday by Appointment)',
  whatsappUrl: 'https://wa.me/917607407159?text=Hello%20Dilip%20Enterprises%20Solar%20Solution,%20I%20want%20to%20enquire%20about%20Solar%20Installation%20and%20Govt%20Subsidy',
};

export const SOLAR_PRODUCTS: SolarProduct[] = [
  {
    id: 'power-plant',
    title: 'Solar Power Plant',
    category: 'Rooftop',
    shortDesc: 'Grid-tied, Off-grid and Hybrid solar power plants for homes, institutions, and industrial rooftops with net-metering.',
    fullDesc: 'Dilip Enterprises specializes in high-efficiency on-grid, off-grid and hybrid solar power plants. From 1 kW residential rooftop setups to 100+ kW MW-scale commercial and industrial plants, we deliver end-to-end turnkey EPC solutions approved under UPNEDA with maximum solar subsidy in Uttar Pradesh.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Sun',
    features: [
      'Tier-1 Mono PERC & Bifacial 16-BB Solar Panels (540Wp - 580Wp)',
      'High-efficiency MPPT Solar Inverters with Wi-Fi Mobile App Monitoring',
      'Hot-dip galvanized heavy-duty mounting structures for 150 km/h wind resistance',
      'Complete UPNEDA Net-metering liaison and fast Discom subsidy approval',
      '25-Year Panel Performance Warranty & 5-Year Comprehensive Inverter Warranty'
    ],
    specs: [
      { label: 'System Types', value: 'On-Grid / Off-Grid / Hybrid' },
      { label: 'Capacity Range', value: '1 kW to 500 kW+' },
      { label: 'Daily Output', value: '4 - 5 Units per kW/day' },
      { label: 'Govt Subsidy', value: 'Up to ₹1,08,000 (Central + UP State)' },
      { label: 'Life Expectancy', value: '25+ Years' }
    ],
    targetPage: 'power-plant'
  },
  {
    id: 'pumps',
    title: 'Solar Water Pumps',
    category: 'Agricultural',
    shortDesc: 'High-performance AC & DC solar submersible and surface pumps for agriculture, farms, irrigation, and rural drinking water.',
    fullDesc: 'At Dilip Enterprises, we provide complete solar-powered water pumping systems tailored for agriculture, tube-wells, gardens, and rural communities in Prayagraj and eastern UP. Eliminate diesel generator costs and erratic electricity supply with zero running cost solar pumps.',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Droplets',
    features: [
      'AC & DC Submersible Stainless Steel Borewell Pumps (1 HP to 10 HP)',
      'Solar Surface Monoblock Pumps for canal & pond water extraction',
      'Hybrid capability: operates with solar by day and grid/generator when needed',
      'Smart VFD Solar Pump Controller with dry-run protection and auto-start',
      'PM-KUSUM Yojana eligible with up to 70% government subsidy support'
    ],
    specs: [
      { label: 'Pump Types', value: 'Submersible / Monoblock / Surface' },
      { label: 'Motor Rating', value: '1 HP, 2 HP, 3 HP, 5 HP, 7.5 HP, 10 HP' },
      { label: 'Operating Voltage', value: 'DC brushless / 3-Phase AC' },
      { label: 'Daily Water Discharge', value: '15,000 to 2,50,000 Liters/day' },
      { label: 'Payback Time', value: 'Under 2 Years vs Diesel' }
    ],
    targetPage: 'pumps'
  },
  {
    id: 'street-lights',
    title: 'Solar LED Street Lights',
    category: 'Lighting',
    shortDesc: 'All-in-One and Integrated solar street lights with intelligent dusk-to-dawn radar motion sensors and LiFePO4 batteries.',
    fullDesc: 'Commercial and municipal grade solar street lighting systems engineered for village panchayats, rural roadways, gated colonies, factory campuses, schools, and farmhouses across Prayagraj. Fully automatic operation from sunset to sunrise with zero electricity bills.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Lightbulb',
    features: [
      'All-In-One Integrated Aluminum Die-Cast Weatherproof Enclosure (IP65)',
      'Grade-A Lithium Ferro Phosphate (LiFePO4) Battery with 2500+ charge cycles',
      'Radar Microwave Motion Sensor (dims to 30% on idle, 100% on motion)',
      'High-lumen Bridgelux / Philips LED Chips (160+ lumens per watt)',
      '3 Days of Rainy/Cloudy Day Autonomy Backup'
    ],
    specs: [
      { label: 'Wattage Options', value: '15W, 24W, 30W, 40W, 60W, 90W, 120W' },
      { label: 'Battery Type', value: 'LiFePO4 3.2V / 12.8V' },
      { label: 'Sensor', value: 'Automatic Dusk-to-Dawn + Radar' },
      { label: 'Pole Height', value: '4m to 9m compatible' },
      { label: 'Warranty', value: '3 to 5 Years' }
    ],
    targetPage: 'street-lights'
  },
  {
    id: 'water-heaters',
    title: 'Solar Water Heaters',
    category: 'Heating',
    shortDesc: 'Pressurized and non-pressurized solar water heating systems (ETC & FPC) for homes, hostels, hotels, and hospitals.',
    fullDesc: 'Dilip Enterprises offers premium solar water heating systems for domestic bathrooms, residential hostels, hotels, hospitals, and industrial boiler pre-heating in Prayagraj. Enjoy boiling hot water 365 days a year without increasing your winter electric geyser bills.',
    image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Flame',
    features: [
      'Evacuated Tube Collector (ETC) with 3-target selective absorption coating',
      'Flat Plate Collector (FPC) with copper tubes and toughened solar glass',
      'High-density PUF insulation maintains hot water temperature up to 72 hours',
      'Corrosion-resistant Inner Tank (Food-grade SS 304 / Vitreous Enamel)',
      'Backup electrical heating element for continuous cloudy weather'
    ],
    specs: [
      { label: 'Capacity', value: '100 LPD to 5,000+ LPD' },
      { label: 'Collector Type', value: 'ETC (Borosilicate) / FPC (Copper)' },
      { label: 'Max Temperature', value: 'Up to 85°C' },
      { label: 'Tank Material', value: 'Stainless Steel 304 / Glass Lined' },
      { label: 'Electricity Savings', value: 'Up to ₹18,000 / year' }
    ],
    targetPage: 'water-heaters'
  }
];

export const SUBSIDY_MATRIX: SubsidyRow[] = [
  {
    capacityKw: 1,
    oldSubsidy: 14588,
    centralSubsidy: 30000,
    upStateSubsidy: 15000,
    totalSubsidy: 45000,
    avgGenPerDayUnits: 4.5,
    roofAreaSqFt: 100,
    estimatedCost: 65000,
    netCost: 20000,
    annualSavingsRs: 12000
  },
  {
    capacityKw: 2,
    oldSubsidy: 29176,
    centralSubsidy: 60000,
    upStateSubsidy: 30000,
    totalSubsidy: 90000,
    avgGenPerDayUnits: 9.0,
    roofAreaSqFt: 200,
    estimatedCost: 125000,
    netCost: 35000,
    annualSavingsRs: 25000
  },
  {
    capacityKw: 3,
    oldSubsidy: 43764,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 13.5,
    roofAreaSqFt: 300,
    estimatedCost: 175000,
    netCost: 67000,
    annualSavingsRs: 38000
  },
  {
    capacityKw: 4,
    oldSubsidy: 51058,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 18.0,
    roofAreaSqFt: 400,
    estimatedCost: 225000,
    netCost: 117000,
    annualSavingsRs: 52000
  },
  {
    capacityKw: 5,
    oldSubsidy: 58352,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 22.5,
    roofAreaSqFt: 500,
    estimatedCost: 275000,
    netCost: 167000,
    annualSavingsRs: 65000
  },
  {
    capacityKw: 6,
    oldSubsidy: 65646,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 27.0,
    roofAreaSqFt: 600,
    estimatedCost: 325000,
    netCost: 217000,
    annualSavingsRs: 78000
  },
  {
    capacityKw: 7,
    oldSubsidy: 72940,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 31.5,
    roofAreaSqFt: 700,
    estimatedCost: 375000,
    netCost: 267000,
    annualSavingsRs: 91000
  },
  {
    capacityKw: 8,
    oldSubsidy: 80934,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 36.0,
    roofAreaSqFt: 800,
    estimatedCost: 425000,
    netCost: 317000,
    annualSavingsRs: 105000
  },
  {
    capacityKw: 10,
    oldSubsidy: 94822,
    centralSubsidy: 78000,
    upStateSubsidy: 30000,
    totalSubsidy: 108000,
    avgGenPerDayUnits: 45.0,
    roofAreaSqFt: 1000,
    estimatedCost: 525000,
    netCost: 417000,
    annualSavingsRs: 135000
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Purushottam Khandelwal',
    role: 'Resident, Civil Lines',
    location: 'Prayagraj, UP',
    rating: 5,
    quote: 'Very good supplier for rooftop solar plant. They have successfully installed my 5kW plant without any issues. All staff members are very supportive and humble. The owner Mr. Devashish personally supervised the net metering inspection with UPNEDA.',
    systemDetails: '5 kW On-Grid Rooftop System'
  },
  {
    id: '2',
    name: 'Nitant Singh Yadav',
    role: 'Commercial Business Owner',
    location: 'Naini, Prayagraj',
    rating: 5,
    quote: 'Excellent response and prompt service! Fully satisfied with Dilip Enterprises. It is a genuine, trusted firm in Prayagraj. Our monthly commercial electricity bill went down from ₹28,000 to nearly zero during sunny months.',
    systemDetails: '15 kW Commercial Solar Plant'
  },
  {
    id: '3',
    name: 'Devraj Meena',
    role: 'Homeowner, Kydganj',
    location: 'Prayagraj, UP',
    rating: 5,
    quote: 'Great experience working with Dilip Enterprises team. They were the best solution in both price and quality. After installation, our electric bill is almost zero and the subsidy came directly to our bank account in 30 days!',
    systemDetails: '3 kW Residential PM Surya Ghar System'
  }
];

export const FAQS = [
  {
    question: 'How much subsidy is available under PM Surya Ghar Muft Bijli Yojana in UP?',
    answer: 'Under the PM Surya Ghar Muft Bijli Yojana, residential consumers receive up to ₹78,000 from the Central Government (₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW and above) PLUS an additional ₹15,000 to ₹30,000 state subsidy from UPNEDA in Uttar Pradesh! The subsidy is credited directly to your bank account after net-meter installation.'
  },
  {
    question: 'Why choose Dilip Enterprises for solar installation in Prayagraj?',
    answer: 'Dilip Enterprises is a government-approved vendor under UPNEDA with 10+ years of solar experience. We use only BIS and MNRE certified Tier-1 Mono PERC panels, heavy hot-dip galvanized structures, and branded Polycab cables. We handle 100% of the paperwork, DISCOM net-metering approvals, and subsidy processing.'
  },
  {
    question: 'How long does it take to recover the cost of a rooftop solar system?',
    answer: 'Typically, residential homeowners recover their investment in 2.5 to 3.5 years through electricity bill savings and government subsidies. After that, you enjoy virtually free electricity for the remaining 22+ years of the panel lifespan.'
  },
  {
    question: 'What happens when my solar panels produce more electricity than I use?',
    answer: 'With our Bi-directional Net Meter, excess power generated during daytime is automatically exported to the DISCOM (UPPCL) grid. You get units credited on your electricity bill, which offset your night-time grid usage.'
  },
  {
    question: 'Does solar still work on cloudy or rainy days in Prayagraj?',
    answer: 'Yes! Solar panels operate on ambient light irradiance, not direct heat. While generation is reduced during heavy rain or overcast days (to about 30-50%), you continue to produce electricity, and the grid or hybrid battery seamlessly supplements any shortfall.'
  },
  {
    question: 'What maintenance is required for solar rooftop panels?',
    answer: 'Solar panels require very minimal maintenance. Simply washing them with clean water twice a month to remove dust and bird droppings ensures peak generation. Dilip Enterprises also provides free 1st-year AMC support and remote monitoring assistance.'
  },
  {
    question: 'How much roof space is required to install 1 kW to 3 kW solar?',
    answer: 'Each 1 kW of solar installation requires approximately 80 to 100 square feet of shadow-free rooftop area. For a typical 3 kW home system, about 250 - 300 sq. ft. of space is sufficient.'
  }
];

export const SOLAR_ESSENTIALS = [
  {
    title: 'Solar Panels (16-BB Cell)',
    desc: 'High-efficiency Half-Cut Mono PERC and N-Type TopCon technology with 16 busbars for maximum power yield even in low light.',
    badge: '25-Year Warranty',
    specs: 'Efficiency up to 22.8% • Anti-reflective coating'
  },
  {
    title: 'Solar Inverters (MPPT)',
    desc: 'Smart On-grid string inverters (K-Solare / Growatt / Solis) featuring dual MPPT tracking, IP65 waterproof rating and built-in Wi-Fi mobile monitoring.',
    badge: '98.6% Peak Efficiency',
    specs: 'Wide DC voltage range • Remote Cloud Diagnostics'
  },
  {
    title: 'Galvanized Mounting Structure',
    desc: 'Custom-fabricated Hot-Dip Galvanized Iron (GI) structures engineered for rooftop safety, elevated headroom, and 150 km/h wind resilience.',
    badge: 'Rust-Proof 25+ Yrs',
    specs: '80+ micron zinc coating • RCC anchor bolting'
  },
  {
    title: 'DC Solar Wires & Cables',
    desc: 'Certified Polycab / Havells flame-retardant (FR) double-insulated XLPO copper cables with UV and extreme weather resistance.',
    badge: 'TUV / EN 50618 Certified',
    specs: 'Low voltage drop • High current-carrying rating'
  },
  {
    title: 'Balance of System (BOS) Kit',
    desc: 'Comprehensive protection components: ACDB & DCDB with genuine Type-II SPDs, fuses, MCBs, chemical earthing rods, and lightning arresters.',
    badge: 'Complete Safety',
    specs: 'Surge protection • 3-rod dedicated earthing'
  },
  {
    title: 'Turnkey Solar EPC',
    desc: 'End-to-end site survey, 3D shadow analysis, UPNEDA liaison, DISCOM net-metering synchronization, commissioning, and subsidy claim handling.',
    badge: 'UPNEDA Approved',
    specs: 'Fast approval • Dedicated project supervisor'
  }
];
