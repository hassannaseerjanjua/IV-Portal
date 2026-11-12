import React, { useState, useEffect } from 'react';
import { IVProduct, OutreachRecord } from '../types';
import {
  X,
  ExternalLink,
  Image,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Mail,
  User,
  Save,
  PackageCheck
} from 'lucide-react';
import { getMoleculeGroup, getTherapeuticCategory } from '../utils/portalHelpers';
import {
  getCompanyLead,
  saveCompanyLead,
  subscribeToCompanyLeadUpdates,
  formatProductForClipboard
} from '../utils/crmStorage';

interface ProductDetailModalProps {
  product: IVProduct | null;
  onClose: () => void;
  onFilterByCompany: (company: string) => void;
  onOutreachUpdated?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onFilterByCompany,
  onOutreachUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [outreachStatus, setOutreachStatus] = useState<OutreachRecord['status']>('Not Contacted');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!product) return;
    const existing = getCompanyLead(product.company);
    if (existing) {
      setOutreachStatus(existing.status);
      setContactPerson(existing.contactPerson || '');
      setPhone(existing.phone || '');
      setEmail(existing.email || '');
      setNotes(existing.notes || '');
    } else {
      setOutreachStatus(product.orig_status === 'EXISTING CLIENT' ? 'Existing Client' : 'Not Contacted');
      setContactPerson(product.contact || '');
      setPhone(product.phone || '');
      setEmail('');
      setNotes('');
    }
  }, [product]);

  // Keep modal in live sync if company lead is updated in the separate Leads screen
  useEffect(() => {
    if (!product) return;
    const unsubscribe = subscribeToCompanyLeadUpdates(() => {
      const existing = getCompanyLead(product.company);
      if (existing) {
        setOutreachStatus(existing.status);
        setContactPerson(existing.contactPerson || '');
        setPhone(existing.phone || '');
        setEmail(existing.email || '');
        setNotes(existing.notes || '');
      }
    });
    return unsubscribe;
  }, [product]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleCopySpec = async () => {
    const text = formatProductForClipboard(product);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveOutreach = () => {
    saveCompanyLead(product.company, {
      companyName: product.company,
      status: outreachStatus,
      contactPerson,
      phone,
      email,
      notes,
      city: product.city
    });
    setIsSaved(true);
    if (onOutreachUpdated) onOutreachUpdated();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const imgSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    product.brand + ' ' + product.company + ' infusion Pakistan'
  )}`;

  const molecule = getMoleculeGroup(product.generic);
  const category = getTherapeuticCategory(product.generic);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Top Amber Accent Bar matching theme */}
        <div className="h-1.5 bg-[#f59e0b] w-full shrink-0" />

        {/* Header - Clean White & Bold Accents */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                Record #{product.sno}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                product.is_glass ? 'badge-glass' : 'badge-plastic'
              }`}>
                {product.is_glass ? '🍾 Glass Infusion Bottle' : '🧴 Plastic BFS Bottle'}
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-[#0047ba] px-2 py-0.5 rounded-full border border-blue-200">
                {product.size}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.brand}
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {product.generic}
            </p>
          </div>

          <button
            onClick={onClose}
            title="Close modal (Esc)"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1 bg-[#f4f6fa]/50">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manufacturer</div>
              <div className="font-extrabold text-slate-900 mt-1">{product.company}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#0047ba]" />
                <span>{product.city || 'Pakistan'}</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pack Volume</div>
              <div className="font-extrabold text-slate-900 mt-1">{product.size}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Clinical pack size</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DRAP Registration</div>
              <div className="font-mono font-bold text-[#0047ba] mt-1">{product.drap_reg || 'Not Listed'}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> DRAP Regulatory Scope
              </div>
            </div>
          </div>

          {/* Molecule & Category */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#0047ba] uppercase tracking-wider">Active Molecule &amp; Class</div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">{molecule}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">{category}</div>
            </div>
            <button
              onClick={() => {
                onFilterByCompany(product.company);
                onClose();
              }}
              className="px-3.5 py-2 bg-blue-50 hover:bg-[#0047ba] text-[#0047ba] hover:text-white rounded-xl font-bold text-xs transition-colors border border-blue-100"
            >
              All {product.company} Formulations →
            </button>
          </div>

          {/* Packaging Audit Details & Prospect Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-[#0047ba]" />
              <span>Packaging Technology &amp; Assessment:</span>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">
                {product.pack_type}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.notes}
              </p>
            </div>
          </div>

          {/* Hanger label viability recommendation */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
            product.is_glass
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            {product.is_glass ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-extrabold text-xs uppercase tracking-wider">
                {product.is_glass ? 'High-Priority Target for Hanger Labels' : 'Molded Loop / Plastic BFS Architecture'}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {product.is_glass
                  ? 'This formulation is packaged in USP Type II Glass Infusion bottles. Unlike plastic bottles with built-in loops, glass bottles require self-adhesive hanger labels or external suspension clips for IV pole hanging.'
                  : 'This formulation is packaged in Blow-Fill-Seal (BFS) plastic containers with built-in mold loops or euro-head caps.'}
              </p>
            </div>
          </div>

          {/* Outreach & CRM Section (Saved in localStorage) */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0047ba]" />
                <span>Company Lead &amp; Outreach ({product.company}):</span>
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                Company CRM Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Outreach Stage
                </label>
                <select
                  value={outreachStatus}
                  onChange={(e) => setOutreachStatus(e.target.value as OutreachRecord['status'])}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                >
                  <option value="Not Contacted">Not Contacted</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Sample Sent">Sample Sent / Testing</option>
                  <option value="Existing Client">Existing Client</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Contact Person / Role
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Procurement / Plant Head"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Phone / Mobile</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. procurement@company.pk"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Private Outreach &amp; Pitch Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes on hanger label samples, meeting logs, target pricing..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveOutreach}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0047ba] hover:bg-[#003894] text-white shadow-sm'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Outreach Saved!' : 'Save Outreach Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySpec}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl border transition-colors ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <a
              href={imgSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Image className="w-3.5 h-3.5 text-[#0047ba]" />
              <span>Google Images</span>
            </a>

            {product.source_link && product.source_link.startsWith('http') && (
              <a
                href={product.source_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>DRAP Source</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
