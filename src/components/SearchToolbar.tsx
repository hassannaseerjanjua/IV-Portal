import React, { useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
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

const selectClass =
  'h-9 pl-3.5 text-[13px] tracking-caption bg-slate-100 hover:bg-slate-200/70 border border-transparent rounded-full text-ink focus:outline-none focus:bg-white focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/15 max-w-full sm:max-w-[220px] truncate cursor-pointer';

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

  // Measure the selected segment once per change, then move the thumb with transform
  const trackRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const el = segRefs.current[filters.packaging];
      if (!el) return;
      setThumb((prev) => ({ x: el.offsetLeft, w: el.offsetWidth, ready: prev.w > 0 }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [filters.packaging]);

  const hasActiveFilters =
    filters.searchQuery ||
    filters.packaging !== 'all' ||
    filters.company ||
    filters.molecule ||
    filters.city ||
    filters.size ||
    filters.therapeuticCategory;

  const segments: { id: PackagingFilter; label: string; dot?: string }[] = [
    { id: 'all', label: `All formulations (${totalDatasetSize})` },
    { id: 'glass', label: 'Glass bottles (80)', dot: 'bg-[#1f9d55]' },
    { id: 'plastic', label: 'Plastic BFS (83)', dot: 'bg-[#c77c0e]' },
  ];

  return (
    <section aria-label="Filters" className="toolbar bg-white rounded-2xl border border-black/[0.06] p-4 sm:p-5 space-y-4">
      {/* Packaging segmented control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="text-[14px] font-semibold text-ink tracking-caption">Packaging segment</div>

        <div
          ref={trackRef}
          role="radiogroup"
          aria-label="Packaging segment"
          className="relative inline-flex p-1 bg-slate-100 rounded-full overflow-x-auto no-scrollbar max-w-full"
        >
          {/* Sliding thumb — glides to the selected segment */}
          <span
            aria-hidden="true"
            data-motion="slide"
            className={`absolute top-1 bottom-1 left-0 rounded-full bg-white ring-1 ring-black/[0.06] pointer-events-none ${
              thumb.ready ? 'transition-[transform,width] duration-base ease-in-out' : ''
            }`}
            style={{ width: thumb.w, transform: `translateX(${thumb.x}px)`, opacity: thumb.w ? 1 : 0 }}
          />
          {segments.map((s) => {
            const active = filters.packaging === s.id;
            return (
              <button
                key={s.id}
                ref={(el) => (segRefs.current[s.id] = el)}
                role="radio"
                aria-checked={active}
                onClick={() => handlePackaging(s.id)}
                className={`relative h-8 px-4 rounded-full text-[13px] tracking-caption whitespace-nowrap inline-flex items-center gap-2 ${
                  active ? 'text-ink font-semibold' : 'text-slate-600 hover:text-ink'
                }`}
              >
                {s.dot && <span className={`size-1.5 rounded-full ${s.dot}`} />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-black/[0.06]">
        <span className="text-[13px] text-slate-500 mr-1 shrink-0">Filter by</span>

        <select
          aria-label="Molecule"
          value={filters.molecule}
          onChange={(e) => onFilterChange({ ...filters, molecule: e.target.value })}
          className={selectClass}
        >
          <option value="">All molecules ({moleculesList.length})</option>
          {moleculesList.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          aria-label="Company"
          value={filters.company}
          onChange={(e) => onFilterChange({ ...filters, company: e.target.value })}
          className={selectClass}
        >
          <option value="">All companies ({companiesList.length})</option>
          {companiesList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          aria-label="Therapeutic class"
          value={filters.therapeuticCategory}
          onChange={(e) => onFilterChange({ ...filters, therapeuticCategory: e.target.value })}
          className={selectClass}
        >
          <option value="">All therapeutic classes</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          aria-label="Pack size"
          value={filters.size}
          onChange={(e) => onFilterChange({ ...filters, size: e.target.value })}
          className={selectClass}
        >
          <option value="">All pack sizes</option>
          <option value="100 ml">100 mL (SVP)</option>
          <option value="250 ml">250 mL</option>
          <option value="300 ml">300 mL</option>
          <option value="500 ml">500 mL (LVP)</option>
          <option value="1000 ml">1000 mL (LVP)</option>
        </select>

        <select
          aria-label="City"
          value={filters.city}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
          className={selectClass}
        >
          <option value="">All cities</option>
          {citiesList.map((ct) => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="motion-fade ml-auto h-9 px-3 rounded-full text-[13px] text-primary hover:bg-blue-50 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between gap-3 text-[13px] text-slate-500">
        <p className="tabular">
          Showing <span className="font-semibold text-ink">{totalMatches}</span> of{' '}
          <span className="font-semibold text-ink">{totalDatasetSize}</span> products
          {filters.searchQuery && (
            <span className="text-ink"> for “{filters.searchQuery}”</span>
          )}
        </p>
        {hasActiveFilters && (
          <span className="motion-fade text-[12px] text-primary bg-blue-50 px-2.5 py-0.5 rounded-full">Filtered</span>
        )}
      </div>
    </section>
  );
};
