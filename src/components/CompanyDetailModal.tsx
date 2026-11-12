import React, { useState, useEffect } from 'react';
import { CompanySummary, IVProduct, CompanyContact } from '../types';
import {
  X, Building2, MapPin, Eye, Search, ExternalLink, Image,
  ShieldCheck, Pencil, Save, Trash2, UserCircle2, Phone,
  Mail, Linkedin, BadgeCheck, Plus
} from 'lucide-react';
import { getCompanyContact, saveCompanyContact, deleteCompanyContact } from '../utils/crmStorage';

interface CompanyDetailModalProps {
  company: CompanySummary | null;
  onClose: () => void;
  onSelectProduct: (product: IVProduct) => void;
  onFilterTableByCompany: (companyName: string) => void;
}

const EMPTY_CONTACT: Omit<CompanyContact, 'companyName' | 'updatedAt'> = {
  personName: '',
  title: '',
  linkedin: '',
  phone: '',
  email: '',
};

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  onClose,
  onSelectProduct,
  onFilterTableByCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contact, setContact] = useState<CompanyContact | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(EMPTY_CONTACT);
  const [saved, setSaved] = useState(false);

  /* Load saved contact whenever company changes */
  useEffect(() => {
    if (!company) return;
    const stored = getCompanyContact(company.name);
    setContact(stored);
    setEditMode(false);
    setSaved(false);
    if (stored) {
      setDraft({
        personName: stored.personName,
        title: stored.title,
        linkedin: stored.linkedin,
        phone: stored.phone,
        email: stored.email,
      });
    } else {
      setDraft(EMPTY_CONTACT);
    }
  }, [company?.name]);

  if (!company) return null;

  const filteredProducts = company.products.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.brand.toLowerCase().includes(q) ||
      p.generic.toLowerCase().includes(q) ||
      p.pack_type.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      p.drap_reg.toLowerCase().includes(q)
    );
  });

  const glassPercent = Math.round((company.glassCount / company.totalProducts) * 100);

  function handleSave() {
    if (!company) return;
    const record: CompanyContact = { companyName: company.name, ...draft };
    saveCompanyContact(record);
    setContact({ ...record, updatedAt: new Date().toISOString() });
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleDelete() {
    if (!company) return;
    deleteCompanyContact(company.name);
    setContact(null);
    setDraft(EMPTY_CONTACT);
    setEditMode(false);
  }

  function startEdit() {
    if (contact) {
      setDraft({
        personName: contact.personName,
        title: contact.title,
        linkedin: contact.linkedin,
        phone: contact.phone,
        email: contact.email,
      });
    } else {
      setDraft(EMPTY_CONTACT);
    }
    setEditMode(true);
  }

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-y-auto">

        {/* Top Amber Accent Bar */}
        <div className="h-1.5 bg-[#f59e0b] w-full shrink-0" />

        {/* ── Modal Header ── */}
        <div className="p-5 sm:p-7 bg-white border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            {/* Avatar */}
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 text-[#0047ba] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Pharma Manufacturer
                </span>
                {company.glassCount > 0 ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>🍾 Prime Hanger Target ({company.glassCount} Glass Lines)</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    🧴 BFS Plastic Specialist
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-400">• Audited DRAP Portfolio</span>
              </div>

              {/* Company Name */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {company.name}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#0047ba]" />
                  <span>{company.city || 'Pakistan'}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>{company.brands.length} Brand Lines</span>
                <span className="text-slate-300">|</span>
                <span>{company.molecules.length} Drug Generics</span>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Metric Cards + Key Contact row ── */}
        <div className="p-5 sm:p-7 bg-[#f8fafc] border-b border-slate-200/80 shrink-0 space-y-4">

          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Formulations</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{company.totalProducts}</div>
                <div className="text-[11px] text-slate-500 font-medium">Audited IV Products</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047ba] flex items-center justify-center text-lg">📦</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Glass Bottles (Target)</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{company.glassCount}</div>
                <div className="text-[11px] text-emerald-600 font-medium">{glassPercent}% • Needs Hanger Labels</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">🍾</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Plastic BFS Containers</div>
                <div className="text-2xl font-extrabold text-amber-700 mt-0.5">{company.plasticCount}</div>
                <div className="text-[11px] text-amber-600 font-medium">{100 - glassPercent}% • Molded Loops / Bags</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg">🧴</div>
            </div>
          </div>

          {/* ── Key Management Contact Card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-[#0047ba]" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Management Contact</span>
                {contact && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <BadgeCheck className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!editMode && (
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#0047ba] hover:bg-[#003894] text-white transition-colors"
                  >
                    {contact ? <><Pencil className="w-3 h-3" />Edit</> : <><Plus className="w-3 h-3" />Add Contact</>}
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      <Save className="w-3 h-3" />Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    {contact && (
                      <button
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Card Body */}
            {!editMode ? (
              contact ? (
                /* ── View Mode ── */
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar initial */}
                  <div className="w-12 h-12 rounded-2xl bg-[#0047ba] text-white flex items-center justify-center text-xl font-extrabold shrink-0 select-none">
                    {contact.personName.charAt(0).toUpperCase() || '?'}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">{contact.personName || '—'}</div>
                    {contact.title && (
                      <div className="text-xs font-semibold text-[#0047ba]">{contact.title}</div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-[#0047ba] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-[#0047ba] transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {contact.email}
                        </a>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a66c2] hover:text-[#004182] transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>

                  {saved && (
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0">✓ Saved!</span>
                  )}
                </div>
              ) : (
                /* ── Empty State ── */
                <div className="p-5 flex items-center gap-3 text-slate-400">
                  <UserCircle2 className="w-9 h-9 shrink-0 text-slate-200" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500">No management contact saved yet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Click <strong>Add Contact</strong> to save name, title, phone, email & LinkedIn for this company.</div>
                  </div>
                </div>
              )
            ) : (
              /* ── Edit Mode ── */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={draft.personName}
                    onChange={e => setDraft(d => ({ ...d, personName: e.target.value }))}
                    placeholder="e.g. Ahmed Khan"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                    placeholder="e.g. General Manager"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Phone className="w-3 h-3 inline mr-1" />Phone
                  </label>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Mail className="w-3 h-3 inline mr-1" />Email
                  </label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
                    placeholder="ahmed@company.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <Linkedin className="w-3 h-3 inline mr-1" />LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={draft.linkedin}
                    onChange={e => setDraft(d => ({ ...d, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/ahmed-khan"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable Portfolio List ── */}
        <div className="p-5 sm:p-7 space-y-4 flex-1 bg-[#f4f6fa]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Audited IV Formulations ({company.products.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">• Clinical Specifications</span>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter company formulations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Formulation Cards */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200 p-6">
                No formulations match &quot;{searchTerm}&quot;. Try clearing search.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const imgSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                  p.brand + ' ' + p.company + ' infusion Pakistan'
                )}`;

                return (
                  <div
                    key={p.sno}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0047ba]/40 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900 group-hover:text-[#0047ba] transition-colors">
                          {p.brand}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_glass ? 'badge-glass' : 'badge-plastic'}`}>
                          {p.is_glass ? '🍾 Glass Bottle' : '🧴 Plastic BFS'}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                          {p.size}
                        </span>
                        {p.drap_reg && p.drap_reg !== '—' && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            DRAP: {p.drap_reg}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-700">{p.generic}</div>
                      <div className="text-xs text-slate-500">{p.pack_type}</div>
                      {p.notes && <p className="text-[11px] text-slate-400 line-clamp-1 italic">{p.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <a
                        href={imgSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Search packshots on Google Images"
                        className="p-2 text-slate-400 hover:text-[#0047ba] hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                      </a>
                      {p.source_link && p.source_link.startsWith('http') && (
                        <a
                          href={p.source_link}
                          target="_blank"
                          rel="noreferrer"
                          title="Open DRAP Source link"
                          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => { onClose(); onSelectProduct(p); }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-[#0047ba] text-[#0047ba] hover:text-white font-bold text-xs transition-all shadow-2xs border border-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Spec
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => { onFilterTableByCompany(company.name); onClose(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0047ba] hover:bg-[#003894] active:bg-[#002d75] text-white font-bold text-xs shadow-md shadow-[#0047ba]/25 transition-all"
          >
            <span>Filter Catalog Table by {company.name}</span>
            <span>→</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
