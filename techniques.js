import {catalogRows} from './catalog.js';
import {practiceNotes,approachLabels,alternatives} from './practice-notes.js';
export const sourceText='https://sa.wikibooks.org/wiki/%E0%A4%B5%E0%A4%BF%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%BE%E0%A4%A8%E0%A4%AD%E0%A5%88%E0%A4%B0%E0%A4%B5';
const original={id:'mantra',name:'Baba Nam Kevalam',kind:'Your original practice',theme:'Sound',format:'Seated',intro:'Let the mantra be your focus.',cue:'Return gently to your mantra.',steps:['Sit comfortably and let your breathing settle.','Repeat Baba Nam Kevalam silently, at an easy pace.','When attention wanders, return gently to the mantra.'],tip:'The optional opening voice says the mantra once. Continue silently in your own rhythm.',source:null};
const savedIds={1:'breath',18:'gaze',38:'listening',51:'joy'};
export const techniques=[original,...catalogRows.map(([number,name,theme,format,intro,prepare,attend,continuePractice,tip])=>({
  id:savedIds[number] || `vbt-${number}`,number:Number(number),name,theme,format,kind:`${theme} · ${format}`,intro,cue:intro,
  steps:[prepare,attend,continuePractice],tip,source:practiceNotes[number].source,sourceLabel:practiceNotes[number].sourceLabel,bookReview:practiceNotes[number].bookReview,
  approach:approachLabels[practiceNotes[number].approach],sourceNote:practiceNotes[number].note,alternative:alternatives[number] || null,
  opening:`${intro} ${prepare} ${attend}`
}))];
export const techniqueById=id=>techniques.find(t=>t.id===id) || original;
export const validTechnique=id=>techniques.some(t=>t.id===id);
export function searchTechniques(query='',theme='all',format='all'){
  const term=query.trim().toLowerCase().replace(/^#\s*/,'');
  return techniques.filter(t=>t.number && (theme==='all'||t.theme===theme) && (format==='all'||(format==='Adapted'?t.approach==='Adapted practice':t.format===format)) &&
    (!term || (/^\d+$/.test(term) ? t.number===Number(term) : `${t.name} ${t.theme} ${t.format} ${t.intro} ${t.steps.join(' ')}`.toLowerCase().includes(term))));
}
