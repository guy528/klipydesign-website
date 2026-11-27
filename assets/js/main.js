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
  const figs = $$('.caps__fig img');
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

