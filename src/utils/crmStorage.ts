import { OutreachRecord, CompanyContact } from '../types';

const CRM_STORAGE_KEY = 'pak_iv_crm_outreach_data_v1';
const COMPANY_CONTACTS_KEY = 'pak_iv_company_contacts_v1';

export function getStoredOutreachRecords(): Record<number, OutreachRecord> {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load outreach records from localStorage', e);
    return {};
  }
}

export function saveOutreachRecord(sno: number, record: Partial<OutreachRecord>): OutreachRecord {
  try {
    const existing = getStoredOutreachRecords();
    const current = existing[sno] || {
      sno,
      status: 'Not Contacted',
      notes: '',
      contactPerson: '',
      phone: '',
      email: ''
    };

    const updated: OutreachRecord = {
      ...current,
      ...record,
      updatedAt: new Date().toISOString()
    };

    existing[sno] = updated;
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));
    return updated;
  } catch (e) {
    console.error('Failed to save outreach record', e);
    return {
      sno,
      status: 'Not Contacted',
      ...record
    };
  }
}

export function getCompanyContact(companyName: string): CompanyContact | null {
  try {
    const raw = localStorage.getItem(COMPANY_CONTACTS_KEY);
    if (!raw) return null;
    const all: Record<string, CompanyContact> = JSON.parse(raw);
    return all[companyName] ?? null;
  } catch {
    return null;
  }
}

export function saveCompanyContact(contact: CompanyContact): void {
  try {
    const raw = localStorage.getItem(COMPANY_CONTACTS_KEY);
    const all: Record<string, CompanyContact> = raw ? JSON.parse(raw) : {};
    all[contact.companyName] = { ...contact, updatedAt: new Date().toISOString() };
    localStorage.setItem(COMPANY_CONTACTS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save company contact', e);
  }
}

export function deleteCompanyContact(companyName: string): void {
  try {
    const raw = localStorage.getItem(COMPANY_CONTACTS_KEY);
    if (!raw) return;
    const all: Record<string, CompanyContact> = JSON.parse(raw);
    delete all[companyName];
    localStorage.setItem(COMPANY_CONTACTS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function getAllCompanyContacts(): Record<string, CompanyContact> {
  try {
    const raw = localStorage.getItem(COMPANY_CONTACTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function exportCompanyContactsAsCSV(): void {
  const contacts = getAllCompanyContacts();
  const rows = Object.values(contacts);
  if (rows.length === 0) return;
  const header = ['Company', 'Contact Person', 'Title', 'Phone', 'Email', 'LinkedIn', 'Last Updated'];
  const lines = [
    header.join(','),
    ...rows.map(r =>
      [
        `"${r.companyName}"`,
        `"${r.personName}"`,
        `"${r.title}"`,
        `"${r.phone}"`,
        `"${r.email}"`,
        `"${r.linkedin}"`,
        `"${r.updatedAt ?? ''}"`,
      ].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'iv_portal_management_contacts.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function formatProductForClipboard(product: {
  sno: number;
  company: string;
  city: string;
  brand: string;
  generic: string;
  size: string;
  is_glass: boolean;
  pack_type: string;
  drap_reg: string;
  notes: string;
}): string {
  return [
    `*${product.brand}* (${product.generic})`,
    `Manufacturer: ${product.company} (${product.city || 'Pakistan'})`,
    `Pack Size: ${product.size}`,
    `Packaging: ${product.is_glass ? '🍾 Glass Infusion Bottle (Hanger Label Target)' : '🧴 Plastic BFS Bottle'}`,
    `Technology: ${product.pack_type}`,
    `DRAP Reg: ${product.drap_reg || 'N/A'}`,
    `Notes: ${product.notes}`
  ].join('\n');
}

