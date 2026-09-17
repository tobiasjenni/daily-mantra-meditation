import {bookExcerpts} from './book-excerpts.js?v=663af7d3c71c';
const original={id:'mantra',name:'Baba Nam Kevalam',kind:'Your original practice',theme:'Sound',format:'Seated',intro:'Let the mantra be your focus.',cue:'Return gently to your mantra.',steps:['Sit comfortably and let your breathing settle.','Repeat Baba Nam Kevalam silently, at an easy pace.','When attention wanders, return gently to the mantra.'],tip:'The optional opening voice says the mantra once. Continue silently in your own rhythm.',source:null};
const savedIds={1:'breath',18:'gaze',38:'listening',51:'joy'};

const edition='https://www.exoticindiaart.com/book/details/vigyan-bhairav-tantra-book-of-secrets-112-techniques-of-meditation-hbd575/';
export const techniques=[original,...Array.from({length:112},(_,i)=>{
  const number=i+1, excerpt=bookExcerpts[number];
  return {id:savedIds[number] || 'vbt-'+number,number,name:excerpt?.name || 'Technique '+number,
    theme:excerpt?'Book excerpt':'Awaiting text',format:excerpt?'Book excerpt':'Awaiting text',kind:excerpt?'Osho · book excerpt':'Book text pending',
    intro:excerpt?.verse || 'The matching book text has not been supplied.',cue:excerpt?.verse || 'The matching book text has not been supplied.',
    steps:[],paragraphs:excerpt?.paragraphs || [],bookExcerpt:!!excerpt,
    tip:excerpt?'Selected passages from the supplied photograph of page '+excerpt.page+'. Gaps between passages are omissions. The continuation is not available.':'The previous app-written guide is withheld until the matching book pages are available. The timer can still be used independently.',
    source:edition,sourceLabel:'View the identified book edition ↗',approach:excerpt?'Quoted book excerpt':'Awaiting book text',
    bookReview:excerpt?'Osho Tapoban · ISBN 978-9937-758-31-4 · p. '+excerpt.page:'Osho Tapoban · ISBN 978-9937-758-31-4 · text pending',
    sourceNote:excerpt?'The verse and commentary passages are transcribed from the supplied opening-page photograph. Only typography has been normalized; these excerpts are not a complete chapter.':'The edition is identified, but its instructions for this number have not been supplied. No substitute exercise or diagram is shown.',
    alternative:null,opening:excerpt?.verse || ''};
})];
export const techniqueById=id=>techniques.find(t=>t.id===id) || original;
export const validTechnique=id=>techniques.some(t=>t.id===id);
export function searchTechniques(query='',theme='all',format='all'){
  const term=query.trim().toLowerCase().replace(/^#\s*/,'');
  return techniques.filter(t=>t.number && (theme==='all'||t.theme===theme) && (format==='all'||t.format===format) &&
    (!term || (/^\d+$/.test(term)?t.number===Number(term):[t.name,t.intro,...t.paragraphs].join(' ').toLowerCase().includes(term))));
}
