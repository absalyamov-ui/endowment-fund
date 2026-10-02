// ===== Проверка форм с фирменными подсказками =====
(function () {
  const L = { ru: { req: 'Заполните это поле', email: 'Укажите корректный e-mail', agree: 'Нужно согласие на обработку данных', file: 'Прикрепите файл', sel: 'Выберите вариант' },
    kk: { req: 'Бұл өрісті толтырыңыз', email: 'Дұрыс e-mail көрсетіңіз', agree: 'Деректерді өңдеуге келісім қажет', file: 'Файлды тіркеңіз', sel: 'Нұсқаны таңдаңыз' },
    en: { req: 'Please fill in this field', email: 'Please enter a valid e-mail', agree: 'Please give your consent to data processing', file: 'Please attach a file', sel: 'Please choose an option' } }[document.documentElement.lang] || {};
  const msg = el => el.type === 'checkbox' ? L.agree : el.type === 'file' ? L.file : el.tagName === 'SELECT' ? L.sel : (el.type === 'email' && el.value) ? L.email : L.req;
  const box = el => el.closest('.field, .agree');
  const clear = el => {
    el.removeAttribute('aria-invalid'); el.classList.remove('inp-err');
    const b = box(el);
    if (b) { b.classList.remove('has-err'); const m = b.querySelector(':scope > .err-msg'); if (m) m.remove(); }
    else if (el.form) { const n = el.form.querySelector(':scope > .err-msg'); if (n) n.remove(); }
  };
  const mark = el => {
    clear(el); el.setAttribute('aria-invalid', 'true');
    const m = document.createElement('span'); m.className = 'err-msg'; m.setAttribute('role', 'alert'); m.textContent = msg(el);
    const b = box(el);
    if (b) { b.classList.add('has-err'); b.appendChild(m); } else { el.classList.add('inp-err'); el.form.appendChild(m); }
  };
  document.querySelectorAll('form').forEach(f => {
    f.setAttribute('novalidate', '');
    f.addEventListener('input', e => { if (e.target.checkValidity && e.target.checkValidity()) clear(e.target); });
    f.addEventListener('change', e => { if (e.target.checkValidity && e.target.checkValidity()) clear(e.target); });
  });
  document.addEventListener('submit', e => {
    const f = e.target; if (!(f instanceof HTMLFormElement)) return;
    const bad = [...f.elements].filter(el => el.willValidate && !el.checkValidity() && el.name !== '_honey');
    if (!bad.length) return;
    e.preventDefault(); e.stopImmediatePropagation();
    bad.forEach(mark); bad[0].focus({ preventScroll: true });
    bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, true);
})();

// ===== Аналитика: цели (Яндекс Метрика + Google Analytics, если подключены) =====
window.track = function (goal, params) {
  try { if (window.ym && window.__ym) ym(window.__ym, 'reachGoal', goal, params || {}); } catch (e) {}
  try { if (window.gtag) gtag('event', goal, params || {}); } catch (e) {}
};
document.addEventListener('click', e => {
  const a = e.target.closest('a, button'); if (!a) return;
  const h = a.getAttribute('href') || '';
  if (a.hasAttribute('download') || /\.(pdf|docx|xlsx|zip)$/i.test(h)) track('download', { file: h.split('/').pop() });
  else if (/donate\.html/.test(h)) track('click_donate');
  else if (/grants\.html#apply/.test(h)) track('click_apply');
  else if (/^mailto:/.test(h)) track('click_email');
  else if (a.matches('[data-fb]')) track('open_feedback');
}, true);
document.addEventListener('submit', e => {
  const n = e.target.getAttribute('name');
  if (n) track('form_' + n.replace(/-/g, '_'));
}, true);

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
  const nums = document.querySelectorAll('.stat b, .numbox b, .kpi b, .pt-total b, .bn-num');
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

// ===== Кнопки «наверх» и «на главную» появляются после прокрутки =====
(function () {
  const nav = document.querySelector('.fab-nav'); if (!nav) return;
  const upd = () => nav.classList.toggle('show', window.scrollY > 600);
  window.addEventListener('scroll', upd, { passive: true }); upd();
  nav.querySelector('.fab-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    track && track('click_top');
  });
})();

// ===== «Показать ещё» для длинных списков (Масс-медиа) =====
(function () {
  const grid = document.querySelector('[data-paged]'); if (!grid) return;
  const step = +grid.dataset.paged, btn = document.querySelector('.more-btn'); let limit = step;
  const apply = () => {
    const vis = [...grid.children].filter(c => c.style.display !== 'none');
    vis.forEach((c, i) => c.classList.toggle('pg-hide', i >= limit));
    grid.querySelectorAll('.pg-hide.rv').forEach(c => c.classList.add('in'));
    btn.parentElement.hidden = vis.length <= limit;
  };
  btn.addEventListener('click', () => { limit += step; apply(); });
  document.querySelectorAll('[data-filter] .chip').forEach(ch => ch.addEventListener('click', () => setTimeout(() => { limit = step; apply(); }, 0)));
  apply();
})();

// ===== Тёмная тема =====
(function () {
  const root = document.documentElement;
  const sync = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      const l = dark ? b.dataset.lLight : b.dataset.lDark;
      b.setAttribute('aria-label', l); b.title = l; b.setAttribute('aria-pressed', dark);
      const s = b.querySelector('.lbl'); if (s) s.textContent = l;
    });
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#120A24' : '#2B005B';
  };
  document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') !== 'dark';
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    sync(); window.track && track(dark ? 'theme_dark' : 'theme_light');
  }));
  sync();
})();

// ===== Версия для слабовидящих =====
(function () {
  const root = document.documentElement, bar = document.querySelector('.a11y-bar');
  if (!bar) return;
  let S; try { S = JSON.parse(localStorage.getItem('a11y') || 'null'); } catch (e) {}
  S = S || { on: false, fs: 0, sc: '', im: '1' };
  const apply = () => {
    root.classList.toggle('a11y', !!S.on);
    ['fs-1', 'fs-2', 'sc-bw', 'sc-wb', 'sc-bl', 'im-0'].forEach(c => root.classList.remove(c));
    if (S.on) { if (+S.fs) root.classList.add('fs-' + S.fs); if (S.sc) root.classList.add('sc-' + S.sc); if (S.im === '0') root.classList.add('im-0'); }
    bar.hidden = !S.on;
    document.querySelectorAll('[data-a11y-toggle]').forEach(b => b.setAttribute('aria-expanded', !!S.on));
    bar.querySelectorAll('[data-fs]').forEach(b => b.classList.toggle('on', +b.dataset.fs === +S.fs));
    bar.querySelectorAll('[data-sc]').forEach(b => b.classList.toggle('on', b.dataset.sc === S.sc));
    bar.querySelectorAll('[data-im]').forEach(b => b.classList.toggle('on', b.dataset.im === S.im));
    try { localStorage.setItem('a11y', JSON.stringify(S)); } catch (e) {}
  };
  document.querySelectorAll('[data-a11y-toggle]').forEach(b => b.addEventListener('click', () => {
    S.on = !S.on; if (S.on && !+S.fs) S.fs = 1; apply();
    const mn = document.querySelector('.mnav.open'); if (mn) document.querySelector('.burger').click();
    window.track && track(S.on ? 'a11y_on' : 'a11y_off');
  }));
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.fs != null) S.fs = +b.dataset.fs;
    if (b.dataset.sc != null) S.sc = b.dataset.sc;
    if (b.dataset.im != null) S.im = b.dataset.im;
    if (b.hasAttribute('data-a11y-off')) S = { on: false, fs: 0, sc: '', im: '1' };
    apply();
  });
  apply();
})();

// ===== Поиск по сайту =====
(function () {
  const dlg = document.querySelector('.sr-dlg'); if (!dlg) return;
  const inp = dlg.querySelector('.sr-in'), res = dlg.querySelector('.sr-res'), hint = res.innerHTML;
  let idx = null, cur = -1;
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/ /g, ' ');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hl = (s, qs) => { let h = esc(s); qs.forEach(q => { if (q.length > 1) h = h.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); }); return h; };
  const load = () => idx ? Promise.resolve(idx) : fetch(dlg.dataset.index).then(r => r.json()).then(d => (idx = d.map(x => Object.assign(x, { n: norm(x.t + ' ' + (x.p || '') + ' ' + (x.d || '')) }))));
  const render = () => {
    const q = norm(inp.value.trim());
    if (q.length < 2) { res.innerHTML = hint; cur = -1; return; }
    const qs = q.split(/\s+/).filter(Boolean);
    load().then(list => {
      const hits = list.map(x => { let sc = 0; for (const w of qs) { const i = x.n.indexOf(w); if (i < 0) return null; sc += (norm(x.t).includes(w) ? 10 : 2) + (i === 0 ? 3 : 0); } return [sc + (x.w || 0), x]; }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, 30);
      cur = -1;
      res.innerHTML = hits.length ? hits.map(([, x]) => `<a class="sr-item" href="${esc(x.u)}"${/^https?:/.test(x.u) ? ' target="_blank" rel="noopener"' : ''}><b><span class="sr-kind">${esc(x.k)}</span>${hl(x.t, qs)}</b>${x.p ? `<small>${hl(x.p, qs)}</small>` : ''}</a>`).join('') : `<p class="sr-none">${esc(dlg.dataset.none || '')}</p>`;
    }).catch(() => {});
  };
  dlg.dataset.none = (document.documentElement.lang === 'kk' ? 'Ештеңе табылмады. Басқа сөзді көріңіз.' : document.documentElement.lang === 'en' ? 'Nothing found. Try another word.' : 'Ничего не найдено. Попробуйте другое слово.');
  const open = () => { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); document.body.classList.add('fb-lock'); load(); setTimeout(() => inp.focus(), 30); window.track && track('search_open'); };
  const close = () => dlg.close ? dlg.close() : dlg.removeAttribute('open');
  dlg.addEventListener('close', () => document.body.classList.remove('fb-lock'));
  document.querySelectorAll('[data-search]').forEach(b => b.addEventListener('click', open));
  dlg.querySelector('.sr-x').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  let tmr; inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(render, 80); });
  inp.addEventListener('keydown', e => {
    const items = [...res.querySelectorAll('.sr-item')]; if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((it, i) => it.classList.toggle('on', i === cur)); items[cur].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); (items[cur] || items[0]).click(); }
  });
  document.addEventListener('keydown', e => { if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(); } });
})();

// ===== «Как работает эндаумент»: активный шаг при прокрутке =====
(function () {
  const steps = [...document.querySelectorAll('.how-step')]; if (!steps.length || !('IntersectionObserver' in window)) return;
  const cur = document.querySelector('.how-cur'), bar = document.querySelector('.how-bar i');
  const set = i => {
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    if (cur) cur.textContent = '0' + (i + 1);
    if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
})();
