/**
 * Client-Side Searching & Filtering Engine for Pakistani IV Infusion Packaging Portal
 * Standalone browser & Node compatible script
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.IVSearchEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  function searchProducts(products, query, filters) {
    if (!products || !Array.isArray(products)) return [];
    
    filters = filters || {};
    const q = (query || '').toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);

    return products.filter(function (p) {
      if (filters.is_glass !== undefined && filters.is_glass !== null) {
        if (p.is_glass !== filters.is_glass) return false;
      }

      if (filters.company && p.company.toLowerCase() !== filters.company.toLowerCase()) {
        return false;
      }

      if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      if (filters.size && !p.size.toLowerCase().includes(filters.size.toLowerCase())) {
        return false;
      }

      if (terms.length > 0) {
        const fullText = [
          p.brand,
          p.generic,
          p.company,
          p.city,
          p.pack_type,
          p.notes,
          p.drap_reg,
          p.size
        ].join(' ').toLowerCase();

        for (var i = 0; i < terms.length; i++) {
          if (!fullText.includes(terms[i])) return false;
        }
      }

      return true;
    });
  }

  function groupProductsByMolecule(products) {
    const map = {};
    products.forEach(function (p) {
      const g = p.generic || 'Other';
      if (!map[g]) {
        map[g] = [];
      }
      map[g].push(p);
    });
    return map;
  }

  function groupProductsByCompany(products) {
    const map = {};
    products.forEach(function (p) {
      const c = p.company || 'Unknown';
      if (!map[c]) {
        map[c] = [];
      }
      map[c].push(p);
    });
    return map;
  }

  return {
    searchProducts: searchProducts,
    groupProductsByMolecule: groupProductsByMolecule,
    groupProductsByCompany: groupProductsByCompany
  };
});

