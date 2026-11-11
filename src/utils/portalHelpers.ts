import { IVProduct, CompanySummary, MoleculeSummary, NicheGroup } from '../types';

export function getTherapeuticCategory(generic: string): string {
  const g = generic.toLowerCase();
  if (g.includes('paracetamol')) return 'Analgesics & Antipyretics';
  if (
    g.includes('ciprofloxacin') ||
    g.includes('metronidazole') ||
    g.includes('moxifloxacin') ||
    g.includes('levofloxacin') ||
    g.includes('linezolid') ||
    g.includes('fluconazole') ||
    g.includes('fluoroquinolone')
  ) {
    return 'Antibiotics & Antimicrobials';
  }
  if (
    g.includes('sodium chloride') ||
    g.includes('dextrose') ||
    g.includes('glucose') ||
    g.includes('ringer') ||
    g.includes('hartmann') ||
    g.includes('saline') ||
    g.includes('potassium') ||
    g.includes('electrolyte') ||
    g.includes('peads') ||
    g.includes('paediatric')
  ) {
    return 'IV Fluids & Electrolytes';
  }
  if (g.includes('mannitol') || g.includes('sorbitol') || g.includes('glycerol')) {
    return 'Osmotic Diuretics';
  }
  return 'Specialty Parenterals';
}

export function getMoleculeGroup(generic: string): string {
  const g = generic.toLowerCase();
  if (g.includes('paracetamol')) return 'Paracetamol';
  if (g.includes('metronidazole')) return 'Metronidazole';
  if (g.includes('ciprofloxacin')) return 'Ciprofloxacin';
  if (g.includes('moxifloxacin')) return 'Moxifloxacin';
  if (g.includes('levofloxacin')) return 'Levofloxacin';
  if (g.includes('mannitol')) return 'Mannitol';
  if (g.includes('linezolid')) return 'Linezolid';
  if (g.includes('fluconazole')) return 'Fluconazole';
  if (g.includes('potassium chloride')) return 'Potassium Chloride';
  if (g.includes('ringer') || g.includes('hartmann') || g.includes('compound sodium lactate')) {
    if (g.includes('dextrose') || g.includes('glucose')) {
      return "Ringer's Lactate + Dextrose";
    }
    return "Ringer's Lactate (Hartmann's)";
  }
  if (g.includes('dextrose') && g.includes('sodium chloride')) {
    return 'Dextrose + Sodium Chloride (DNS/DHS)';
  }
  if (g.includes('dextrose 10%')) return 'Dextrose 10%';
  if (g.includes('dextrose 5%')) return 'Dextrose 5%';
  if (g.includes('dextrose') || g.includes('glucose')) return 'Dextrose Solutions';
  if (g.includes('sodium chloride 0.9%') || g.includes('normal saline')) return 'Sodium Chloride 0.9% (Normal Saline)';
  if (g.includes('sodium chloride')) return 'Sodium Chloride Solutions';
  if (g.includes('fluoroquinolone')) return 'Fluoroquinolone Infusion';
  return generic.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Specialty IV';
}

export function getSizeCategory(size: string): string {
  const s = size.toLowerCase();
  if (s.includes('100 ml') || s.includes('100ml')) return '100 mL (SVP)';
  if (s.includes('250 ml') || s.includes('250ml')) return '250 mL';
  if (s.includes('300 ml') || s.includes('300ml')) return '300 mL';
  if (s.includes('500 ml') || s.includes('500ml')) return '500 mL (LVP)';
  if (s.includes('1000 ml') || s.includes('1000ml') || s.includes('1 l') || s.includes('1l')) return '1000 mL (LVP)';
  return 'Flexible / Multi-pack';
}

export function getCompanySummaries(products: IVProduct[]): CompanySummary[] {
  const companyMap = new Map<string, {
    city: string;
    products: IVProduct[];
    molecules: Set<string>;
    brands: Set<string>;
    sizes: Set<string>;
    glassCount: number;
    plasticCount: number;
  }>();

  products.forEach((p) => {
    const comp = p.company.trim();
    if (!companyMap.has(comp)) {
      companyMap.set(comp, {
        city: p.city || 'Pakistan',
        products: [],
        molecules: new Set<string>(),
        brands: new Set<string>(),
        sizes: new Set<string>(),
        glassCount: 0,
        plasticCount: 0
      });
    }

    const entry = companyMap.get(comp)!;
    entry.products.push(p);
    if (p.is_glass) entry.glassCount++;
    else entry.plasticCount++;

    entry.molecules.add(getMoleculeGroup(p.generic));
    if (p.brand && p.brand !== 'Brand to verify' && p.brand !== 'Brands to verify') {
      entry.brands.add(p.brand);
    }
    if (p.size) entry.sizes.add(p.size);
  });

  return Array.from(companyMap.entries()).map(([name, data]) => {
    let hangerViability: 'High' | 'Medium' | 'Low' | 'None' = 'None';
    if (data.glassCount > 2) hangerViability = 'High';
    else if (data.glassCount > 0) hangerViability = 'Medium';
    else hangerViability = 'None';

    return {
      name,
      city: data.city,
      totalProducts: data.products.length,
      glassCount: data.glassCount,
      plasticCount: data.plasticCount,
      products: data.products,
      molecules: Array.from(data.molecules),
      brands: Array.from(data.brands),
      packSizes: Array.from(data.sizes),
      hangerViability
    };
  }).sort((a, b) => b.glassCount - a.glassCount || b.totalProducts - a.totalProducts);
}

export function getMoleculeSummaries(products: IVProduct[]): MoleculeSummary[] {
  const molMap = new Map<string, {
    category: string;
    products: IVProduct[];
    companies: Set<string>;
    sizes: Set<string>;
    glassCount: number;
    plasticCount: number;
  }>();

  products.forEach((p) => {
    const mol = getMoleculeGroup(p.generic);
    const cat = getTherapeuticCategory(p.generic);

    if (!molMap.has(mol)) {
      molMap.set(mol, {
        category: cat,
        products: [],
        companies: new Set<string>(),
        sizes: new Set<string>(),
        glassCount: 0,
        plasticCount: 0
      });
    }

    const entry = molMap.get(mol)!;
    entry.products.push(p);
    entry.companies.add(p.company);
    if (p.is_glass) entry.glassCount++;
    else entry.plasticCount++;
    if (p.size) entry.sizes.add(p.size);
  });

  return Array.from(molMap.entries()).map(([molecule, data]) => ({
    molecule,
    category: data.category,
    totalProducts: data.products.length,
    companiesCount: data.companies.size,
    glassCount: data.glassCount,
    plasticCount: data.plasticCount,
    commonSizes: Array.from(data.sizes),
    products: data.products,
    companies: Array.from(data.companies)
  })).sort((a, b) => b.totalProducts - a.totalProducts);
}

export function getNicheGroups(products: IVProduct[]): NicheGroup[] {
  const glassProducts = products.filter(p => p.is_glass);
  const plasticProducts = products.filter(p => !p.is_glass);

  const antibiotics = products.filter(p => getTherapeuticCategory(p.generic) === 'Antibiotics & Antimicrobials');
  const analgesics = products.filter(p => getTherapeuticCategory(p.generic) === 'Analgesics & Antipyretics');
  const fluids = products.filter(p => getTherapeuticCategory(p.generic) === 'IV Fluids & Electrolytes');
  const svp100 = products.filter(p => p.size.toLowerCase().includes('100 ml') || p.size.toLowerCase().includes('100ml'));
  const lvp500 = products.filter(p => p.size.toLowerCase().includes('500 ml') || p.size.toLowerCase().includes('500ml'));

  const karachiProds = products.filter(p => p.city.toLowerCase().includes('karachi'));
  const lahoreProds = products.filter(p => p.city.toLowerCase().includes('lahore'));
  const kpkProds = products.filter(p => p.city.toLowerCase().includes('kpk') || p.city.toLowerCase().includes('nowshera') || p.city.toLowerCase().includes('haripur') || p.city.toLowerCase().includes('dera ismail'));

  const countCompanies = (prods: IVProduct[]) => new Set(prods.map(p => p.company)).size;

  return [
    {
      id: 'glass-hanger',
      title: 'Glass Bottles (Hanger Label Prospects)',
      badge: 'High Value Target',
      category: 'packaging',
      icon: '🍾',
      description: 'USP Type II clear infusion bottles & vials requiring external hanging labels with integrated loops for clinical administration.',
      productCount: glassProducts.length,
      companyCount: countCompanies(glassProducts),
      products: glassProducts
    },
    {
      id: 'plastic-bfs',
      title: 'Plastic BFS Infusion Containers',
      badge: 'Molded Loops',
      category: 'packaging',
      icon: '🧴',
      description: 'Polyethylene (LDPE) and Polypropylene (PP) Blow-Fill-Seal containers produced with built-in plastic hanger loops or Euro-heads.',
      productCount: plasticProducts.length,
      companyCount: countCompanies(plasticProducts),
      products: plasticProducts
    },
    {
      id: 'antibiotics',
      title: 'Antibiotics & Antimicrobial Infusions',
      badge: 'Hospital Specialty',
      category: 'therapeutic',
      icon: '💊',
      description: 'Critical IV anti-infectives including Ciprofloxacin, Metronidazole, Moxifloxacin, Levofloxacin, and Linezolid in clinical demand.',
      productCount: antibiotics.length,
      companyCount: countCompanies(antibiotics),
      products: antibiotics
    },
    {
      id: 'analgesics',
      title: 'IV Paracetamol & Post-Op Analgesics',
      badge: 'Fastest Growing Line',
      category: 'therapeutic',
      icon: '💉',
      description: '1000mg/100ml IV Paracetamol formulations manufactured heavily in Type II Glass bottles and BFS plastic across Pakistan.',
      productCount: analgesics.length,
      companyCount: countCompanies(analgesics),
      products: analgesics
    },
    {
      id: 'lvp-fluids',
      title: 'LVPs: Rehydration & Electrolytes',
      badge: 'Bulk Parenterals',
      category: 'therapeutic',
      icon: '💧',
      description: 'Normal Saline (0.9%), Dextrose (5%, 10%), Ringer\'s Lactate (Hartmann\'s), and paediatric electrolyte infusions.',
      productCount: fluids.length,
      companyCount: countCompanies(fluids),
      products: fluids
    },
    {
      id: 'svp-100ml',
      title: 'Small Volume Parenterals (100 mL)',
      badge: '100ml Bottles',
      category: 'volume',
      icon: '🧪',
      description: 'High-concentration drug infusions (Paracetamol, Metronidazole, Cipro) where hanger labels are prominently used.',
      productCount: svp100.length,
      companyCount: countCompanies(svp100),
      products: svp100
    },
    {
      id: 'lvp-500ml',
      title: 'Large Volume Parenterals (500 mL)',
      badge: '500ml Bottles & Bags',
      category: 'volume',
      icon: '🧃',
      description: 'Standard hospital maintenance and hydration fluids primarily packed in BFS LDPE/PP bottles with euro-head hangers.',
      productCount: lvp500.length,
      companyCount: countCompanies(lvp500),
      products: lvp500
    },
    {
      id: 'hub-karachi',
      title: 'Karachi Industrial Pharma Corridor',
      badge: 'Major Port Hub',
      category: 'region',
      icon: '🏭',
      description: 'Leading multinational and domestic parenteral manufacturers located in Korangi, Landhi, SITE, and Federal B Area Karachi.',
      productCount: karachiProds.length,
      companyCount: countCompanies(karachiProds),
      products: karachiProds
    },
    {
      id: 'hub-lahore',
      title: 'Punjab / Lahore Pharma Cluster',
      badge: 'Central Manufacturing',
      category: 'region',
      icon: '🏛️',
      description: 'Major parenteral production lines located in Lahore, Sundar Industrial Estate, Multan Road, and surrounding Punjab industrial clusters.',
      productCount: lahoreProds.length,
      companyCount: countCompanies(lahoreProds),
      products: lahoreProds
    },
    {
      id: 'hub-kpk',
      title: 'KPK Pharma Hub (Nowshera, Haripur, DIK)',
      badge: 'Northern Cluster',
      category: 'region',
      icon: '🏔️',
      description: 'Strategic IV infusion manufacturing units located across Khyber Pakhtunkhwa including Unisa, Ahad International, and Frontier Dextrose.',
      productCount: kpkProds.length,
      companyCount: countCompanies(kpkProds),
      products: kpkProds
    }
  ];
}

