(() => {
  const WA = '5492926506666';
  const root = document.documentElement;
  root.classList.add('js-reveal');
  const mobile = window.matchMedia('(max-width: 760px)');

  /* Menú móvil */
  const toggle = document.querySelector('.bar-toggle');
  const menu = document.getElementById('menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Cerrar' : 'Menú';
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menú'; }
  });

  /* WhatsApp fijo: aparece después del hero */
  const floatWa = document.querySelector('.float-wa');
  const hero = document.querySelector('.hero');
  const onScroll = () => floatWa.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6 && !ticket.classList.contains('is-open'));
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Entradas escalonadas por sección */
  document.querySelectorAll('section').forEach((sec) => {
    sec.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal, .frame').forEach((el) => io.observe(el));

  /* Video del hero: corre igual con "reducir animaciones", con botón para pausar */
  const video = document.querySelector('.hero-video');
  const vbtn = document.querySelector('.vid-toggle');
  const tryPlay = () => { const p = video.play(); if (p) p.catch(() => {}); };
  tryPlay();
  vbtn.addEventListener('click', () => {
    if (video.paused) { tryPlay(); vbtn.textContent = 'Pausar'; vbtn.setAttribute('aria-pressed', 'false'); }
    else { video.pause(); vbtn.textContent = 'Reproducir'; vbtn.setAttribute('aria-pressed', 'true'); }
  });

  /* Tablero de salidas */
  const board = document.querySelector('.board');
  const groups = [...board.tBodies];
  const rows = [...board.querySelectorAll('tbody tr:not(.month)')];
  const chips = [...document.querySelectorAll('.chip')];
  const ticket = document.getElementById('ticket');
  const form = document.getElementById('ticket-form');
  const el = (id) => document.getElementById(id);
  const pax = el('t-pax');
  const send = el('t-send');
  let picked = null;

  const money = (n, usd) => usd ? `U$D ${n.toLocaleString('es-AR')}` : `$${n.toLocaleString('es-AR')}`;

  const filter = (key) => {
    chips.forEach((c) => { const on = c.dataset.month === key; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    groups.forEach((g) => {
      let any = false;
      [...g.rows].forEach((r) => {
        if (r.classList.contains('month')) return;
        const show = key === 'all' || g.dataset.month === key || (key === 'camboriu' && r.dataset.tag === 'camboriu');
        r.hidden = !show; if (show) any = true;
      });
      g.hidden = !any;
    });
  };
  chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.month)));
  document.querySelectorAll('[data-filter]').forEach((a) => a.addEventListener('click', () => filter(a.dataset.filter)));

  const update = () => {
    const n = Math.max(1, Math.min(40, parseInt(pax.value, 10) || 1));
    if (String(n) !== pax.value) pax.value = n;
    const name = el('t-name').value.trim();
    if (!picked) return;
    const d = picked.dataset;
    const usd = d.mon === 'USD';
    const price = Number(d.precio) || 0;
    el('t-total').textContent = price ? `${money(price * n, usd)}` : 'A consultar';
    const lines = [
      `Hola Electroturismo! Quiero consultar por la salida a ${d.dest} del ${d.fecha} (${d.dur}).`,
      `Somos ${n} ${n === 1 ? 'pasajero' : 'pasajeros'}.`,
    ];
    if (price) lines.push(`Vi el precio de ${money(price, usd)} por persona en la web.`);
    if (name) lines.push(`Mi nombre es ${name}.`);
    lines.push('¿Hay lugar?');
    send.href = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const pick = (row, open) => {
    if (picked) picked.classList.remove('is-picked');
    picked = row; row.classList.add('is-picked');
    const d = row.dataset;
    el('t-dest').textContent = d.dest;
    el('t-when').textContent = `Sale el ${d.fecha} · ${d.dur}`;
    el('t-inc').textContent = [d.inc, 'seguro médico y coordinación permanente'].filter(Boolean).join(' · ');
    el('t-opc-row').hidden = !d.opc;
    el('t-opc').textContent = d.opc || '';
    update();
    if (open && mobile.matches) { ticket.classList.add('is-open'); onScroll(); }
  };
  rows.forEach((r) => r.addEventListener('click', () => pick(r, true)));
  pick(rows[0], false);

  el('t-close').addEventListener('click', () => { ticket.classList.remove('is-open'); onScroll(); });
  form.addEventListener('input', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    pax.value = Math.max(1, Math.min(40, (parseInt(pax.value, 10) || 1) + Number(b.dataset.step)));
    update();
  }));

  /* Compartir */
  const share = document.getElementById('share');
  share.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Electroturismo · Desde Suárez', url: location.href });
      else { await navigator.clipboard.writeText(location.href); share.textContent = 'Link copiado'; }
    } catch (e) { /* cancelado */ }
  });

  onScroll();
})();
