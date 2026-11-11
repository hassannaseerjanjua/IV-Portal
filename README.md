# Pakistani IV Infusions & Packaging Intelligence Portal

A modern, frontend-only intelligence portal built with **React, Vite, and Tailwind CSS** for exploring Pakistani IV infusion manufacturers, product-wise formulations, and packaging niches (Type II Glass Infusion Bottles vs. Blow-Fill-Seal Plastic Containers).

---

## 🌟 Key Features

1. **🔬 Product-Wise Finder (`ProductWiseView`)**:
   - Discover which pharmaceutical companies manufacture specific molecules/active ingredients (e.g., Paracetamol, Ciprofloxacin, Metronidazole, Moxifloxacin, Levofloxacin, Sodium Chloride 0.9%, Dextrose, Ringer's Lactate).
   - Side-by-side packaging comparison: See who manufactures each drug in **Glass Bottles (Hanger Label Target)** vs. **Plastic BFS**.

2. **🎯 Niche-Wise Market Explorer (`NicheWiseView`)**:
   - **Packaging Niches**:
     - *Glass Bottles (Hanger Label Prospects)*: 80 formulations requiring external hanger labels with hanging loops.
     - *Plastic BFS Containers*: 83 formulations with molded hanger loops.
   - **Therapeutic Niches**:
     - *Antibiotics & Antimicrobials* (Cipro, Metro, Moxi, Levo, Linezolid).
     - *Post-Operative Analgesics* (IV Paracetamol 1000mg/100ml).
     - *Crystalloid IV Fluids & Rehydration* (Normal Saline, Dextrose, Hartmann's).
   - **Volume Niches**: Small Volume Parenterals (100ml) vs. Large Volume Parenterals (500ml & 1000ml).
   - **Regional Manufacturing Hubs**: Karachi industrial corridor, Lahore/Punjab cluster, Khyber Pakhtunkhwa (Nowshera, Haripur, DI Khan).

3. **🏢 65-Company Directory (`CompanyDirectoryView`)**:
   - Company profile cards showing total IV product lines, Glass vs. Plastic ratio, cities, and prospect viability.
   - Instant drill-down modal to inspect a company's complete portfolio.

4. **📊 Master Data Table (`TableView`)**:
   - Full 163-product dataset from the original HTML audit preserved 100% with zero data loss.
   - Multi-column sorting, instant search, DRAP registration numbers, packaging audit notes, Google image search shortcuts, and DRAP registry verification links.

5. **⚡ Pure Frontend Architecture (No Backend Server Required)**:
   - Client-side search engine (`src/utils/searchEngine.ts` and `public/script.js`).
   - 0 server runtime dependencies: can be hosted anywhere (GitHub Pages, Netlify, Vercel, or statically from disk).
   - Export filtered data to CSV with 1 click.
   - Built-in Print / PDF optimization.

---

## 🚀 How to Run Locally

### 1. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Build for Production / Static Hosting
```bash
npm run build
```
The output will be placed in the `dist/` folder. You can upload `dist/` to any static web hosting provider (Vercel, Netlify, Cloudflare Pages, GitHub Pages, or an S3 bucket).

