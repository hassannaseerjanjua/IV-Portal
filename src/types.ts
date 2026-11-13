export interface IVProduct {
  sno: number;
  company: string;
  city: string;
  generic: string;
  brand: string;
  size: string;
  orig_status: string;
  is_glass: boolean;
  pack_type: string;
  notes: string;
  drap_reg: string;
  contact: string;
  phone: string;
  outreach: string;
  source_link: string;
  image_link: string;
}

export type ViewTab = 'products' | 'niches' | 'companies' | 'table' | 'leads' | 'calendar' | 'analytics' | 'pipeline';

export type PackagingFilter = 'all' | 'glass' | 'plastic';

export interface FilterState {
  searchQuery: string;
  packaging: PackagingFilter;
  company: string;
  molecule: string;
  city: string;
  size: string;
  therapeuticCategory: string;
  outreachStatus?: string;
}

export interface CompanySummary {
  name: string;
  city: string;
  totalProducts: number;
  glassCount: number;
  plasticCount: number;
  products: IVProduct[];
  molecules: string[];
  brands: string[];
  packSizes: string[];
  hangerViability: 'High' | 'Medium' | 'Low' | 'None';
}

export interface MoleculeSummary {
  molecule: string;
  category: string;
  totalProducts: number;
  companiesCount: number;
  glassCount: number;
  plasticCount: number;
  commonSizes: string[];
  products: IVProduct[];
  companies: string[];
}

export interface NicheGroup {
  id: string;
  title: string;
  badge: string;
  description: string;
  category: 'packaging' | 'therapeutic' | 'volume' | 'region';
  icon: string;
  productCount: number;
  companyCount: number;
  products: IVProduct[];
}

export interface CompanyLead {
  companyName: string;
  status: 'Not Contacted' | 'In Discussion' | 'Sample Sent' | 'Existing Client' | 'Not Interested';
  contactPerson?: string;
  title?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
  city?: string;
  updatedAt?: string;
  totalProducts?: number;
  glassCount?: number;
  plasticCount?: number;
  brands?: string[];
}

export interface OutreachRecord {
  sno: number;
  status: 'Not Contacted' | 'In Discussion' | 'Sample Sent' | 'Existing Client' | 'Not Interested';
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  updatedAt?: string;
  company?: string;
  brand?: string;
  generic?: string;
  size?: string;
  is_glass?: boolean;
}

export interface CompanyContact {
  companyName: string;
  personName: string;
  title: string;
  linkedin: string;
  phone: string;
  email: string;
  updatedAt?: string;
}

export type LeadTaskType =
  | 'Follow Up'
  | 'Call'
  | 'Email'
  | 'Meeting'
  | 'Sample Dispatch'
  | 'Contract';

export type LeadTaskStatus = 'Todo' | 'In Progress' | 'Closed';

export interface LeadTask {
  id: string;
  title: string;
  type: LeadTaskType;
  status: LeadTaskStatus;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}
