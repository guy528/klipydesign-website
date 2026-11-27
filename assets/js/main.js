/* KLIPYDESIGN.COM — interactions (no dependencies). Runs on the homepage and the category pages. */
(() => {
  'use strict';

  /* ---------- SETTINGS: edit these ---------- */
  // Free form backend: create a form at https://formspree.io and paste its ID here.
  // Until then, the form opens the visitor's email app with the brief filled in.
  const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  const CONTACT_EMAIL = 'klipy_info@klipydesign.com';
  const MORPH_EVERY_MS = 3600; // how often the hero mosaic changes shape
  /* ------------------------------------------ */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  requestAnimationFrame(() => setTimeout(() => root.classList.add('is-ready'), 60));
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    if (!burger) return;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (burger) burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- scroll progress + active section in the menu ---------- */
  const progress = $('.header__progress');
  const navLinks = $$('#nav a[href^="#"]');
  const watched = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    let current = null;
    watched.forEach((sec) => { if (sec.getBoundingClientRect().top < innerHeight * 0.4) current = sec.id; });
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    stepsFill();
  };

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---------- hero: morphing category mosaic ---------- */
  const mosaic = $('#mosaic');
  if (mosaic) {
    const tiles = $$('.tile', mosaic);
    const caption = $('#mosaicCaption');
    if (!fine) caption.textContent = 'Five categories · tap a colour to explore';
    const captionDefault = caption.textContent;
    const nameEl = $('#mosaicName');
    const dotsEl = $('#mosaicDots');
    const pauseBtn = $('#mosaicPause');
    const cursor = $('#mosaicCursor');

    // Layouts on a 10 × 10 grid: [x, y, w, h, shape]. shape: 'p' pill, 'c' circle, 'r' rectangle,
    // or [tl, tr, br, bl] = which corners become a full quarter-circle.
    const LAYOUTS = [
      { name: 'Skyline', tiles: [[0, 4.4, 2, 5.6, 'p'], [2, 1.4, 2, 8.6, 'p'], [4, 3.2, 2, 6.8, 'p'], [6, 0, 2, 10, 'p'], [8, 3.8, 2, 6.2, 'p']] },
      { name: 'Grid', tiles: [[0, 0, 4, 6, 'r'], [4, 0, 6, 4, 'r'], [4, 4, 3, 6, 'r'], [0, 6, 4, 4, 'r'], [7, 4, 3, 6, 'r']] },
      { name: 'Bauhaus', tiles: [[0, 0, 4, 6, [0, 0, 0, 1]], [4, 0, 6, 4, [0, 1, 1, 0]], [4, 4, 3, 6, [1, 1, 0, 0]], [0, 6, 4, 4, [1, 0, 0, 0]], [7, 4, 3, 6, [0, 0, 1, 0]]] },
      { name: 'Orbit', tiles: [[0, 0, 4.5, 4.5, 'c'], [4.8, 0.7, 2.8, 2.8, 'c'], [4.5, 4, 5.5, 5.5, 'c'], [0.5, 5, 3.5, 3.5, 'c'], [7.6, 0, 2.4, 2.4, 'c']] }
    ];
    let current = 0, hovered = null, paused = reduce, inView = true, timer = null;

    const dots = LAYOUTS.map((l, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show the ${l.name} layout`);
      b.innerHTML = '<i></i>';
      b.addEventListener('click', () => { morphTo(i); restart(); });
      dotsEl.appendChild(b);
      return b;
    });

    function render() {
      const W = mosaic.clientWidth, H = mosaic.clientHeight;
      const u = W / 10, v = H / 10, g = Math.max(8, Math.round(W / 60));
      LAYOUTS[current].tiles.forEach(([x, y, w, h, shape], i) => {
        const t = tiles[i];
        const pw = w * u - g, ph = h * v - g, m = Math.min(pw, ph);
        let r;
        if (shape === 'p') r = '999px';
        else if (shape === 'c') r = '50%';
        else if (shape === 'r') r = '6px';
        else r = shape.map((f) => (f ? m + 'px' : '6px')).join(' ');
        Object.assign(t.style, { left: x * u + g / 2 + 'px', top: y * v + g / 2 + 'px', width: pw + 'px', height: ph + 'px', borderRadius: r });
        t.classList.toggle('is-tall', pw / ph < 0.62);
        t.classList.toggle('is-round', shape === 'c');
        t.classList.toggle('is-small', m < 170);
        t.classList.toggle('label-top', Array.isArray(shape) && (shape[2] || shape[3]) && !shape[0] && !shape[1]);
      });
      nameEl.textContent = LAYOUTS[current].name;
      dots.forEach((d, i) => d.setAttribute('aria-current', i === current));
    }
    // Wave morph: each capsule starts a beat after the previous one, with a little squash
    function morphTo(n) {
      current = n;
      if (!reduce) {
        tiles.forEach((t, i) => {
          const d = i * 0.07 + 's';
          t.style.transitionDelay = `${d},${d},${d},${d},${d},0s,0s,0s`;
          t.style.setProperty('--d', d);
        });
        mosaic.classList.remove('is-morphing'); void mosaic.offsetWidth; mosaic.classList.add('is-morphing');
        clearTimeout(morphT);
        morphT = setTimeout(() => { mosaic.classList.remove('is-morphing'); tiles.forEach((t) => { t.style.transitionDelay = ''; }); }, 1500);
      }
      render();
    }
    let morphT;
    function next() { morphTo((current + 1) % LAYOUTS.length); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => { if (!paused && hovered === null && inView && !document.hidden) next(); }, MORPH_EVERY_MS);
    }
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-pressed', paused);
    });
    if (reduce) { pauseBtn.textContent = 'Play'; pauseBtn.setAttribute('aria-pressed', 'true'); }

    const enter = (t, i) => {
      hovered = i;
      mosaic.classList.add('has-hover');
      tiles.forEach((x) => x.classList.toggle('is-hover', x === t));
      caption.textContent = `${String(i + 1).padStart(2, '0')} · ${t.dataset.name} — click to explore`;
      if (cursor) cursor.textContent = `Explore ${t.dataset.name} →`;
    };
    const leave = () => {
      hovered = null;
      mosaic.classList.remove('has-hover');
      tiles.forEach((x) => x.classList.remove('is-hover'));
      caption.textContent = captionDefault;
      if (cursor) cursor.classList.remove('on');
    };
    tiles.forEach((t, i) => {
      t.addEventListener('mouseenter', () => enter(t, i));
      t.addEventListener('focus', () => enter(t, i));
      t.addEventListener('mouseleave', leave);
      t.addEventListener('blur', leave);
      // entrance: scale in one after another
      t.style.transitionDelay = `0s,0s,0s,0s,0s,0s,${0.25 + i * 0.08}s,0s`;
      setTimeout(() => { t.style.transitionDelay = ''; }, 1600);
    });
    tiles.forEach((t, i) => t.style.setProperty('--i', i));
    // 3D tilt: the whole composition leans toward the cursor
    const stage = mosaic.parentElement;
    if (fine && !reduce) {
      stage.addEventListener('mousemove', (e) => {
        const r = mosaic.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        mosaic.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        mosaic.style.setProperty('--rx', (py * -9).toFixed(2) + 'deg');
      });
      stage.addEventListener('mouseleave', () => { mosaic.style.setProperty('--ry', '0deg'); mosaic.style.setProperty('--rx', '0deg'); });
    }
    if (fine && cursor) {
      mosaic.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 34 + 'px';
        if (hovered !== null) cursor.classList.add('on');
      });
    }
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }).observe(mosaic);
    let rT;
    addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(render, 100); });
    render();
    restart();
  }

  /* ---------- projects page: category filter ---------- */
  const filters = $$('.filter');
  if (filters.length) {
    const cards = $$('#projectGrid .pcard');
    const empty = $('#noProjects');
    const apply = (cat) => {
      let shown = 0;
      cards.forEach((c) => { const on = cat === 'all' || c.dataset.cat === cat; c.hidden = !on; if (on) shown++; });
      filters.forEach((f) => { const on = f.dataset.filter === cat; f.classList.toggle('is-on', on); f.setAttribute('aria-pressed', on); });
      if (empty) empty.hidden = shown > 0;
    };
    filters.forEach((f) => f.addEventListener('click', () => {
      apply(f.dataset.filter);
      history.replaceState(null, '', f.dataset.filter === 'all' ? location.pathname : '#' + f.dataset.filter);
    }));
    const start = location.hash.slice(1);
    if (start && filters.some((f) => f.dataset.filter === start)) apply(start);
  }

  /* ---------- selected works accordion ---------- */
  const works = $$('.work');
  const openWork = (i) => works.forEach((w, j) => {
    w.classList.toggle('is-open', i === j);
    $('.work__tab', w).setAttribute('aria-expanded', i === j);
  });
  works.forEach((w, i) => $('.work__tab', w).addEventListener('click', () => openWork(i)));

  /* ---------- capabilities accordion + figure swap ---------- */
  const caps = $$('.cap');
  const figs = $$('.caps__fig > img, .caps__fig > .caps__slide');
  const capNames = ['Concept design', '3D prototyping', 'Functional mechanisms', 'Design for manufacturing'];
  caps.forEach((cap, i) => {
    $('button', cap).addEventListener('click', () => {
      caps.forEach((c, j) => {
        c.classList.toggle('is-open', i === j);
        $('button', c).setAttribute('aria-expanded', i === j);
      });
      figs.forEach((f, j) => f.classList.toggle('is-on', i === j));
      const n = String(i + 1).padStart(2, '0');
      if ($('#capNum')) $('#capNum').textContent = n;
      if ($('#capCount')) $('#capCount').textContent = n;
      if ($('#capTag')) $('#capTag').textContent = capNames[i];
    });
  });

  /* ---------- years in practice ---------- */
  $$('[data-count="since"]').forEach((el) => {
    el.dataset.count = String(new Date().getFullYear() - +el.dataset.since);
    el.textContent = el.dataset.count;
  });

  /* ---------- reveal on scroll, staggered groups, counters ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count;
    if (reduce || !end) return;
    const t0 = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('.stagger').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('[data-count]', en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.15 });
  $$('.reveal, .stagger').forEach((el) => io.observe(el));

  /* ---------- process line fills as you scroll ---------- */
  const steps = $('#steps');
  const items = steps ? $$('li', steps) : [];
  function stepsFill() {
    if (!steps) return;
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    steps.style.setProperty('--fill', p.toFixed(3));
    items.forEach((li, i) => li.classList.toggle('on', p >= i / (items.length - 1) - 0.001));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- contact form ---------- */
  const form = $('#brief');
  if (form) {
    const status = $('.form__status', form);
    const submit = $('button[type=submit]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.closest('.field').classList.toggle('invalid', bad);
        f.setAttribute('aria-invalid', bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) { status.classList.add('err'); status.textContent = 'Please add your name, a valid email and a few words about the project.'; return; }

      const data = new FormData(form);
      if (data.get('_gotcha')) return;

      if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
        const body = [
          `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Company: ${data.get('company') || '—'}`,
          `Focus: ${data.getAll('focus').join(', ') || '—'}`, '', data.get('message')
        ].join('\n');
        location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Project brief — ' + data.get('name'))}&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening your email app…';
        return;
      }

      submit.disabled = true;
      status.textContent = 'Sending…';
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.classList.add('ok');
        status.textContent = 'Thank you — your brief is in. We reply within one working day.';
      } catch (err) {
        status.classList.add('err');
        status.textContent = `Something went wrong. Please email us at ${CONTACT_EMAIL}.`;
      } finally {
        submit.disabled = false;
      }
    });
  }
})();


/* ---------- homepage video header ---------- */
(function(){
  var v=document.getElementById('vheroVideo'),b=document.getElementById('vheroPause'),hero=document.querySelector('.vhero'),root=document.documentElement;
  if(!hero) return;
  if(b&&v){b.addEventListener('click',function(){if(v.paused){v.play();b.textContent='Pause';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Pause background video')}else{v.pause();b.textContent='Play';b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Play background video')}});}
  function onScroll(){var on=window.scrollY < hero.offsetHeight-80 && !document.body.classList.contains('nav-open');root.classList.toggle('on-video',on)}
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  if('IntersectionObserver' in window&&v){new IntersectionObserver(function(e){if(b&&b.getAttribute('aria-pressed')==='true')return;e[0].isIntersecting?v.play().catch(function(){}):v.pause()}).observe(hero)}
})();


/* Works gallery: square tiles on a scattered 4-column grid, hover swaps to the in-use photo,
   a "View project" cursor follows the pointer, and on touch screens visible tiles slowly alternate photos. */
(function(){
  var grid=document.getElementById('galGrid'); if(!grid) return;
  var MAX_TILES=20; /* show at most 20 projects; the rest stay on the All projects page */
  var tiles=[].slice.call(grid.querySelectorAll('.gtile'));
  for(var si=tiles.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var tmp=tiles[si];tiles[si]=tiles[sj];tiles[sj]=tmp} /* random order on every visit */
  tiles.slice(MAX_TILES).forEach(function(t){t.remove()});
  tiles=tiles.slice(0,MAX_TILES);
  /* Square tiles on a 4-column grid, like a scattered contact sheet: most take one cell, some take a 2x2 block,
     and a few cells stay empty on purpose. Each entry is [start column, cells wide]. */
  var PATTERN=[[1,1],[4,1],[1,1],[3,2],[2,1],[1,1],[2,1],[4,1],[1,2],[4,1],[3,1]];
  tiles.forEach(function(t,i){var p=PATTERN[i%PATTERN.length]; t.style.setProperty('--gc',p[0]); t.style.setProperty('--gs',p[1]); if(p[1]>1) t.classList.add('gtile--big'); grid.appendChild(t)});
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window && !reduce){
    tiles.forEach(function(t){ if(t.getBoundingClientRect().top>innerHeight) t.classList.add('g-hide') });
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.remove('g-hide'); io.unobserve(e.target)} })},{rootMargin:'0px 0px -8% 0px'});
    tiles.forEach(function(t){io.observe(t)});
  }
  var cur=document.getElementById('galCursor');
  if(matchMedia('(hover:hover)').matches && cur){
    tiles.forEach(function(t){
      t.addEventListener('mouseenter',function(){cur.classList.add('is-on')});
      t.addEventListener('mouseleave',function(){cur.classList.remove('is-on')});
    });
    addEventListener('mousemove',function(e){cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px'},{passive:true});
  } else if(!reduce && 'IntersectionObserver' in window){
    var vis=new Set();
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?vis.add(e.target):(vis.delete(e.target),e.target.classList.remove('is-alt'))})},{threshold:.6});
    tiles.forEach(function(t){io2.observe(t)});
    setInterval(function(){vis.forEach(function(t){t.classList.toggle('is-alt')})},2800);
  }
})();

/* ---------- capabilities: concept-sketch slideshow ----------
   For each sketch (random order): 1) construction lines, circles and dimension marks draw themselves,
   2) the sketch's own outlines (found with edge detection) are traced in by a scanning line,
   3) the real image fades in and the drawing dissolves. Then it holds, and the next sketch starts. */
(function(){
  var box=document.getElementById('capSketches'); if(!box) return;
  var imgs=[].slice.call(box.querySelectorAll('img')); if(!imgs.length) return;
  for(var i=imgs.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1));var t=imgs[i];imgs[i]=imgs[k];imgs[k]=t}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DRAW=1900, MELT=1000, HOLD=3200;               /* timings in ms */
  var LINE='rgba(214,232,255,', RED='#F32836';
  var cv=document.createElement('canvas'); cv.className='caps__draw'; cv.setAttribute('aria-hidden','true'); box.appendChild(cv);
  var ctx=cv.getContext('2d'), W=0, H=0, dpr=1;
  function fit(){W=box.clientWidth;H=box.clientHeight;dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  function loaded(im){return new Promise(function(res){if(!im.getAttribute('src')) im.src=im.dataset.src; if(im.complete&&im.naturalWidth) res(im); else {im.onload=function(){res(im)};im.onerror=function(){res(im)}}})}
  function cover(iw,ih,w,h){var s=Math.max(w/iw,h/ih);var dw=iw*s,dh=ih*s;return [(w-dw)/2,(h-dh)/2,dw,dh]}
  /* outline map of the image, same crop as object-fit:cover */
  var cache={};
  function edges(im){
    var key=im.dataset.src+'|'+W+'x'+H; if(cache[key]) return cache[key];
    var sc=Math.min(1,560/Math.max(W,H)), w=Math.max(1,Math.round(W*sc)), h=Math.max(1,Math.round(H*sc));
    var o=document.createElement('canvas'); o.width=w;o.height=h; var c=o.getContext('2d',{willReadFrequently:true});
    var r=cover(im.naturalWidth||1,im.naturalHeight||1,w,h); c.drawImage(im,r[0],r[1],r[2],r[3]);
    var d; try{d=c.getImageData(0,0,w,h).data}catch(e){return null}
    var g=new Float32Array(w*h),b=new Float32Array(w*h),m=new Float32Array(w*h),x,y,p;
    for(p=0;p<w*h;p++) g[p]=.299*d[p*4]+.587*d[p*4+1]+.114*d[p*4+2];
    for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){p=y*w+x;b[p]=(g[p]*4+g[p-1]+g[p+1]+g[p-w]+g[p+w])/8}
    var hist=new Uint32Array(256),n=0;
    for(y=2;y<h-2;y++)for(x=2;x<w-2;x++){p=y*w+x;
      var gx=b[p-w+1]+2*b[p+1]+b[p+w+1]-b[p-w-1]-2*b[p-1]-b[p+w-1];
      var gy=b[p+w-1]+2*b[p+w]+b[p+w+1]-b[p-w-1]-2*b[p-w]-b[p-w+1];
      var v=Math.min(255,Math.sqrt(gx*gx+gy*gy)/2); m[p]=v; hist[v|0]++; n++}
    var keep=n*0.10, acc=0, th=255; for(th=255;th>0;th--){acc+=hist[th]; if(acc>=keep) break}
    var out=c.createImageData(w,h);
    for(p=0;p<w*h;p++){ if(m[p]>=th){var a=Math.min(1,(m[p]-th)/(th*0.6+1)+.35); out.data[p*4]=214;out.data[p*4+1]=232;out.data[p*4+2]=255;out.data[p*4+3]=a*255} }
    c.putImageData(out,0,0); return cache[key]=o;
  }
  /* a fresh set of construction geometry for each sketch */
  function geometry(){
    var cx=W*(.38+Math.random()*.24), cy=H*(.36+Math.random()*.28), R=Math.min(W,H)*(.22+Math.random()*.12);
    var dimY=H*(.86+Math.random()*.05), ang=(Math.random()<.5?-1:1)*Math.PI/4;
    var labels=['Ø '+Math.round(40+Math.random()*80),'R'+Math.round(4+Math.random()*20),'A–A','1:1','SECTION B','SCALE 2:1'];
    return {cx:cx,cy:cy,R:R,r2:R*(.45+Math.random()*.2),dimY:dimY,ang:ang,lab:labels[Math.floor(Math.random()*labels.length)],lab2:Math.round(60+Math.random()*180)+' mm'};
  }
  function seg(x1,y1,x2,y2,p){if(p<=0)return;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1+(x2-x1)*p,y1+(y2-y1)*p);ctx.stroke()}
  function clamp(v){return v<0?0:v>1?1:v}
  function ease(v){return v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2}
  function frame(t,G,E){
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    var melt=clamp((t-DRAW)/MELT); ctx.globalAlpha=1-melt;
    /* faint drafting grid */
    var gp=clamp(t/500); ctx.strokeStyle=LINE+(0.07*gp)+')'; ctx.lineWidth=1;
    for(var gx=24;gx<W;gx+=24){ctx.beginPath();ctx.moveTo(gx+.5,0);ctx.lineTo(gx+.5,H);ctx.stroke()}
    for(var gy=24;gy<H;gy+=24){ctx.beginPath();ctx.moveTo(0,gy+.5);ctx.lineTo(W,gy+.5);ctx.stroke()}
    /* centre lines, circles, diagonal */
    var p1=ease(clamp(t/700)), p2=ease(clamp((t-250)/900)), p3=ease(clamp((t-650)/800)), p4=ease(clamp((t-1000)/700));
    ctx.setLineDash([10,4,2,4]); ctx.strokeStyle=RED; ctx.lineWidth=1;
    seg(0,G.cy,W,G.cy,p1); seg(G.cx,0,G.cx,H,p1); ctx.setLineDash([]);
    ctx.strokeStyle=LINE+'.75)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(G.cx,G.cy,G.R,-Math.PI/2,-Math.PI/2+Math.PI*2*p2); ctx.stroke();
    ctx.beginPath(); ctx.arc(G.cx,G.cy,G.r2,Math.PI/2,Math.PI/2+Math.PI*2*p3); ctx.stroke();
    seg(G.cx,G.cy,G.cx+Math.cos(G.ang)*G.R*1.5,G.cy+Math.sin(G.ang)*G.R*1.5,p3);
    /* dimension line with ticks and label */
    ctx.strokeStyle=LINE+'.8)'; var x1=G.cx-G.R, x2=G.cx+G.R;
    seg(x1,G.dimY,x2,G.dimY,p4); seg(x1,G.cy,x1,G.dimY+8,p4); seg(x2,G.cy,x2,G.dimY+8,p4);
    if(p4>.6){ctx.globalAlpha=(1-melt)*clamp((p4-.6)/.4); ctx.fillStyle=LINE+'.95)'; ctx.font='500 11px "JetBrains Mono",ui-monospace,monospace'; ctx.textAlign='center';
      ctx.fillText(G.lab2,(x1+x2)/2,G.dimY-7); ctx.textAlign='left'; ctx.fillText(G.lab,G.cx+G.R*.72+8,G.cy-G.R*.72-6); ctx.globalAlpha=1-melt}
    /* the sketch's own outlines, traced in by a scanning line */
    var sw=ease(clamp((t-350)/(DRAW-350)));
    if(E&&sw>0){ctx.save();ctx.beginPath();ctx.rect(0,0,W*sw,H);ctx.clip();ctx.drawImage(E,0,0,W,H);ctx.restore()}
    if(sw>0&&sw<1){ctx.strokeStyle=RED;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(W*sw,0);ctx.lineTo(W*sw,H);ctx.stroke()}
    ctx.globalAlpha=1;
  }
  var n=-1, visible=true, timer=null;
  if('IntersectionObserver' in window) new IntersectionObserver(function(e){visible=e[0].isIntersecting}).observe(box);
  function active(){return visible&&!document.hidden&&box.classList.contains('is-on')}
  function next(){
    if(!active()){timer=setTimeout(next,600);return}
    var prev=imgs[n]; n=(n+1)%imgs.length; var im=imgs[n];
    loaded(im).then(function(){
      loaded(imgs[(n+1)%imgs.length]);
      if(prev) prev.classList.remove('is-show');
      if(reduce){im.classList.add('is-show');timer=setTimeout(next,HOLD+DRAW);return}
      fit(); var G=geometry(), E=null; try{E=edges(im)}catch(e){}
      var t0=performance.now(), shown=false;
      (function tick(now){
        var t=now-t0; frame(t,G,E);
        if(!shown&&t>=DRAW){im.classList.add('is-show');shown=true}
        if(t<DRAW+MELT) requestAnimationFrame(tick); else {ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);timer=setTimeout(next,HOLD)}
      })(t0);
    });
  }
  next();
  addEventListener('resize',function(){cache={}});
})();
