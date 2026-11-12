import React, { useState, useMemo } from 'react';
import { PRODUCTS } from './data/products';
import { FilterState, IVProduct, CompanySummary, NicheGroup, ViewTab, PackagingFilter } from './types';
import {
  getMoleculeSummaries,
  getCompanySummaries,
  getNicheGroups,
  getMoleculeGroup,
  getTherapeuticCategory,
} from './utils/portalHelpers';
import { searchAndFilterProducts, exportToCSV } from './utils/searchEngine';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { SearchToolbar } from './components/SearchToolbar';
import { ProductWiseView } from './components/ProductWiseView';
import { NicheWiseView } from './components/NicheWiseView';
import { CompanyDirectoryView } from './components/CompanyDirectoryView';
import { TableView } from './components/TableView';
import { AnalyticsView } from './components/AnalyticsView';
import { LeadsView } from './components/LeadsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { getStoredCompanyLeads, subscribeToCompanyLeadUpdates } from './utils/crmStorage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('products');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    packaging: 'all',
    company: '',
    molecule: '',
    city: '',
    size: '',
    therapeuticCategory: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<IVProduct | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);

  // Live tracked company leads count
  const [leadsCount, setLeadsCount] = useState<number>(() => {
    return Object.keys(getStoredCompanyLeads()).length;
  });

  React.useEffect(() => {
    const updateCount = () => {
      setLeadsCount(Object.keys(getStoredCompanyLeads()).length);
    };
    const unsubscribe = subscribeToCompanyLeadUpdates(updateCount);
    return unsubscribe;
  }, []);

  // Lists for dropdown options
  const companiesList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.company.trim()))).sort();
  }, []);

  const moleculesList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => getMoleculeGroup(p.generic)))).sort();
  }, []);

  const citiesList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.city.trim()).filter(Boolean))).sort();
  }, []);

  const categoriesList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => getTherapeuticCategory(p.generic)))).sort();
  }, []);

  // Filtered products based on active filters
  const filteredProducts = useMemo(() => {
    return searchAndFilterProducts(PRODUCTS, filters);
  }, [filters]);

  // Derived datasets
  const allMolecules = useMemo(() => {
    return getMoleculeSummaries(filteredProducts);
  }, [filteredProducts]);

  const allCompanies = useMemo(() => {
    return getCompanySummaries(PRODUCTS);
  }, []);

  const allNiches = useMemo(() => {
    return getNicheGroups(PRODUCTS);
  }, []);

  // Counts
  const totalProducts = PRODUCTS.length;
  const glassProductsCount = useMemo(() => PRODUCTS.filter((p) => p.is_glass).length, []);
  const plasticProductsCount = totalProducts - glassProductsCount;
  const totalCompaniesCount = companiesList.length;
  const totalMoleculesCount = moleculesList.length;

  // Handlers
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      packaging: 'all',
      company: '',
      molecule: '',
      city: '',
      size: '',
      therapeuticCategory: '',
    });
  };

  const handlePackagingSelect = (pkg: PackagingFilter) => {
    setFilters((prev) => ({ ...prev, packaging: pkg }));
  };

  const handleFilterByCompany = (companyName: string) => {
    setFilters((prev) => ({ ...prev, company: companyName }));
    setActiveTab('table');
  };

  const handleQuickMoleculeSelect = (molName: string) => {
    setFilters((prev) => ({ ...prev, molecule: molName }));
    setActiveTab('products');
  };

  const handleSelectNiche = (niche: NicheGroup) => {
    if (niche.category === 'packaging') {
      if (niche.id === 'glass-hanger') {
        setFilters((prev) => ({ ...prev, packaging: 'glass', company: '', molecule: '' }));
      } else {
        setFilters((prev) => ({ ...prev, packaging: 'plastic', company: '', molecule: '' }));
      }
    } else if (niche.category === 'therapeutic') {
      if (niche.id === 'analgesics') {
        setFilters((prev) => ({ ...prev, molecule: 'Paracetamol', therapeuticCategory: 'Analgesics & Antipyretics' }));
      } else if (niche.id === 'antibiotics') {
        setFilters((prev) => ({ ...prev, therapeuticCategory: 'Antibiotics & Antimicrobials', molecule: '' }));
      } else if (niche.id === 'lvp-fluids') {
        setFilters((prev) => ({ ...prev, therapeuticCategory: 'IV Fluids & Electrolytes', molecule: '' }));
      }
    } else if (niche.category === 'volume') {
      if (niche.id === 'svp-100ml') {
        setFilters((prev) => ({ ...prev, size: '100 ml' }));
      } else if (niche.id === 'lvp-500ml') {
        setFilters((prev) => ({ ...prev, size: '500 ml' }));
      }
    } else if (niche.category === 'region') {
      if (niche.id === 'hub-karachi') {
        setFilters((prev) => ({ ...prev, city: 'Karachi' }));
      } else if (niche.id === 'hub-lahore') {
        setFilters((prev) => ({ ...prev, city: 'Lahore' }));
      } else if (niche.id === 'hub-kpk') {
        setFilters((prev) => ({ ...prev, city: 'KPK' }));
      }
    }
    setActiveTab('table');
  };

  return (
    <div className="min-h-screen bg-[#f0f3f8] text-slate-800 flex flex-col font-sans relative">
      {/* Reference Image Signature: Amber/Gold Accent Bar along the top border */}
      <div className="h-1.5 bg-[#f59e0b] w-full fixed top-0 left-0 z-50" />

      <div className="flex flex-1 pt-1.5">
        {/* White Single-Level Sidebar (NO submenus, matching JS Bank Intranet Portal reference) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          productsCount={totalProducts}
          companiesCount={totalCompaniesCount}
          nichesCount={allNiches.length}
          moleculesCount={totalMoleculesCount}
          leadsCount={leadsCount}
          filteredProducts={filteredProducts}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Workspace Column */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
            }`}
        >
          <div className="p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1700px] mx-auto">
            {/* Top Bar with Search, Live Date/Time, User Pill, and Quick Export */}
            <Header
              searchQuery={filters.searchQuery}
              onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
              activeTab={activeTab}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onExportClick={() => exportToCSV(filteredProducts, `Pak_IV_${filteredProducts.length}_Products.csv`)}
              filteredCount={filteredProducts.length}
              totalCount={totalProducts}
            />

            {/* Global KPI Metric Cards */}
            {/* <KpiCards
              totalCount={totalProducts}
              glassCount={glassProductsCount}
              plasticCount={plasticProductsCount}
              companiesCount={totalCompaniesCount}
              moleculesCount={totalMoleculesCount}
              activePackaging={filters.packaging}
              onSelectPackaging={handlePackagingSelect}
              onSelectTab={setActiveTab}
            /> */}

            {/* Filter Toolbar with Clean White Segment Buttons */}
            {activeTab !== 'leads' && activeTab !== 'analytics' && (
              <SearchToolbar
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
                companiesList={companiesList}
                moleculesList={moleculesList}
                citiesList={citiesList}
                categoriesList={categoriesList}
                totalMatches={filteredProducts.length}
                totalDatasetSize={totalProducts}
              />
            )}

            {/* Active View */}
            <main>
              {activeTab === 'products' && (
                <ProductWiseView
                  molecules={allMolecules}
                  onSelectProduct={setSelectedProduct}
                  onFilterByCompany={handleFilterByCompany}
                />
              )}

              {activeTab === 'niches' && (
                <NicheWiseView
                  niches={allNiches}
                  onSelectNiche={handleSelectNiche}
                  onSelectProduct={setSelectedProduct}
                />
              )}

              {activeTab === 'companies' && (
                <CompanyDirectoryView
                  companies={allCompanies}
                  onSelectCompany={setSelectedCompany}
                  onFilterByCompany={handleFilterByCompany}
                />
              )}

              {activeTab === 'table' && (
                <TableView
                  products={filteredProducts}
                  onSelectProduct={setSelectedProduct}
                  onFilterByCompany={handleFilterByCompany}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  companies={allCompanies}
                  onSelectCompany={setSelectedCompany}
                  onFilterByCompany={handleFilterByCompany}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  products={PRODUCTS}
                  companies={allCompanies}
                  molecules={allMolecules}
                  onSelectCompany={handleFilterByCompany}
                  onSelectMolecule={handleQuickMoleculeSelect}
                />
              )}
            </main>

            {/* Footer matching reference design */}
            <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Pakistani IV Infusion &amp; Packaging Intelligence Portal • DRAP Audit</p>
              <p className="font-semibold text-slate-500">2026 © IV Packaging Intelligence</p>
            </footer>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onFilterByCompany={handleFilterByCompany}
        onOutreachUpdated={() => setLeadsCount(Object.keys(getStoredOutreachRecords()).length)}
      />

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onSelectProduct={setSelectedProduct}
        onFilterTableByCompany={handleFilterByCompany}
      />
    </div>
  );
};

export default App;
