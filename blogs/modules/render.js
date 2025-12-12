// modules/render.js
import { state, humanDate } from './data.js';

/* --- DOM Helpers --- */
export function $(sel){return document.querySelector(sel)}
export function create(el, attrs={}, children=null){
  const e = document.createElement(el);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k==='class') e.className = v;
    else if(k==='html') e.innerHTML = v;
    else e.setAttribute(k,v);
  });
  if(children){
    if(Array.isArray(children)) children.forEach(c=>e.appendChild(c));
    else e.appendChild(children);
  }
  return e;
}

/* --- Funciones de Renderizado --- */

export function renderTags(){
  const area = $('#tagsArea'); area.innerHTML = '';
  const tags = [...new Set(state.postList.flatMap(p=>p.tags||[]))].sort();
  
  const allChip = create('button',{class:`chip ${state.activeTags.size===0?'active':''}`, type:'button'});
  allChip.textContent = 'Todas';
  allChip.onclick = ()=>{ state.activeTags.clear(); renderMain(); };
  area.appendChild(allChip);

  tags.forEach(t=>{
    const btn = create('button',{class:`chip ${state.activeTags.has(t)?'active':''}`, type:'button'});
    btn.textContent = t;
    btn.onclick = ()=>{
      if(state.activeTags.has(t)) state.activeTags.delete(t); else state.activeTags.add(t);
      renderMain();
    };
    area.appendChild(btn);
  });
}

export function openPostModal(p){
  const tpl = document.getElementById('modalTpl').content.cloneNode(true);
  const bd = tpl.querySelector('.modal-backdrop');
  bd.querySelector('#modalTitle').textContent = p.title;
  bd.querySelector('#modalMeta').textContent = `${p.author} — ${humanDate(p.date)}`;
  bd.querySelector('#modalContent').innerHTML = p.content;
  bd.querySelector('#modalClose').onclick = ()=> bd.remove();
  bd.onclick = (e)=> { if(e.target===bd) bd.remove(); };
  document.body.appendChild(bd);
}


export function renderPosts(){
  const grid = $('#postsGrid'); grid.innerHTML = '';
  const q = state.query.toLowerCase();
  
  let filtered = state.postList.filter(p=>{
    if(state.activeTags.size>0 && !p.tags.some(t=>state.activeTags.has(t))) return false;
    if(q && !(p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q))) return false;
    return true;
  }).sort((a,b)=> new Date(b.date) - new Date(a.date));

  if(filtered.length===0) return grid.innerHTML = `<div class="card"><p class="excerpt">No se encontraron resultados.</p></div>`;

  filtered.forEach(p=>{
    const feed = state.feedList.find(f=>f.id===p.feedId) || {};
    const card = create('article',{class:'card'});
    
    // Header card
    const meta = create('div',{class:'meta'});
    meta.appendChild(create('div',{class:'avatar', html: (feed.title||p.author).slice(0,1)}));
    meta.appendChild(create('div',{html:`<strong class="title">${p.title}</strong><br><small class="small">${p.author} · ${humanDate(p.date)}</small>`}));
    card.appendChild(meta);
    
    card.appendChild(create('p',{class:'excerpt', html: p.excerpt}));
    
    // Footer card
    const footer = create('footer',{},[
      create('div',{class:'tags'}, p.tags.map(t=>create('span',{class:'tag',html:t}))),
      create('button',{class:'read-btn', type:'button', html:'Leer'})
    ]);
    footer.querySelector('.read-btn').onclick = ()=> openPostModal(p);
    card.appendChild(footer);
    
    grid.appendChild(card);
  });
}

export function renderFeeds(){
  const list = $('#feedList'); list.innerHTML = '';
  state.feedList.forEach(f=>{
    const item = create('div',{class:'feed-item'});
    item.innerHTML = `<img src="${f.logo}" onerror="this.style.display='none'"><div><strong style="font-family:'Maven Pro'">${f.title}</strong><br><small class="small">${f.url}</small></div>`;
    list.appendChild(item);
  });
  $('#statCount').textContent = `${state.postList.length} publicaciones · ${state.feedList.length} fuentes`;
}

// Función principal que llama a todas
export function renderMain(){ renderTags(); renderPosts(); renderFeeds(); }