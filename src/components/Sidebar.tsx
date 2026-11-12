import React from 'react';
import { ViewTab, IVProduct } from '../types';
import {
  FlaskConical,
  Target,
  Building2,
  TableProperties,
  BarChart3,
  UserCheck,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

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

const NAV_ITEMS: { id: ViewTab; label: string; icon: React.ElementType }[] = [
  { id: 'products', label: 'Products', icon: FlaskConical },
  { id: 'niches', label: 'Niche Markets', icon: Target },
  { id: 'companies', label: 'Companies Directory', icon: Building2 },
  { id: 'table', label: 'Master Table', icon: TableProperties },
  { id: 'leads', label: 'Leads & CRM', icon: UserCheck },
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
];

// h-10 row (40px) + space-y-0.5 gap (2px)
const ROW_STEP = 42;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeTab);

  // Close the mobile drawer with Escape
  React.useEffect(() => {
    if (!isOpenMobile) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseMobile();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpenMobile, onCloseMobile]);

  return (
    <>
      {/* Mobile scrim — always mounted so it can fade both ways */}
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={`fixed inset-0 z-overlay bg-black/30 lg:hidden transition-opacity duration-slow ease-out ${
          isOpenMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        aria-label="Primary navigation"
        data-motion="slide"
        className={`fixed inset-y-0 left-0 z-drawer flex flex-col bg-white lg:frosted-white border-r border-black/[0.06] transition-[transform,width] duration-slow ease-drawer ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-72 lg:w-[72px]' : 'w-72 lg:w-64'}`}
      >
        {/* Brand */}
        <div
          className={`h-[52px] shrink-0 flex items-center border-b border-black/[0.06] overflow-hidden ${
            isCollapsed ? 'lg:justify-center px-4 lg:px-0' : 'px-4 justify-between'
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0 motion-fade-late">
              <div className="size-7 rounded-md bg-ink text-white flex items-center justify-center shrink-0">
                <FlaskConical className="size-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 leading-none">
                <div className="text-[15px] font-semibold text-ink truncate tracking-apple">IV Portal</div>
                <div className="text-[11px] text-slate-500 truncate mt-1">DRAP Audit &amp; Packaging</div>
              </div>
            </div>
          )}

          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="lg:hidden size-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-4" />
          </button>

          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex size-8 rounded-full items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-ink shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden lg:overflow-visible px-3 py-4">
          <div
            className={`px-3 pb-2 text-[12px] font-semibold text-slate-400 whitespace-nowrap ${
              isCollapsed ? 'lg:invisible' : 'motion-fade-late'
            }`}
          >
            Workspace
          </div>

          <ul className="relative space-y-0.5">
            {/* Sliding selection — moves between rows instead of jumping */}
            {activeIndex >= 0 && (
              <li
                aria-hidden="true"
                data-motion="slide"
                className="absolute inset-x-0 top-0 h-10 rounded-lg bg-slate-100 transition-transform duration-base ease-in-out pointer-events-none"
                style={{ transform: `translateY(${activeIndex * ROW_STEP}px)` }}
              />
            )}

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id} className="relative">
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      if (isOpenMobile) onCloseMobile();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative w-full h-10 flex items-center gap-3 rounded-lg text-left text-[14px] tracking-caption ${
                      isCollapsed ? 'lg:justify-center px-3 lg:px-0' : 'px-3'
                    } ${
                      isActive
                        ? 'text-ink font-semibold'
                        : 'text-slate-600 hover:bg-slate-100/60 hover:text-ink'
                    }`}
                  >
                    <Icon
                      className={`size-[18px] shrink-0 transition-colors duration-base ${
                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                      strokeWidth={1.75}
                    />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'motion-fade-late'}`}>{item.label}</span>

                    {isCollapsed && (
                      <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 rounded-md bg-ink text-white text-[12px] font-normal whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-fast ease-out pointer-events-none z-modal">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer note */}
        {!isCollapsed && (
          <div className="shrink-0 px-6 py-4 border-t border-black/[0.06] text-[11px] leading-snug text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis motion-fade-late">
            Pakistani IV Infusion &amp; Packaging Intelligence
          </div>
        )}
      </aside>
    </>
  );
};
