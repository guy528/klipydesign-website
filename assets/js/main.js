/* KLIPYDESIGN.COM — interactions (no dependencies) */
(() => {
  'use strict';

  /* ---------- SETTINGS: edit these ---------- */
  // Free form backend: create a form at https://formspree.io and paste its ID here.
  // Until then, the form opens the visitor's email app with the brief filled in.
  const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  const CONTACT_EMAIL = 'studio@klipydesign.com';
  /* ------------------------------------------ */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => setTimeout(() => root.classList.add('is-ready'), 60));
  $('#year').textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- selected works accordion ---------- */
  const works = $$('.work');
  const openWork = (i) => works.forEach((w, j) => {
    const on = i === j;
    w.classList.toggle('is-open', on);
    $('.work__tab', w).setAttribute('aria-expanded', on);
  });
  works.forEach((w, i) => $('.work__tab', w).addEventListener('click', () => openWork(i)));

  /* ---------- hero bars: preview + open project ---------- */
  const foot = $('.chart__foot span');
  const footDefault = foot.textContent;
  $$('.bar').forEach((bar) => {
    const name = $('.bar__info b', bar).textContent;
    const type = $('.bar__info span', bar).textContent;
    const num = $('.bar__num', bar).textContent;
    const show = () => { foot.textContent = `${num} · ${name} — ${type} · click to open`; };
    const hide = () => { foot.textContent = footDefault; };
    bar.addEventListener('mouseenter', show);
    bar.addEventListener('focus', show);
    bar.addEventListener('mouseleave', hide);
    bar.addEventListener('blur', hide);
    bar.addEventListener('click', () => openWork(+bar.dataset.open));
  });

  /* ---------- capabilities accordion + figure swap ---------- */
  const caps = $$('.cap');
  const figs = $$('.caps__fig img');
  const names = ['Concept design', '3D prototyping', 'Functional mechanisms', 'Design for manufacturing'];
  caps.forEach((cap, i) => {
    $('button', cap).addEventListener('click', () => {
      caps.forEach((c, j) => {
        c.classList.toggle('is-open', i === j);
        $('button', c).setAttribute('aria-expanded', i === j);
      });
      figs.forEach((f, j) => f.classList.toggle('is-on', i === j));
      const n = String(i + 1).padStart(2, '0');
      $('#capNum').textContent = n;
      $('#capCount').textContent = n;
      $('#capTag').textContent = names[i];
    });
  });

  /* ---------- years in practice ---------- */
  $$('[data-count="since"]').forEach((el) => {
    el.dataset.count = String(new Date().getFullYear() - +el.dataset.since);
    el.textContent = el.dataset.count;
  });

  /* ---------- reveal on scroll + counters ---------- */
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
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    if (en.target.matches('.stats')) $$('[data-count]', en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.2 });
  $$('.reveal, .stats').forEach((el) => io.observe(el));

  /* ---------- process line fills as you scroll ---------- */
  const steps = $('#steps');
  const items = $$('li', steps);
  const onScroll = () => {
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    steps.style.setProperty('--fill', p.toFixed(3));
    items.forEach((li, i) => li.classList.toggle('on', p >= i / (items.length - 1) - 0.001));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- contact form ---------- */
  const form = $('#brief');
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
})();
