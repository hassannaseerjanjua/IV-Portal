import React, { useState, useEffect } from 'react';
import { IVProduct, CompanyLead } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Image, MapPin, Eye, Building2 } from 'lucide-react';
import { getStoredCompanyLeads, subscribeToCompanyLeadUpdates } from '../utils/crmStorage';

interface TableViewProps {
  products: IVProduct[];
  onSelectProduct: (product: IVProduct) => void;
  onFilterByCompany: (company: string) => void;
}

type SortCol = 'sno' | 'company' | 'brand' | 'generic' | 'size' | 'is_glass' | 'pack_type';

export const TableView: React.FC<TableViewProps> = ({
  products,
  onSelectProduct,
  onFilterByCompany,
}) => {
  const [sortCol, setSortCol] = useState<SortCol>('sno');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [companyLeads, setCompanyLeads] = useState<Record<string, CompanyLead>>({});

  useEffect(() => {
    setCompanyLeads(getStoredCompanyLeads());
    const unsubscribe = subscribeToCompanyLeadUpdates(() => {
      setCompanyLeads(getStoredCompanyLeads());
    });
    return unsubscribe;
  }, []);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const SortIndicator = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto table-container">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-100/90 backdrop-blur-xs text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('sno')}
                className="px-3 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors w-12 text-center group"
              >
                <div className="flex items-center justify-center">
                  <span>#</span>
                  <SortIndicator col="sno" />
                </div>
              </th>

              <th
                onClick={() => handleSort('company')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors min-w-[200px] group"
              >
                <div className="flex items-center">
                  <span>Company &amp; City</span>
                  <SortIndicator col="company" />
                </div>
              </th>

              <th
                onClick={() => handleSort('brand')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors min-w-[160px] group"
              >
                <div className="flex items-center">
                  <span>Marketing Brand</span>
                  <SortIndicator col="brand" />
                </div>
              </th>

              <th
                onClick={() => handleSort('generic')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors min-w-[200px] group"
              >
                <div className="flex items-center">
                  <span>Generic Formula</span>
                  <SortIndicator col="generic" />
                </div>
              </th>

              <th
                onClick={() => handleSort('size')}
                className="px-3 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors w-28 text-center group"
              >
                <div className="flex items-center justify-center">
                  <span>Pack Size</span>
                  <SortIndicator col="size" />
                </div>
              </th>

              <th
                onClick={() => handleSort('is_glass')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors w-36 text-center group"
              >
                <div className="flex items-center justify-center">
                  <span>Bottle</span>
                  <SortIndicator col="is_glass" />
                </div>
              </th>

              <th
                onClick={() => handleSort('pack_type')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors min-w-[210px] group"
              >
                <div className="flex items-center">
                  <span>Packaging Technology</span>
                  <SortIndicator col="pack_type" />
                </div>
              </th>

              <th className="px-4 py-3.5 w-36 text-center">
                Lead / Outreach
              </th>

              {/* <th className="px-4 py-3.5 min-w-[260px]">
                Packaging Details &amp; Notes
              </th> */}

              {/* <th className="px-4 py-3.5 w-32 text-center">
                DRAP Reg
              </th> */}

              <th className="px-4 py-3.5 w-28 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No IV products match your active search and filter criteria. Try resetting filters.
                </td>
              </tr>
            ) : (
              sortedProducts.map((p, idx) => {
                const imgSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                  p.brand + ' ' + p.company + ' infusion Pakistan'
                )}`;
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                return (
                  <tr
                    key={p.sno}
                    className={`${rowBg} hover:bg-blue-50/50 transition-colors group`}
                  >
                    <td className="px-3 py-3 text-center font-medium text-slate-400">
                      {p.sno}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => onFilterByCompany(p.company)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors"
                      >
                        {p.company}
                      </button>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{p.city || 'Pakistan'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-700">
                      {p.brand}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.generic}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                        {p.size}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {p.is_glass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-glass shadow-2xs">
                          Glass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-plastic shadow-2xs">
                          Plastic
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {p.pack_type}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const lead = companyLeads[p.company];
                        const status = lead?.status || (p.orig_status === 'EXISTING CLIENT' || p.company.includes('Bosch') ? 'Existing Client' : null);
                        if (!status || status === 'Not Contacted') {
                          return (
                            <button
                              onClick={() => onSelectProduct(p)}
                              className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-colors"
                              title={`Create lead for ${p.company}`}
                            >
                              + Add Lead
                            </button>
                          );
                        }
                        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                        let dotColor = 'bg-slate-400';
                        if (status === 'Existing Client') {
                          badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          dotColor = 'bg-emerald-500';
                        } else if (status === 'In Discussion') {
                          badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                          dotColor = 'bg-blue-600';
                        } else if (status === 'Sample Sent') {
                          badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                          dotColor = 'bg-amber-500';
                        } else if (status === 'Not Interested') {
                          badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                          dotColor = 'bg-rose-500';
                        }
                        return (
                          <button
                            onClick={() => onSelectProduct(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 ${badgeColor}`}
                            title={`Company Lead: ${p.company} • ${status} (Click to edit in modal)`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            <span>{status}</span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* <td className="px-4 py-3 text-slate-600 text-[11px] leading-relaxed max-w-sm">
                      {p.notes}
                    </td> */}

                    {/* <td className="px-4 py-3 text-center text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {p.drap_reg || '—'}
                    </td> */}

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectProduct(p)}
                          title="Inspect Product Full Details"
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={imgSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Search product pack shots on Google Images"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Image className="w-4 h-4" />
                        </a>

                        {p.source_link && p.source_link.startsWith('http') && (
                          <a
                            href={p.source_link}
                            target="_blank"
                            rel="noreferrer"
                            title="Open DRAP registry source link"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
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
  );
};

