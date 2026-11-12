import React, { useState, useEffect, useMemo } from 'react';
import { CompanySummary, CompanyLead, IVProduct } from '../types';
import {
  Building2,
  Plus,
  Search,
  Download,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Save,
  Check,
  ChevronDown,
  Linkedin,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getStoredCompanyLeads,
  saveCompanyLead,
  deleteCompanyLead,
  subscribeToCompanyLeadUpdates,
  exportCompanyLeadsAsCSV
} from '../utils/crmStorage';

interface LeadsViewProps {
  companies: CompanySummary[];
  onSelectCompany: (company: CompanySummary) => void;
  onFilterByCompany: (companyName: string) => void;
}

type StageFilter = 'ALL' | CompanyLead['status'];
type BottleFilter = 'ALL' | 'GLASS' | 'PLASTIC';

interface CompanyLeadFormState {
  companyName: string;
  city: string;
  status: CompanyLead['status'];
  contactPerson: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  notes: string;
}

const EMPTY_FORM: CompanyLeadFormState = {
  companyName: '',
  city: '',
  status: 'In Discussion',
  contactPerson: '',
  title: '',
  phone: '',
  email: '',
  linkedin: '',
  notes: '',
};

export const LeadsView: React.FC<LeadsViewProps> = ({
  companies,
  onSelectCompany,
  onFilterByCompany,
}) => {
  const [leads, setLeads] = useState<Record<string, CompanyLead>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [bottleFilter, setBottleFilter] = useState<BottleFilter>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<CompanyLeadFormState>(EMPTY_FORM);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string | null>(null);

  // Load leads and subscribe to live sync
  const loadLeads = () => {
    setLeads(getStoredCompanyLeads());
  };

  useEffect(() => {
    loadLeads();
    const unsubscribe = subscribeToCompanyLeadUpdates(() => {
      loadLeads();
    });
    return unsubscribe;
  }, []);

  // Fast company summary lookup by company name (normalized)
  const companyByName = useMemo(() => {
    const map = new Map<string, CompanySummary>();
    companies.forEach((c) => {
      map.set(c.name.trim().toLowerCase(), c);
    });
    return map;
  }, [companies]);

  // Combine stored company leads with catalog company summaries
  const companyLeadsList = useMemo(() => {
    const list: Array<CompanyLead & { summary?: CompanySummary }> = [];
    Object.values(leads).forEach((lead) => {
      const summary = companyByName.get(lead.companyName.trim().toLowerCase());
      list.push({
        ...lead,
        city: lead.city || summary?.city || 'Pakistan',
        totalProducts: summary?.totalProducts ?? lead.totalProducts ?? 0,
        glassCount: summary?.glassCount ?? lead.glassCount ?? 0,
        plasticCount: summary?.plasticCount ?? lead.plasticCount ?? 0,
        brands: summary?.brands ?? lead.brands ?? [],
        summary,
      });
    });

    // Sort by last updated (newest first)
    return list.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [leads, companyByName]);

  // KPI Metrics
  const stats = useMemo(() => {
    const all = companyLeadsList;
    const inDiscussion = all.filter((l) => l.status === 'In Discussion').length;
    const sampleSent = all.filter((l) => l.status === 'Sample Sent').length;
    const existingClient = all.filter((l) => l.status === 'Existing Client').length;
    const notInterested = all.filter((l) => l.status === 'Not Interested').length;
    const glassTargets = all.filter((l) => (l.glassCount ?? 0) > 0).length;

    return {
      total: all.length,
      inDiscussion,
      sampleSent,
      existingClient,
      notInterested,
      glassTargets,
    };
  }, [companyLeadsList]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return companyLeadsList.filter((lead) => {
      // Stage filter
      if (stageFilter !== 'ALL' && lead.status !== stageFilter) {
        return false;
      }

      // Bottle filter
      if (bottleFilter === 'GLASS' && (lead.glassCount ?? 0) === 0) return false;
      if (bottleFilter === 'PLASTIC' && (lead.plasticCount ?? 0) === 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = lead.companyName.toLowerCase().includes(q);
        const matchCity = lead.city?.toLowerCase().includes(q);
        const matchContact = lead.contactPerson?.toLowerCase().includes(q);
        const matchTitle = lead.title?.toLowerCase().includes(q);
        const matchPhone = lead.phone?.toLowerCase().includes(q);
        const matchEmail = lead.email?.toLowerCase().includes(q);
        const matchNotes = lead.notes?.toLowerCase().includes(q);
        const matchBrand = lead.brands?.some((b) => b.toLowerCase().includes(q));
        return (
          matchName ||
          matchCity ||
          matchContact ||
          matchTitle ||
          matchPhone ||
          matchEmail ||
          matchNotes ||
          matchBrand
        );
      }

      return true;
    });
  }, [companyLeadsList, stageFilter, bottleFilter, searchQuery]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData(EMPTY_FORM);
    setCompanySearchTerm('');
    setIsCompanyDropdownOpen(false);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (lead: CompanyLead) => {
    setModalMode('edit');
    setFormData({
      companyName: lead.companyName,
      city: lead.city || '',
      status: lead.status,
      contactPerson: lead.contactPerson || '',
      title: lead.title || '',
      phone: lead.phone || '',
      email: lead.email || '',
      linkedin: lead.linkedin || '',
      notes: lead.notes || '',
    });
    setCompanySearchTerm(lead.companyName);
    setIsCompanyDropdownOpen(false);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  // Select a company from catalog suggestions
  const handleSelectCompany = (comp: CompanySummary) => {
    const existing = leads[comp.name];
    setFormData({
      companyName: comp.name,
      city: comp.city || '',
      status: existing?.status || (comp.name.includes('Bosch') ? 'Existing Client' : 'In Discussion'),
      contactPerson: existing?.contactPerson || '',
      title: existing?.title || '',
      phone: existing?.phone || '',
      email: existing?.email || '',
      linkedin: existing?.linkedin || '',
      notes: existing?.notes || '',
    });
    setCompanySearchTerm(comp.name);
    setIsCompanyDropdownOpen(false);
  };

  // Save Company Lead
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;

    saveCompanyLead(formData.companyName.trim(), {
      companyName: formData.companyName.trim(),
      city: formData.city.trim(),
      status: formData.status,
      contactPerson: formData.contactPerson.trim(),
      title: formData.title.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      linkedin: formData.linkedin.trim(),
      notes: formData.notes.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
    }, 850);
  };

  // Delete Company Lead
  const handleDeleteLead = (companyName: string) => {
    deleteCompanyLead(companyName);
    setDeleteConfirmName(null);
  };

  // Quick inline status change
  const handleQuickStatusChange = (companyName: string, newStatus: CompanyLead['status']) => {
    saveCompanyLead(companyName, { status: newStatus });
  };

  // Filter company options for modal
  const filteredCompanyOptions = useMemo(() => {
    if (!companySearchTerm.trim()) return companies.slice(0, 15);
    const q = companySearchTerm.toLowerCase();
    return companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
      .slice(0, 20);
  }, [companies, companySearchTerm]);

  // Status badge styling helper
  const getStatusBadge = (status: CompanyLead['status']) => {
    switch (status) {
      case 'Existing Client':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Existing Client',
        };
      case 'Sample Sent':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Sample Sent',
        };
      case 'In Discussion':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
          label: 'In Discussion',
        };
      case 'Not Interested':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Not Interested',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Not Contacted',
        };
    }
  };

  // Selected company summary for preview box in modal
  const selectedCompanySummary = useMemo(() => {
    if (!formData.companyName) return null;
    return companyByName.get(formData.companyName.trim().toLowerCase()) || null;
  }, [formData.companyName, companyByName]);

  return (
    <div className="space-y-5">
      {/* Top Banner & CRM Actions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-[#0047ba] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-[#0047ba]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Company Leads &amp; Outreach CRM
              </h2>
              <p className="text-xs text-slate-500">
                Manage B2B company relationships, procurement heads, and bottle hanger label testing across Pakistani IV manufacturers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportCompanyLeadsAsCSV()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download all company leads as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV ({companyLeadsList.length})</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0047ba] hover:bg-[#003894] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Company Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <button
          onClick={() => setStageFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stageFilter === 'ALL'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Companies
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tracked accounts</div>
        </button>

        <button
          onClick={() => setStageFilter('In Discussion')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stageFilter === 'In Discussion'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
            <span>In Discussion</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.inDiscussion}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Commercial meetings</div>
        </button>

        <button
          onClick={() => setStageFilter('Sample Sent')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stageFilter === 'Sample Sent'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
            <span>Sample Sent</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.sampleSent}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Testing hanger labels</div>
        </button>

        <button
          onClick={() => setStageFilter('Existing Client')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stageFilter === 'Existing Client'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
            <span>Existing Client</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.existingClient}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Active commercial accounts</div>
        </button>

        <button
          onClick={() => setBottleFilter(bottleFilter === 'GLASS' ? 'ALL' : 'GLASS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            bottleFilter === 'GLASS'
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-between">
            <span>Glass Targets</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.glassTargets}</div>
          <div className="text-[11px] text-purple-600/80 mt-0.5">Use glass infusion bottles</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by company name, city, contact person, phone, email, notes, brand..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba] text-slate-800"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Stage:
          </span>
          {(['ALL', 'In Discussion', 'Sample Sent', 'Existing Client', 'Not Contacted', 'Not Interested'] as StageFilter[]).map(
            (stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  stageFilter === stage
                    ? 'bg-[#0047ba] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stage === 'ALL' ? 'All Stages' : stage}
              </button>
            )
          )}
        </div>

        {/* Bottle Type filter */}
        <div className="flex items-center gap-1 text-xs shrink-0 border-l border-slate-200 pl-3">
          <button
            onClick={() => setBottleFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              bottleFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Plants
          </button>
          <button
            onClick={() => setBottleFilter('GLASS')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              bottleFilter === 'GLASS' ? 'bg-purple-700 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Glass Plants
          </button>
          <button
            onClick={() => setBottleFilter('PLASTIC')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              bottleFilter === 'PLASTIC' ? 'bg-blue-700 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Plastic BFS
          </button>
        </div>
      </div>

      {/* Company Leads Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 min-w-[220px]">Company &amp; Location</th>
                <th className="px-3 py-3.5 min-w-[150px] text-center">Packaging Profile</th>
                <th className="px-4 py-3.5 min-w-[170px]">Key Brands</th>
                <th className="px-4 py-3.5 w-44">Outreach Stage</th>
                <th className="px-4 py-3.5 min-w-[200px]">Key Contact</th>
                <th className="px-4 py-3.5 min-w-[240px]">Pitch Notes</th>
                <th className="px-3 py-3.5 w-28 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047ba] flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No company leads match your filter</h3>
                      <p className="text-xs text-slate-500">
                        {companyLeadsList.length === 0
                          ? 'Create your first company lead or select any pharmaceutical manufacturer to start tracking outreach.'
                          : 'Try adjusting your search terms or filter selection to view tracked manufacturer leads.'}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0047ba] hover:bg-[#003894] rounded-xl shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Company Lead</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const badge = getStatusBadge(lead.status);
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                  return (
                    <tr key={lead.companyName} className={`${rowBg} hover:bg-blue-50/40 transition-colors group`}>
                      {/* Company & City */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => {
                            if (lead.summary) onSelectCompany(lead.summary);
                            else onFilterByCompany(lead.companyName);
                          }}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#0047ba] shrink-0" />
                          <span>{lead.companyName}</span>
                        </button>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 pl-5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{lead.city || 'Pakistan'}</span>
                        </div>
                      </td>

                      {/* Packaging Profile */}
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {(lead.glassCount ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold badge-glass">
                              🍾 {lead.glassCount} Glass
                            </span>
                          )}
                          {(lead.plasticCount ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold badge-plastic">
                              🧴 {lead.plasticCount} BFS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">
                          {lead.totalProducts || 0} Total Formulations
                        </div>
                      </td>

                      {/* Key Brands */}
                      <td className="px-4 py-3.5">
                        {lead.brands && lead.brands.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {lead.brands.slice(0, 3).map((brand) => (
                              <span
                                key={brand}
                                className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-blue-700 truncate"
                              >
                                {brand}
                              </span>
                            ))}
                            {lead.brands.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center">
                                +{lead.brands.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">IV Infusions</span>
                        )}
                      </td>

                      {/* Outreach Stage */}
                      <td className="px-4 py-3.5">
                        <div className="relative inline-block w-full">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                lead.companyName,
                                e.target.value as CompanyLead['status']
                              )
                            }
                            className={`w-full appearance-none pl-6 pr-6 py-1 text-xs font-bold rounded-xl border cursor-pointer focus:outline-none transition-colors ${badge.bg}`}
                          >
                            <option value="Not Contacted">Not Contacted</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Sample Sent">Sample Sent</option>
                            <option value="Existing Client">Existing Client</option>
                            <option value="Not Interested">Not Interested</option>
                          </select>
                          <span
                            className={`w-2 h-2 rounded-full absolute left-2.5 top-2.5 pointer-events-none ${badge.dot}`}
                          />
                          <ChevronDown className="w-3 h-3 text-current opacity-70 absolute right-2 top-2 pointer-events-none" />
                        </div>
                        {lead.updatedAt && (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(lead.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>

                      {/* Key Contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">
                          {lead.contactPerson || <span className="text-slate-300 font-normal italic">No contact specified</span>}
                        </div>
                        {lead.title && (
                          <div className="text-[11px] font-semibold text-[#0047ba] mt-0.5 truncate max-w-[190px]">
                            {lead.title}
                          </div>
                        )}
                        <div className="mt-1 space-y-0.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-2.5 h-2.5 shrink-0" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-[11px] text-slate-500 hover:text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-[170px]">{lead.email}</span>
                            </a>
                          )}
                          {lead.linkedin && (
                            <a
                              href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#0a66c2] hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="w-2.5 h-2.5 shrink-0" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Pitch Notes */}
                      <td className="px-4 py-3.5">
                        {lead.notes ? (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={lead.notes}>
                            {lead.notes}
                          </p>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">No notes added yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit lead button */}
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            title="Edit Company Lead"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Company Details / Products */}
                          <button
                            onClick={() => {
                              if (lead.summary) onSelectCompany(lead.summary);
                              else onFilterByCompany(lead.companyName);
                            }}
                            title="View Company Formulations & Profile"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete lead */}
                          {deleteConfirmName === lead.companyName ? (
                            <button
                              onClick={() => handleDeleteLead(lead.companyName)}
                              title="Confirm Remove Lead"
                              className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmName(lead.companyName)}
                              title="Delete Company Lead"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COMPANY LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0047ba] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {modalMode === 'create' ? 'Create New Company Lead' : 'Edit Company Lead'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Synchronized across Master Table View, Product Modals, and Company Directory
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLead} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Company Selection / Auto-Suggest */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Target Pharmaceutical Company <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={companySearchTerm}
                    onChange={(e) => {
                      setCompanySearchTerm(e.target.value);
                      setFormData({ ...formData, companyName: e.target.value });
                      setIsCompanyDropdownOpen(true);
                    }}
                    onFocus={() => setIsCompanyDropdownOpen(true)}
                    placeholder="Search manufacturer name (e.g. Bosch, Otsuka, Pacific, Medipak)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30 focus:border-[#0047ba]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />

                  {/* Autocomplete Dropdown */}
                  {isCompanyDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
                      {filteredCompanyOptions.map((c) => (
                        <div
                          key={c.name}
                          onClick={() => handleSelectCompany(c)}
                          className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#0047ba]" />
                              <span>{c.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {c.city || 'Pakistan'} • {c.totalProducts} IV Formulations
                            </div>
                          </div>
                          <div>
                            {c.glassCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold badge-glass">
                                🍾 {c.glassCount} Glass Target
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold badge-plastic">
                                🧴 BFS Plastic
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Target Summary Box */}
              {selectedCompanySummary && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-blue-900 text-xs">
                      {selectedCompanySummary.name}
                    </div>
                    <div className="text-[11px] text-blue-700 mt-0.5">
                      {selectedCompanySummary.city || 'Pakistan'} • {selectedCompanySummary.totalProducts} IV Formulations • Brands: {selectedCompanySummary.brands.slice(0, 3).join(', ')}
                    </div>
                  </div>
                  <div>
                    {selectedCompanySummary.glassCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold badge-glass">
                        🍾 {selectedCompanySummary.glassCount} Glass (Hanger Target)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold badge-plastic">
                        🧴 Plastic BFS Only
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Outreach Stage & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Outreach Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as CompanyLead['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  >
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Sample Sent">Sample Sent / Testing</option>
                    <option value="Existing Client">Existing Client</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Manufacturing City / Plant Location
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Karachi / Lahore / Hattar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>
              </div>

              {/* Key Contact Person & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Key Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Aftab / Mr. Tariq Khan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Title / Department
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Head of Procurement / Plant Manager"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>
              </div>

              {/* Phone, Email & LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Phone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. procurement@pharma.pk"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-slate-400" />
                    <span>LinkedIn Profile</span>
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="e.g. linkedin.com/in/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                  />
                </div>
              </div>

              {/* Private Outreach & Pitch Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Private Outreach &amp; Pitch Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter meeting logs, hanger label sample shipments, plant requirements, target volumes, pricing..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047ba]/30"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveSuccess}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 font-bold rounded-xl text-white transition-all shadow-sm ${
                    saveSuccess
                      ? 'bg-emerald-600'
                      : 'bg-[#0047ba] hover:bg-[#003894]'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Company Lead Saved &amp; Synced!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{modalMode === 'create' ? 'Create Lead' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
