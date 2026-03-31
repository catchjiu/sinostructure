/**
 * Generates 100 verified STPVO sentence templates from curated word pools.
 * All words verified to exist in the processed vocab.ts with matching roles.
 * Sentence structure: [S] + [T] + 在 + [P] + [V] + [O]
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load the generated vocab to cross-verify everything
const vocabTs = readFileSync(join(root, 'constants', 'vocab.ts'), 'utf8');
const wordExists = (char, role) => {
  const needle = `traditional: '${char}', simplified: '${char}'`;
  const idx = vocabTs.indexOf(needle);
  if (idx === -1) return false;
  const lineEnd = vocabTs.indexOf('\n', idx);
  const line = vocabTs.slice(idx, lineEnd === -1 ? undefined : lineEnd);
  return line.includes(`role: '${role}'`);
};

// ── Word Pools ────────────────────────────────────────────────────────────

const SUBJECTS = [
  { char: '他',   en: 'He',             pinyin: 'tā' },
  { char: '她',   en: 'She',            pinyin: 'tā' },
  { char: '他们', en: 'They',           pinyin: 'tāmen' },
  { char: '你',   en: 'You',            pinyin: 'nǐ' },
  { char: '学生', en: 'The student',    pinyin: 'xuéshēng' },
  { char: '老师', en: 'The teacher',    pinyin: 'lǎoshī' },
  { char: '朋友', en: 'A friend',       pinyin: 'péngyou' },
  { char: '妈妈', en: 'Mom',            pinyin: 'māmā' },
  { char: '爸爸', en: 'Dad',            pinyin: 'bàbà' },
  { char: '女人', en: 'The woman',      pinyin: 'nǔrén' },
  { char: '弟弟', en: 'Younger brother',pinyin: 'dìdì' },
  { char: '哥哥', en: 'Older brother',  pinyin: 'gēgē' },
  { char: '工人', en: 'The worker',     pinyin: 'gōngrén' },
  { char: '先生', en: 'The gentleman',  pinyin: 'xiānshēng' },
  { char: '母亲', en: 'Mother',         pinyin: 'mǔqīn' },
  { char: '父亲', en: 'Father',         pinyin: 'fùqīn' },
  { char: '专家', en: 'The expert',     pinyin: 'zhuānjiā' },
  { char: '小孩', en: 'The child',      pinyin: 'xiǎohái' },
  { char: '女孩', en: 'The girl',       pinyin: 'nǔhái' },
  { char: '男生', en: 'The boy',        pinyin: 'nánshēng' },
];

const TIMES = [
  { char: '常常', en: 'often',           pinyin: 'chángcháng' },
  { char: '经常', en: 'regularly',       pinyin: 'jīngcháng' },
  { char: '往往', en: 'usually',         pinyin: 'wǎngwǎng' },
  { char: '时候', en: 'at that time',    pinyin: 'shíhòu' },
  { char: '刚',   en: 'just now',        pinyin: 'gāng' },
  { char: '立刻', en: 'immediately',     pinyin: 'lìkè' },
  { char: '曾经', en: 'once',            pinyin: 'céngjīng' },
  { char: '一向', en: 'consistently',   pinyin: 'yīxiàng' },
];

const PLACES = [
  { char: '家',   en: 'home',           pinyin: 'jiā' },
  { char: '学校', en: 'school',         pinyin: 'xuéxiào' },
  { char: '公司', en: 'the office',     pinyin: 'gōngsī' },
  { char: '医院', en: 'the hospital',   pinyin: 'yīyuàn' },
  { char: '那里', en: 'there',          pinyin: 'nàlǐ' },
  { char: '市场', en: 'the market',     pinyin: 'shìchǎng' },
  { char: '教室', en: 'the classroom',  pinyin: 'jiàoshì' },
  { char: '学院', en: 'the college',    pinyin: 'xuéyuàn' },
  { char: '广场', en: 'the plaza',      pinyin: 'guǎngchǎng' },
  { char: '校园', en: 'campus',         pinyin: 'xiàoyuán' },
  { char: '高中', en: 'high school',    pinyin: 'gāozhōng' },
];

// V+O pairs: semantically natural, both words must be in vocab with correct role
const VO_PAIRS = [
  { v:'看',  vEn:'watches',        o:'电影',  oEn:'movies' },
  { v:'看',  vEn:'watches',        o:'新闻',  oEn:'the news' },
  { v:'看',  vEn:'watches',        o:'电视',  oEn:'TV' },
  { v:'看',  vEn:'looks at',       o:'照片',  oEn:'photos' },
  { v:'说',  vEn:'speaks',         o:'中文',  oEn:'Chinese' },
  { v:'说',  vEn:'speaks',         o:'英文',  oEn:'English' },
  { v:'说',  vEn:'tells',          o:'故事',  oEn:'stories' },
  { v:'做',  vEn:'handles',        o:'事',    oEn:'things' },
  { v:'做',  vEn:'does',           o:'运动',  oEn:'exercise' },
  { v:'做',  vEn:'does',           o:'活动',  oEn:'activities' },
  { v:'做',  vEn:'has',            o:'梦',    oEn:'dreams' },
  { v:'买',  vEn:'buys',           o:'菜',    oEn:'vegetables' },
  { v:'买',  vEn:'buys',           o:'电脑',  oEn:'a computer' },
  { v:'买',  vEn:'buys',           o:'电视',  oEn:'a TV' },
  { v:'买',  vEn:'buys',           o:'水',    oEn:'water' },
  { v:'想',  vEn:'thinks about',   o:'生活',  oEn:'life' },
  { v:'想',  vEn:'thinks about',   o:'问题',  oEn:'problems' },
  { v:'想',  vEn:'thinks about',   o:'工作',  oEn:'work' },
  { v:'想',  vEn:'misses',         o:'孩子',  oEn:'the children' },
  { v:'带',  vEn:'looks after',    o:'孩子',  oEn:'the children' },
  { v:'找',  vEn:'looks for',      o:'工作',  oEn:'work' },
  { v:'找',  vEn:'looks for',      o:'钱',    oEn:'money' },
  { v:'讲',  vEn:'tells',          o:'故事',  oEn:'stories' },
  { v:'讲',  vEn:'discusses',      o:'问题',  oEn:'problems' },
  { v:'讲',  vEn:'speaks',         o:'中文',  oEn:'Chinese' },
  { v:'吃',  vEn:'eats',           o:'菜',    oEn:'vegetables' },
  { v:'吃',  vEn:'eats',           o:'茶',    oEn:'tea' },    // 喝茶 is more natural, but 吃茶 exists
  { v:'照顾',vEn:'looks after',    o:'孩子',  oEn:'the children' },
  { v:'购买',vEn:'purchases',      o:'菜',    oEn:'groceries' },
  { v:'购买',vEn:'purchases',      o:'电脑',  oEn:'a computer' },
];

// ── Verify all pool words exist in vocab.ts ────────────────────────────────
console.log('Verifying word pools...');
let errors = 0;
SUBJECTS.forEach(w => { if (!wordExists(w.char, 'S')) { console.warn(`  ✗ S missing: ${w.char}`); errors++; }});
TIMES.forEach(w =>    { if (!wordExists(w.char, 'T')) { console.warn(`  ✗ T missing: ${w.char}`); errors++; }});
PLACES.forEach(w =>   { if (!wordExists(w.char, 'P')) { console.warn(`  ✗ P missing: ${w.char}`); errors++; }});
VO_PAIRS.forEach(p => {
  if (!wordExists(p.v, 'V')) { console.warn(`  ✗ V missing: ${p.v}`); errors++; }
  if (!wordExists(p.o, 'O')) { console.warn(`  ✗ O missing: ${p.o}`); errors++; }
});
if (errors === 0) console.log('  All pool words verified ✓');
else console.log(`  ${errors} missing words — fix before continuing`);

if (errors > 0) process.exit(1);

// ── Generate 100 unique sentences ─────────────────────────────────────────
// Strategy: cycle through VO pairs as the outer loop to maximise variety,
// then round-robin through S, T, P pools.
const sentences = [];
const seen = new Set();

let si = 0, ti = 0, pi = 0;

for (let vo = 0; vo < VO_PAIRS.length && sentences.length < 100; vo++) {
  for (let round = 0; sentences.length < 100; round++) {
    const s = SUBJECTS[si % SUBJECTS.length];
    const t = TIMES[ti % TIMES.length];
    const p = PLACES[pi % PLACES.length];
    const vop = VO_PAIRS[vo];

    const key = `${s.char}|${t.char}|${p.char}|${vop.v}|${vop.o}`;
    if (!seen.has(key)) {
      seen.add(key);
      const idx = sentences.length + 1;
    const audio = `${s.char}${t.char}在${p.char}${vop.v}${vop.o}。`;

    // Build natural English translation
    const tPhrase = {
      '常常': 'often', '经常': 'regularly', '往往': 'usually',
      '时候': 'sometimes', '刚': 'just now', '立刻': 'immediately',
      '曾经': 'once', '一向': 'always',
    }[t.char] || t.en;
    const pPhrase = p.char === '那里' ? 'there' : `at ${p.en}`;
    const eng = `${s.en} ${tPhrase} ${vop.vEn} ${vop.oEn} ${pPhrase}.`;
      sentences.push({ id: `sent-${String(idx).padStart(2,'0')}`, audio, eng, s, t, p, v: vop.v, o: vop.o });
    }

    si++; ti++; pi++;
    if (round > SUBJECTS.length + TIMES.length + PLACES.length + 5) break; // safety
  }
}

console.log(`\nGenerated ${sentences.length} unique sentences`);

// ── Emit TypeScript ────────────────────────────────────────────────────────
const tsLines = sentences.map(sent => {
  const { id, audio, eng, s, t, p, v, o } = sent;
  return `  {
    id: '${id}',
    audioText: '${audio}',
    englishTranslation: '${eng.replace(/'/g, "\\'")}',
    components: [
      { role: 'S', word: VOCAB.find(w => w.traditional === '${s.char}' && w.role === 'S')! },
      { role: 'T', word: VOCAB.find(w => w.traditional === '${t.char}' && w.role === 'T')! },
      { role: 'P', word: VOCAB.find(w => w.traditional === '${p.char}' && w.role === 'P')! },
      { role: 'V', word: VOCAB.find(w => w.traditional === '${v}' && w.role === 'V')! },
      { role: 'O', word: VOCAB.find(w => w.traditional === '${o}' && w.role === 'O')! },
    ],
  },`;
}).join('\n');

// ── Read existing vocab.ts and replace SENTENCE_TEMPLATES block ────────────
let existing = readFileSync(join(root, 'constants', 'vocab.ts'), 'utf8');

const newTemplatesBlock = `export const SENTENCE_TEMPLATES: SentenceTemplate[] = [\n${tsLines}\n];`;
existing = existing.replace(
  /\/\/ ── SENTENCE TEMPLATES[\s\S]*?^export const SENTENCE_TEMPLATES[\s\S]*?\];/m,
  `// ── SENTENCE TEMPLATES ────────────────────────────────────────────────────\n// All component words verified to exist in VOCAB with matching role.\n${newTemplatesBlock}`
);

writeFileSync(join(root, 'constants', 'vocab.ts'), existing, 'utf8');
console.log('✓ vocab.ts updated with 100 sentence templates');

// Print a sample for review
console.log('\nFirst 5 sentences:');
sentences.slice(0, 5).forEach(s => console.log(`  ${s.audio} → ${s.eng}`));
console.log('\nLast 5 sentences:');
sentences.slice(-5).forEach(s => console.log(`  ${s.audio} → ${s.eng}`));
