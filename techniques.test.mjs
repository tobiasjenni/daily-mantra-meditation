import test from 'node:test';
import assert from 'node:assert/strict';
import {techniques,techniqueById,searchTechniques} from './techniques.js';
import {bookTitles} from './book-titles.js';
import {practiceGuides} from './practice-guides.js';
import {begin,decode,initialState} from './core.js';

test('all 112 verified titles and saved IDs survive adding practical guides',()=>{
  assert.equal(techniques.length,113);assert.equal(new Set(techniques.map(t=>t.id)).size,113);
  assert.deepEqual(techniques.filter(t=>t.number).map(t=>t.number),Array.from({length:112},(_,i)=>i+1));
  assert.deepEqual(techniques.filter(t=>t.number).map(t=>t.name),bookTitles.map(t=>t.title));
  for(const [id,number] of [['breath',1],['gaze',18],['listening',38],['joy',51]]){
    assert.equal(techniqueById(id).number,number);
    assert.equal(decode(JSON.stringify(begin({...initialState(),technique:id},1000000,'UTC'))).session.technique,id);
  }
});

test('every entry has source-linked guidance, with adaptations and teacher-led limits disclosed',()=>{
  assert.equal(Object.keys(practiceGuides).length,112);
  for(const t of techniques.filter(t=>t.number)){
    assert.equal(t.steps.length,3);
    assert.ok(t.steps.every(s=>s.length>25));
    assert.ok(t.tip.length>20);
    assert.match(t.source,/^https:\/\/oshoworld\.com\/[a-z0-9-]+$/);
    assert.match(t.sourceNote,/not quotations/);
    assert.match(t.opening,new RegExp(t.tip.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.doesNotMatch(t.intro,/Read Osho’s commentary through|awaiting/i);
  }
  assert.deepEqual(techniques.filter(t=>t.approach==='Teacher-led method').map(t=>t.number),[15,34,46]);
  for(const n of [11,27,108])assert.equal(practiceGuides[n].mode,'Adapted practice');
  for(const n of [3,4,5,100])assert.match(practiceGuides[n].source,/vigyan-bhairav-tantra-vol-/);
});

test('specific corrections retain the distinctive source methods',()=>{
  const text=n=>[...practiceGuides[n].steps,practiceGuides[n].tip].join(' ');
  assert.match(text(3),/navel/);
  assert.match(text(22),/backward/);
  assert.match(text(30),/eyes still move/);
  assert.match(text(44),/middle U/);
  assert.match(text(68),/hoped-for future/);assert.match(text(68),/direct experience/);assert.match(text(68),/real action/);
  assert.match(text(82),/not an anatomical body scan/);
  assert.match(text(100),/exhale/);
  assert.match(text(21),/Never injure/);assert.match(text(27),/Do not exercise to collapse/);
  assert.match(text(90),/Never press/);
  assert.match(text(48),/consenting adult/);
  assert.notDeepEqual(practiceGuides[62].steps,practiceGuides[78].steps);
  assert.notDeepEqual(practiceGuides[100].steps,practiceGuides[110].steps);
});

test('supplied excerpts stay separate from the new practical summaries',()=>{
  const caress=techniqueById('vbt-10'),hope=techniqueById('vbt-68');
  assert.equal(caress.name,'Become the caress');assert.equal(hope.name,'Be hope-less');
  assert.ok([caress,hope].every(t=>t.paragraphs.length>0&&t.steps.length===3));
  assert.equal(techniques.filter(t=>t.bookExcerpt).length,2);
  assert.match(hope.sourceNote,/supplied page photograph/);
});

test('library searches titles, numbers, and actual practice details and filters by useful themes',()=>{
  assert.equal(searchTechniques().length,112);
  assert.deepEqual(searchTechniques('#68').map(t=>t.number),[68]);
  assert.deepEqual(searchTechniques('caress').map(t=>t.number),[10]);
  assert.equal(searchTechniques('gentle care of attention').length,0);
  assert.equal(techniqueById('vbt-112').name,'Enter the space within');
  assert.ok(searchTechniques('navel').some(t=>t.number===3));
  assert.ok(searchTechniques('','Breath').every(t=>t.theme==='Breath'));
  assert.deepEqual(searchTechniques('','all','Teacher-led').map(t=>t.number),[15,34,46]);
});
