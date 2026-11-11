import { IVProduct, FilterState } from '../types';
import { getMoleculeGroup, getTherapeuticCategory } from './portalHelpers';

export function searchAndFilterProducts(
  products: IVProduct[],
  filters: FilterState
): IVProduct[] {
  const query = filters.searchQuery.toLowerCase().trim();
  const searchTerms = query.split(/\s+/).filter(Boolean);

  return products.filter((p) => {
    // 1. Packaging filter
    if (filters.packaging === 'glass' && !p.is_glass) return false;
    if (filters.packaging === 'plastic' && p.is_glass) return false;

    // 2. Company filter
    if (filters.company && p.company !== filters.company) return false;

    // 3. Molecule filter
    if (filters.molecule) {
      const pMol = getMoleculeGroup(p.generic);
      if (pMol.toLowerCase() !== filters.molecule.toLowerCase()) return false;
    }

    // 4. Therapeutic Category filter
    if (filters.therapeuticCategory) {
      const pCat = getTherapeuticCategory(p.generic);
      if (pCat.toLowerCase() !== filters.therapeuticCategory.toLowerCase()) return false;
    }

    // 5. City filter
    if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;

    // 6. Size filter
    if (filters.size && !p.size.toLowerCase().includes(filters.size.toLowerCase())) return false;

    // 7. Full-text search (tokens across all key attributes)
    if (searchTerms.length > 0) {
      const searchableText = [
        p.brand,
        p.generic,
        p.company,
        p.city,
        p.pack_type,
        p.notes,
        p.drap_reg,
        p.size,
        p.orig_status,
        getMoleculeGroup(p.generic),
        getTherapeuticCategory(p.generic)
      ].join(' ').toLowerCase();

      // All search terms must match
      const allMatch = searchTerms.every(term => searchableText.includes(term));
      if (!allMatch) return false;
    }

    return true;
  });
}

export function exportToCSV(products: IVProduct[], filename = 'Pakistani_IV_Infusions_Export.csv') {
  const headers = [
    'S.No',
    'Company Name',
    'City / Region',
    'Marketing Brand',
    'Generic Formula',
    'Pack Size',
    'Is Glass Bottle (Hanger Prospect)',
    'Packaging Technology',
    'DRAP Registration Number',
    'Audited Packaging Notes',
    'Source Link'
  ];

  const rows = products.map((p) => [
    p.sno,
    `"${(p.company || '').replace(/"/g, '""')}"`,
    `"${(p.city || '').replace(/"/g, '""')}"`,
    `"${(p.brand || '').replace(/"/g, '""')}"`,
    `"${(p.generic || '').replace(/"/g, '""')}"`,
    `"${(p.size || '').replace(/"/g, '""')}"`,
    p.is_glass ? 'TRUE (Glass Bottle)' : 'FALSE (Plastic BFS)',
    `"${(p.pack_type || '').replace(/"/g, '""')}"`,
    `"${(p.drap_reg || '').replace(/"/g, '""')}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    `"${(p.source_link || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

