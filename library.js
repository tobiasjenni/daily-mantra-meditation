import {techniques,searchTechniques} from './techniques.js?v=1770a8d45b7e';
export const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function setupLibrary(selectTechnique,isActive){
  const $=id=>document.getElementById(id);
  $('technique').innerHTML='<option value="mantra">Baba Nam Kevalam · original practice</option><optgroup label="Osho · 112 techniques">'+techniques.filter(t=>t.number).map(option).join('')+'</optgroup>';
  $('library-theme').innerHTML='<option value="all">All themes</option>'+[...new Set(techniques.filter(t=>t.number).map(t=>t.theme))].sort().map(t=>`<option>${escapeHtml(t)}</option>`).join('');
  $('library-format').innerHTML='<option value="all">All practice types</option>'+[...new Set(techniques.filter(t=>t.number).map(t=>t.format))].sort().map(t=>`<option>${escapeHtml(t)}</option>`).join('');
  function option(t){return `<option value="${t.id}">${t.number}. ${escapeHtml(t.name)}</option>`;}
  function renderResults(){
    const found=searchTechniques($('library-search').value,$('library-theme').value,$('library-format').value).filter(t=>!$('library-visual').checked || false);
    $('library-count').textContent=`${found.length} of 112 techniques`;
    $('library-lock').hidden=!isActive();
    $('library-results').innerHTML=found.map(t=>`<button type="button" class="library-card" data-technique="${t.id}" ${isActive()?'disabled':''}><span class="library-number">${String(t.number).padStart(3,'0')}</span><span class="library-card-body"><span class="library-card-title">${escapeHtml(t.name)}</span><span class="library-card-meta">${escapeHtml(t.theme)} · ${escapeHtml(t.format)}</span><span class="library-card-focus">${escapeHtml(t.intro)}</span><span class="library-card-tags">${t.approach==='Adapted practice'?'<span>Adapted practice</span>':''}${t.approach==='Teacher-led method'?'<span>Teacher-led</span>':''}</span></span></button>`).join('');
    $('library-empty').hidden=found.length>0;
  }
  $('browse-techniques').addEventListener('click',()=>{renderResults();$('library-dialog').showModal();});
  for(const id of ['library-search','library-theme','library-format','library-visual'])$(id).addEventListener(id==='library-search'?'input':'change',renderResults);
  $('library-clear').addEventListener('click',()=>{$('library-search').value='';$('library-theme').value='all';$('library-format').value='all';$('library-visual').checked=false;renderResults();});
  $('library-results').addEventListener('click',event=>{
    const button=event.target.closest('button[data-technique]');
    if(!button || isActive())return;
    if(selectTechnique(button.dataset.technique))$('library-dialog').close();
  });
}
