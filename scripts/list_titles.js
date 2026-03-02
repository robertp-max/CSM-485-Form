const fs = require('fs');
const s = fs.readFileSync('src/data/trainingCards.ts', 'utf8');
const re = /title:\s*'([^']+)'/g;
const titles = [];
let m;
while ((m = re.exec(s))) titles.push(m[1]);
console.log(titles.length);
console.log(titles[137] || 'NOT_FOUND');
