import React from 'react';
import { IVProduct, CompanySummary, MoleculeSummary } from '../types';
import { BarChart3, PieChart, TrendingUp, Sparkles, Factory, MapPin, Package, ShieldCheck } from 'lucide-react';

interface AnalyticsViewProps {
  products: IVProduct[];
  companies: CompanySummary[];
  molecules: MoleculeSummary[];
  onSelectCompany: (company: string) => void;
  onSelectMolecule: (molecule: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  products,
  companies,
  molecules,
  onSelectCompany,
  onSelectMolecule,
}) => {
  const total = products.length;
  const glass = products.filter(p => p.is_glass).length;
  const plastic = total - glass;
  const glassPct = Math.round((glass / total) * 1000) / 10;
  const plasticPct = Math.round((plastic / total) * 1000) / 10;

  // Categories
  const catMap: Record<string, { count: number; glass: number; plastic: number }> = {};
  products.forEach(p => {
    let cat = 'Specialty IV';
    const g = p.generic.toLowerCase();
    if (g.includes('paracetamol')) cat = 'Analgesics & Antipyretics';
    else if (g.includes('cipro') || g.includes('metro') || g.includes('moxi') || g.includes('levo') || g.includes('linezolid') || g.includes('fluconazole')) cat = 'Antibiotics & Antimicrobials';
    else if (g.includes('sodium') || g.includes('dextrose') || g.includes('ringer') || g.includes('hartmann') || g.includes('saline') || g.includes('potassium')) cat = 'IV Fluids & Electrolytes';
    else if (g.includes('mannitol') || g.includes('sorbitol')) cat = 'Osmotic Diuretics';

    if (!catMap[cat]) catMap[cat] = { count: 0, glass: 0, plastic: 0 };
    catMap[cat].count++;
    if (p.is_glass) catMap[cat].glass++;
    else catMap[cat].plastic++;
  });

  // Pack sizes
  const sizeMap: Record<string, number> = {};
  products.forEach(p => {
    const s = p.size.toLowerCase();
    let label = 'Other Sizes';
    if (s.includes('100 ml') || s.includes('100ml')) label = '100 mL (SVP Infusions)';
    else if (s.includes('250 ml') || s.includes('300 ml')) label = '250 / 300 mL (Medium SVP)';
    else if (s.includes('500 ml')) label = '500 mL (LVP Fluids)';
    else if (s.includes('1000 ml') || s.includes('1 l')) label = '1000 mL (Bulk LVP)';
    sizeMap[label] = (sizeMap[label] || 0) + 1;
  });

  // Regional hubs
  const cityMap: Record<string, number> = {};
  products.forEach(p => {
    const c = p.city || 'Pakistan';
    let hub = 'Other Pakistan';
    if (c.toLowerCase().includes('karachi')) hub = 'Karachi Hub (Sindh)';
    else if (c.toLowerCase().includes('lahore')) hub = 'Lahore & Punjab Hub';
    else if (c.toLowerCase().includes('nowshera') || c.toLowerCase().includes('haripur') || c.toLowerCase().includes('dera ismail') || c.toLowerCase().includes('kpk')) hub = 'Khyber Pakhtunkhwa (KPK)';
    else if (c.toLowerCase().includes('islamabad')) hub = 'Islamabad Capital Hub';
    cityMap[hub] = (cityMap[hub] || 0) + 1;
  });

  // Top 10 manufacturers
  const top10Companies = [...companies]
    .sort((a, b) => b.totalProducts - a.totalProducts)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Executive Summary Banner (Solid, no gradient) */}
      <div className="bg-tile-1 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Market Intelligence Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Pakistani IV Infusion &amp; Packaging Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Audit of 163 DRAP-registered IV formulations across 65 active pharmaceutical manufacturing plants in Pakistan.
            Nearly half of the audited market ({glassPct}%) uses Type II Glass Infusion bottles requiring external hanger labels.
          </p>
        </div>
      </div>

      {/* Grid: Packaging Technology & Therapeutic Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Glass vs Plastic BFS Ratio */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>Container Technology Ratio</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Glass Infusion Bottles vs. Blow-Fill-Seal Plastic</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-semibold border border-slate-200">
              {total} Formulations
            </span>
          </div>

          {/* Visual Dual Progress Bar */}
          <div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${glassPct}%` }}
                className="bg-emerald-600 h-full"
                title={`Glass: ${glass} (${glassPct}%)`}
              />
              <div
                style={{ width: `${plasticPct}%` }}
                className="bg-amber-600 h-full"
                title={`Plastic: ${plastic} (${plasticPct}%)`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-4 pt-3 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{glass} ({glassPct}%)</div>
                    <div className="text-xs font-semibold text-emerald-800">Type II Glass Bottles</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Prime prospects for self-adhesive hanger labels &amp; suspension loops.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{plastic} ({plasticPct}%)</div>
                    <div className="text-xs font-semibold text-amber-800">Plastic BFS Bottles</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Polyethylene (LDPE/PP) containers with molded hanger loops.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Therapeutic Class Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Therapeutic Class Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across clinical indications</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(catMap).map(([category, stats]) => {
              const pct = Math.round((stats.count / total) * 100);

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-normal">
                    <span className="text-slate-800 font-semibold">{category}</span>
                    <span className="text-slate-500 font-mono">
                      {stats.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(stats.glass / total) * 100}%` }}
                      className="bg-emerald-600 h-full"
                      title={`${stats.glass} in Glass`}
                    />
                    <div
                      style={{ width: `${(stats.plastic / total) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title={`${stats.plastic} in Plastic BFS`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-emerald-800 font-normal">{stats.glass} in Glass</span>
                    <span className="text-amber-800 font-normal">{stats.plastic} in Plastic BFS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Pack Volumes & Regional Production Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 3: Pack Size Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Pack Volume Segmentation</span>
            </h3>
            <span className="text-xs text-slate-400 font-normal">SVP vs. LVP</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(sizeMap)
              .sort((a, b) => b[1] - a[1])
              .map(([sizeLabel, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={sizeLabel} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{sizeLabel}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{pct}% of Pakistani IV portfolio</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-slate-900">{count}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Formulations</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Card 4: Regional Manufacturing Clusters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Regional Manufacturing Hubs</span>
            </h3>
            <span className="text-xs text-slate-400 font-normal">Clusters</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(cityMap)
              .sort((a, b) => b[1] - a[1])
              .map(([hub, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={hub} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{hub}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{pct}% of manufacturing activity</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-slate-900">{count}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Products</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Top 10 Manufacturers Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Factory className="w-4 h-4 text-blue-600" />
              <span>Top 10 IV Manufacturers by Audited Product Range</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Companies with largest parenteral portfolios in Pakistan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Manufacturer</th>
                <th className="py-2.5 px-3">City / Hub</th>
                <th className="py-2.5 px-3 text-center">Total Products</th>
                <th className="py-2.5 px-3 text-center">Glass (Hanger Target)</th>
                <th className="py-2.5 px-3 text-center">Plastic BFS</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {top10Companies.map((c, i) => (
                <tr key={c.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-400">#{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{c.city}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-blue-700">{c.totalProducts}</td>
                  <td className="py-2.5 px-3 text-center">
                    {c.glassCount > 0 ? (
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {c.glassCount} Glass
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {c.plasticCount > 0 ? (
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {c.plasticCount} BFS
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectCompany(c.name)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Filter Table →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
