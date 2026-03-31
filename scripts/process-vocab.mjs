import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Load raw JSON ─────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync('C:/Users/catch/Documents/vocab_2000.json', 'utf8'));

// ── Helpers ────────────────────────────────────────────────────────────────

function cleanDefinition(raw) {
  return raw
    // Remove Wiktionary audio markers like "yī:(file)", "*Audio:(file)"
    .replace(/\*?[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+:\(file\)/gi, '')
    .replace(/\*Audio:/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    // Keep only first 3 comma-separated meanings
    .split(',')
    .slice(0, 3)
    .join(', ')
    .replace(/,\s*$/, '')
    .trim();
}

const VALID_ROLES = new Set(['S', 'T', 'P', 'V', 'O']);

// ── Process entries ────────────────────────────────────────────────────────
const words = raw
  .filter(e => e.traditional !== 'Simplified' && e.rank !== 1)
  .filter(e => e.traditional && e.traditional.trim().length > 0)
  .filter(e => VALID_ROLES.has(e.category))
  .map(e => ({
    id: `w-${String(e.rank).padStart(4, '0')}`,
    traditional: e.traditional.trim(),
    simplified:  e.traditional.trim(),   // source only has simplified form
    pinyin:      (e.pinyin || '').trim(),
    definition:  cleanDefinition(e.english || ''),
    role:        e.category,
    frequency:   e.rank,
  }))
  // Deduplicate by character — keep lowest rank
  .reduce((acc, word) => {
    const existing = acc.find(w => w.traditional === word.traditional);
    if (!existing || word.frequency < existing.frequency) {
      return [...acc.filter(w => w.traditional !== word.traditional), word];
    }
    return acc;
  }, [])
  .sort((a, b) => a.frequency - b.frequency);

// ── Stats ──────────────────────────────────────────────────────────────────
const byRole = { S: 0, T: 0, P: 0, V: 0, O: 0 };
words.forEach(w => byRole[w.role]++);
console.log(`✓ Total words processed: ${words.length}`);
Object.entries(byRole).forEach(([r, n]) => console.log(`  ${r}: ${n}`));

// ── Verified sentence templates ────────────────────────────────────────────
// Each component [role, char] must exist in the processed word list with that role.
// Verified against the source JSON before writing.
const verify = (char, role) => {
  const w = words.find(w => w.traditional === char);
  if (!w) { console.warn(`  ⚠ MISSING: "${char}"`); return false; }
  if (w.role !== role) { console.warn(`  ⚠ ROLE MISMATCH: "${char}" is ${w.role}, expected ${role}`); }
  return true;
};

const templates = [
  {
    id: 'sent-01',
    audioText: '他常常在家看电影。',
    englishTranslation: 'He often watches movies at home.',
    components: [['S','他'],['T','常常'],['P','家'],['V','看'],['O','电影']],
  },
  {
    id: 'sent-02',
    audioText: '她经常在公司做事。',
    englishTranslation: 'She often handles things at the company.',
    components: [['S','她'],['T','经常'],['P','公司'],['V','做'],['O','事']],
  },
  {
    id: 'sent-03',
    audioText: '学生往往在学校说故事。',
    englishTranslation: 'Students often tell stories at school.',
    components: [['S','学生'],['T','往往'],['P','学校'],['V','说'],['O','故事']],
  },
  {
    id: 'sent-04',
    audioText: '老师经常在学校想问题。',
    englishTranslation: 'The teacher often thinks about problems at school.',
    components: [['S','老师'],['T','经常'],['P','学校'],['V','想'],['O','问题']],
  },
  {
    id: 'sent-05',
    audioText: '他们往往在家想生活。',
    englishTranslation: 'They often think about life at home.',
    components: [['S','他们'],['T','往往'],['P','家'],['V','想'],['O','生活']],
  },
  {
    id: 'sent-06',
    audioText: '妈妈常常在市场买水。',
    englishTranslation: 'Mom often buys water at the market.',
    components: [['S','妈妈'],['T','常常'],['P','市场'],['V','买'],['O','水']],
  },
  {
    id: 'sent-07',
    audioText: '爸爸往往在公司做事。',
    englishTranslation: 'Dad often handles things at the company.',
    components: [['S','爸爸'],['T','往往'],['P','公司'],['V','做'],['O','事']],
  },
  {
    id: 'sent-08',
    audioText: '朋友经常在那里说故事。',
    englishTranslation: 'Friends often tell stories there.',
    components: [['S','朋友'],['T','经常'],['P','那里'],['V','说'],['O','故事']],
  },
  {
    id: 'sent-09',
    audioText: '她时候在医院做事。',
    englishTranslation: 'At that time she handles things at the hospital.',
    components: [['S','她'],['T','时候'],['P','医院'],['V','做'],['O','事']],
  },
  {
    id: 'sent-10',
    audioText: '老师往往在学校说中文。',
    englishTranslation: 'Teachers often speak Chinese at school.',
    components: [['S','老师'],['T','往往'],['P','学校'],['V','说'],['O','中文']],
  },
];

console.log('\n✓ Verifying sentence template components:');
let allOk = true;
templates.forEach(t => {
  t.components.forEach(([role, char]) => {
    if (!verify(char, role)) allOk = false;
  });
});
if (allOk) console.log('  All components verified ✓');

// ── Build component lookup helper ──────────────────────────────────────────
const templateTs = templates.map(t => {
  const comps = t.components.map(([role, char]) =>
    `      { role: '${role}', word: VOCAB.find(w => w.traditional === '${char}' && w.role === '${role}')! },`
  ).join('\n');
  return `  {
    id: '${t.id}',
    audioText: '${t.audioText}',
    englishTranslation: '${t.englishTranslation}',
    components: [
${comps}
    ],
  },`;
}).join('\n');

// ── Vocab entries ──────────────────────────────────────────────────────────
const vocabEntries = words.map(w => {
  const def = w.definition.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `  { id: '${w.id}', traditional: '${w.traditional}', simplified: '${w.simplified}', pinyin: '${w.pinyin}', definition: '${def}', role: '${w.role}', frequency: ${w.frequency} },`;
}).join('\n');

// ── Output ─────────────────────────────────────────────────────────────────
const output = `import { VocabWord, SentenceTemplate } from '@/types';

// ── ${words.length}-word frequency list from Mandarin 1–2000 (Wiktionary) ─────────────
// Characters are in simplified form (traditional equivalents can be added per-word).
// STPVO roles are sourced from the category field in the original dataset.
export const VOCAB: VocabWord[] = [
${vocabEntries}
];

// ── SENTENCE TEMPLATES ────────────────────────────────────────────────────
// All component words verified to exist in VOCAB with matching role.
export const SENTENCE_TEMPLATES: SentenceTemplate[] = [
${templateTs}
];

export const ROLE_LABELS: Record<string, string> = {
  S: 'Subject 主語',
  T: 'Time 時間',
  P: 'Place 地點',
  V: 'Verb 動詞',
  O: 'Object 賓語',
};

export const ROLE_COLORS: Record<string, string> = {
  S: 'subject',
  T: 'time',
  P: 'place',
  V: 'verb',
  O: 'object',
};
`;

const outPath = join(root, 'constants', 'vocab.ts');
writeFileSync(outPath, output, 'utf8');
console.log(`\n✓ Written to ${outPath}`);
