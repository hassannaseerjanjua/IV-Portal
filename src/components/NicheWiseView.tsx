import React, { useState } from 'react';
import { IVProduct, NicheGroup } from '../types';
import { Sparkles, Wine, Droplet, Pill, Syringe, Waves, TestTube, Package, Factory, Landmark, Mountain, Layers } from 'lucide-react';

const NICHE_ICONS: Record<string, React.ElementType> = {
  'glass-hanger': Wine,
  'plastic-bfs': Droplet,
  antibiotics: Pill,
  analgesics: Syringe,
  'lvp-fluids': Waves,
  'svp-100ml': TestTube,
  'lvp-500ml': Package,
  'hub-karachi': Factory,
  'hub-lahore': Landmark,
  'hub-kpk': Mountain,
};

const NicheIcon: React.FC<{ id: string; className?: string }> = ({ id, className }) => {
  const Icon = NICHE_ICONS[id] ?? Layers;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
};

interface NicheWiseViewProps {
  niches: NicheGroup[];
  onSelectNiche: (niche: NicheGroup) => void;
  onSelectProduct: (product: IVProduct) => void;
}

export const NicheWiseView: React.FC<NicheWiseViewProps> = ({
  niches,
  onSelectNiche,
  onSelectProduct,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Niches' },
    { id: 'packaging', label: 'Packaging Niches (Glass vs BFS)' },
    { id: 'therapeutic', label: 'Therapeutic Niches' },
    { id: 'volume', label: 'Volume / Pack Size Niches' },
    { id: 'region', label: 'Regional Manufacturing Hubs' }
  ];

  const filteredNiches = niches.filter(n => {
    if (activeCategoryFilter === 'all') return true;
    return n.category === activeCategoryFilter;
  });

  const activeSelectedNiche = selectedNicheId
    ? niches.find(n => n.id === selectedNicheId)
    : null;

  return (
    <div className="space-y-5">
      {/* Niche Category selector pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCategoryFilter(c.id);
              setSelectedNicheId(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeCategoryFilter === c.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Niches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNiches.map((niche) => {
          const isSelected = selectedNicheId === niche.id;

          return (
            <div
              key={niche.id}
              onClick={() => setSelectedNicheId(isSelected ? null : niche.id)}
              className={`bg-white rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between hover:shadow-md ${isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-blue-300'
                }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="size-11 rounded-xl bg-slate-100 text-ink flex items-center justify-center"><NicheIcon id={niche.id} className="size-5" /></div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {niche.badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mt-3.5">
                  {niche.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {niche.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-center py-1 bg-slate-50 rounded-xl mb-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{niche.productCount}</div>
                    <div className="text-[10px] text-slate-400 font-normal uppercase">Products</div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-blue-700">{niche.companyCount}</div>
                    <div className="text-[10px] text-slate-400 font-normal uppercase">Companies</div>
                  </div>
                </div>

                {/* <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-blue-600' : 'text-slate-600'}>
                    {isSelected ? 'Viewing Products Below ↓' : 'Click to Inspect Products'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Niche Product Explorer */}
      {activeSelectedNiche && (
        <div key={activeSelectedNiche.id} className="motion-rise bg-white rounded-2xl p-5 border-2 border-blue-500/30 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <NicheIcon id={activeSelectedNiche.id} className="size-5 text-ink" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeSelectedNiche.title}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {activeSelectedNiche.productCount} Formulations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manufactured across {activeSelectedNiche.companyCount} Pakistani pharmaceutical companies
              </p>
            </div>

            <button
              onClick={() => onSelectNiche(activeSelectedNiche)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Filter Entire Portal by this Niche</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeSelectedNiche.products.slice(0, 15).map((p) => (
              <div
                key={p.sno}
                onClick={() => onSelectProduct(p)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-900">{p.company}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.is_glass ? 'badge-glass' : 'badge-plastic'}`}>
                      {p.is_glass ? 'Glass' : 'BFS'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-blue-700 mt-1">{p.brand}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{p.generic}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-normal">
                  <span>Size: {p.size}</span>
                  <span className="text-blue-600 font-semibold">Inspect Spec →</span>
                </div>
              </div>
            ))}
          </div>

          {activeSelectedNiche.products.length > 15 && (
            <div className="text-center pt-2">
              <button
                onClick={() => onSelectNiche(activeSelectedNiche)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                View all {activeSelectedNiche.products.length} products in Catalog Table →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

