import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, Download } from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: ViewTab;
  onOpenMobileMenu: () => void;
  onExportClick: () => void;
  filteredCount: number;
  totalCount: number;
}

const TAB_LABELS: Partial<Record<ViewTab, string>> = {
  products: 'Product-wise Companies',
  niches: 'Niche-wise Markets',
  companies: 'Companies Directory',
  table: 'Master Catalog',
  leads: 'Leads & Outreach',
  calendar: 'Task Calendar & Schedule',
  analytics: 'Market Overview',
};

const formatNow = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onOpenMobileMenu,
  onExportClick,
}) => {
  const [now, setNow] = useState(formatNow);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(formatNow()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll edge: show the hairline only when content actually passes under the bar
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
    <div ref={sentinelRef} aria-hidden="true" className="h-px -mb-px" />
    <header
      className={`sticky top-0 z-nav frosted border-b transition-colors duration-base ${
        scrolled ? 'border-black/[0.08]' : 'border-transparent'
      }`}
    >
      <div className="h-[52px] px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden -ml-1.5 size-9 rounded-full flex items-center justify-center text-ink hover:bg-black/5"
        >
          <Menu className="size-5" />
        </button>

        <h1
          key={activeTab}
          className="text-[17px] sm:text-[21px] font-semibold text-ink tracking-apple truncate shrink-0 motion-fade"
        >
          {TAB_LABELS[activeTab] ?? 'Portal Overview'}
        </h1>

        <div className="flex-1" />

        {/* Global search */}
        <label className="relative hidden md:block w-full max-w-sm">
          <span className="sr-only">Search products</span>
          <Search className="size-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search brand, molecule, company, DRAP reg."
            className="w-full h-9 pl-9 pr-4 text-[14px] tracking-caption bg-white border border-black/[0.08] rounded-full text-ink focus:outline-none focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/15"
          />
        </label>

        <span className="hidden xl:block text-[12px] text-slate-500 whitespace-nowrap tabular">{now}</span>

        <button
          title="Audit notifications"
          aria-label="Audit notifications"
          className="relative size-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-black/5 hover:text-ink shrink-0"
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>

        <button
          onClick={onExportClick}
          title="Export CSV dataset"
          className="h-9 px-4 rounded-full bg-primary hover:bg-primary-hover text-white text-[14px] tracking-caption inline-flex items-center gap-1.5 shrink-0"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Mobile search row */}
      <div className="md:hidden px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="size-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search brand, molecule, company…"
            className="w-full h-10 pl-9 pr-4 text-[15px] bg-white border border-black/[0.08] rounded-full text-ink focus:outline-none focus:border-primary-focus focus:ring-4 focus:ring-primary-focus/15"
          />
        </label>
      </div>
    </header>
    </>
  );
};
