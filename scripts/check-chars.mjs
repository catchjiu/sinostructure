import { readFileSync } from 'fs';
const f = readFileSync('constants/vocab.ts', 'utf8');
// Find lines for specific characters
const chars = ['她', '他', '你', '朋友', '老师'];
chars.forEach(c => {
  const line = f.split('\n').find(l => l.includes(`traditional: '${c}'`));
  console.log(`${c}: ${line ? line.trim().slice(0, 80) : 'NOT FOUND'}`);
});

// Also test regex
const testRe = new RegExp(`traditional: '她'[^}]+role: 'S'`);
console.log('\nRegex test for 她:', testRe.test(f));

// Check the hex codes of 她 in both strings
const fileChar = f.match(/traditional: '(.)'/)?.[1];
console.log('\nFirst char found in file:', fileChar, fileChar?.charCodeAt(0));
console.log('Script 她 charCode:', '她'.charCodeAt(0));
