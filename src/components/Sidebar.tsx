import React from 'react';
import { ViewTab } from '../types';
import {
  LayoutDashboard,
  FlaskConical,
  Target,
  Building2,
  TableProperties,
  BarChart3,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { exportToCSV } from '../utils/searchEngine';
import { IVProduct } from '../types';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  productsCount: number;
  companiesCount: number;
  nichesCount: number;
  moleculesCount: number;
  leadsCount?: number;
  filteredProducts: IVProduct[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  productsCount,
  companiesCount,
  nichesCount,
  moleculesCount,
  leadsCount,
  filteredProducts,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Pure single-level navigation items (NO submenus, exactly like reference image)
  const navItems = [
    {
      id: 'products' as ViewTab,
      label: 'Products',
      icon: FlaskConical,
      count: moleculesCount,
    },
    {
      id: 'niches' as ViewTab,
      label: 'Niche Markets',
      icon: Target,
      count: nichesCount,
    },
    {
      id: 'companies' as ViewTab,
      label: 'Companies Directory',
      icon: Building2,
      count: companiesCount,
    },
    {
      id: 'table' as ViewTab,
      label: 'Master Table',
      icon: TableProperties,
      count: productsCount,
    },
    {
      id: 'leads' as ViewTab,
      label: 'Leads & CRM',
      icon: UserCheck,
      count: leadsCount ?? null,
    },
    {
      id: 'analytics' as ViewTab,
      label: 'Analytics & Insights',
      icon: BarChart3,
      count: null,
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar - Pure White Theme matching reference */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'}`}
      >
        {/* Top: Logo & Portal Branding */}
        <div>
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* JS Bank style geometric logo icon */}
              {!isCollapsed && (
                <>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-2.5 h-7 bg-[#f59e0b] rounded-xs skew-x-[-18deg]" />
                    <span className="w-2.5 h-7 bg-[#0047ba] rounded-xs skew-x-[-18deg]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-base tracking-tight truncate">
                        IV PORTAL
                      </span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold truncate">
                      DRAP Audit &amp; Packaging
                    </p>
                  </div></>
              )}
            </div>

            {/* Mobile close */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Clean Navigation Links - Exactly matching the reference image pill design */}
          <div className="px-3.5 py-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all relative ${isActive
                    ? 'bg-[#0047ba] text-white font-bold shadow-md shadow-[#0047ba]/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="text-xs truncate">{item.label}</span>
                    </div>
                  )}

                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section with Export Actions and Geometric Brand Decal */}
        <div style={{ height: '-webkit-fill-available' }} className="relative overflow-hidden pt-4 pb-3 px-3.5 border-t border-slate-100 bg-white">

          {/* Reference Image Signature: Bottom-left amber/orange decorative geometric stripes */}
          <div className="absolute -bottom-6 -left-6 pointer-events-none opacity-90">
            <div className="flex items-end gap-1.5 transform rotate-45">
              <div className="w-4 h-16 bg-[#f59e0b] rounded-full" />
              <div className="w-4 h-24 bg-[#ea580c] rounded-full" />
              <div className="w-4 h-32 bg-[#f97316] rounded-full" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
