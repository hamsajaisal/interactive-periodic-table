(function() {
  const grid = document.getElementById('grid');
  const live = document.getElementById('live');
  const byNum = new Map(ELEMENTS.map(e=>[e.number,e]));
  const bySym = new Map(ELEMENTS.map(e=>[e.symbol.toUpperCase(),e]));
  const byPos = new Map();
  ELEMENTS.forEach(e=> byPos.set(e.row+','+e.col, e));
  const ROWS=10, COLS=18;
  const catLabels={}; ELEMENTS.forEach(e=>catLabels[e.category]=e.categoryLabel);

  // ---- Build header + cells ----
  const frag=document.createDocumentFragment();
  for(let c=1;c<=COLS;c++){
    const h=document.createElement('div');
    h.className='group-head'; h.setAttribute('role','presentation');
    h.textContent=c; h.style.gridColumn=c; frag.appendChild(h);
  }
  function announceText(el){
    return el.name+'. Symbol '+spaced(el.symbol)+'. Atomic number '+el.number+
           '. Group '+el.group+'. Period '+el.period+'. '+el.categoryLabel+'.';
  }
  function spaced(s){ return s.split('').join(' '); }
  function makeCell(el){
    const b=document.createElement('button');
    b.type='button'; b.className='cell cat-'+el.category;
    b.dataset.num=el.number; b.dataset.cat=el.category; b.dataset.phase=el.phase;
    b.dataset.row=el.row; b.dataset.col=el.col;
    b.style.gridColumn=el.col; b.style.gridRow=el.row+1;
    b.style.setProperty('--phase','var(--p-'+el.phase+')');
    b.setAttribute('role','gridcell'); b.setAttribute('tabindex','-1');
    b.setAttribute('aria-label',announceText(el));
    b.innerHTML='<span class="num" aria-hidden="true">'+el.number+'</span>'+
      '<span class="sym" aria-hidden="true">'+el.symbol+'</span>'+
      '<span class="nm" aria-hidden="true">'+el.name+'</span>';
    return b;
  }
  ELEMENTS.forEach(el=>frag.appendChild(makeCell(el)));
  function marker(t,col,row){const d=document.createElement('div');d.className='placeholder';
    d.setAttribute('role','presentation');d.style.gridColumn=col;d.style.gridRow=row+1;d.textContent=t;frag.appendChild(d);}
  marker('57–71',3,6); marker('89–103',3,7);
  function seriesLabel(t,row){const d=document.createElement('div');d.className='ln-row-label';
    d.setAttribute('role','presentation');d.style.gridRow=row+1;d.textContent=t;frag.appendChild(d);}
  seriesLabel('Lanthanoids',9); seriesLabel('Actinoids',10);
  grid.appendChild(frag);

  function say(msg){ live.textContent=''; requestAnimationFrame(()=>{live.textContent=msg;}); }

  // ---- Roving focus ----
  let activeNum=1;
  const cellOf=n=>grid.querySelector('.cell[data-num="'+n+'"]');
  function setActive(num,{focus=true,announce=true,edgeMsg=null}={}){
    const el=byNum.get(num); if(!el) return;
    grid.querySelectorAll('.cell.is-active').forEach(c=>{c.classList.remove('is-active');c.setAttribute('tabindex','-1');});
    const cell=cellOf(num); cell.classList.add('is-active'); cell.setAttribute('tabindex','0');
    activeNum=num; if(focus) cell.focus();
    if(announce){ let m=announceText(el); if(edgeMsg) m=edgeMsg+' '+m; say(m); }
  }

  function findNeighbor(el,dRow,dCol){
    let r=el.row,c=el.col;
    for(let i=0;i<COLS+ROWS;i++){ r+=dRow;c+=dCol;
      if(r<1||r>ROWS||c<1||c>COLS) return null;
      const hit=byPos.get(r+','+c); if(hit) return hit; }
    return null;
  }
  function move(dRow,dCol){
    const el=byNum.get(activeNum);
    const next=findNeighbor(el,dRow,dCol);
    if(next){ setActive(next.number); return; }
    let msg;
    if(dCol>0) msg='You are at the right edge. No more elements to the right in period '+el.period+'.';
    else if(dCol<0) msg='You are at the left edge. No more elements to the left in period '+el.period+'.';
    else if(dRow<0) msg='Top of this column. No element above in group '+el.group+'.';
    else msg='Bottom of this column. No element below in group '+el.group+'.';
    setActive(activeNum,{edgeMsg:msg});
  }
  function periodEnds(p){
    const inP=ELEMENTS.filter(e=>e.period===p&&e.row<=7).sort((a,b)=>a.col-b.col);
    return {first:inP[0],last:inP[inP.length-1]};
  }
  function whereAmI(){
    const el=byNum.get(activeNum);
    say(el.name+'. Row '+el.row+', group '+el.group+', period '+el.period+'.');
  }

  grid.addEventListener('keydown',ev=>{
    const cell=ev.target.closest('.cell'); if(!cell) return;
    const el=byNum.get(Number(cell.dataset.num));
    switch(ev.key){
      case 'ArrowRight':ev.preventDefault();afterRight(el);break;
      case 'ArrowLeft':ev.preventDefault();move(0,-1);break;
      case 'ArrowDown':ev.preventDefault();move(1,0);break;
      case 'ArrowUp':ev.preventDefault();move(-1,0);break;
      case 'Home':{ev.preventDefault();const{first}=periodEnds(el.period);
        setActive(first.number,{edgeMsg:'First element in period '+el.period+'.'});break;}
      case 'End':{ev.preventDefault();const{last}=periodEnds(el.period);
        setActive(last.number,{edgeMsg:'This is the last element in period '+el.period+'.'});break;}
      case 'Enter':case ' ':ev.preventDefault();openDetail(el.number);break;
      case 'g':case 'G':ev.preventDefault();whereAmI();break;
    }
  });
  function afterRight(el){
    const next=findNeighbor(el,0,1);
    if(next){setActive(next.number);}
    else{const{last}=periodEnds(el.period);
      const msg=(last&&last.number===el.number)?'This is the last element in period '+el.period+'.'
        :'No more elements to the right in period '+el.period+'.';
      setActive(activeNum,{edgeMsg:msg});}
  }

  grid.addEventListener('click',ev=>{const c=ev.target.closest('.cell');if(c)setActive(Number(c.dataset.num));});
  grid.addEventListener('dblclick',ev=>{const c=ev.target.closest('.cell');if(c)openDetail(Number(c.dataset.num));});

  // ---- Search ----
  const input=document.getElementById('symbol-search');
  document.getElementById('search-go').addEventListener('click',()=>runSearch(false));
  input.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();runSearch(ev.shiftKey);}});
  function runSearch(openPanel){
    const q=(input.value||'').trim().toUpperCase();
    if(!q){say('Type a symbol, name, or atomic number, then press Enter.');return;}
    
    let el = null;
    if (/^\d+$/.test(q)) {
      el = byNum.get(Number(q));
    } else {
      el = bySym.get(q);
      if (!el) {
        el = ELEMENTS.find(e => e.name.toUpperCase() === q);
      }
      if (!el) {
        el = ELEMENTS.find(e => e.name.toUpperCase().includes(q));
      }
    }
    
    if(!el){say('No element found for "'+q+'". Try a symbol like Fe, a name like Iron, or a number like 26.');return;}
    setActive(el.number,{focus:true});
    const c=cellOf(el.number); c.classList.add('flash'); setTimeout(()=>c.classList.remove('flash'),1100);
    if(openPanel) openDetail(el.number);
  }

  // ---- Filter by family ----
  const filterSel=document.getElementById('filter-cat');
  Object.keys(catLabels).forEach(cat=>{
    const o=document.createElement('option'); o.value=cat; o.textContent=catLabels[cat];
    filterSel.appendChild(o);
  });
  filterSel.addEventListener('change',()=>{
    const cat=filterSel.value;
    grid.querySelectorAll('.cell').forEach(c=>c.classList.remove('match'));
    if(!cat){ grid.classList.remove('filtering'); say('Showing all families.'); return; }
    grid.classList.add('filtering');
    let n=0;
    grid.querySelectorAll('.cell[data-cat="'+cat+'"]').forEach(c=>{c.classList.add('match');n++;});
    say('Highlighting '+catLabels[cat]+'. '+n+' element'+(n===1?'':'s')+' shown.');
  });

  // ---- Colour by state ----
  const viewSel=document.getElementById('view-mode');
  const legendTitle=document.getElementById('legend-title');
  viewSel.addEventListener('change',()=>{
    if(viewSel.value==='state'){
      grid.classList.add('by-state');
      legendTitle.textContent='State at room temperature';
      renderLegend('state');
      say('Table coloured by state at room temperature. Most elements are solid; mercury and bromine are liquid; eleven are gases.');
    }else{
      grid.classList.remove('by-state');
      legendTitle.textContent='Family colour key';
      renderLegend('category');
      say('Table coloured by element family.');
    }
  });

  // ---- Legend (re-renders for each mode) ----
  const legendItems=document.getElementById('legend-items');
  function renderLegend(mode){
    legendItems.innerHTML='';
    if(mode==='state'){
      [['Solid','--p-Solid'],['Liquid','--p-Liquid'],['Gas','--p-Gas']].forEach(([label,v])=>{
        const s=document.createElement('span');s.className='item';
        s.innerHTML='<span class="swatch" style="--s:var('+v+')"></span>'+label;
        legendItems.appendChild(s);
      });
    }else{
      Object.keys(catLabels).forEach(cat=>{
        const s=document.createElement('span');s.className='item';
        s.innerHTML='<span class="swatch" style="--s:var(--c-'+cat+')"></span>'+catLabels[cat];
        legendItems.appendChild(s);
      });
    }
  }
  renderLegend('category');

  // ---- Detail dialog ----
  const overlay=document.getElementById('overlay'), dialog=document.getElementById('dialog');
  let lastFocused=null;
  const stat=(k,v)=>'<li><span class="k">'+k+'</span><span class="v">'+v+'</span></li>';
  function shellCounts(config){
    const counts={}; const expand={'[He]':2,'[Ne]':10,'[Ar]':18,'[Kr]':36,'[Xe]':54,'[Rn]':86}; let base=0;
    config.split(/\s+/).forEach(t=>{ if(expand[t]!==undefined){base=expand[t];return;}
      const m=t.match(/^(\d)([spdf])(\d+)$/); if(m){const n=+m[1],e=+m[3];counts[n]=(counts[n]||0)+e;} });
    const baseMap={2:[2],10:[2,8],18:[2,8,8],36:[2,8,18,8],54:[2,8,18,18,8],86:[2,8,18,32,18,8]};
    let arr=base&&baseMap[base]?baseMap[base].slice():[];
    Object.keys(counts).map(Number).sort((a,b)=>a-b).forEach(n=>{arr[n-1]=(arr[n-1]||0)+counts[n];});
    return arr.filter(x=>x>0);
  }
  function elementImageSVG(el){
    const cat=getComputedStyle(document.documentElement).getPropertyValue('--c-'+el.category).trim()||'#888';
    const shells=shellCounts(el.config); let rings='',cx=190,cy=110;
    shells.forEach((cnt,i)=>{const r=26+i*16;
      rings+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+cat+'" stroke-opacity="0.55" stroke-width="1.4"/>';
      rings+='<circle cx="'+(cx+r)+'" cy="'+cy+'" r="3.4" fill="'+cat+'"/>';});
    return '<svg viewBox="0 0 380 220" width="100%" height="220" role="img" '+
      'aria-label="Stylised atom diagram of '+el.name+' showing '+shells.length+' electron shells">'+
      '<rect width="380" height="220" fill="#0b1722"/>'+rings+
      '<circle cx="'+cx+'" cy="'+cy+'" r="18" fill="'+cat+'"/>'+
      '<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-family="Segoe UI,sans-serif" font-size="18" font-weight="800" fill="#0b1722">'+el.symbol+'</text>'+
      '<text x="20" y="200" font-family="Segoe UI,sans-serif" font-size="12" fill="#9fb6cf">'+el.name+' · '+shells.length+' shells</text></svg>';
  }
  function openDetail(num){
    const el=byNum.get(num); if(!el) return;
    lastFocused=document.activeElement;
    document.getElementById('dlg-top').style.setProperty('--cat',getComputedStyle(document.documentElement).getPropertyValue('--c-'+el.category));
    document.getElementById('dlg-sym').innerHTML=el.symbol+'<span class="n">'+el.number+'</span>';
    document.getElementById('dlg-name').textContent=el.name;
    document.getElementById('dlg-cat').textContent=el.categoryLabel+' · Group '+el.group+' · Period '+el.period;
    document.getElementById('dlg-img').innerHTML=elementImageSVG(el);
    const shells = shellCounts(el.config);
    document.getElementById('dlg-stats').innerHTML=
      stat('Symbol',el.symbol)+stat('Atomic number',el.number)+stat('Atomic mass',el.mass+' u')+
      stat('Group',el.group)+stat('Period',el.period)+stat('Category',el.categoryLabel)+
      stat('State at room temp.',el.phase)+stat('Electrons per shell',shells.join(', '))+stat('Electron configuration',el.config);
    document.getElementById('dlg-prose').innerHTML=
      '<h3>Discovery</h3><p>'+el.discovery+'</p>'+
      '<h3>What it is used for</h3><p>'+el.uses+'</p>'+
      '<h3>Did you know?</h3><p>'+el.facts+'</p>';
    overlay.classList.add('open'); dialog.focus();
    say('Details opened for '+el.name+'. '+el.categoryLabel+'. Atomic number '+el.number+'. Press Escape to close.');
  }
  function closeDetail(){ if(!overlay.classList.contains('open'))return;
    overlay.classList.remove('open'); if(lastFocused&&lastFocused.focus)lastFocused.focus(); }
  document.getElementById('dlg-close').addEventListener('click',closeDetail);
  overlay.addEventListener('click',ev=>{if(ev.target===overlay)closeDetail();});
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape')closeDetail();
    if(ev.key==='Tab'&&overlay.classList.contains('open')){
      const f=dialog.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])');
      if(!f.length)return; const first=f[0],last=f[f.length-1];
      if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}
      else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}
    }
  });

  // ---- Touch direction pad ----
  if(('ontouchstart' in window)||navigator.maxTouchPoints>0){ document.body.classList.add('touch'); }
  document.querySelector('.dpad').addEventListener('click',ev=>{
    const b=ev.target.closest('button'); if(!b)return;
    const d=b.dataset.dir;
    if(d==='info'){whereAmI();return;}
    if(d==='up')move(-1,0); else if(d==='down')move(1,0);
    else if(d==='left')move(0,-1); else if(d==='right'){afterRight(byNum.get(activeNum));}
  });

  setActive(1,{focus:false,announce:false});
})();