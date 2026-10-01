// Генератор статических страниц сайта.
// Запуск: node build.js  →  готовый сайт в папке public/.
// Тексты страниц правятся прямо в этом файле.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'public');
const STATIC = path.join(__dirname, 'static');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(STATIC, OUT, { recursive: true });
const IMG = path.join(OUT, 'assets', 'img');
fs.writeFileSync(path.join(IMG, 'logo-white.svg'), fs.readFileSync(path.join(IMG, 'logo.svg'), 'utf8').replace(/#2B005B/g, '#FFFFFF'));
fs.copyFileSync(path.join(IMG, 'sign.svg'), path.join(OUT, 'favicon.svg'));
const SITE = 'https://endowment.kz';
const NAME = 'Эндаумент-фонд науки и образования';

const NAV = [
  ['about.html', 'О фонде'], ['programs.html', 'Программы'], ['grants.html', 'Как получить грант'],
  ['donors.html', 'Доноры'], ['reports.html', 'Отчёты'], ['press.html', 'Пресс-центр'], ['contacts.html', 'Контакты'],
];

const ph = (label, cls = '', h) => `<div class="ph ${cls}"${h ? ` style="min-height:${h}px"` : ''} role="img" aria-label="${label}"><span>${label}</span></div>`;
const head = (eb, h, btn) => `<div class="head"><div><span class="eb">${eb}</span><h2 class="h2">${h}</h2></div>${btn || ''}</div>`;
const faq = items => `<div class="faq">${items.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
const field = (label, name, ph, type = 'text', req = true) => `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" placeholder="${ph}"${req ? ' required' : ''}></div>`;
const select = (label, name, opts) => `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}" required><option value="">Выберите</option>${opts.map(o => `<option>${o}</option>`).join('')}</select></div>`;
const area = (label, name, ph) => `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" placeholder="${ph}" required></textarea></div>`;
const agree = `<label class="agree"><input type="checkbox" required> Согласен на обработку персональных данных</label>`;
const formOpen = name => `<form class="form" name="${name}" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="${name}"><p class="visually-hidden"><label>Не заполняйте: <input name="bot-field"></label></p>`;

function header(active) {
  const links = NAV.map(([href, t]) => `<a href="${href}"${href === active ? ' class="active"' : ''}>${t}</a>`).join('');
  return `<header class="hdr"><div class="wrap">
<a class="logo" href="index.html" aria-label="${NAME} — на главную"><img src="assets/img/logo.svg" alt="${NAME}" width="282" height="48"></a>
<nav class="nav" aria-label="Основное меню">${links}</nav>
<div class="hdr-act"><div class="lang"><a class="on" href="#">RU</a><a href="#" title="Скоро">KZ</a><a href="#" title="Скоро">EN</a></div><a class="btn btn-gold no-arrow" href="donate.html">Поддержать</a>
<button class="burger" aria-label="Меню" aria-expanded="false"><span></span><span></span><span></span></button></div>
</div></header>
<nav class="mnav" aria-label="Мобильное меню">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a class="btn btn-gold" href="donate.html">Сделать пожертвование</a><div class="lang"><a class="on" href="#">RU</a><a href="#">KZ</a><a href="#">EN</a></div></nav>`;
}

const footer = `<footer class="ftr"><div class="wrap">
<div class="ftr-top">
<div><a class="logo" href="index.html"><img src="assets/img/logo-white.svg" alt="${NAME}" width="306" height="52"></a>
<p>Целевой капитал, доход от которого направляется на развитие науки и образования Казахстана.</p>
<div class="soc"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="Facebook">FB</a><a href="#" aria-label="YouTube">YT</a><a href="#" aria-label="Telegram">TG</a><a href="#" aria-label="LinkedIn">in</a></div></div>
<div><h4>Фонд</h4><ul><li><a href="about.html">О фонде</a></li><li><a href="about.html#board">Попечительский совет</a></li><li><a href="about.html#team">Руководство</a></li><li><a href="about.html#docs">Документы</a></li><li><a href="about.html#jobs">Вакансии</a></li></ul></div>
<div><h4>Деятельность</h4><ul><li><a href="programs.html">Программы и проекты</a></li><li><a href="grants.html">Как получить грант</a></li><li><a href="reports.html">Отчёты</a></li><li><a href="press.html">Пресс-центр</a></li></ul></div>
<div><h4>Донорам</h4><ul><li><a href="donate.html">Сделать пожертвование</a></li><li><a href="donors.html#named">Именной фонд</a></li><li><a href="donors.html#companies">Корпоративным партнёрам</a></li><li><a href="donors.html">Наши доноры</a></li></ul></div>
<div><h4>Контакты</h4><ul><li><a href="tel:+77172000000">+7 (7172) 00-00-00</a></li><li><a href="mailto:info@endowment.kz">info@endowment.kz</a></li><li>г. Астана, пр. Мангилик Ел, 00</li><li>Пн–Пт, 9:00–18:00</li></ul></div>
</div>
<div class="ftr-bot"><span>© <span data-year>2026</span> ${NAME}</span><span><a href="#">Политика конфиденциальности</a> · <a href="sitemap.xml">Карта сайта</a></span></div>
</div></footer>`;

function page(file, title, desc, active, body) {
  const full = file === 'index.html' ? `${NAME} — капитал для науки и образования Казахстана` : `${title} — ${NAME}`;
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${full}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}/${file === 'index.html' ? '' : file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${full}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="ru_KZ">
<meta name="theme-color" content="#2B005B">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap&subset=cyrillic" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
${header(active)}
<main>
${body}
</main>
${footer}
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, file), html);
}

const phero = (crumb, title, lead) => `<section class="phero pat pat-bg"><div class="wrap"><div class="crumbs"><a href="index.html">Главная</a> &nbsp;/&nbsp; ${crumb}</div><h1 class="h1-page">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

const PROGS = [
  ['grants', 'Приём заявок до 15.11.2026', 'gold', 'Гранты', 'Гранты молодым учёным', 'До ₸ 00 млн на проект до 3 лет для исследователей до 40 лет.', ''],
  ['scholar', 'Приём заявок до 01.12.2026', 'gold', 'Стипендии', 'Стипендия фонда', 'Ежемесячная стипендия и наставник для студентов бакалавриата.', 'dark'],
  ['mobility', 'Приём заявок до 20.12.2026', 'gold', 'Мобильность', 'Академическая мобильность', 'Стажировки в ведущих университетах и научных центрах мира.', ''],
  ['infra', 'Скоро', 'grey', 'Инфраструктура', 'Лаборатории будущего', 'Софинансирование оборудования для университетских лабораторий.', 'muted'],
  ['grants', 'Идёт реализация', 'grey', 'Гранты', 'Наука в регионах', 'Поддержка исследовательских групп в региональных вузах.', 'dark'],
  ['scholar', 'Завершено', 'grey', 'Стипендии', 'Именная стипендия', 'Программа, учреждённая донором в честь выпускника.', 'muted'],
];
const progCard = ([cat, tag, tc, catName, h, t, cls], withCat = true) => `<article class="card" data-cat="${cat}">${ph('Фото программы', cls)}<div class="card-b"><div class="tags"><span class="tag ${tc}">${tag}</span>${withCat ? `<span class="tag vi">${catName}</span>` : ''}</div><h3 class="h3">${h}</h3><p class="txt">${t}</p><a class="link" href="grants.html">Условия участия →</a></div></article>`;

const NEWS = [
  ['12 сентября 2026', 'Гранты', 'Подведены итоги конкурса грантов для молодых учёных', 'dark'],
  ['28 августа 2026', 'Партнёрство', 'Фонд и университеты подписали меморандум о сотрудничестве', ''],
  ['10 августа 2026', 'Отчётность', 'Опубликован годовой отчёт фонда за 2025 год', 'dark'],
  ['24 июля 2026', 'Стипендии', 'Стипендиаты фонда прошли летнюю школу в Астане', ''],
  ['02 июля 2026', 'Донорам', 'Открыт приём пожертвований в юбилейную программу «10 лет»', 'dark'],
  ['18 июня 2026', 'Наука', 'Лаборатория при поддержке фонда получила новое оборудование', ''],
  ['30 мая 2026', 'События', 'Ежегодная встреча доноров и попечителей фонда', 'dark'],
];
const newsCard = ([d, cat, h, cls]) => `<article class="card">${ph('Фото', cls)}<div class="card-b"><div class="tags"><span class="tag vi">${cat}</span><span class="date">${d}</span></div><h3 class="h3"><a href="news-item.html">${h}</a></h3></div></article>`;

// ===== ГЛАВНАЯ =====
page('index.html', 'Главная', 'Эндаумент-фонд науки и образования формирует неснижаемый целевой капитал и направляет инвестиционный доход на гранты учёным, стипендии студентам и развитие университетов Казахстана.', '', `
<section class="hero"><div class="wrap">
<div class="hero-row"><div><span class="eb" style="color:var(--go)">${NAME}</span><h1 class="h1">Знания, которые служат стране поколениями</h1>
<p class="lead">Мы формируем неснижаемый целевой капитал и направляем инвестиционный доход на гранты учёным, стипендии студентам и развитие университетов Казахстана.</p>
<div class="btn-row"><a class="btn btn-gold" href="donate.html">Сделать пожертвование</a><a class="btn btn-light" href="grants.html">Как получить грант</a></div></div>
${ph('Фото: исследователи в лаборатории')}</div>
<div class="stats"><div class="stat"><b>₸ 00 млрд</b><span>целевой капитал фонда</span></div><div class="stat"><b>₸ 0,0 млрд</b><span>направлено на гранты и программы</span></div><div class="stat"><b>000+</b><span>учёных и студентов получили поддержку</span></div><div class="stat"><b>00</b><span>доноров и партнёров</span></div></div>
</div></section>

<section class="sec bg-li"><div class="wrap split">
<div><span class="eb">О фонде</span><h2 class="h2">Значимые перемены начинаются там, где поддержка превращается в возможности</h2></div>
<div class="stack pt-44"><p class="txt" style="font-size:18px">Эндаумент-фонд — это целевой капитал, который не расходуется. Пожертвования инвестируются по консервативной стратегии, а доход ежегодно направляется на программы фонда.</p><p class="txt" style="font-size:18px">Так поддержка науки и образования становится постоянной и не зависит от разовых бюджетов и колебаний рынка.</p><a class="link" href="about.html">Подробнее о фонде →</a></div>
</div></section>

<section class="sec bg-wh"><div class="wrap">${head('Что мы поддерживаем', 'Четыре направления фонда')}
<div class="grid g4">${[['01', 'Наука мирового уровня', 'Гранты на исследования, оборудование лабораторий и участие в международных проектах.'], ['02', 'Доступное образование', 'Стипендии талантливым студентам из регионов и семей с ограниченными возможностями.'], ['03', 'Кадры и таланты', 'Программы для молодых учёных и преподавателей: стажировки, менторство, мобильность.'], ['04', 'Сильные университеты', 'Развитие инфраструктуры вузов и совместные проекты с индустрией.']].map(([n, h, t]) => `<div class="val"><span class="n">${n}</span><span class="bar"></span><h3 class="h3">${h}</h3><p class="txt">${t}</p></div>`).join('')}</div>
</div></section>

<section class="sec bg-dp"><div class="wrap">${head('Модель фонда', 'Как работает эндаумент')}
<div class="steps">${[['01', 'Пожертвования', 'Частные лица, компании и выпускники вносят средства в целевой капитал.'], ['02', 'Неснижаемый капитал', 'Основная сумма сохраняется навсегда и не тратится на текущие нужды.'], ['03', 'Инвестиционный доход', 'Управляющая компания инвестирует капитал по утверждённой декларации.'], ['04', 'Гранты и программы', 'Доход ежегодно направляется на науку, стипендии и университеты.']].map(([n, h, t], i) => `<div class="step"><b>${n}</b><h3 class="h3">${h}</h3><p class="txt">${t}</p></div>${i < 3 ? '<span class="step-arr" aria-hidden="true">→</span>' : ''}`).join('')}</div>
<p class="note">Основной капитал не расходуется — на программы направляется только инвестиционный доход. Это делает поддержку бессрочной.</p>
</div></section>

<section class="sec bg-li"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">Принципы работы</span><h2 class="h2">Управляем капиталом так, чтобы ему доверяли</h2></div><p class="txt">Решения о грантах принимаются коллегиально, а результаты публикуются ежегодно.</p></div>
<div class="grid g2">${[['Независимость', 'Попечительский совет и экспертные комиссии принимают решения вне интересов отдельных доноров.'], ['Беспристрастность', 'Заявки оцениваются по открытым критериям независимыми экспертами.'], ['Прозрачность', 'Ежегодно публикуем финансовую отчётность, аудиторское заключение и итоги конкурсов.'], ['Подотчётность', 'Отчитываемся перед донорами о каждом проекте, профинансированном из дохода фонда.']].map(([h, t]) => `<div class="pr"><h3 class="h3">${h}</h3><p class="txt">${t}</p></div>`).join('')}</div>
</div></section>

<section class="sec bg-wh"><div class="wrap">${head('Программы и проекты', 'Открытые конкурсы', '<a class="btn btn-outline" href="programs.html">Все программы</a>')}
<div class="grid g3">${PROGS.slice(0, 3).map(p => progCard(p, false)).join('')}</div>
</div></section>

<section class="sec bg-vi pat pat-bg"><div class="wrap cta"><div class="txt-col"><span class="eb">Для учёных и университетов</span><h2 class="h2">Есть проект в сфере науки или образования?</h2><p class="lead" style="margin-top:20px">Подайте заявку — экспертный совет рассмотрит её в течение 30 рабочих дней. Мы поддерживаем проекты со всего Казахстана.</p></div>
<div class="stack" style="gap:16px"><a class="btn btn-gold" href="grants.html#apply">Подать заявку</a><a class="btn btn-light" href="grants.html">Условия и требования</a></div></div></section>

<section class="sec bg-wh" style="padding:96px 0"><div class="wrap">${head('Нам доверяют', 'Доноры и партнёры', '<a class="btn btn-outline" href="donate.html">Стать донором</a>')}
<div class="grid g6">${'<div class="logo-box">Логотип</div>'.repeat(6)}</div></div></section>

<section class="sec bg-li"><div class="wrap">${head('Пресс-центр', 'Новости фонда', '<a class="btn btn-outline" href="press.html">Все новости</a>')}
<div class="grid g3">${NEWS.slice(0, 3).map(newsCard).join('')}</div></div></section>
`);

// ===== О ФОНДЕ =====
const people = (n, roles, alt) => Array.from({ length: n }, (_, i) => `<div class="person">${ph('Портрет', i % 2 ? '' : 'dark')}<h3 class="h3">Имя Фамилия</h3><p class="txt">${roles[i % roles.length]}</p></div>`).join('');
page('about.html', 'О фонде', 'Миссия, история, попечительский совет, руководство и документы Эндаумент-фонда науки и образования.', 'about.html', `
${phero('О фонде', 'О фонде', 'Эндаумент-фонд науки и образования создан, чтобы у науки и образования Казахстана был постоянный, независимый от бюджетных циклов источник финансирования.')}
<section class="sec bg-li"><div class="wrap">
<div class="grid g2"><div class="mv bg-dp"><span class="eb">Миссия</span><h2 class="h2 h2-sm">Создавать возможности для учёных и студентов сегодня и через 50 лет</h2><p class="txt">Формировать и приумножать целевой капитал, доход которого стабильно направляется на развитие науки и образования.</p></div>
<div class="mv bg-wh"><span class="eb">Видение</span><h2 class="h2 h2-sm">Казахстан — страна, где талант не зависит от происхождения</h2><p class="txt">Каждый одарённый студент и исследователь может реализовать свой потенциал, а университеты конкурируют на мировом уровне.</p></div></div>
<div class="grid g4 mt-56">${[['Долгосрочность', 'Мыслим горизонтом поколений'], ['Ответственность', 'Бережём каждый тенге доноров'], ['Открытость', 'Публикуем отчёты и решения'], ['Партнёрство', 'Работаем вместе с вузами и бизнесом']].map(([h, t]) => `<div class="vline"><h3 class="h3">${h}</h3><p class="txt">${t}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head('10 лет фонду', 'История фонда')}
<div class="tl">${[['2016', 'Основание фонда', 'Первые учредители и формирование целевого капитала'], ['2018', 'Первые гранты', 'Запуск конкурса для молодых учёных'], ['2020', 'Стипендии', 'Программа поддержки студентов из регионов'], ['2023', 'Партнёрства', 'Соглашения с ведущими университетами страны'], ['2026', '10 лет', 'Новая стратегия и юбилейные программы']].map(([y, h, t], i) => `<div class="tl-i${i === 4 ? ' now' : ''}"><div class="tl-dot"><i></i><s></s></div><b>${y}</b><h3 class="h3">${h}</h3><p class="txt">${t}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-li" id="board"><div class="wrap">${head('Управление', 'Попечительский совет')}<div class="grid g4">${people(4, ['Председатель попечительского совета', 'Член попечительского совета'])}</div></div></section>
<section class="sec bg-wh" id="team"><div class="wrap">${head('Команда', 'Руководство')}<div class="grid g4">${people(4, ['Генеральный директор', 'Директор по инвестициям', 'Директор по программам', 'Директор по развитию'])}</div></div></section>
<section class="sec bg-li" id="docs"><div class="wrap">${head('Нормативная база', 'Документы фонда')}
<div>${[['Устав фонда', '1,2 МБ'], ['Инвестиционная декларация', '640 КБ'], ['Положение о попечительском совете', '410 КБ'], ['Положение о конкурсном отборе', '520 КБ'], ['Антикоррупционная политика', '300 КБ']].map(([t, s]) => `<div class="rowline"><span class="pdf">PDF</span><h3 class="h3 grow">${t}</h3><span class="meta">PDF · ${s}</span><a class="link" href="#">Скачать ↓</a></div>`).join('')}</div>
</div></section>
<section class="band bg-go" id="jobs"><div class="wrap cta"><div><h2 class="h2 h2-sm">Хотите работать в фонде?</h2><p style="opacity:.75;margin-top:8px">Открытые вакансии и стажировки для выпускников</p></div><a class="btn btn-dark" href="mailto:hr@endowment.kz">Смотреть вакансии</a></div></section>
`);

// ===== ПРОГРАММЫ =====
page('programs.html', 'Программы и проекты', 'Гранты, стипендии, академическая мобильность и инфраструктурные проекты Эндаумент-фонда науки и образования.', 'programs.html', `
${phero('Программы и проекты', 'Программы и проекты', 'Все программы финансируются из инвестиционного дохода фонда. Выберите направление и узнайте об условиях участия.')}
<section class="sec bg-li" style="padding-top:72px"><div class="wrap">
<div class="toolbar"><div class="chips" data-filter>${[['all', 'Все'], ['grants', 'Гранты'], ['scholar', 'Стипендии'], ['infra', 'Инфраструктура'], ['mobility', 'Мобильность']].map(([v, t], i) => `<button class="chip${i ? '' : ' on'}" data-value="${v}">${t}</button>`).join('')}</div>
<label class="search"><span class="visually-hidden">Поиск по программам</span><input id="prog-search" type="search" placeholder="Поиск по программам"><span aria-hidden="true">⌕</span></label></div>
<div class="grid g3">${PROGS.map(p => progCard(p)).join('')}</div>
</div></section>
<section class="flag bg-dp"><div class="in"><span class="eb">Флагманский проект</span><h2 class="h2">Лаборатории будущего</h2><p class="lead" style="margin-top:20px;font-size:18px">Совместно с университетами оснащаем 10 исследовательских лабораторий современным оборудованием. Каждая лаборатория получает поддержку на 5 лет и открывает доступ к оборудованию для учёных со всей страны.</p>
<div class="kpis"><div><b>10</b><span>лабораторий</span></div><div><b>5 лет</b><span>поддержки</span></div><div><b>₸ 00 млрд</b><span>бюджет проекта</span></div></div><a class="btn btn-gold" href="grants.html">О проекте</a></div>${ph('Фото лаборатории')}</section>
<section class="sec bg-wh"><div class="wrap">${head('Эффект программ', 'Результаты в цифрах')}
<div class="grid g4">${[['000+', 'грантов и стипендий'], ['00', 'университетов-партнёров'], ['000', 'научных публикаций'], ['00', 'регионов охвата']].map(([n, t]) => `<div class="numbox"><b>${n}</b><p class="txt">${t}</p></div>`).join('')}</div></div></section>
`);

// ===== КАК ПОЛУЧИТЬ ГРАНТ =====
page('grants.html', 'Как получить грант', 'Кто может подать заявку на грант или стипендию фонда, этапы конкурса, документы и форма заявки.', 'grants.html', `
${phero('Как получить грант', 'Как получить грант', 'Пошаговая инструкция для учёных, студентов и университетов: кто может подать заявку, какие нужны документы и как проходит отбор.')}
<section class="sec bg-li"><div class="wrap">${head('Участники', 'Кто может подать заявку')}
<div class="grid g3">${[['Учёные', 'Исследователи и научные группы', ['Гражданство РК', 'Аффилиация с вузом или НИИ', 'Научный задел по теме']], ['Студенты', 'Бакалавриат и магистратура', ['Средний балл от 3,0', 'Активное участие в науке', 'Рекомендация преподавателя']], ['Университеты', 'Вузы и научные организации', ['Лицензия на образовательную деятельность', 'Софинансирование от 20%', 'План развития лаборатории']]].map(([h, t, l]) => `<div class="form" style="gap:16px"><h3 class="h3">${h}</h3><p class="txt">${t}</p><hr style="border:0;border-top:1px solid var(--ln);margin:4px 0;width:100%">${l.map(x => `<span class="check">${x}</span>`).join('')}</div>`).join('')}</div>
</div></section>
<section class="sec bg-dp"><div class="wrap">${head('Процесс', 'Этапы конкурса')}
<div>${[['01', 'Регистрация', 'Заполните предварительную заявку на этой странице', '1 день'], ['02', 'Подача заявки', 'Координатор пришлёт форму, загрузите документы', 'до дедлайна'], ['03', 'Техническая проверка', 'Проверяем комплектность и соответствие условиям', '5 рабочих дней'], ['04', 'Экспертиза', 'Независимые эксперты оценивают проект по открытым критериям', '20 рабочих дней'], ['05', 'Решение и договор', 'Экспертный совет утверждает список, подписываем договор', '10 рабочих дней']].map(([n, h, t, d]) => `<div class="stage"><b>${n}</b><div><h3 class="h3">${h}</h3><p class="txt">${t}</p></div><span class="tag">${d}</span></div>`).join('')}</div>
</div></section>
<section class="sec bg-li" id="apply"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">Документы</span><h2 class="h2 h2-sm">Что подготовить</h2></div>
<div>${['Заявка по форме фонда', 'Описание проекта (до 10 страниц)', 'Смета расходов', 'CV руководителя и команды', 'Письмо поддержки от организации'].map(x => `<div class="rowline" style="padding:14px 0"><span style="color:var(--go);font-weight:700">—</span><span class="grow" style="font-size:16px">${x}</span></div>`).join('')}</div>
<a class="link" href="#">Скачать шаблоны документов ↓</a></div>
${formOpen('grant-application')}
<h3 class="h3">Предварительная заявка</h3><p class="txt">Оставьте контакты — координатор программы свяжется с вами в течение 3 рабочих дней.</p>
<div class="frow">${field('Имя и фамилия', 'name', 'Имя Фамилия')}${field('Организация', 'org', 'Название вуза или НИИ')}</div>
<div class="frow">${field('E-mail', 'email', 'name@mail.kz', 'email')}${field('Телефон', 'phone', '+7 (___) ___-__-__', 'tel')}</div>
${select('Программа', 'program', PROGS.slice(0, 4).map(p => p[4]))}
${area('Кратко о проекте', 'about', 'До 500 символов')}
${agree}<button class="btn btn-gold" type="submit">Отправить заявку</button></form>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head('Вопросы и ответы', 'Частые вопросы')}
${faq([['Можно ли подать несколько заявок?', 'Да, но не более одной заявки в рамках одного конкурса от одного руководителя проекта.'], ['Какие расходы покрывает грант?', 'Оборудование и материалы, оплату труда участников проекта, командировки и публикации. Полный перечень — в положении о конкурсе.'], ['Можно ли участвовать без учёной степени?', 'Да. Для программ молодых учёных степень не обязательна, оцениваются научный задел и качество проекта.'], ['Как узнать результаты конкурса?', 'Результаты публикуются в разделе «Пресс-центр», каждый заявитель получает письмо на e-mail.']])}
</div></section>
`);

// ===== ПОЖЕРТВОВАНИЕ =====
page('donate.html', 'Сделать пожертвование', 'Поддержите науку и образование Казахстана: разовое или ежемесячное пожертвование, именной фонд, корпоративное партнёрство.', 'donate.html', `
${phero('Сделать пожертвование', 'Ваш вклад работает всегда', 'Пожертвование в эндаумент не тратится — оно инвестируется, и доход от него ежегодно поддерживает науку и образование.')}
<section class="sec bg-li"><div class="wrap split split-5-7">
<div class="stack" style="gap:16px"><span class="eb" style="margin:0">Форматы участия</span><h2 class="h2 h2-sm" style="margin-bottom:8px">Выберите, как помочь</h2>
${[['Разовое пожертвование', 'Любая сумма в целевой капитал фонда', 'once', true], ['Ежемесячный взнос', 'Регулярная поддержка от ₸ 2 000 в месяц', 'monthly'], ['Именной фонд', 'От ₸ 00 млн — фонд с вашим именем или именем близкого', '', false, 'contacts.html'], ['Корпоративное партнёрство', 'Программы для компаний и выпускников', '', false, 'contacts.html']].map(([h, t, per, on, href]) => `<button class="opt${on ? ' on' : ''}"${per ? ` data-period="${per}"` : ''}${href ? ` data-href="${href}"` : ''} type="button"><i></i><span><span class="h3" style="display:block;font-size:19px">${h}</span><span class="txt">${t}</span></span></button>`).join('')}
</div>
<form class="form" id="donate-form" name="donation" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="donation"><p class="visually-hidden"><label>Не заполняйте: <input name="bot-field"></label></p>
<input type="hidden" name="amount"><input type="hidden" name="period"><input type="hidden" name="payment">
<h3 class="h3 donate-title" style="font-size:28px">Разовое пожертвование</h3>
<div class="seg" data-choice><button class="on" data-v="once">Разово</button><button data-v="monthly">Ежемесячно</button></div>
<div class="field"><label>Сумма, ₸</label><div class="amounts" data-choice><button data-v="5000">5 000</button><button class="on" data-v="10000">10 000</button><button data-v="50000">50 000</button><button data-v="100000">100 000</button></div></div>
<div class="field"><label for="f-amount_custom">Другая сумма</label><input id="f-amount_custom" name="amount_custom" inputmode="numeric" placeholder="Введите сумму"></div>
<div class="frow">${field('Имя и фамилия', 'name', 'Имя Фамилия')}${field('E-mail для квитанции', 'email', 'name@mail.kz', 'email')}</div>
<div class="field"><label>Способ оплаты</label><div class="pay" data-choice><button class="on">Банковская карта</button><button>Kaspi</button><button>Перевод по реквизитам</button></div></div>
${agree}
<button class="btn btn-gold donate-btn no-arrow" type="submit" style="align-self:stretch">Пожертвовать ₸ 10 000</button>
<p class="small" style="text-align:center">После отправки мы пришлём ссылку на оплату и благодарственное письмо на e-mail.</p>
</form>
</div></section>
<section class="sec bg-dp"><div class="wrap">${head('Эффект', 'Что меняет ваш вклад')}
<div class="grid g3">${[['₸ 10 000', 'обеспечивают месяц доступа к научным базам данных для студента'], ['₸ 100 000', 'покрывают участие молодого учёного в международной конференции'], ['₸ 1 000 000', 'становятся частью капитала и приносят доход на стипендии ежегодно']].map(([n, t]) => `<div class="step"><b>${n}</b><p class="txt" style="font-size:17px">${t}</p></div>`).join('')}</div></div></section>
<section class="sec bg-wh"><div class="wrap grid g2">
<div class="mv bg-li"><span class="eb">Налоговые льготы</span><h3 class="h3" style="font-size:26px">Пожертвования уменьшают налогооблагаемый доход</h3><p class="txt">Компании и частные лица могут воспользоваться налоговым вычетом в соответствии с Налоговым кодексом РК. Мы предоставляем все закрывающие документы.</p></div>
<div class="mv bg-dp"><span class="eb">Реквизиты для перевода</span><dl class="req" style="margin:0">${[['Получатель', NAME], ['БИН', '000000000000'], ['IBAN', 'KZ00 0000 0000 0000 0000'], ['Банк', 'АО «Банк» · БИК XXXXKZKA'], ['Назначение', 'Пожертвование в целевой капитал']].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>
</div></section>
<section class="sec bg-li"><div class="wrap">${head('Вопросы донора', 'Частые вопросы')}
${faq([['Почему эндаумент, а не прямое пожертвование?', 'Ваш вклад не расходуется: он инвестируется, и доход от него поддерживает программы фонда бессрочно — сегодня и через десятилетия.'], ['Могу ли я выбрать программу для поддержки?', 'Да. При пожертвовании от ₸ 1 млн можно указать направление, а от ₸ 00 млн — учредить именной фонд с собственной программой.'], ['Как фонд отчитывается перед донорами?', 'Ежегодно публикуем отчёт и аудиторское заключение, а крупным донорам направляем персональный отчёт о программах.'], ['Можно ли сделать пожертвование от компании?', 'Да. Свяжитесь с нами — подготовим договор пожертвования и закрывающие документы.']])}
</div></section>
`);

// ===== ДОНОРЫ =====
page('donors.html', 'Доноры', 'Доноры и партнёры Эндаумент-фонда науки и образования: уровни признания, компании, именные фонды.', 'donors.html', `
${phero('Доноры', 'Наши доноры', 'Люди и компании, которые вкладывают в будущее науки и образования Казахстана. Спасибо, что вы с нами.')}
<section class="sec bg-li"><div class="wrap">${head('Признание', 'Круги доноров')}
<div class="grid g3">${[['Друг фонда', 'до ₸ 1 млн', 'Имя в ежегодном отчёте и на сайте фонда', 'bg-wh'], ['Меценат', '₸ 1–50 млн', 'Отчёт о программах и приглашение на ежегодную встречу доноров', 'bg-vi'], ['Основатель', 'от ₸ 50 млн', 'Именной фонд или программа, место на стене основателей', 'bg-dp']].map(([h, s, t, c]) => `<div class="mv ${c}"><span style="color:var(--go);font-weight:700;font-size:15px">${s}</span><h3 class="h3" style="font-size:28px">${h}</h3><p class="txt">${t}</p></div>`).join('')}</div></div></section>
<section class="sec bg-wh" id="companies"><div class="wrap">${head('Корпоративные доноры', 'Компании-партнёры', '<a class="btn btn-outline" href="contacts.html">Стать партнёром</a>')}
<div class="grid g5">${'<div class="logo-box">Логотип</div>'.repeat(10)}</div></div></section>
<section class="sec bg-li" id="named"><div class="wrap">${head('Именные фонды', 'Фонды, носящие имена')}
<div class="grid g3">${[0, 1, 2].map(i => `<article class="card">${ph('Портрет', i === 1 ? '' : 'dark')}<div class="card-b"><span style="color:var(--go);font-weight:600;font-size:14px">Учреждён в 20XX</span><h3 class="h3">Фонд имени Имя Фамилия</h3><p class="txt">Поддерживает стипендии для студентов инженерных специальностей.</p></div></article>`).join('')}</div></div></section>
<section class="sec bg-wh"><div class="wrap">${head('Благодарим', 'Частные доноры')}
<div class="grid g4">${[0, 1, 2, 3].map(() => `<ul>${'<li style="margin-bottom:14px">Имя Фамилия</li>'.repeat(6)}</ul>`).join('')}</div>
<p class="small mt-24">Список обновляется ежеквартально. Если вы хотите сохранить анонимность, сообщите нам об этом при пожертвовании.</p></div></section>
<section class="sec bg-dp"><div class="wrap quote">${ph('Портрет донора')}<div><q>Я вложил в фонд, потому что знаю: эти деньги будут работать и через 30 лет.</q><p style="color:var(--go);font-weight:700;margin-top:24px">Имя Фамилия, донор фонда</p></div></div></section>
<section class="band bg-go"><div class="wrap cta"><div><h2 class="h2 h2-sm">Станьте частью истории фонда</h2><p style="opacity:.75;margin-top:8px">Любой вклад становится капиталом, который работает бессрочно</p></div><a class="btn btn-dark" href="donate.html">Сделать пожертвование</a></div></section>
`);

// ===== ОТЧЁТЫ =====
const vals = [12, 18, 25, 31, 40, 52, 61, 74, 86, 100, 118];
page('reports.html', 'Отчёты', 'Финансовая отчётность, аудиторские заключения, инвестиционная декларация и годовые отчёты Эндаумент-фонда.', 'reports.html', `
${phero('Отчёты', 'Отчёты и прозрачность', 'Мы публикуем финансовую отчётность, аудиторские заключения и результаты программ. Каждый донор может увидеть, как работает его вклад.')}
<section class="sec bg-li"><div class="wrap">${head('Итоги 2025 года', 'Ключевые показатели', '<a class="btn btn-outline" href="#archive">Годовой отчёт 2025</a>')}
<div class="grid g4">${[['₸ 00 млрд', 'целевой капитал', '+00% за год'], ['0,0%', 'доходность портфеля', 'среднегодовая за 5 лет'], ['₸ 0,0 млрд', 'направлено на программы', 'в 2025 году'], ['0,0%', 'административные расходы', 'от размера капитала']].map(([n, t, d]) => `<div class="numbox"><b>${n}</b><p style="font-size:16px">${t}</p><em>${d}</em></div>`).join('')}</div>
<div class="grid mt-40" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)" id="charts">
<div class="form"><h3 class="h3">Рост целевого капитала, ₸ млрд</h3><div class="bars" role="img" aria-label="График роста капитала 2016–2026">${vals.map((v, i) => `<div><i class="${i === vals.length - 1 ? 'g' : i >= vals.length - 4 ? 'r' : ''}" style="height:${Math.round(v / 118 * 100)}%"></i><span>${String(2016 + i).slice(-2)}</span></div>`).join('')}</div><p class="small">Данные условные — заменить фактическими</p></div>
<div class="mv bg-dp" style="padding:40px"><h3 class="h3">Куда направлен доход</h3><div class="alloc">${[['Гранты учёным', 45, 'var(--go)'], ['Стипендии', 30, '#fff'], ['Инфраструктура вузов', 15, 'var(--vi)'], ['Операционные расходы', 10, 'var(--mu)']].map(([l, p, c]) => `<div><div class="t"><span>${l}</span><b>${p}%</b></div><div class="tr"><i style="width:${p}%;background:${c}"></i></div></div>`).join('')}</div><div style="margin-top:auto"><p style="font-size:14px;opacity:.6">Итого в 2025 году</p><b style="font-size:36px;color:var(--go);font-weight:800">₸ 0,0 млрд</b></div></div>
</div></div></section>
<section class="sec bg-wh" id="archive"><div class="wrap">${head('Архив', 'Отчётность и документы')}
<div class="chips" style="margin-bottom:32px">${['Годовые отчёты', 'Аудит', 'Инвестиционная декларация', 'Реестр договоров', 'Меморандумы', 'Антикоррупционная политика'].map((t, i) => `<span class="chip${i ? '' : ' on'}">${t}</span>`).join('')}</div>
<div class="grid g4">${['2025', '2024', '2023', '2022'].map(y => `<div class="rep"><div class="cover"><small>Годовой отчёт</small><b>${y}</b></div><h3 class="h3" style="font-size:20px">Годовой отчёт ${y}</h3><div style="display:flex;justify-content:space-between"><span class="meta">PDF · 8,4 МБ</span><a class="link" href="#" style="font-size:15px">Скачать ↓</a></div></div>`).join('')}</div>
</div></section>
<section class="band bg-vi" style="padding:64px 0"><div class="wrap cta"><div class="txt-col"><span class="eb">Независимый аудит</span><h2 class="h2 h2-sm">Ежегодная проверка международной аудиторской компанией</h2></div><a class="btn btn-light" href="#">Аудиторское заключение</a></div></section>
`);

// ===== ПРЕСС-ЦЕНТР =====
page('press.html', 'Пресс-центр', 'Новости Эндаумент-фонда науки и образования, публикации в СМИ, фото и контакты пресс-службы.', 'press.html', `
${phero('Пресс-центр', 'Пресс-центр', 'Новости фонда, публикации в СМИ, фотоархив и ответы на обращения граждан.')}
<section class="sec bg-li" style="padding-top:72px"><div class="wrap">
<div class="chips" style="margin-bottom:40px">${['Новости', 'СМИ о нас', 'Фото и видео', 'Ответы на обращения', 'Для журналистов'].map((t, i) => `<span class="chip${i ? '' : ' on'}">${t}</span>`).join('')}</div>
<article class="card grid g2" style="gap:0">${ph('Фото события', '', 440)}<div class="card-b" style="padding:48px;justify-content:center"><div class="tags"><span class="tag gold">Главное</span><span class="date">12 сентября 2026</span></div><h2 class="h2 h2-sm"><a href="news-item.html">Подведены итоги конкурса грантов для молодых учёных</a></h2><p class="txt">Экспертный совет фонда определил победителей: 00 исследовательских проектов из 00 регионов получат поддержку на общую сумму ₸ 0,0 млрд.</p><a class="link" href="news-item.html">Читать →</a></div></article>
<div class="grid g3 mt-24">${NEWS.slice(1).map(newsCard).join('')}</div>
<nav class="pager" aria-label="Страницы"><a href="#">←</a><a class="on" href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">→</a></nav>
</div></section>
<section class="sec bg-vi" style="padding:72px 0"><div class="wrap cta"><div><span class="eb">Для журналистов</span><h2 class="h2 h2-sm">Пресс-служба фонда</h2><p style="opacity:.8;margin-top:8px"><a href="mailto:press@endowment.kz">press@endowment.kz</a> &nbsp;·&nbsp; +7 (7172) 00-00-00</p></div>
<form class="sub" name="subscribe" method="POST" action="/thanks.html" data-netlify="true"><input type="hidden" name="form-name" value="subscribe"><label class="visually-hidden" for="sub-email">E-mail</label><input id="sub-email" type="email" name="email" placeholder="Ваш e-mail для подписки" required><button class="btn btn-gold" type="submit">Подписаться</button></form></div></section>
`);

// ===== СТАТЬЯ =====
page('news-item.html', 'Подведены итоги конкурса грантов для молодых учёных', 'Экспертный совет фонда определил победителей ежегодного конкурса грантов для молодых учёных.', 'press.html', `
<section class="bg-li" style="padding:56px 0 48px"><div class="wrap">
<div class="crumbs" style="color:var(--mu)"><a href="index.html">Главная</a> &nbsp;/&nbsp; <a href="press.html">Пресс-центр</a> &nbsp;/&nbsp; Новости</div>
<div class="tags" style="margin-bottom:24px"><span class="tag wh vi">Гранты</span><span class="date">12 сентября 2026 · 4 мин чтения</span></div>
<h1 class="h1-page" style="color:var(--dp);max-width:960px">Подведены итоги конкурса грантов для молодых учёных</h1>
<div class="mt-40">${ph('Главное фото статьи', '', 560)}</div>
</div></section>
<section class="bg-li"><div class="wrap article">
<aside class="share"><small>Поделиться</small><a href="#">Telegram</a><a href="#">Facebook</a><a href="#">WhatsApp</a><a href="#">Ссылка</a></aside>
<div class="prose"><p class="lede">Экспертный совет фонда определил победителей ежегодного конкурса. Поддержку получат 00 исследовательских проектов из 00 регионов Казахстана.</p>
<p>Текст новости. Здесь размещается основной материал: подробности конкурса, количество заявок, критерии оценки, состав экспертного совета и комментарии участников.</p>
<h2 class="h3" style="font-size:28px">Как проходил отбор</h2>
<p>Заявки оценивались независимыми экспертами по открытым критериям: научная новизна, квалификация команды, реалистичность плана и ожидаемый эффект для науки и экономики страны.</p>
<blockquote><p>«Каждый грант — это вклад не только в конкретного учёного, но и в научную школу, которая будет работать десятилетиями».</p><cite>Имя Фамилия, председатель экспертного совета</cite></blockquote>
<p>Договоры с победителями будут подписаны до конца года, финансирование начнётся в январе. Следующий конкурс стартует весной.</p>
${ph('Фото с церемонии', 'dark', 420)}</div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head('Пресс-центр', 'Читайте также', '<a class="btn btn-outline" href="press.html">Все новости</a>')}<div class="grid g3">${NEWS.slice(1, 4).map(newsCard).join('')}</div></div></section>
`);

// ===== КОНТАКТЫ =====
page('contacts.html', 'Контакты', 'Контакты Эндаумент-фонда науки и образования: адрес, телефоны, e-mail отделов и форма обратной связи.', 'contacts.html', `
${phero('Контакты', 'Контакты', 'Мы открыты к вопросам, предложениям о партнёрстве и обращениям граждан.')}
<section class="sec bg-li"><div class="wrap">
<div class="grid g4">${[['Общие вопросы', 'info@endowment.kz', '+7 (7172) 00-00-00'], ['Донорам и партнёрам', 'donors@endowment.kz', '+7 (7172) 00-00-01'], ['Грантовые программы', 'grants@endowment.kz', '+7 (7172) 00-00-02'], ['Пресс-служба', 'press@endowment.kz', '+7 (7172) 00-00-03']].map(([h, e, t]) => `<div class="numbox" style="background:var(--wh)"><span class="eb" style="margin-bottom:10px">${h}</span><a class="h3" style="font-size:19px;display:block" href="mailto:${e}">${e}</a><p style="font-size:16px;margin-top:6px">${t}</p></div>`).join('')}</div>
<div class="grid mt-24" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr)">
<div class="map" aria-label="Карта: офис фонда"><div class="pin">${NAME}<br>г. Астана, пр. Мангилик Ел, 00</div></div>
<div class="mv bg-dp" style="padding:40px"><span class="eb">Офис фонда</span><h3 class="h3" style="font-size:24px">г. Астана, пр. Мангилик Ел, 00, офис 000</h3><p class="txt">Пн–Пт, 9:00–18:00<br>Приём граждан — по предварительной записи</p><a class="btn btn-light" style="align-self:flex-start" href="https://2gis.kz/astana" target="_blank" rel="noopener">Построить маршрут</a></div>
</div></div></section>
<section class="sec bg-wh"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">Обратная связь</span><h2 class="h2">Напишите нам</h2></div><p class="txt">Ответим в течение 3 рабочих дней. Официальные обращения граждан рассматриваются в сроки, установленные законодательством РК.</p></div>
${formOpen('contact')}<div class="frow">${field('Имя', 'name', 'Имя Фамилия')}${field('E-mail', 'email', 'name@mail.kz', 'email')}</div>
${select('Тема обращения', 'topic', ['Общий вопрос', 'Пожертвование', 'Партнёрство', 'Грантовые программы', 'Обращение гражданина', 'СМИ'])}
${area('Сообщение', 'message', 'Текст обращения')}${agree}<button class="btn btn-gold" type="submit">Отправить</button></form>
</div></section>
`);

// ===== СПАСИБО и 404 =====
page('thanks.html', 'Спасибо', 'Ваша заявка отправлена.', '', `
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><h1 class="h1-page">Спасибо!</h1><p class="lead">Мы получили ваше сообщение и свяжемся с вами в течение 3 рабочих дней.</p><div class="btn-row mt-40"><a class="btn btn-gold" href="index.html">На главную</a></div></div></section>`);
page('404.html', 'Страница не найдена', 'Страница не найдена.', '', `
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><h1 class="h1-page">404 — страница не найдена</h1><p class="lead">Возможно, она была перемещена. Начните с главной.</p><div class="btn-row mt-40"><a class="btn btn-gold" href="index.html">На главную</a></div></div></section>`);

// sitemap / robots
const files = ['', 'about.html', 'programs.html', 'grants.html', 'donate.html', 'donors.html', 'reports.html', 'press.html', 'news-item.html', 'contacts.html'];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map(f => `  <url><loc>${SITE}/${f}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('built', fs.readdirSync(OUT).filter(f => f.endsWith('.html')).length, 'pages');
