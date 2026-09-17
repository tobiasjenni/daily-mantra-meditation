import test from 'node:test';
import assert from 'node:assert/strict';
import {techniques,techniqueById,searchTechniques} from './techniques.js';
import {begin,decode,initialState} from './core.js';
test('all numbered slots and saved IDs survive the switch to supplied book text',()=>{
  assert.equal(techniques.length,113);assert.equal(new Set(techniques.map(t=>t.id)).size,113);
  assert.deepEqual(techniques.filter(t=>t.number).map(t=>t.number),Array.from({length:112},(_,i)=>i+1));
  for(const [id,number] of [['breath',1],['gaze',18],['listening',38],['joy',51]]){
    assert.equal(techniqueById(id).number,number);
    assert.equal(decode(JSON.stringify(begin({...initialState(),technique:id},1000000,'UTC'))).session.technique,id);
  }
  assert.equal(techniqueById('mantra').steps.length,3);
});
test('missing book text cannot expose or speak an invented practice',()=>{
  const missing=techniques.filter(t=>t.number&&!t.bookExcerpt);assert.equal(missing.length,110);
  for(const t of missing){assert.equal(t.opening,'');assert.deepEqual(t.steps,[]);assert.deepEqual(t.paragraphs,[]);assert.equal(t.alternative,null);assert.equal(t.name,'Technique '+t.number);}
  const caress=techniqueById('vbt-10'),hope=techniqueById('vbt-68');
  assert.equal(caress.name,'Become the caress');assert.equal(hope.name,'Be hope-less');
  assert.equal(hope.opening,'As a hen mothers her chicks, mother particular knowings, particular doings, in reality.');
  assert.equal(caress.opening,'While being caressed, sweet princess, enter the caressing as everlasting life.');
  assert.ok([caress,hope].every(t=>t.paragraphs.length>0&&t.steps.length===0));
});
test('book library searches the supplied text and numbered pending slots',()=>{
  assert.equal(searchTechniques().length,112);assert.deepEqual(searchTechniques('#68').map(t=>t.number),[68]);
  assert.deepEqual(searchTechniques('caress').map(t=>t.number),[10]);assert.equal(searchTechniques('gentle care of attention').length,0);
  assert.equal(searchTechniques('','Awaiting text').length,110);assert.equal(searchTechniques('','Book excerpt').length,2);
});
