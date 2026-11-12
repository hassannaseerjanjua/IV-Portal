import React, { useState, useEffect } from 'react';
import { CompanySummary } from '../types';
import { Building2, MapPin, Search, UserCircle2, Download, Phone, Linkedin } from 'lucide-react';
import { getAllCompanyContacts, exportCompanyContactsAsCSV } from '../utils/crmStorage';
import type { CompanyContact } from '../types';

interface CompanyDirectoryViewProps {
  companies: CompanySummary[];
  onSelectCompany: (company: CompanySummary) => void;
  onFilterByCompany: (companyName: string) => void;
}

export const CompanyDirectoryView: React.FC<CompanyDirectoryViewProps> = ({
  companies,
  onSelectCompany,
  onFilterByCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState<'all' | 'glass' | 'plastic' | 'contacted'>('all');
  const [contacts, setContacts] = useState<Record<string, CompanyContact>>({});

  /* Reload contacts from localStorage whenever the view mounts or becomes visible */
  useEffect(() => {
    setContacts(getAllCompanyContacts());
  }, []);

  const cities = Array.from(new Set(companies.map(c => c.city).filter(Boolean))).sort();
  const savedCount = Object.keys(contacts).length;

  const filteredCompanies = companies.filter(c => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName  = c.name.toLowerCase().includes(q);
      const matchCity  = c.city.toLowerCase().includes(q);
      const matchBrand = c.brands.some(b => b.toLowerCase().includes(q));
      const matchMol   = c.molecules.some(m => m.toLowerCase().includes(q));
      const contact    = contacts[c.name];
      const matchContact = contact
        ? contact.personName.toLowerCase().includes(q) || contact.title.toLowerCase().includes(q)
        : false;
      if (!matchName && !matchCity && !matchBrand && !matchMol && !matchContact) return false;
    }
    if (cityFilter && !c.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (targetFilter === 'glass'     && c.glassCount   === 0) return false;
    if (targetFilter === 'plastic'   && c.plasticCount === 0) return false;
    if (targetFilter === 'contacted' && !contacts[c.name])    return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Bar ── */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search manufacturer, city, brand or molecule..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700"
          >
            <option value="">All Cities ({cities.length})</option>
            {cities.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>

          {(['all', 'glass', 'plastic', 'contacted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTargetFilter(f)}
              className={`px-3 py-2 rounded-xl font-semibold transition ${
                targetFilter === f
                  ? f === 'glass'     ? 'bg-emerald-700 text-white'
                  : f === 'plastic'   ? 'bg-amber-700 text-white'
                  : f === 'contacted' ? 'bg-primary text-white'
                  :                     'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'all'       && `All (${companies.length})`}
              {f === 'glass'     && 'Glass Users'}
              {f === 'plastic'   && 'BFS Plastic'}
              {f === 'contacted' && (
                <span className="flex items-center gap-1">
                  <UserCircle2 className="w-3.5 h-3.5" />
                  Contact Saved ({savedCount})
                </span>
              )}
            </button>
          ))}

          {/* Export contacts CSV */}
          {savedCount > 0 && (
            <button
              onClick={() => exportCompanyContactsAsCSV()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
              title={`Export ${savedCount} saved management contacts as CSV`}
            >
              <Download className="w-3.5 h-3.5" />
              Export Contacts ({savedCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Result count ── */}
      <div className="text-xs text-slate-500 font-normal px-1">
        Showing <strong className="text-slate-700">{filteredCompanies.length}</strong> of {companies.length} manufacturers
        {savedCount > 0 && (
          <span className="ml-2 text-primary font-semibold">
            • {savedCount} with management contact saved
          </span>
        )}
      </div>

      {/* ── Companies Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((c) => {
          const glassPct = Math.round((c.glassCount / c.totalProducts) * 100);
          const contact  = contacts[c.name] ?? null;

          return (
            <div
              key={c.name}
              className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                contact ? 'border-primary/30 ring-1 ring-primary/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-semibold shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">{c.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{c.city || 'Pakistan'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.glassCount > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-glass">Prime Target</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-plastic">BFS Line</span>
                    )}
                  </div>
                </div>

                {/* Packaging progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-normal">
                    <span className="text-slate-500">Portfolio Packaging:</span>
                    <span className="text-slate-800 font-semibold">{c.totalProducts} Formulations</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    {c.glassCount > 0 && (
                      <div style={{ width: `${glassPct}%` }} className="bg-emerald-500 h-full" title={`${c.glassCount} Glass`} />
                    )}
                    {c.plasticCount > 0 && (
                      <div style={{ width: `${100 - glassPct}%` }} className="bg-amber-400 h-full" title={`${c.plasticCount} Plastic BFS`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span className="text-emerald-700 font-semibold">{c.glassCount} Glass</span>
                    <span className="text-amber-700 font-semibold">{c.plasticCount} BFS Plastic</span>
                  </div>
                </div>

                {/* Key molecules */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="text-[11px] font-normal text-slate-500">Key Products / Molecules:</div>
                  <div className="flex flex-wrap gap-1">
                    {c.molecules.slice(0, 4).map(m => (
                      <span key={m} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{m}</span>
                    ))}
                    {c.molecules.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-normal px-1 py-0.5">+{c.molecules.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* ── Management Contact Preview ── */}
                {contact ? (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                      {/* Avatar initial */}
                      <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {contact.personName.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 truncate">{contact.personName}</div>
                        {contact.title && (
                          <div className="text-[10px] text-primary font-semibold truncate">{contact.title}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} title={contact.phone}
                            className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                            target="_blank" rel="noreferrer" title="LinkedIn Profile"
                            className="p-1 rounded-lg text-slate-400 hover:text-[#0a66c2] hover:bg-white transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <UserCircle2 className="w-4 h-4 text-slate-200" />
                      <span>No management contact — open profile to add</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setContacts(getAllCompanyContacts()); // refresh before opening modal
                    onSelectCompany(c);
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  View Company Profile →
                </button>
                <button
                  onClick={() => onFilterByCompany(c.name)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Filter Products ({c.totalProducts})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
