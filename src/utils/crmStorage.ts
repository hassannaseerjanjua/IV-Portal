import { CompanyLead, OutreachRecord, CompanyContact } from '../types';

const COMPANY_LEADS_KEY = 'pak_iv_company_leads_v2';
const COMPANY_CONTACTS_KEY = 'pak_iv_company_contacts_v1';
const CRM_STORAGE_KEY = 'pak_iv_crm_outreach_data_v1';

export const COMPANY_LEAD_UPDATE_EVENT = 'iv_crm_company_lead_updated';
export const OUTREACH_UPDATE_EVENT = 'iv_crm_outreach_updated';

const DEFAULT_INITIAL_COMPANY_LEADS: Record<string, CompanyLead> = {
  'Bosch Pharmaceuticals (Pvt) Ltd': {
    companyName: 'Bosch Pharmaceuticals (Pvt) Ltd',
    status: 'Existing Client',
    contactPerson: 'Dr. Aftab',
    title: 'Head of Production & Plant Head',
    phone: '+92 21 111-267-241',
    email: 'info@boschpharma.com',
    linkedin: 'https://www.linkedin.com/company/bosch-pharmaceuticals',
    city: 'Karachi',
    notes: 'Existing commercial client for 100ml glass infusion hanger labels (Bofalgan & Flazol lines). Highly reliable account.',
    updatedAt: new Date().toISOString()
  }
};

/* ── Company Lead Store ── */

export function getStoredCompanyLeads(): Record<string, CompanyLead> {
  try {
    const raw = localStorage.getItem(COMPANY_LEADS_KEY);
    if (!raw) {
      localStorage.setItem(COMPANY_LEADS_KEY, JSON.stringify(DEFAULT_INITIAL_COMPANY_LEADS));
      return { ...DEFAULT_INITIAL_COMPANY_LEADS };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load company leads from localStorage', e);
    return { ...DEFAULT_INITIAL_COMPANY_LEADS };
  }
}

export function getCompanyLead(companyName: string): CompanyLead | null {
  if (!companyName) return null;
  const all = getStoredCompanyLeads();
  const normalized = companyName.trim().toLowerCase();
  for (const [name, lead] of Object.entries(all)) {
    if (name.trim().toLowerCase() === normalized) {
      return lead;
    }
  }
  return null;
}

export function saveCompanyLead(companyName: string, lead: Partial<CompanyLead>): CompanyLead {
  try {
    const existing = getStoredCompanyLeads();
    const cleanName = companyName.trim();
    const current = existing[cleanName] || {
      companyName: cleanName,
      status: 'Not Contacted',
      contactPerson: '',
      title: '',
      phone: '',
      email: '',
      linkedin: '',
      notes: '',
      city: '',
    };

    const updated: CompanyLead = {
      ...current,
      ...lead,
      companyName: cleanName,
      updatedAt: new Date().toISOString()
    };

    existing[cleanName] = updated;
    localStorage.setItem(COMPANY_LEADS_KEY, JSON.stringify(existing));

    // Also sync into company contacts for the company detail modal
    if (updated.contactPerson || updated.phone || updated.email) {
      saveCompanyContact({
        companyName: cleanName,
        personName: updated.contactPerson || '',
        title: updated.title || '',
        phone: updated.phone || '',
        email: updated.email || '',
        linkedin: updated.linkedin || '',
        updatedAt: updated.updatedAt,
      });
    }

    // Dispatch update events for instant reactive updates across all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COMPANY_LEAD_UPDATE_EVENT, { detail: { companyName: cleanName, updated } }));
      window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { companyName: cleanName, updated } }));
    }

    return updated;
  } catch (e) {
    console.error('Failed to save company lead', e);
    return {
      companyName,
      status: 'Not Contacted',
      ...lead
    };
  }
}

export function deleteCompanyLead(companyName: string): void {
  try {
    const existing = getStoredCompanyLeads();
    const cleanName = companyName.trim();
    if (existing[cleanName]) {
      delete existing[cleanName];
      localStorage.setItem(COMPANY_LEADS_KEY, JSON.stringify(existing));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(COMPANY_LEAD_UPDATE_EVENT, { detail: { companyName: cleanName, deleted: true } }));
        window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { companyName: cleanName, deleted: true } }));
      }
    }
  } catch (e) {
    console.error('Failed to delete company lead', e);
  }
}

export function subscribeToCompanyLeadUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(COMPANY_LEAD_UPDATE_EVENT, handler);
  window.addEventListener(OUTREACH_UPDATE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(COMPANY_LEAD_UPDATE_EVENT, handler);
    window.removeEventListener(OUTREACH_UPDATE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function exportCompanyLeadsAsCSV(): void {
  const records = getStoredCompanyLeads();
  const rows = Object.values(records);
  if (rows.length === 0) return;

  const header = [
    'Company Name',
    'City',
    'Outreach Stage',
    'Key Contact Person',
    'Title / Role',
    'Phone / WhatsApp',
    'Email Address',
    'LinkedIn Profile',
    'Outreach Notes',
    'Last Updated'
  ];

  const lines = [
    header.join(','),
    ...rows.map(r =>
      [
        `"${(r.companyName || '').replace(/"/g, '""')}"`,
        `"${(r.city || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.linkedin || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${r.updatedAt || ''}"`
      ].join(',')
    )
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Pak_IV_Company_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Legacy Outreach Records Compatibility Helpers ── */

export function getStoredOutreachRecords(): Record<number, OutreachRecord> {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOutreachRecord(sno: number, record: Partial<OutreachRecord>): OutreachRecord {
  try {
    const existing = getStoredOutreachRecords();
    const current = existing[sno] || { sno, status: 'Not Contacted' };
    const updated: OutreachRecord = { ...current, ...record, updatedAt: new Date().toISOString() };
    existing[sno] = updated;
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));

    // Also sync into company lead if company is provided
    if (updated.company) {
      saveCompanyLead(updated.company, {
        companyName: updated.company,
        status: updated.status,
        contactPerson: updated.contactPerson,
        phone: updated.phone,
        email: updated.email,
        notes: updated.notes,
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { sno, updated } }));
    }
    return updated;
  } catch (e) {
    return { sno, status: 'Not Contacted', ...record };
  }
}

export function deleteOutreachRecord(sno: number): void {
  try {
    const existing = getStoredOutreachRecords();
    delete existing[sno];
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { sno, deleted: true } }));
    }
  } catch {
    /* ignore */
  }
}

export function subscribeToOutreachUpdates(callback: () => void): () => void {
  return subscribeToCompanyLeadUpdates(callback);
}

export function exportLeadsAsCSV(): void {
  exportCompanyLeadsAsCSV();
}

/* ── Company Contacts ── */

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

    // Also sync into CompanyLead
    const leads = getStoredCompanyLeads();
    const existing = leads[contact.companyName] || {
      companyName: contact.companyName,
      status: 'In Discussion',
    };
    leads[contact.companyName] = {
      ...existing,
      contactPerson: contact.personName,
      title: contact.title,
      phone: contact.phone,
      email: contact.email,
      linkedin: contact.linkedin,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(COMPANY_LEADS_KEY, JSON.stringify(leads));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COMPANY_LEAD_UPDATE_EVENT, { detail: { companyName: contact.companyName } }));
      window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { companyName: contact.companyName } }));
    }
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COMPANY_LEAD_UPDATE_EVENT, { detail: { companyName } }));
      window.dispatchEvent(new CustomEvent(OUTREACH_UPDATE_EVENT, { detail: { companyName } }));
    }
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
  exportCompanyLeadsAsCSV();
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
