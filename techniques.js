import {bookTitles} from './book-titles.js?v=1770a8d45b7e';
import {bookExcerpts} from './book-excerpts.js?v=1770a8d45b7e';
import {practiceGuides} from './practice-guides.js?v=1770a8d45b7e';
const original={id:'mantra',name:'Baba Nam Kevalam',kind:'Your original practice',theme:'Sound',format:'Seated',intro:'Let the mantra be your focus.',cue:'Return gently to your mantra.',steps:['Sit comfortably and let your breathing settle.','Repeat Baba Nam Kevalam silently, at an easy pace.','When attention wanders, return gently to the mantra.'],tip:'The optional opening voice says the mantra once. Continue silently in your own rhythm.',source:null};
const savedIds={1:'breath',18:'gaze',38:'listening',51:'joy'};

export const techniques=[original,...Array.from({length:112},(_,i)=>{
  const number=i+1, excerpt=bookExcerpts[number], title=bookTitles[i], guide=practiceGuides[number];
  return {id:savedIds[number] || 'vbt-'+number,number,name:title.title,
    theme:guide.theme,format:guide.format,kind:'Osho · '+guide.mode.toLowerCase(),
    intro:guide.intro,cue:guide.intro,
    steps:guide.steps,paragraphs:excerpt?.paragraphs || [],bookExcerpt:!!excerpt,
    tip:guide.tip,
    source:guide.source || title.source,titleSource:title.source,sourceLabel:'Read Osho’s commentary ↗',approach:guide.mode,
    bookReview:excerpt?'Osho Tapoban · ISBN 978-9937-758-31-4 · p. '+excerpt.page:'Title and number checked against Osho World’s 112-technique catalogue',
    sourceNote:'The practice steps are concise app-written summaries of the linked Osho commentary, not quotations or the complete chapter. '+(guide.mode==='Adapted practice'?'The practice note identifies the adaptation. ':guide.mode==='Teacher-led method'?'These steps explain the method and preparation, not a complete self-guided exercise. ':'Some commentaries offer additional methods; the note identifies when one option is used. ')+(guide.source?'The commentary link opens the corresponding discourse because the catalogue page contains another technique’s commentary. ':'')+(excerpt?'The optional book excerpt below comes from your supplied page photograph; gaps mark omissions. ':'')+'A complete comparison with every page of the Tapoban print edition has not been established.',
    alternative:null,opening:guide.mode==='Teacher-led method'?guide.intro+' '+guide.tip:[...guide.steps,guide.tip].join(' ')};
})];
export const techniqueById=id=>techniques.find(t=>t.id===id) || original;
export const validTechnique=id=>techniques.some(t=>t.id===id);
export function searchTechniques(query='',theme='all',format='all'){
  const term=query.trim().toLowerCase().replace(/^#\s*/,'');
  return techniques.filter(t=>t.number && (theme==='all'||t.theme===theme) && (format==='all'||t.format===format) &&
    (!term || (/^\d+$/.test(term)?t.number===Number(term):[t.name,t.intro,...t.steps,t.tip,...t.paragraphs].join(' ').toLowerCase().includes(term))));
}
