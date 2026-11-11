const fs = require('fs');
const src = fs.readFileSync('src/data/products.ts', 'utf8');
const matches = [...src.matchAll(/company:\s*["']([^"']+)["']/g)].map(m => m[1]);
const unique = [...new Set(matches)].sort();
console.log(JSON.stringify(unique, null, 2));

