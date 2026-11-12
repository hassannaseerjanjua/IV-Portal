import React from 'react';
import { PackagingFilter, ViewTab } from '../types';

interface KpiCardsProps {
  totalCount: number;
  glassCount: number;
  plasticCount: number;
  companiesCount: number;
  moleculesCount: number;
  activePackaging: PackagingFilter;
  onSelectPackaging: (val: PackagingFilter) => void;
  onSelectTab: (tab: ViewTab) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalCount,
  glassCount,
  plasticCount,
  companiesCount,
  moleculesCount,
  activePackaging,
  onSelectPackaging,
  onSelectTab,
}) => {
  const glassPercent = Math.round((glassCount / totalCount) * 1000) / 10;
  const plasticPercent = Math.round((plasticCount / totalCount) * 1000) / 10;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Products */}
      <div
        onClick={() => {
          onSelectPackaging('all');
          onSelectTab('table');
        }}
        className={`bg-white p-4 sm:p-5 rounded-2xl shadow-xs border transition cursor-pointer hover:shadow-md hover:border-blue-300 ${
          activePackaging === 'all' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Total Products</div>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">IV formulations audited</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-semibold text-lg sm:text-xl">
            📦
          </div>
        </div>
      </div>

      {/* 2. Glass Bottles (Hanger Target) */}
      <div
        onClick={() => {
          onSelectPackaging('glass');
        }}
        className={`bg-white p-4 sm:p-5 rounded-2xl shadow-xs border transition cursor-pointer hover:shadow-md hover:border-emerald-300 ${
          activePackaging === 'glass' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-emerald-200 bg-emerald-50/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <span>Glass Bottles</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-700 mt-1">{glassCount}</div>
            <div className="text-[11px] text-emerald-700 font-normal mt-1">
              {glassPercent}% • Prime Hanger Prospects
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-semibold text-lg sm:text-xl">
            
          </div>
        </div>
      </div>

      {/* 3. Plastic BFS Containers */}
      <div
        onClick={() => {
          onSelectPackaging('plastic');
        }}
        className={`bg-white p-4 sm:p-5 rounded-2xl shadow-xs border transition cursor-pointer hover:shadow-md hover:border-amber-300 ${
          activePackaging === 'plastic' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-amber-200 bg-amber-50/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-800">Plastic BFS Bottles</div>
            <div className="text-2xl sm:text-3xl font-semibold text-amber-700 mt-1">{plasticCount}</div>
            <div className="text-[11px] text-amber-700 font-normal mt-1">
              {plasticPercent}% • Molded Loops / Bags
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-semibold text-lg sm:text-xl">
            
          </div>
        </div>
      </div>

      {/* 4. Active Pharma Companies */}
      <div
        onClick={() => onSelectTab('companies')}
        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 transition cursor-pointer hover:shadow-md hover:border-purple-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Manufacturers</div>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">{companiesCount}</div>
            <div className="text-[11px] text-purple-600 font-normal mt-1">Pakistani pharma companies</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-semibold text-lg sm:text-xl">
            🏭
          </div>
        </div>
      </div>

      {/* 5. Unique Active Molecules */}
      <div
        onClick={() => onSelectTab('products')}
        className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 transition cursor-pointer hover:shadow-md hover:border-indigo-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Product Generics</div>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">{moleculesCount}</div>
            <div className="text-[11px] text-indigo-600 font-normal mt-1">Active IV molecules</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-semibold text-lg sm:text-xl">
            🔬
          </div>
        </div>
      </div>
    </div>
  );
};

