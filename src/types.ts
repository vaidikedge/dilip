export type PageId =
  | 'home'
  | 'about'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'power-plant'
  | 'pumps'
  | 'street-lights'
  | 'water-heaters'
  | 'how-it-works'
  | 'calculator'
  | 'contact'
  | 'privacy'
  | 'privacy-policy'
  | 'admin-leads';

export interface SolarProduct {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: 'Rooftop' | 'Product' | 'Agricultural' | 'Lighting' | 'Heating';
  image: string;
  iconName: string;
  features: string[];
  specs: { label: string; value: string }[];
  targetPage?: PageId;
}

export interface SubsidyRow {
  capacityKw: number;
  oldSubsidy: number;
  centralSubsidy: number;
  upStateSubsidy: number;
  totalSubsidy: number;
  avgGenPerDayUnits: number;
  roofAreaSqFt: number;
  estimatedCost: number;
  netCost: number;
  annualSavingsRs: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  quote: string;
  systemDetails: string;
}

export interface SolarConsultationLead {
  fullName: string;
  phone: string;
  email?: string;
  location: string;
  propertyType: 'Home / Residential' | 'Housing Society' | 'Commercial' | 'Industrial' | 'Agriculture / Farm';
  monthlyBillRs: string;
  desiredCapacityKw: string;
  roofType: 'RCC Flat Roof' | 'Tin / Metal Sheet' | 'Ground Mount' | 'Other';
  message?: string;
  // UPPCL Electricity Bill fields
  uppclAccountNumber?: string;
  sanctionedLoadKw?: string;
  billFileName?: string;
  billFileType?: string;
  billFileSize?: number;
  billFileData?: string;
}
