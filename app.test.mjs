import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KEY} from './core.js';

test('Start speaks once; pause/resume, reload, storage synchronization and ticks never replay it',async()=>{
  const elements=new Map();
  for(const [,id] of readFileSync(new URL('./index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g)) {
    elements.set(id,{style:{},value:'6',checked:false,disabled:false,hidden:false,textContent:'',innerHTML:'',listeners:{},addEventListener(name,callback){this.listeners[name]=callback;},showModal(){}});
  }
  const windowEvents={};const documentEvents={};const speech=[];const data=new Map();
  globalThis.document={title:'',visibilityState:'visible',getElementById:id=>elements.get(id),addEventListener:(e,fn)=>documentEvents[e]=fn};
  globalThis.window={addEventListener:(e,fn)=>windowEvents[e]=fn,speechSynthesis:{getVoices:()=>[],cancel(){},speak:u=>speech.push(u)},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
  globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const realInterval=globalThis.setInterval;let tick;
  globalThis.setInterval=fn=>{tick=fn;return 0;};
  const realNow=Date.now;let now=Date.parse('2026-09-10T10:00:00Z');Date.now=()=>now;
  try {
    await import('./app.js?first');
    assert.equal(speech.length,0);assert.equal(data.size,0);assert.equal(elements.get('countdown').textContent,'06:00');
    elements.get('start').listeners.click();assert.equal(speech.length,1);
    now+=10000;tick();assert.equal(elements.get('countdown').textContent,'05:50');
    elements.get('start').listeners.click();now+=30000;tick();assert.equal(elements.get('countdown').textContent,'05:50');
    elements.get('start').listeners.click();assert.equal(speech.length,1);
    await import('./app.js?reload');assert.equal(speech.length,1);
    windowEvents.storage({key:KEY,newValue:data.get(KEY)});documentEvents.visibilitychange();assert.equal(speech.length,1);
    now+=500000;tick();assert.equal(elements.get('countdown').textContent,'00:00');assert.equal(elements.get('start-label').textContent,'Meditate again');
    elements.get('start').listeners.click();assert.equal(speech.length,2);
    elements.get('reset').listeners.click();assert.equal(elements.get('countdown').textContent,'06:00');
    assert.ok(JSON.parse(data.get(KEY)).startDate);
  } finally {globalThis.setInterval=realInterval;Date.now=realNow;}
});
