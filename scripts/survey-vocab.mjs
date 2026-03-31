import { readFileSync } from 'fs';

const raw = JSON.parse(readFileSync('C:/Users/catch/Documents/vocab_2000.json', 'utf8'));
const valid = raw.filter(v => v.traditional !== 'Simplified' && ['S','T','P','V','O'].includes(v.category));

const find = w => valid.find(v => v.traditional === w);
const fmt = v => v ? `rank:${v.rank} cat:${v.category}` : 'MISSING';

console.log('\n=== SUBJECT candidates ===');
['他','她','我们','他们','朋友','老师','学生','妈妈','爸爸','孩子','男人','女人','工人','哥哥','弟弟'].forEach(w => {
  console.log(`  ${w} → ${fmt(find(w))}`);
});

console.log('\n=== VERB candidates ===');
['看','吃','说','做','去','来','买','写','听','读','给','用','想','工作','学习','回','开','走','带','帮','问','告诉'].forEach(w => {
  console.log(`  ${w} → ${fmt(find(w))}`);
});

console.log('\n=== OBJECT candidates ===');
['电影','音乐','书','话','事','问题','钱','饭','水','路','地方','工作','生活','人','东西','孩子','故事','中文','英文'].forEach(w => {
  console.log(`  ${w} → ${fmt(find(w))}`);
});

console.log('\n=== PLACE candidates ===');
['家','学校','公司','中国','图书馆','医院','这里','那里','学校','市场','国内','城市','地方','学校'].forEach(w => {
  console.log(`  ${w} → ${fmt(find(w))}`);
});

console.log('\n=== TIME candidates ===');
['常常','经常','往往','以前','以后','已经','现在','一起','刚','立刻','时候','年','期间','时代','时期','日子'].forEach(w => {
  console.log(`  ${w} → ${fmt(find(w))}`);
});

console.log('\n=== Top 30 T words ===');
valid.filter(v => v.category === 'T').sort((a,b) => a.rank - b.rank).slice(0,30).forEach(v => {
  console.log(`  rank:${v.rank} ${v.traditional} (${v.pinyin}) = ${v.english.slice(0,50)}`);
});
