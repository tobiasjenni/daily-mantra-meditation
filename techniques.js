import {bookTitles} from './book-titles.js?v=f61d236dfea3';
import {bookExcerpts} from './book-excerpts.js?v=f61d236dfea3';
const original={id:'mantra',name:'Baba Nam Kevalam',kind:'Your original practice',theme:'Sound',format:'Seated',intro:'Let the mantra be your focus.',cue:'Return gently to your mantra.',steps:['Sit comfortably and let your breathing settle.','Repeat Baba Nam Kevalam silently, at an easy pace.','When attention wanders, return gently to the mantra.'],tip:'The optional opening voice says the mantra once. Continue silently in your own rhythm.',source:null};
const savedIds={1:'breath',18:'gaze',38:'listening',51:'joy'};

export const techniques=[original,...Array.from({length:112},(_,i)=>{
  const number=i+1, excerpt=bookExcerpts[number], title=bookTitles[i];
  return {id:savedIds[number] || 'vbt-'+number,number,name:title.title,
    theme:excerpt?'Book excerpt':'Read at source',format:excerpt?'Book excerpt':'Read at source',kind:excerpt?'Osho · book excerpt':'Osho · source-linked practice',
    intro:excerpt?.verse || 'Read Osho’s commentary through the source link below.',cue:excerpt?.verse || 'Read Osho’s commentary through the source link below.',
    steps:[],paragraphs:excerpt?.paragraphs || [],bookExcerpt:!!excerpt,
    tip:excerpt?'Selected passages from the supplied photograph of page '+excerpt.page+'. Gaps between passages are omissions. The continuation is not available.':'The linked source provides the commentary for this technique. The timer is available for your practice.',
    source:title.source,sourceLabel:'Read Osho’s commentary ↗',approach:excerpt?'Quoted book excerpt':'Title verified · Osho World',
    bookReview:excerpt?'Osho Tapoban · ISBN 978-9937-758-31-4 · p. '+excerpt.page:'Title and number checked against Osho World’s 112-technique catalogue',
    sourceNote:excerpt?'The verse and commentary passages are transcribed from the supplied opening-page photograph. Only typography has been normalized; these excerpts are not a complete chapter.':'This title and number are taken from Osho World’s numbered catalogue, and the link opens its matching commentary. Wording can differ between editions; this does not establish an exact match to every heading in the Tapoban edition. No substitute exercise is supplied.',
    alternative:null,opening:excerpt?.verse || ''};
})];
export const techniqueById=id=>techniques.find(t=>t.id===id) || original;
export const validTechnique=id=>techniques.some(t=>t.id===id);
export function searchTechniques(query='',theme='all',format='all'){
  const term=query.trim().toLowerCase().replace(/^#\s*/,'');
  return techniques.filter(t=>t.number && (theme==='all'||t.theme===theme) && (format==='all'||t.format===format) &&
    (!term || (/^\d+$/.test(term)?t.number===Number(term):[t.name,t.intro,...t.paragraphs].join(' ').toLowerCase().includes(term))));
}
