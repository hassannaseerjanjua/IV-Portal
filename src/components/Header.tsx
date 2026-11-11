import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Menu, Calendar, ShieldCheck, Printer, Download } from 'lucide-react';
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

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onOpenMobileMenu,
  onExportClick,
  filteredCount,
  totalCount,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTabLabel = (tab: ViewTab) => {
    switch (tab) {
      case 'products':
        return 'Product-wise Companies';
      case 'niches':
        return 'Niche-wise Markets';
      case 'companies':
        return 'Companies Directory';
      case 'table':
        return 'Master Catalog Table';
      case 'analytics':
        return 'Analytics & Market Overview';
      default:
        return 'Portal Overview';
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      {/* Left: Mobile hamburger & Search bar (Matching reference image) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-xs border border-slate-200"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Reference Image Style Rounded Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by brand, molecule, company, city, DRAP reg..."
            className="w-full pl-5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] text-slate-800 placeholder-slate-400 transition-all"
          />
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
        </div>
      </div>

      {/* Right: Live Date/Time, Notification, Profile Pill & Action Button (Matching reference) */}
      <div className="flex items-center gap-3 sm:gap-4 self-end md:self-center">
        {/* Date Time Badge (matching "Monday, 10 Feb 2020, 02:30 PM") */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3.5 py-2 rounded-2xl shadow-xs border border-slate-200/80">
          <Calendar className="w-3.5 h-3.5 text-[#0047ba]" />
          <span>{currentDateTime || 'Loading date...'}</span>
        </div>

        {/* Notification Bell */}
        <button
          // onClick={() => alert(`Showing ${filteredCount} of ${totalCount} audited IV formulations in Pakistan.`)}
          title="Audit Notifications"
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] absolute top-2.5 right-2.5 ring-2 ring-white"></span>
        </button>

        {/* Reference Image Quick Action Button (Solid Royal Blue Plus Button) */}
        <button
          onClick={onExportClick}
          title="Export CSV Dataset"
          className="w-10 h-10 rounded-2xl bg-[#0047ba] hover:bg-[#003894] active:bg-[#002d75] text-white flex items-center justify-center shadow-md shadow-[#0047ba]/25 transition-all"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
