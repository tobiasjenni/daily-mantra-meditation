import {techniques,searchTechniques} from './techniques.js';
export const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function setupLibrary(selectTechnique,isActive){
  const $=id=>document.getElementById(id);
  const recommended=[1,18,32,38,51,98];
  $('technique').innerHTML='<option value="mantra">Baba Nam Kevalam · original practice</option><optgroup label="Gentle starting points">'+techniques.filter(t=>recommended.includes(t.number)).map(option).join('')+'</optgroup><optgroup label="The remaining techniques">'+techniques.filter(t=>t.number&&!recommended.includes(t.number)).map(option).join('')+'</optgroup>';
  $('library-theme').innerHTML='<option value="all">All themes</option>'+[...new Set(techniques.filter(t=>t.number).map(t=>t.theme))].sort().map(t=>`<option>${escapeHtml(t)}</option>`).join('');
  $('library-format').innerHTML='<option value="all">All practice types</option>'+[...new Set(techniques.filter(t=>t.number).map(t=>t.format))].sort().map(t=>`<option>${escapeHtml(t)}</option>`).join('');
  function option(t){return `<option value="${t.id}">${t.number}. ${escapeHtml(t.name)}</option>`;}
  function renderResults(){
    const found=searchTechniques($('library-search').value,$('library-theme').value,$('library-format').value);
    $('library-count').textContent=`${found.length} of 112 techniques`;
    $('library-lock').hidden=!isActive();
    $('library-results').innerHTML=found.map(t=>`<button type="button" class="library-card" data-technique="${t.id}" ${isActive()?'disabled':''}><span class="library-number">${String(t.number).padStart(3,'0')}</span><span class="library-card-body"><span class="library-card-title">${escapeHtml(t.name)}</span><span class="library-card-meta">${escapeHtml(t.theme)} · ${escapeHtml(t.format)}</span><span class="library-card-focus">${escapeHtml(t.intro)}</span></span></button>`).join('');
    $('library-empty').hidden=found.length>0;
  }
  $('browse-techniques').addEventListener('click',()=>{renderResults();$('library-dialog').showModal();});
  for(const id of ['library-search','library-theme','library-format'])$(id).addEventListener(id==='library-search'?'input':'change',renderResults);
  $('library-clear').addEventListener('click',()=>{$('library-search').value='';$('library-theme').value='all';$('library-format').value='all';renderResults();});
  $('library-results').addEventListener('click',event=>{
    const button=event.target.closest('button[data-technique]');
    if(!button || isActive())return;
    if(selectTechnique(button.dataset.technique))$('library-dialog').close();
  });
}
