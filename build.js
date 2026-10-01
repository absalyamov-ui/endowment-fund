// Генератор статического сайта Эндаумент-фонда на трёх языках.
// Запуск: node build.js  →  готовый сайт в папке public/.
//   русский   — корень сайта (/about.html)
//   казахский — /kz/about.html
//   английский — /en/about.html
// Тексты лежат в i18n/ru.js, i18n/kz.js, i18n/en.js. Разметка — в этом файле.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'public');
const STATIC = path.join(__dirname, 'static');
const SITE = 'https://endowment.kz';
const LANGS = { ru: require('./i18n/ru'), kz: require('./i18n/kz'), en: require('./i18n/en') };
const PREFIX = { ru: '', kz: 'kz/', en: 'en/' };
const HREFLANG = { ru: 'ru', kz: 'kk', en: 'en' };
const NAV_FILES = ['about.html', 'programs.html', 'grants.html', 'donate.html', 'reports.html', 'press.html', 'contacts.html'];
const PROG_META = [['edu', 'gold', '', 'campus'], ['sci', 'gold', '', 'lib2'], ['inn', 'gold', '', 'aisana'], ['edu', 'gold', '', 'lib1'], ['sci', 'gold', '', 'folder'], ['inn', 'gold', '', 'meet']];
const NEWS_IMG = ['hold'];
const PARTNERS = [['alageum', 'Alageum Electric', 48], ['mnvo', 'Министерство науки и высшего образования РК', 70], ['freedom', 'Freedom Broker', 52], ['sdu', 'SDU University', 92]]; // логотип, название, макс. высота // фото к новостям по порядку
const BOARD_IMG = ['ilyasov', 'nurbek', 'turlov', 'dzhumadildaev', 'stvaev', 'kuanganov', 'madibekov', 'abdrakhmanov'];
const EMAIL = 'endowment@alageum.com';
const FILTERS = ['all', 'edu', 'sci', 'inn'];

// Статика и логотипы
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(STATIC, OUT, { recursive: true });
const IMG = path.join(OUT, 'assets', 'img');
for (const l of Object.keys(LANGS)) {
  const svg = fs.readFileSync(path.join(IMG, `logo-${l}.svg`), 'utf8');
  fs.writeFileSync(path.join(IMG, `logo-${l}-white.svg`), svg.replace(/#2B005B/g, '#FFFFFF'));
}
fs.copyFileSync(path.join(IMG, 'sign.svg'), path.join(OUT, 'favicon.svg'));

const sitemap = [];
for (const [lang, t] of Object.entries(LANGS)) buildLang(lang, t);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('built', sitemap.length, 'pages');

function buildLang(lang, t) {
  const pre = PREFIX[lang];
  const R = pre ? '../' : '';
  const DIR = path.join(OUT, pre);
  fs.mkdirSync(DIR, { recursive: true });
  const u = t.ui;
  const logo = `${R}assets/img/logo-${lang}.svg`;
  const logoW = `${R}assets/img/logo-${lang}-white.svg`;

  // ---------- компоненты ----------
  const ph = (label, cls = '', h, img, pos) => img
    ? `<div class="ph has-img ${cls}"${h ? ` style="min-height:${h}px"` : ''}><img src="${R}assets/img/photos/${img}.jpg" alt="${label}" loading="lazy"${pos ? ` style="object-position:${pos}"` : ''}></div>`
    : `<div class="ph ${cls}"${h ? ` style="min-height:${h}px"` : ''} role="img" aria-label="${label}"><span>${label}</span></div>`;
  const head = (eb, h, btn) => `<div class="head"><div><span class="eb">${eb}</span><h2 class="h2">${h}</h2></div>${btn || ''}</div>`;
  const faq = items => `<div class="faq">${items.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  const field = (label, name, p, type = 'text') => `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" placeholder="${p}" required></div>`;
  const select = (label, name, opts) => `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}" required><option value="">${u.choose}</option>${opts.map(o => `<option>${o}</option>`).join('')}</select></div>`;
  const area = (label, name, p) => `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" placeholder="${p}" required></textarea></div>`;
  const agree = `<label class="agree"><input type="checkbox" required> ${u.agree}</label>`;
  const hidden = name => `<input type="hidden" name="form-name" value="${name}"><input type="hidden" name="language" value="${lang}"><p class="visually-hidden"><label>${u.honeypot}: <input name="bot-field"></label></p>`;
  const formOpen = (name, extra = '') => `<form class="form"${extra} name="${name}" method="POST" action="/${pre}thanks.html" data-netlify="true" netlify-honeypot="bot-field">${hidden(name)}`;
  const phero = (crumb, title, lead) => `<section class="phero pat pat-bg"><div class="wrap"><div class="crumbs"><a href="index.html">${u.home}</a> &nbsp;/&nbsp; ${crumb}</div><h1 class="h1-page">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;
  const langLinks = file => Object.keys(LANGS).map(l => `<a${l === lang ? ' class="on" aria-current="true"' : ''} href="${R}${PREFIX[l]}${file}" hreflang="${HREFLANG[l]}" lang="${HREFLANG[l]}">${LANGS[l].ui.langCode}</a>`).join('');

  const progCard = (i, withCat = true) => {
    const [cat, tc, cls, img] = PROG_META[i]; const [tag, catName, h, txt] = t.progs[i];
    return `<article class="card" data-cat="${cat}">${ph(t.progs[i][2], cls, null, img)}<div class="card-b"><div class="tags"><span class="tag ${tc}">${tag}</span>${withCat ? `<span class="tag vi">${catName}</span>` : ''}</div><h3 class="h3">${h}</h3><p class="txt">${txt}</p><a class="link" href="grants.html">${u.conditions} →</a></div></article>`;
  };
  const newsCard = (i) => { const [d, cat, h] = t.news[i]; return `<article class="card">${ph(NEWS_IMG[i] ? h : u.photo, i % 2 ? '' : 'dark', null, NEWS_IMG[i])}<div class="card-b"><div class="tags"><span class="tag vi">${cat}</span><span class="date">${d}</span></div><h3 class="h3"><a href="news-item.html">${h}</a></h3></div></article>`; };
  const partners = PARTNERS.map(([f, n, h]) => `<div class="logo-box"><img src="${R}assets/img/partners/${f}.png" alt="${n}" style="max-height:${h}px" loading="lazy"></div>`).join('');
  const people = (n, roles) => Array.from({ length: n }, (_, i) => `<div class="person">${ph(u.portrait, i % 2 ? '' : 'dark')}<h3 class="h3">${u.fullName}</h3><p class="txt">${roles[i % roles.length]}</p></div>`).join('');

  const header = (active, file) => `<header class="hdr"><div class="wrap">
<a class="logo" href="index.html" aria-label="${t.name} — ${u.toHome}"><img src="${logo}" alt="${t.name}" width="282" height="48"></a>
<nav class="nav" aria-label="${u.mainMenu}">${NAV_FILES.map((f, i) => `<a href="${f}"${f === active ? ' class="active"' : ''}>${u.nav[i]}</a>`).join('')}</nav>
<div class="hdr-act"><div class="lang">${langLinks(file)}</div>
<button class="burger" aria-label="${u.menu}" aria-expanded="false"><span></span><span></span><span></span></button></div>
</div></header>
<nav class="mnav" aria-label="${u.mobileMenu}">${NAV_FILES.map((f, i) => `<a href="${f}">${u.nav[i]}</a>`).join('')}<div class="lang">${langLinks(file)}</div></nav>`;

  const f = t.footer;
  const footer = `<footer class="ftr"><div class="wrap">
<div class="ftr-top">
<div><a class="logo" href="index.html"><img src="${logoW}" alt="${t.name}" width="306" height="52"></a>
<p>${f.about}</p>
<div class="soc"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="Facebook">FB</a><a href="#" aria-label="YouTube">YT</a><a href="#" aria-label="Telegram">TG</a><a href="#" aria-label="LinkedIn">in</a></div></div>
<div><h4>${f.fund}</h4><ul>${['about.html', 'about.html#board', 'about.html#team', 'about.html#docs', 'about.html#jobs'].map((h, i) => `<li><a href="${h}">${f.fundLinks[i]}</a></li>`).join('')}</ul></div>
<div><h4>${f.work}</h4><ul>${['programs.html', 'grants.html', 'reports.html', 'press.html'].map((h, i) => `<li><a href="${h}">${f.workLinks[i]}</a></li>`).join('')}</ul></div>
<div><h4>${f.donors}</h4><ul>${['donate.html'].map((h, i) => `<li><a href="${h}">${f.donorLinks[i]}</a></li>`).join('')}</ul></div>
<div><h4>${f.contacts}</h4><ul><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li>${f.address}</li><li>${f.hours}</li></ul></div>
</div>
<div class="ftr-bot"><span>© <span data-year>2026</span> ${t.name}</span><span><a href="#">${f.privacy}</a> · <a href="${R}sitemap.xml">${f.sitemap}</a></span></div>
</div></footer>`;

  function page(file, title, desc, active, body) {
    const full = file === 'index.html' ? t.homeTitle : `${title} — ${t.name}`;
    const alt = Object.keys(LANGS).map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${SITE}/${PREFIX[l]}${file === 'index.html' ? '' : file}">`).join('\n');
    const url = `${SITE}/${pre}${file === 'index.html' ? '' : file}`;
    if (!['thanks.html', '404.html'].includes(file)) sitemap.push(url);
    fs.writeFileSync(path.join(DIR, file), `<!doctype html>
<html lang="${t.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${full}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
${alt}
<link rel="alternate" hreflang="x-default" href="${SITE}/${file === 'index.html' ? '' : file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${full}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="${t.og}">
<meta name="theme-color" content="#2B005B">
<link rel="icon" href="${R}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${R}assets/css/style.css">
</head>
<body>
${header(active, file)}
<main>
${body}
</main>
${footer}
<script src="${R}assets/js/main.js" defer></script>
</body>
</html>
`);
  }

  // ---------- ГЛАВНАЯ ----------
  const x = t.index;
  page('index.html', u.home, x.desc, '', `
<section class="hero hero-bg"><div class="wrap">
<div class="hero-row"><div><span class="eb" style="color:var(--go)">${t.name}</span><h1 class="h1">${x.h1}</h1>
<p class="lead">${x.lead}</p>
<div class="btn-row"><a class="btn btn-gold" href="donate.html">${u.donate}</a><a class="btn btn-light" href="grants.html">${x.btnGrant}</a></div></div>
<div class="hero-space" aria-hidden="true"></div></div>
<div class="stats">${x.stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
</div></section>
<section class="sec bg-li"><div class="wrap split">
<div><span class="eb">${x.aboutEb}</span><h2 class="h2">${x.aboutH}</h2></div>
<div class="stack pt-44"><p class="txt" style="font-size:18px">${x.aboutP1}</p><p class="txt" style="font-size:18px">${x.aboutP2}</p><a class="link" href="about.html">${x.aboutLink} →</a></div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head(x.dirEb, x.dirH)}
<div class="grid g4">${x.dirs.map(([h, d], i) => `<div class="val"><span class="n">0${i + 1}</span><span class="bar"></span><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-dp"><div class="wrap">${head(x.howEb, x.howH)}
<div class="steps">${x.steps.map(([h, d], i) => `<div class="step"><b>0${i + 1}</b><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>${i < 3 ? '<span class="step-arr" aria-hidden="true">→</span>' : ''}`).join('')}</div>
<p class="note">${x.note}</p>
</div></section>
<section class="sec bg-li"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">${x.prEb}</span><h2 class="h2">${x.prH}</h2></div><p class="txt">${x.prLead}</p></div>
<div class="grid g2">${x.principles.map(([h, d]) => `<div class="pr"><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head(x.progEb, x.progH, `<a class="btn btn-outline" href="programs.html">${u.allPrograms}</a>`)}
<div class="grid g3">${[0, 1, 2].map(i => progCard(i, false)).join('')}</div>
</div></section>
<section class="sec bg-vi pat pat-bg"><div class="wrap cta"><div class="txt-col"><span class="eb">${x.ctaEb}</span><h2 class="h2">${x.ctaH}</h2><p class="lead" style="margin-top:20px">${x.ctaP}</p></div>
<div class="stack" style="gap:16px"><a class="btn btn-gold" href="grants.html#apply">${x.ctaBtn}</a><a class="btn btn-light" href="grants.html">${x.ctaBtn2}</a></div></div></section>
<section class="sec bg-wh" style="padding:96px 0"><div class="wrap">${head(x.donEb, x.donH, `<a class="btn btn-outline" href="donate.html">${x.donBtn}</a>`)}
<div class="grid g4 partners">${partners}</div></div></section>
<section class="sec bg-li"><div class="wrap">${head(x.newsEb, x.newsH, `<a class="btn btn-outline" href="press.html">${u.allNews}</a>`)}
<div class="grid g3">${[0, 1, 2].map(newsCard).join('')}</div></div></section>
`);

  // ---------- О ФОНДЕ ----------
  const a = t.about;
  page('about.html', a.title, a.desc, 'about.html', `
${phero(a.title, a.title, a.lead)}
<section class="sec bg-li"><div class="wrap">
<div class="grid g2"><div class="mv bg-dp"><span class="eb">${a.mission[0]}</span><h2 class="h2 h2-sm">${a.mission[1]}</h2><p class="txt">${a.mission[2]}</p></div>
<div class="mv bg-wh"><span class="eb">${a.vision[0]}</span><h2 class="h2 h2-sm">${a.vision[1]}</h2><p class="txt">${a.vision[2]}</p></div></div>
<div class="grid g4 mt-56">${a.values.map(([h, d]) => `<div class="vline"><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head(a.histEb, a.histH)}
<div class="tl">${a.history.map(([y, h, d], i) => `<div class="tl-i${i === a.history.length - 1 ? ' now' : ''}"><div class="tl-dot"><i></i><s></s></div><b>${y}</b><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div>
</div></section>
<section class="sec bg-li" id="board"><div class="wrap">${head(a.boardEb, a.boardH)}<div class="grid g4">${a.board.map(([n, r], i) => `<div class="person">${BOARD_IMG[i] ? ph(n, '', null, 'board/' + BOARD_IMG[i], 'center 20%') : ph(u.portrait, i % 2 ? '' : 'dark')}<h3 class="h3">${n}</h3><p class="txt">${r}</p></div>`).join('')}</div></div></section>
<section class="sec bg-wh" id="team"><div class="wrap">${head(a.teamEb, a.teamH)}<div class="grid dir-grid"><div class="person">${ph(a.director[0], 'dark', null, 'makenov', 'center 25%')}<h3 class="h3">${a.director[0]}</h3><p class="txt">${a.director[1]}</p></div>
<div class="dir-info"><p class="lead-dk">${a.bio}</p><h3 class="h3" style="margin-top:40px">${a.govH}</h3><div class="grid g3" style="margin-top:20px">${a.gov.map(([h, d]) => `<div class="vline"><h3 class="h3" style="font-size:18px">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div></div></div></div></section>
<section class="sec bg-li" id="docs"><div class="wrap">${head(a.docsEb, a.docsH)}
<div>${a.docs.map(d => `<div class="rowline"><span class="pdf">PDF</span><h3 class="h3 grow">${d}</h3><a class="link" href="#">${u.download} ↓</a></div>`).join('')}</div>
</div></section>
<section class="band bg-go" id="jobs"><div class="wrap cta"><div><h2 class="h2 h2-sm">${a.jobsH}</h2><p style="opacity:.75;margin-top:8px">${a.jobsP}</p></div><a class="btn btn-dark" href="mailto:${EMAIL}">${a.jobsBtn}</a></div></section>
`);

  // ---------- ПРОГРАММЫ ----------
  const p = t.programs;
  page('programs.html', p.title, p.desc, 'programs.html', `
${phero(p.title, p.title, p.lead)}
<section class="sec bg-wh"><div class="wrap">${head(p.mainEb, p.mainH)}
<div class="grid g3">${p.main.map(([cat, h, bud, per, d, l]) => `<div class="form prog-main" style="gap:16px"><span class="tag vi" style="align-self:flex-start">${cat}</span><h3 class="h3">${h}</h3><dl class="pm-meta"><div><dt>${p.budgetL}</dt><dd>${bud}</dd></div><div><dt>${p.periodL}</dt><dd>${per}</dd></div></dl><p class="txt">${d}</p><hr style="border:0;border-top:1px solid var(--ln);margin:4px 0;width:100%">${l.map(y => `<span class="check">${y}</span>`).join('')}</div>`).join('')}</div>
</div></section>
<section class="sec bg-li"><div class="wrap">${head(p.cardsEb, p.cardsH)}
<div class="toolbar"><div class="chips" data-filter>${FILTERS.map((v, i) => `<button class="chip${i ? '' : ' on'}" data-value="${v}">${p.filters[i]}</button>`).join('')}</div>
<label class="search"><span class="visually-hidden">${p.search}</span><input id="prog-search" type="search" placeholder="${p.search}"><span aria-hidden="true">⌕</span></label></div>
<div class="grid g3">${t.progs.map((_, i) => progCard(i)).join('')}</div>
</div></section>
<section class="flag bg-dp"><div class="in"><span class="eb">${p.flagEb}</span><h2 class="h2">${p.flagH}</h2><p class="lead" style="margin-top:20px;font-size:18px">${p.flagP}</p>
<div class="kpis">${p.kpis.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div><a class="btn btn-gold" href="grants.html">${p.flagBtn}</a></div>${ph(p.flagPhoto, '', null, 'aisana')}</section>
<section class="sec bg-wh"><div class="wrap">${head(p.resEb, p.resH)}
<div class="grid g4">${p.results.map(([n, d]) => `<div class="numbox"><b>${n}</b><p class="txt">${d}</p></div>`).join('')}</div></div></section>
`);

  // ---------- КАК ПОЛУЧИТЬ ГРАНТ ----------
  const g = t.grants;
  page('grants.html', g.title, g.desc, 'grants.html', `
${phero(g.title, g.title, g.lead)}
<section class="sec bg-li"><div class="wrap">${head(g.whoEb, g.whoH)}
<div class="grid g3">${g.who.map(([h, d, l]) => `<div class="form" style="gap:16px"><h3 class="h3">${h}</h3><p class="txt">${d}</p><hr style="border:0;border-top:1px solid var(--ln);margin:4px 0;width:100%">${l.map(y => `<span class="check">${y}</span>`).join('')}</div>`).join('')}</div>
</div></section>
<section class="sec bg-dp"><div class="wrap">${head(g.stEb, g.stH)}
<div>${g.stages.map(([h, d, s], i) => `<div class="stage"><b>0${i + 1}</b><div><h3 class="h3">${h}</h3><p class="txt">${d}</p></div><span class="tag">${s}</span></div>`).join('')}</div>
</div></section>
<section class="sec bg-li" id="apply"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">${g.docsEb}</span><h2 class="h2 h2-sm">${g.docsH}</h2></div>
<div>${g.docs.map(y => `<div class="rowline" style="padding:14px 0"><span style="color:var(--go);font-weight:700">—</span><span class="grow" style="font-size:16px">${y}</span></div>`).join('')}</div>
<a class="link" href="#">${g.tpl} ↓</a></div>
${formOpen('grant-application')}
<h3 class="h3">${g.formH}</h3><p class="txt">${g.formP}</p>
<div class="frow">${field(g.f.name, 'name', u.namePh)}${field(g.f.org, 'org', g.f.orgPh)}</div>
<div class="frow">${field('E-mail', 'email', 'name@mail.kz', 'email')}${field(g.f.phone, 'phone', '+7 (___) ___-__-__', 'tel')}</div>
${select(g.f.program, 'program', t.programs.main.map(r => r[1]))}
${area(g.f.about, 'about', g.f.aboutPh)}
${agree}<button class="btn btn-gold" type="submit">${g.f.submit}</button></form>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head(g.faqEb, g.faqH)}${faq(g.faq)}</div></section>
`);

  // ---------- ПОЖЕРТВОВАНИЕ ----------
  const d = t.donate;
  page('donate.html', d.title, d.desc, 'donate.html', `
${phero(d.title, d.h1, d.lead)}
<section class="sec bg-li"><div class="wrap">${head(d.whyEb, d.whyH)}
<div class="grid g4 why">${d.why.map(([h, x], i) => `<div class="vline"><b class="why-n">0${i + 1}</b><h3 class="h3" style="font-size:20px">${h}</h3><p class="txt">${x}</p></div>`).join('')}</div></div></section>
<section class="sec bg-wh"><div class="wrap">${head(d.fmtEb, d.fmtH, `<a class="btn btn-outline" href="#apply">${d.fmtBtn}</a>`)}
<div class="grid g3">${d.fmts.map(([h, sub, x], i) => `<div class="mv ${['bg-li', 'bg-vi', 'bg-dp'][i]}"><span style="color:var(--go);font-weight:700;font-size:15px">${sub}</span><h3 class="h3" style="font-size:28px">${h}</h3><p class="txt">${x}</p></div>`).join('')}</div></div></section>
<section class="sec bg-li"><div class="wrap">${head(d.reqEb, d.reqH)}
<div class="mv bg-dp req-wide"><dl class="req" style="margin:0">${d.req.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div></div></section>
<section class="sec bg-wh"><div class="wrap">${head(d.faqEb, d.faqH)}${faq(d.faq)}</div></section>
<section class="sec bg-li" id="apply"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">${d.formEb}</span><h2 class="h2">${d.formH}</h2></div><p class="txt">${d.formP}</p><p class="txt"><a class="link" href="mailto:${EMAIL}">${EMAIL}</a></p></div>
${formOpen('contributor')}
${field(d.f.name, 'name', u.namePh)}
<div class="frow">${field(d.f.phone, 'phone', '+7 (___) ___-__-__', 'tel')}${field('E-mail', 'email', 'name@mail.kz', 'email')}</div>
<div class="frow">${select(d.f.type, 'type', d.f.types)}${field(d.f.amount, 'amount', d.f.amountPh)}</div>
${field(d.f.time, 'time', d.f.timePh)}
${field(d.f.topic, 'topic', d.f.topicPh)}
${area(d.f.message, 'message', d.f.messagePh)}
${agree}<button class="btn btn-gold" type="submit">${d.f.submit}</button></form>
</div></section>
`);

  // ---------- ОТЧЁТЫ ----------
  const r = t.reports;
  page('reports.html', r.title, r.desc, 'reports.html', `
${phero(r.title, r.h1, r.lead)}
<section class="sec bg-li"><div class="wrap">${head(r.keyEb, r.keyH, `<a class="btn btn-outline" href="#archive">${r.keyBtn}</a>`)}
<div class="grid g4">${r.kpis.map(([n, s, dd]) => `<div class="numbox"><b>${n}</b><p style="font-size:16px">${s}</p><em>${dd}</em></div>`).join('')}</div>
<div class="grid mt-40" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)" id="charts">
<div class="form"><h3 class="h3">${r.chartH}</h3><div class="bars" role="img" aria-label="${r.chartAria}">${r.chart.map(([y, v], i) => `<div><b class="bv">${v.toLocaleString('ru-RU')}</b><i class="${i === r.chart.length - 1 ? 'g' : 'r'}" style="height:${Math.round(v / Math.max(...r.chart.map(c => c[1])) * 85)}%"></i><span>${y}</span></div>`).join('')}</div><p class="small">${r.chartNote}</p></div>
<div class="mv bg-dp" style="padding:40px"><h3 class="h3">${r.allocH}</h3><div class="alloc">${r.alloc.map(([l, val, pc], i) => { const c = ['var(--go)', '#fff', 'var(--vi)', 'var(--mu)'][i]; return `<div><div class="t"><span>${l}</span><b>${val}</b></div><div class="tr"><i style="width:${pc}%;background:${c}"></i></div></div>`; }).join('')}</div><div style="margin-top:auto"><p style="font-size:14px;opacity:.6">${r.totalLabel}</p><b style="font-size:36px;color:var(--go);font-weight:800">${r.total}</b></div></div>
</div></div></section>
<section class="sec bg-wh" id="archive"><div class="wrap">${head(r.archEb, r.archH)}
<div class="chips" style="margin-bottom:32px">${r.tabs.map((y, i) => `<span class="chip${i ? '' : ' on'}">${y}</span>`).join('')}</div>
<div class="grid g4">${r.arch.map(([k, y, h]) => `<div class="rep"><div class="cover"><small>${k}</small><b>${y}</b></div><h3 class="h3" style="font-size:20px">${h}</h3><div style="display:flex;justify-content:space-between"><span class="meta">PDF</span><a class="link" href="#" style="font-size:15px">${u.download} ↓</a></div></div>`).join('')}</div>
</div></section>
<section class="band bg-vi" style="padding:64px 0"><div class="wrap cta"><div class="txt-col"><span class="eb">${r.auditEb}</span><h2 class="h2 h2-sm">${r.auditH}</h2></div><a class="btn btn-light" href="#">${r.auditBtn}</a></div></section>
`);

  // ---------- ПРЕСС-ЦЕНТР ----------
  const s = t.press;
  page('press.html', s.title, s.desc, 'press.html', `
${phero(s.title, s.title, s.lead)}
<section class="sec bg-li" style="padding-top:72px"><div class="wrap">
<div class="chips" style="margin-bottom:40px">${s.tabs.map((y, i) => `<span class="chip${i ? '' : ' on'}">${y}</span>`).join('')}</div>
<article class="card grid g2" style="gap:0">${ph(t.news[0][2], '', 440, 'hold', 'center 35%')}<div class="card-b" style="padding:48px;justify-content:center"><div class="tags"><span class="tag gold">${s.main}</span><span class="date">${t.news[0][0]}</span></div><h2 class="h2 h2-sm"><a href="news-item.html">${t.news[0][2]}</a></h2><p class="txt">${s.featP}</p><a class="link" href="news-item.html">${u.readMore} →</a></div></article>
<div class="grid g3 mt-24">${[1, 2, 3, 4, 5, 6].map(newsCard).join('')}</div>
<nav class="pager" aria-label="${u.pages}"><a href="#">←</a><a class="on" href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">→</a></nav>
</div></section>
<section class="sec bg-vi" style="padding:72px 0"><div class="wrap cta"><div><span class="eb">${s.journEb}</span><h2 class="h2 h2-sm">${s.journH}</h2><p style="opacity:.8;margin-top:8px"><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
<form class="sub" name="subscribe" method="POST" action="/${pre}thanks.html" data-netlify="true"><input type="hidden" name="form-name" value="subscribe"><input type="hidden" name="language" value="${lang}"><label class="visually-hidden" for="sub-email">E-mail</label><input id="sub-email" type="email" name="email" placeholder="${s.subPh}" required><button class="btn btn-gold" type="submit">${s.subBtn}</button></form></div></section>
`);

  // ---------- СТАТЬЯ ----------
  const n = t.article;
  page('news-item.html', t.news[0][2], n.desc, 'press.html', `
<section class="bg-li" style="padding:56px 0 48px"><div class="wrap">
<div class="crumbs" style="color:var(--mu)"><a href="index.html">${u.home}</a> &nbsp;/&nbsp; <a href="press.html">${t.press.title}</a> &nbsp;/&nbsp; ${n.crumb}</div>
<div class="tags" style="margin-bottom:24px"><span class="tag wh vi">${t.news[0][1]}</span><span class="date">${t.news[0][0]} · ${n.readTime}</span></div>
<h1 class="h1-page" style="color:var(--dp);max-width:960px">${t.news[0][2]}</h1>
<div class="mt-40">${ph(t.news[0][2], '', 560, 'sign', 'center 40%')}</div>
</div></section>
<section class="bg-li"><div class="wrap article">
<aside class="share"><small>${n.share}</small><a href="#">Telegram</a><a href="#">Facebook</a><a href="#">WhatsApp</a><a href="#">${n.link}</a></aside>
<div class="prose"><p class="lede">${n.lede}</p>
<p>${n.p1}</p>
<h2 class="h3" style="font-size:28px">${n.h2}</h2>
<p>${n.p2}</p>
<blockquote><p>${n.quote}</p><cite>${n.quoteBy}</cite></blockquote>
<p>${n.p3}</p>
${ph(n.photoCeremony, 'dark', 420, 'group')}
<h2 class="h3" style="font-size:28px">${n.galleryH}</h2>
<div class="grid g2 gallery">${['hold', 'meet', 'folder', 'lib2', 'lib1', 'campus'].map(k => ph(n.photoCeremony, '', 240, k)).join('')}</div></div>
</div></section>
<section class="sec bg-wh"><div class="wrap">${head(t.press.title, n.alsoH, `<a class="btn btn-outline" href="press.html">${u.allNews}</a>`)}<div class="grid g3">${[1, 2, 3].map(newsCard).join('')}</div></div></section>
`);

  // ---------- КОНТАКТЫ ----------
  const c = t.contacts;
  page('contacts.html', c.title, c.desc, 'contacts.html', `
${phero(c.title, c.title, c.lead)}
<section class="sec bg-li"><div class="wrap">
<div class="numbox" style="background:var(--wh)"><span class="eb" style="margin-bottom:10px">${c.allQ}</span><a class="h3" style="font-size:clamp(22px,2.4vw,32px);display:block;word-break:break-all" href="mailto:${EMAIL}">${EMAIL}</a></div>
<div class="grid mt-24" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr)">
<div class="map"><iframe src="https://www.google.com/maps?q=51.134021,71.4337485&amp;z=16&amp;hl=${HREFLANG[lang]}&amp;output=embed" title="${c.mapAria}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
<div class="mv bg-dp" style="padding:40px"><span class="eb">${c.office}</span><h3 class="h3" style="font-size:24px">${c.addr}</h3><p class="txt">${c.hours}</p><a class="btn btn-light" style="align-self:flex-start" href="https://maps.app.goo.gl/g34qZp13ujU8Q2R17" target="_blank" rel="noopener">${c.route}</a></div>
</div></div></section>
<section class="sec bg-wh"><div class="wrap split split-5-7">
<div class="stack"><div><span class="eb">${c.fbEb}</span><h2 class="h2">${c.fbH}</h2></div><p class="txt">${c.fbP}</p></div>
${formOpen('contact')}<div class="frow">${field(c.f.name, 'name', u.namePh)}${field('E-mail', 'email', 'name@mail.kz', 'email')}</div>
${select(c.f.topic, 'topic', c.f.topics)}
${area(c.f.message, 'message', c.f.messagePh)}${agree}<button class="btn btn-gold" type="submit">${c.f.submit}</button></form>
</div></section>
`);

  // ---------- СПАСИБО / 404 ----------
  page('thanks.html', t.thanks.title, t.thanks.p, '', `
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><h1 class="h1-page">${t.thanks.title}</h1><p class="lead">${t.thanks.p}</p><div class="btn-row mt-40"><a class="btn btn-gold" href="index.html">${t.thanks.btn}</a></div></div></section>`);
  page('404.html', t.nf.title, t.nf.p, '', `
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><h1 class="h1-page">${t.nf.h1}</h1><p class="lead">${t.nf.p}</p><div class="btn-row mt-40"><a class="btn btn-gold" href="${R}${pre}index.html">${t.thanks.btn}</a></div></div></section>`);
}
