import {KEY,initialState,plan,remaining,begin,pause,resume,settle,decode} from './core.js';
import {speakMantra} from './audio.js';
const $=id=>document.getElementById(id);
let state=initialState();
let storageOK=true;
try {state=decode(localStorage.getItem(KEY));} catch {storageOK=false;}
let audioContext=null;
let wakeLock=null;
let acquiringWakeLock=false;
let lastPlanDay=null;
let lastStatus=null;
const speechAvailable='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
function updateVoiceChoices(){
  if(!speechAvailable)return;
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const voices=window.speechSynthesis.getVoices().filter(v=>/^(en|hi)(?:-|$)/i.test(v.lang));
  $('voice-choice').innerHTML='<option value="">Automatic · Hindi or English</option>'+voices.map(v=>`<option value="${escape(v.voiceURI)}">${escape(v.name)} · ${escape(v.lang)}</option>`).join('');
  $('voice-choice').value=voices.some(v=>v.voiceURI===state.voiceURI) ? state.voiceURI:'';
}
function feedback(message) {$('feedback').textContent=message;}
function persist() {
  try {localStorage.setItem(KEY,JSON.stringify(state));}
  catch {storageOK=false;feedback('This browser couldn’t save your practice. Keep this page open; your progress may reset on your next visit.');}
}
function prepareBell() {
  if(!state.bell) return;
  try {const Audio=window.AudioContext || window.webkitAudioContext; if(Audio){audioContext ||= new Audio();audioContext.resume().catch(()=>feedback('Sound is unavailable. The timer will still finish on screen.'));}}
  catch {feedback('Sound is unavailable. The timer will still finish on screen.');}
}
function ringBell() {
  if(!state.bell || !audioContext || audioContext.state!=='running') return;
  try {
    const now=audioContext.currentTime;
    for(const [frequency,volume] of [[523.25,.12],[1046.5,.035],[1569.75,.012]]) {
      const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+3.5);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+3.6);
    }
  } catch {feedback('Your meditation is complete. The bell couldn’t play on this device.');}
}
async function keepAwake() {
  if(!('wakeLock' in navigator) || wakeLock || acquiringWakeLock || document.visibilityState!=='visible' || state.session?.status!=='running') return;
  acquiringWakeLock=true;
  try {
    const lock=await navigator.wakeLock.request('screen');
    if(state.session?.status!=='running'){await lock.release();return;}
    wakeLock=lock;
    lock.addEventListener('release',()=>{if(wakeLock===lock)wakeLock=null;});
  } catch {} finally {acquiringWakeLock=false;}
}
function releaseAwake() {if(wakeLock){const lock=wakeLock;wakeLock=null;lock.release().catch(()=>{});}}
function render() {
  const now=Date.now();const next=settle(state,now);
  if(next!==state){state=next;persist();ringBell();releaseAwake();}
  const p=plan(state,now);const s=state.session;const status=s?.status || 'ready';
  const milliseconds=s ? remaining(s,now) : p.minutes*60000;
  const seconds=Math.ceil(milliseconds/1000);
  const time=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('countdown').textContent=time;
  $('ring-progress').style.strokeDashoffset=String(s ? 1-milliseconds/s.totalMs : 0);
  document.title=status==='running' || status==='paused' ? `${time} · Daily Mantra` : 'Daily Mantra · Baba Nam Kevalam';
  $('day-label').textContent=state.startDate ? `DAY ${p.day} OF YOUR PRACTICE` : 'YOUR FIRST DAY';
  $('timer-note').textContent=status==='done' ? 'Take a quiet moment.' : `${s ? Math.round(s.totalMs/60000) : p.minutes} minutes ${s ? 'for this session':'today'}`;
  $('timer-caption').textContent={ready:'TIME FOR YOURSELF',running:'RETURN TO YOUR MANTRA',paused:'TAKE YOUR TIME',done:'SESSION COMPLETE'}[status];
  if(status!==lastStatus){
    $('session-status').textContent={ready:'Ready when you are.',running:'Baba Nam Kevalam',paused:'Paused. Continue when you’re ready.',done:'Your meditation is complete.'}[status];
    lastStatus=status;
  }
  $('start-label').textContent={ready:'Start meditation',running:'Pause',paused:'Resume meditation',done:'Meditate again'}[status];
  $('play-icon').innerHTML=status==='running' ? '<path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor"/>' : '<path d="M8 5v14l11-7z" fill="currentColor"/>';
  $('reset').hidden=!s;
  $('bell').checked=state.bell;$('voice').checked=state.voice;
  const active=status==='running' || status==='paused';
  for(const id of ['duration','apply-duration','use-plan']) $(id).disabled=active;
  $('rhythm-summary').textContent=`${p.minutes} min · +1 each day`;
  if(lastPlanDay!==p.today && !active){$('duration').value=p.minutes;lastPlanDay=p.today;}
  $('use-plan').hidden=!state.override || state.override.date!==p.today;
  $('restart-plan').hidden=!state.startDate;
  $('start-date').textContent=state.startDate ? `Started ${state.startDate}. Calendar days follow ${state.zone.replaceAll('_',' ')}.` : 'Your practice hasn’t started yet.';
  $('progression-copy').textContent=state.startDate ? `Your suggested duration today is ${p.suggested} minutes. Add 1 minute each calendar day—even on days you skip. Resetting the timer keeps your progression.` : 'Day one begins when you first press Start. Begin with 6 minutes, then add 1 minute each calendar day—even on days you skip.';
}
$('start').addEventListener('click',()=>{
  feedback('');const status=state.session?.status;
  if(status==='running'){state=pause(state);releaseAwake();}
  else if(status==='paused'){state=resume(state);prepareBell();void keepAwake();}
  else {
    state=begin(state);prepareBell();void keepAwake();
    if(state.voice) speakMantra(window.speechSynthesis,window.SpeechSynthesisUtterance,()=>feedback('Your device couldn’t speak the mantra. You can begin silently: Baba Nam Kevalam.'),state.voiceURI);
  }
  persist();render();
});
$('reset').addEventListener('click',()=>{
  state={...state,session:null};window.speechSynthesis?.cancel();releaseAwake();persist();lastPlanDay=null;render();feedback('Timer reset. Your daily progression is unchanged.');
});
$('bell').addEventListener('change',()=>{state.bell=$('bell').checked;prepareBell();persist();});
$('voice').addEventListener('change',()=>{state.voice=$('voice').checked;if(!state.voice)window.speechSynthesis?.cancel();persist();});
$('voice-choice').addEventListener('change',()=>{state.voiceURI=$('voice-choice').value || null;persist();feedback('Voice saved for your next meditation.');});
function setDuration(minutes) {
  if(['running','paused'].includes(state.session?.status))throw new Error('Reset or complete the current session before changing its duration.');
  if(!Number.isInteger(minutes) || minutes<1 || minutes>180)throw new Error('Choose a whole number from 1 to 180 minutes.');
  state={...state,override:{date:plan(state).today,minutes},session:null};persist();render();feedback(`Today’s meditation is set to ${minutes} ${minutes===1?'minute':'minutes'}.`);
  $('duration').value=minutes;
  return {minutes,date:plan(state).today,status:'ready'};
}
$('apply-duration').addEventListener('click',()=>{
  try {setDuration(Number($('duration').value));} catch(error){feedback(error.message);}
});
$('use-plan').addEventListener('click',()=>{state={...state,override:null,session:null};persist();lastPlanDay=null;render();feedback('Your suggested daily duration is restored.');});
$('restart-plan').addEventListener('click',()=>$('restart-dialog').showModal());
$('restart-dialog').addEventListener('close',()=>{
  if($('restart-dialog').returnValue!=='restart')return;
  state={...initialState(),bell:state.bell,voice:state.voice,voiceURI:state.voiceURI};window.speechSynthesis?.cancel();releaseAwake();persist();lastPlanDay=null;render();feedback('Your next Start begins day one at 6 minutes.');
});
window.addEventListener('storage',event=>{
  if(event.key!==KEY && event.key!==null)return;
  state=decode(event.newValue);lastPlanDay=null;render();updateVoiceChoices();
  if(state.session?.status==='running')void keepAwake();else releaseAwake();
});
document.addEventListener('visibilitychange',()=>{render();if(document.visibilityState==='visible')void keepAwake();});
window.addEventListener('pageshow',()=>{render();void keepAwake();});
// Prime the platform's voice list without saying anything or starting a session.
if(speechAvailable){updateVoiceChoices();window.speechSynthesis.addEventListener?.('voiceschanged',updateVoiceChoices);}
else {$('voice').disabled=true;$('voice-choice').disabled=true;$('voice-description').textContent='Speech is unavailable in this browser. Repeat the mantra silently.';}
render();
if(!storageOK)feedback('Storage is unavailable in this browser. Your practice will last only while this page stays open.');
setInterval(render,250);
// Optional agent controls use the same state and duration action as the visible UI.
// Starting stays on the visible button so the opening voice receives a user gesture.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const definitions=[
    {name:'read_meditation_timer',title:'Read meditation timer',description:'Read the current timer and today’s suggested duration. Does not start a session.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input || typeof input!=='object' || Object.keys(input).length)throw new Error('No input properties are accepted.');render();const p=plan(state);return {status:state.session?.status || 'ready',remainingSeconds:Math.ceil(state.session ? remaining(state.session)/1000:p.minutes*60),day:p.day,todayMinutes:p.minutes,suggestedMinutes:p.suggested};}},
    {name:'set_today_meditation_duration',title:'Set today’s meditation duration',description:'Set today’s duration from 1 to 180 minutes before a session. This does not start the timer or change tomorrow’s progression.',inputSchema:{type:'object',properties:{minutes:{type:'integer',minimum:1,maximum:180}},required:['minutes'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input || typeof input!=='object' || Object.keys(input).some(k=>k!=='minutes'))throw new Error('Provide only minutes.');return setDuration(input.minutes);}}
  ];
  for(const tool of definitions){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',event=>{if(!event.persisted)lifecycle.abort();});
}
