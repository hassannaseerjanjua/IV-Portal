import React from 'react';
import { RotateCcw, Filter, CheckCircle2 } from 'lucide-react';
import { FilterState, PackagingFilter } from '../types';

interface SearchToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  companiesList: string[];
  moleculesList: string[];
  citiesList: string[];
  categoriesList: string[];
  totalMatches: number;
  totalDatasetSize: number;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  filters,
  onFilterChange,
  onReset,
  companiesList,
  moleculesList,
  citiesList,
  categoriesList,
  totalMatches,
  totalDatasetSize,
}) => {
  const handlePackaging = (pkg: PackagingFilter) => {
    onFilterChange({ ...filters, packaging: pkg });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.packaging !== 'all' ||
    filters.company ||
    filters.molecule ||
    filters.city ||
    filters.size ||
    filters.therapeuticCategory;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3.5">
      {/* Packaging Scope Segment Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0047ba]" />
            <span>Packaging Segment:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePackaging('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filters.packaging === 'all'
                ? 'bg-[#0047ba] text-white shadow-sm shadow-[#0047ba]/25'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Formulations ({totalDatasetSize})
          </button>

          <button
            onClick={() => handlePackaging('glass')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filters.packaging === 'glass'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span className="text-sm">🍾</span>
            <span>Glass Bottles (80)</span>
          </button>

          <button
            onClick={() => handlePackaging('plastic')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filters.packaging === 'plastic'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span className="text-sm">🧴</span>
            <span>Plastic BFS (83)</span>
          </button>
        </div>
      </div>

      {/* Secondary Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Filter by:
        </span>

        {/* Molecule dropdown */}
        <select
          value={filters.molecule}
          onChange={(e) => onFilterChange({ ...filters, molecule: e.target.value })}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 text-slate-700 font-medium max-w-[190px]"
        >
          <option value="">All Molecules ({moleculesList.length})</option>
          {moleculesList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Company dropdown */}
        <select
          value={filters.company}
          onChange={(e) => onFilterChange({ ...filters, company: e.target.value })}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 text-slate-700 font-medium max-w-[210px]"
        >
          <option value="">All Companies ({companiesList.length})</option>
          {companiesList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Category dropdown */}
        <select
          value={filters.therapeuticCategory}
          onChange={(e) => onFilterChange({ ...filters, therapeuticCategory: e.target.value })}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 text-slate-700 font-medium max-w-[180px]"
        >
          <option value="">All Therapeutic Classes</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Pack Size dropdown */}
        <select
          value={filters.size}
          onChange={(e) => onFilterChange({ ...filters, size: e.target.value })}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 text-slate-700 font-medium"
        >
          <option value="">All Pack Sizes</option>
          <option value="100 ml">100 mL (SVP)</option>
          <option value="250 ml">250 mL</option>
          <option value="300 ml">300 mL</option>
          <option value="500 ml">500 mL (LVP)</option>
          <option value="1000 ml">1000 mL (LVP)</option>
        </select>

        {/* City dropdown */}
        <select
          value={filters.city}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 text-slate-700 font-medium"
        >
          <option value="">All Cities</option>
          {citiesList.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-[#0047ba] hover:text-[#003894] font-bold flex items-center gap-1 ml-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
        <div>
          Showing <span className="font-bold text-slate-900">{totalMatches}</span> of{' '}
          <span className="font-bold text-slate-900">{totalDatasetSize}</span> products
          {filters.searchQuery && (
            <span className="ml-1 text-[#0047ba] font-semibold">for &quot;{filters.searchQuery}&quot;</span>
          )}
        </div>
        {hasActiveFilters && (
          <span className="text-[11px] bg-blue-50 text-[#0047ba] px-2.5 py-0.5 rounded-full font-bold border border-blue-200/60">
            Filtered View Active
          </span>
        )}
      </div>
    </div>
  );
};
