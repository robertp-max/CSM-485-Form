const fs = require('fs');
const path = require('path');
const s = fs.readFileSync(path.join(__dirname, '..','src','data','trainingCards.ts'), 'utf8');
const re = /title:\s*'([^']+)'/g;
const titles = [];
let m;
while ((m = re.exec(s))) titles.push(m[1]);
console.log(titles.length);
console.log(titles[137] || 'NOT_FOUND');
