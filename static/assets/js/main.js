// Мобильное меню
const burger = document.querySelector('.burger');
const mnav = document.querySelector('.mnav');
if (burger && mnav) {
  burger.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  });
}

// Фильтр программ
document.querySelectorAll('[data-filter]').forEach(group => {
  const cards = document.querySelectorAll('[data-cat]');
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      const f = chip.dataset.value;
      cards.forEach(c => { c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none'; });
    });
  });
});
const search = document.querySelector('#prog-search');
if (search) {
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('[data-cat]').forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// Переключатели (одиночный выбор в группе)
document.querySelectorAll('[data-choice]').forEach(group => {
  group.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      group.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      updateDonate();
    });
  });
});

// Форма пожертвования (подписи берутся из data-атрибутов формы на нужном языке)
const LOCALE = document.documentElement.lang === 'en' ? 'en-US' : 'ru-RU';
function fmt(n){ return n.toLocaleString(LOCALE).replace(/\u00a0/g,' '); }
function updateDonate(){
  const form = document.querySelector('#donate-form');
  if (!form) return;
  const L = form.dataset;
  const custom = form.querySelector('[name=amount_custom]');
  const sel = form.querySelector('.amounts .on');
  const amount = custom && custom.value ? parseInt(custom.value.replace(/\D/g,''),10) : (sel ? parseInt(sel.dataset.v,10) : 0);
  const period = form.querySelector('.seg .on');
  const monthly = period && period.dataset.v === 'monthly';
  form.querySelector('[name=amount]').value = amount || '';
  form.querySelector('[name=period]').value = monthly ? L.lSegMonthly : L.lSegOnce;
  const pay = form.querySelector('.pay .on');
  if (pay) form.querySelector('[name=payment]').value = pay.textContent.trim();
  form.querySelector('.donate-title').textContent = monthly ? L.lMonthly : L.lOnce;
  form.querySelector('.donate-btn').textContent = amount ? `${L.lBtn} ₸ ${fmt(amount)}${monthly ? ' ' + L.lPermonth : ''}` : L.lBtn;
}
const custom = document.querySelector('[name=amount_custom]');
if (custom) custom.addEventListener('input', () => {
  if (custom.value) document.querySelectorAll('.amounts button').forEach(x => x.classList.remove('on'));
  updateDonate();
});
document.querySelectorAll('.opt').forEach(o => o.addEventListener('click', () => {
  document.querySelectorAll('.opt').forEach(x => x.classList.remove('on'));
  o.classList.add('on');
  const seg = document.querySelector('.seg');
  if (seg && o.dataset.period) {
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === o.dataset.period));
    updateDonate();
  }
  if (o.dataset.href) location.href = o.dataset.href;
}));
updateDonate();

// Текущий год в подвале
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Режим предпросмотра (без сервера форм): показываем подтверждение на месте
if (window.PREVIEW) {
  document.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    f.innerHTML = '<h3 class="h3">Спасибо!</h3><p class="txt">Это предпросмотр: на опубликованном сайте заявка придёт в раздел Forms на Netlify.</p>';
  }));
}

// ===== Анимации =====
window.__rv = 1;
(function () {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  // Шапка с тенью при прокрутке
  const hdr = document.querySelector('.hdr');
  // Параллакс паттерна в шапках страниц
  const phero = document.querySelector('.phero');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (hdr) hdr.classList.toggle('scrolled', y > 8);
      if (motion && phero && y < 900) phero.style.setProperty('--py', (y * 0.25).toFixed(1) + 'px');
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (!motion || !('IntersectionObserver' in window)) return;

  // Появление блоков при прокрутке (с лёгкой лесенкой внутри одной сетки)
  const SEL = '.sec .head, .split > *, .grid > *, .card, .val, .pt, .person, .rowline, .numbox, .pr, .mv, .why, .doc-gh, .pt-gh, .pt-total, .req, .faq details, .empty-state, .marquee, .vline, .txt-col, .cta > *';
  const els = [...document.querySelectorAll(SEL)].filter(e => !e.closest('.hero, .phero, .hdr, .ftr, .mnav') && !e.parentElement.closest('.rv'));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(e => {
    if (e.parentElement.closest('.rv')) return;
    const sibs = [...e.parentElement.children].filter(c => els.includes(c));
    const i = sibs.indexOf(e);
    e.style.setProperty('--d', Math.min(i % 8, 6) * 0.08 + 's');
    e.classList.add('rv'); io.observe(e);
  });

  // Счётчики цифр
  const nums = document.querySelectorAll('.stat b, .numbox b, .kpi b, .pt-total b');
  const cio = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, txt = el.textContent, m = txt.match(/\d+(?:[.,]\d+)?/);
    if (!m) return;
    const dec = (m[0].split(/[.,]/)[1] || '').length, sep = m[0].includes(',') ? ',' : '.';
    const end = parseFloat(m[0].replace(',', '.')), t0 = performance.now(), dur = 1600;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = txt.replace(m[0], (end * e).toFixed(dec).replace('.', sep));
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    };
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  nums.forEach(n => cio.observe(n));
})();

// ===== Обратная связь (окно «Написать нам») =====
(function () {
  const dlg = document.querySelector('.fb-dlg');
  if (!dlg) return;
  const form = dlg.querySelector('.fb-form'), body = dlg.querySelector('.fb-body'), ok = dlg.querySelector('.fb-ok');
  const open = (topicIdx, msg) => {
    body.hidden = false; ok.hidden = true; dlg.querySelector('.fb-err').hidden = true;
    const sel = form.topic;
    if (topicIdx != null && sel.options[+topicIdx + 1]) sel.selectedIndex = +topicIdx + 1;
    if (msg && !form.message.value) form.message.value = msg;
    form.elements['Страница'].value = location.href;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.classList.add('fb-lock');
    setTimeout(() => form.name.focus(), 50);
  };
  const close = () => { dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  dlg.addEventListener('close', () => document.body.classList.remove('fb-lock'));
  document.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(b.dataset.fbTopic, b.dataset.fbMsg); }));
  dlg.querySelectorAll('.fb-x, .fb-close2').forEach(b => b.addEventListener('click', close));
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  if (location.hash === '#write') open();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]'), label = btn.textContent;
    btn.disabled = true; btn.textContent = form.dataset.sending;
    fetch(form.dataset.ajax, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(r => r.json().then(d => { if (!r.ok || String(d.success) !== 'true') throw 0; }))
      .then(() => { form.reset(); body.hidden = true; ok.hidden = false; })
      .catch(() => { dlg.querySelector('.fb-err').hidden = false; })
      .finally(() => { btn.disabled = false; btn.textContent = label; });
  });
})();
