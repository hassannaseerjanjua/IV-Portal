import React, { useState } from 'react';
import { IVProduct, MoleculeSummary } from '../types';
import { ChevronDown, ChevronUp, ExternalLink, Image, Building2 } from 'lucide-react';

interface ProductWiseViewProps {
  molecules: MoleculeSummary[];
  onSelectProduct: (product: IVProduct) => void;
  onFilterByCompany: (company: string) => void;
}

export const ProductWiseView: React.FC<ProductWiseViewProps> = ({
  molecules,
  onSelectProduct,
  onFilterByCompany,
}) => {
  const [expandedMolecules, setExpandedMolecules] = useState<Record<string, boolean>>({
    'Paracetamol': true,
    'Metronidazole': true,
    'Ciprofloxacin': true
  });
  const [moleculeSearch, setMoleculeSearch] = useState('');

  const toggleExpand = (molName: string) => {
    setExpandedMolecules(prev => ({ ...prev, [molName]: !prev[molName] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    molecules.forEach(m => { next[m.molecule] = true; });
    setExpandedMolecules(next);
  };

  const collapseAll = () => {
    setExpandedMolecules({});
  };

  const filteredMolecules = molecules.filter(m => {
    if (!moleculeSearch) return true;
    const q = moleculeSearch.toLowerCase();
    return (
      m.molecule.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.companies.some(c => c.toLowerCase().includes(q)) ||
      m.products.some(p => p.brand.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Molecule Search & Control bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={moleculeSearch}
            onChange={(e) => setMoleculeSearch(e.target.value)}
            placeholder="Search molecule (e.g. Paracetamol, Cipro, Saline)..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">
            {filteredMolecules.length} Molecules Found
          </span>
          <span className="text-slate-300">•</span>
          <button
            onClick={expandAll}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={collapseAll}
            className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* List of Product / Molecule Cards */}
      <div className="space-y-3">
        {filteredMolecules.map((m) => {
          const isExpanded = !!expandedMolecules[m.molecule];

          return (
            <div
              key={m.molecule}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(m.molecule)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-gradient-to-r from-white to-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    💊
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {m.molecule}
                      </h3>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {m.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-blue-700">{m.companiesCount} Manufacturing Companies</span>
                      <span className="text-slate-300">•</span>
                      <span>{m.totalProducts} Total Formulations</span>
                      {m.commonSizes.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>Sizes: {m.commonSizes.slice(0, 3).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs">
                    {m.glassCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-glass">
                        🍾 {m.glassCount} Glass
                      </span>
                    )}
                    {m.plasticCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-plastic">
                        🧴 {m.plasticCount} Plastic BFS
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Company Breakdown Table */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Companies Manufacturing {m.molecule}:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {m.products.map((p) => {
                      const imgSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.brand + ' ' + p.company + ' infusion Pakistan')}`;

                      return (
                        <div
                          key={p.sno}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <button
                                  onClick={() => onFilterByCompany(p.company)}
                                  className="text-xs font-bold text-slate-900 hover:text-blue-600 text-left transition-colors"
                                >
                                  {p.company}
                                </button>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {p.city || 'Pakistan'}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  p.is_glass ? 'badge-glass' : 'badge-plastic'
                                }`}
                              >
                                {p.is_glass ? '🍾 Glass' : '🧴 Plastic BFS'}
                              </span>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-blue-700">
                                  {p.brand}
                                </span>
                                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {p.size}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {p.pack_type}
                              </div>
                              {p.drap_reg && p.drap_reg !== '—' && (
                                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                  DRAP: {p.drap_reg}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => onSelectProduct(p)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                            >
                              Inspect Details →
                            </button>

                            <div className="flex items-center gap-1.5">
                              <a
                                href={imgSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Search packaging images on Google"
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Image className="w-3.5 h-3.5" />
                              </a>
                              {p.source_link && p.source_link.startsWith('http') && (
                                <a
                                  href={p.source_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="DRAP Registry Source"
                                  className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

