import test from 'node:test';
import assert from 'node:assert/strict';
import {techniques,searchTechniques,techniqueById} from './techniques.js';
import {catalogRows} from './catalog.js';
import {begin,decode,initialState} from './core.js';
test('the complete library has each number 1–112 exactly once and preserves the original mantra',()=>{
  assert.equal(techniques.length,113);assert.equal(new Set(techniques.map(t=>t.id)).size,113);
  assert.deepEqual(techniques.filter(t=>t.number).map(t=>t.number),Array.from({length:112},(_,i)=>i+1));
  assert.ok(catalogRows.every(row=>row.length===9));
  for(const t of techniques.filter(t=>t.number)){
    assert.equal(t.steps.length,3);assert.ok(t.steps.every(s=>typeof s==='string'&&s.length>30));
    assert.ok(t.tip.length>30);assert.ok(t.opening.length>50);assert.ok(t.source.startsWith('https://'));
    assert.equal(decode(JSON.stringify(begin({...initialState(),technique:t.id},1000000,'UTC'))).session.technique,t.id);
  }
  assert.equal(techniqueById('mantra').number,undefined);assert.equal(techniqueById('breath').number,1);assert.equal(techniqueById('joy').number,51);
});
test('library searches names, phrases, exact numbers, themes, and practice types',()=>{
  assert.equal(searchTechniques().length,112);assert.deepEqual(searchTechniques('#38').map(t=>t.number),[38]);
  assert.deepEqual(searchTechniques('112').map(t=>t.number),[112]);assert.equal(searchTechniques('0').length,0);
  assert.ok(searchTechniques('  BREATH  ').length>0);assert.ok(searchTechniques('', 'Sound').every(t=>t.theme==='Sound'));
  assert.equal(searchTechniques('', 'all','Adult context').length,3);
  assert.ok(searchTechniques('', 'Body','Adapted').length>0);assert.equal(searchTechniques('<script>').length,0);
});
