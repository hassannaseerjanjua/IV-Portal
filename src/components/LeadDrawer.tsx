import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CompanyLead, CompanySummary } from '../types';
import { usePresence } from '../hooks/usePresence';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Clock,
  Edit3,
  ExternalLink,
  ChevronDown,
  Layers,
  Calendar,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface LeadDrawerProps {
  lead: (CompanyLead & { summary?: CompanySummary }) | null;
  onClose: () => void;
  onEditLead?: (lead: CompanyLead) => void;
  onStatusChange?: (companyName: string, newStatus: CompanyLead['status']) => void;
  onViewCompanyProducts?: (company: CompanySummary) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead: leadProp,
  onClose,
  onEditLead,
  onStatusChange,
  onViewCompanyProducts,
}) => {
  const { value: lead, state: presence } = usePresence(leadProp);
  const [currentStatus, setCurrentStatus] = useState<CompanyLead['status']>('Not Contacted');

  useEffect(() => {
    if (leadProp) {
      setCurrentStatus(leadProp.status);
    }
  }, [leadProp]);

  // Close on Escape key
  useEffect(() => {
    if (!leadProp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leadProp, onClose]);

  if (!lead) return null;

  const handleStatusSelect = (newStatus: CompanyLead['status']) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(lead.companyName, newStatus);
  };

  // Helper for status badge colors
  const getStatusStyle = (status: CompanyLead['status']) => {
    switch (status) {
      case 'Existing Client':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Sample Sent':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'In Discussion':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'Not Interested':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusStyle = getStatusStyle(currentStatus);

  // Formatted date string
  const formattedDate = lead.updatedAt
    ? new Date(lead.updatedAt).toLocaleDateString('en-CA')
    : new Date().toLocaleDateString('en-CA');

  const leadTypeLabel =
    (lead.glassCount ?? 0) > 0
      ? 'Glass Bottle Hanger Target'
      : (lead.plasticCount ?? 0) > 0
        ? 'BFS Plastic Manufacturer'
        : 'IV Formulations';

  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';

  const drawerContent = (
    <div
      data-state={presence}
      className="motion-scrim fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex justify-end overflow-hidden"
      style={{ height: '100vh', width: '100vw' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="motion-drawer relative w-full max-w-md sm:max-w-lg bg-white h-screen shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
        style={{ height: '100vh', maxHeight: '100vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Stripe */}
        <div className="h-1 bg-[#f59e0b] w-full shrink-0" />

        {/* Drawer Header (Matching Screenshot Design) */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {lead.contactPerson || lead.companyName}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 truncate">
              {lead.phone ? (
                <span className="font-mono text-slate-700">{lead.phone}</span>
              ) : (
                <span>{lead.city || 'Pakistan'}</span>
              )}
              {lead.contactPerson && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="truncate">{lead.companyName}</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader / Section Title */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-slate-900">Lead details</span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Target Company (Project row in screenshot) */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Company / Target</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-right">{lead.companyName}</span>
              {lead.summary && onViewCompanyProducts && (
                <button
                  onClick={() => {
                    onClose();
                    onViewCompanyProducts(lead.summary!);
                  }}
                  title="View company products"
                  className="text-slate-400 hover:text-[#0047ba] transition-colors p-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lead Source / Outreach Stage Dropdown (Matching screenshot dropdown) */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Outreach Stage</span>
            <div className="relative min-w-[170px]">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusSelect(e.target.value as CompanyLead['status'])}
                className={`w-full appearance-none pl-6 pr-8 py-1.5 text-xs font-semibold rounded-xl border cursor-pointer focus:outline-none transition-colors shadow-2xs ${statusStyle.bg}`}
              >
                <option value="Not Contacted">Not Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Sample Sent">Sample Sent</option>
                <option value="Existing Client">Existing Client</option>
                <option value="Not Interested">Not Interested</option>
              </select>
              <span
                className={`w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusStyle.dot}`}
              />
              <ChevronDown className="w-3.5 h-3.5 text-current opacity-70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Lead Type */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Lead Type</span>
            <span className="font-semibold text-slate-800 text-right">
              {leadTypeLabel}
            </span>
          </div>

          {/* Date uploaded / updated */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Date uploaded</span>
            <span className="font-semibold text-slate-900 font-mono">{formattedDate}</span>
          </div>

          {/* Actioned by */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Actioned by</span>
            <span className="font-semibold text-slate-800">Admin</span>
          </div>

          {/* Added By */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Added By</span>
            <span className="font-semibold text-slate-800">Admin</span>
          </div>

          {/* City / Location (Matching pill in screenshot) */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">City</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.city || 'Pakistan'}</span>
            </div>
          </div>

          {/* Contact Person Details */}
          {lead.contactPerson && (
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-slate-500 font-medium">Contact Person</span>
              <div className="text-right">
                <span className="font-semibold text-slate-900 block">{lead.contactPerson}</span>
                {lead.title && (
                  <span className="text-[11px] text-slate-500 block">{lead.title}</span>
                )}
              </div>
            </div>
          )}

          {/* Phone / WhatsApp */}
          {lead.phone && (
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-slate-500 font-medium">Phone / WhatsApp</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-mono text-xs font-semibold text-[#0047ba] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{lead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Email Address */}
          {lead.email && (
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-slate-500 font-medium">Email Address</span>
              <a
                href={`mailto:${lead.email}`}
                className="font-semibold text-[#0047ba] hover:underline flex items-center gap-1 truncate max-w-[240px]"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </a>
            </div>
          )}

          {/* LinkedIn Profile */}
          {lead.linkedin && (
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-slate-500 font-medium">LinkedIn Profile</span>
              <a
                href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>View Profile</span>
              </a>
            </div>
          )}

          {/* Packaging Profile */}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-slate-500 font-medium">Packaging Profile</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {(lead.glassCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold badge-glass">
                  {lead.glassCount} Glass
                </span>
              )}
              {(lead.plasticCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold badge-plastic">
                  {lead.plasticCount} BFS
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                ({lead.totalProducts || 0} total)
              </span>
            </div>
          </div>

          {/* Notes Section (Matching Screenshot) */}
          <div className="pt-2">
            <span className="text-slate-700 font-semibold block mb-1.5">Notes</span>
            {lead.notes ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs whitespace-pre-wrap">
                {lead.notes}
              </div>
            ) : (
              <span className="text-slate-400 italic">—</span>
            )}
          </div>

          {/* Tasks (0) Section (Matching Screenshot with dashed card) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700 font-semibold">Tasks (0)</span>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
              <span className="text-xs font-medium text-slate-400">No tasks yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};
export default LeadDrawer;

