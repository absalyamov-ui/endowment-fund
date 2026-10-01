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

// Форма пожертвования
function fmt(n){ return n.toLocaleString('ru-RU').replace(/ /g,' '); }
function updateDonate(){
  const form = document.querySelector('#donate-form');
  if (!form) return;
  const custom = form.querySelector('[name=amount_custom]');
  const sel = form.querySelector('.amounts .on');
  let amount = custom && custom.value ? parseInt(custom.value.replace(/\D/g,''),10) : (sel ? parseInt(sel.dataset.v,10) : 0);
  const period = form.querySelector('.seg .on');
  const monthly = period && period.dataset.v === 'monthly';
  form.querySelector('[name=amount]').value = amount || '';
  form.querySelector('[name=period]').value = monthly ? 'Ежемесячно' : 'Разово';
  const pay = form.querySelector('.pay .on');
  if (pay) form.querySelector('[name=payment]').value = pay.textContent.trim();
  form.querySelector('.donate-title').textContent = monthly ? 'Ежемесячный взнос' : 'Разовое пожертвование';
  form.querySelector('.donate-btn').textContent = amount ? `Пожертвовать ₸ ${fmt(amount)}${monthly?' в месяц':''}` : 'Пожертвовать';
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
