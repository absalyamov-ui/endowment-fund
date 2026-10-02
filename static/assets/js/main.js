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

// ===== Фоновая отправка форм (без перехода на страницы FormSubmit) =====
document.querySelectorAll('form[action*="formsubmit.co"]:not(.fb-form)').forEach(f => {
  if (f.querySelector('input[type=file]')) return; // формы с файлом отправляются обычным способом
  f.addEventListener('submit', e => {
    e.preventDefault();
    const btn = f.querySelector('[type=submit]');
    if (btn) btn.disabled = true;
    const next = f.querySelector('[name=_next]');
    fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
      .then(r => r.json().then(d => { if (!r.ok || String(d.success) !== 'true') throw 0; location.href = next ? next.value : '/thanks.html'; }))
      .catch(() => { if (btn) btn.disabled = false; f.submit(); });
  });
});

// ===== Лента партнёров: показываем только логотипы, которые реально загрузились =====
(function () {
  const mq = document.querySelector('.marquee[data-logos]');
  if (!mq) return;
  let list; try { list = JSON.parse(mq.dataset.logos); } catch (e) { return; }
  Promise.all(list.map(o => new Promise(res => {
    const t = setTimeout(() => res(null), 8000);
    const done = v => { clearTimeout(t); res(v); };
    const plain = () => { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.onload = () => done(im.naturalWidth > 1 && im.naturalHeight > 1 ? o : null); im.onerror = () => done(null); im.src = o.s; };
    // Если сервер разрешает чтение пикселей — отсеиваем белые/пустые логотипы, невидимые на белом фоне
    const im = new Image(); im.crossOrigin = 'anonymous'; im.referrerPolicy = 'no-referrer';
    im.onload = () => {
      try {
        const w = 120, h = Math.max(1, Math.round(120 * im.naturalHeight / im.naturalWidth)) || 60, c = document.createElement('canvas');
        c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
        const d = x.getImageData(0, 0, w, h).data; let vis = 0;
        for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 60 && (d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) < 215) vis++;
        done(vis / (w * h) > 0.01 ? o : null);
      } catch (e) { plain(); }
    };
    im.onerror = plain;
    im.src = o.s;
  }))).then(ok => {
    ok = ok.filter(Boolean);
    if (ok.length <= mq.querySelectorAll('.mq-set:first-child .mq-item').length) return;
    const esc = v => String(v).replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]));
    const set = hid => `<div class="mq-set"${hid ? ' aria-hidden="true"' : ''}>${ok.map(o => `<a class="mq-item" href="partners.html" title="${esc(o.t)}"><img src="${esc(o.s)}" alt="${hid ? '' : esc(o.t)}" referrerpolicy="no-referrer"></a>`).join('')}</div>`;
    const track = mq.querySelector('.mq-track');
    track.innerHTML = set(0) + set(1);
    if (track.scrollWidth / 2 < mq.clientWidth) track.innerHTML += set(1) + set(1);
  });
})();
