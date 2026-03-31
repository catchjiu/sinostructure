import { readFileSync } from 'fs';

const raw = JSON.parse(readFileSync('C:/Users/catch/Documents/vocab_2000.json', 'utf8'));
const valid = raw.filter(v => v.traditional !== 'Simplified' && ['S','T','P','V','O'].includes(v.category));

const clean = s => s
  .replace(/\*?[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+:\(file\)/gi, '')
  .replace(/\*Audio:/gi, '')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .split(',').slice(0,2).join(', ').trim();

for (const role of ['S','T','P','V','O']) {
  const words = valid.filter(v => v.category === role).sort((a,b)=>a.rank-b.rank);
  console.log(`\n=== ${role} (${words.length} total) ===`);
  words.forEach(v => console.log(`  [${v.rank}] ${v.traditional} (${v.pinyin}) = ${clean(v.english).slice(0,60)}`));
}
