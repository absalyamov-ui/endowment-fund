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
const SITE = 'https://endowment-fund.kz';
const LANGS = { ru: require('./i18n/ru'), kz: require('./i18n/kz'), en: require('./i18n/en') };
const PREFIX = { ru: '', kz: 'kz/', en: 'en/' };
const HREFLANG = { ru: 'ru', kz: 'kk', en: 'en' };
const NAV_FILES = ['index.html', 'about.html', 'programs.html', 'grants.html', 'donate.html', 'reports.html', 'press.html', 'contacts.html'];
const PROG_META = [['edu', 'gold', '', 'p-grad'], ['sci', 'gold', '', 'p-dna'], ['inn', 'gold', '', 'p-aisana'], ['edu', 'gold', '', 'p-class'], ['sci', 'gold', '', 'p-micro'], ['inn', 'gold', '', 'p-robot']];
const MEDIA = require('./media');
const PARTNERS_ALL = require('./partners');
// Типографика: короткие предлоги/союзы не остаются в конце строки (неразрывный пробел после них), тире не переносится в начало строки
const SHORT = {
  ru: 'в|во|без|до|из|изо|к|ко|на|над|о|об|обо|от|ото|по|под|при|про|с|со|у|за|для|и|а|но|не|ни|да|или|что|как|из-за|из-под',
  kz: 'және|мен|бен|пен|не|да|де|та|те|ал|бұл|сол|осы|әр|бір|ҚР',
  en: 'a|an|the|of|to|in|on|at|by|for|and|or|but|nor|as|is|be|with|from|into|via|per|no|not|our|its|it|we|up',
};
function typo(html, lang) {
  const re = new RegExp(`(^|[\\s(«“"„>—–])(${SHORT[lang]})\\s+(?=[^\\s<])`, 'giu');
  let skip = false;
  return html.split(/(<[^>]+>)/).map(part => {
    if (part.startsWith('<')) {
      if (/^<(script|style|textarea)\b/i.test(part)) skip = true;
      else if (/^<\/(script|style|textarea)>/i.test(part)) skip = false;
      return part;
    }
    if (skip || !part.trim()) return part;
    let s = part;
    for (let k = 0; k < 2; k++) s = s.replace(re, (m, a, w) => `${a}${w} `); // дважды — для цепочек «и в»
    if (lang === 'ru') s = s.replace(/ (ли|же|бы|ль|ж|б)(?=[\s,.?!:;)»]|$)/gu, '\u00A0$1');
    return s.replace(/ ([—–]) /g, ' $1 ').replace(/(\d) (₸|%|млн|млрд|тыс|m|bn)/g, '$1 $2').replace(/₸ (\d)/g, '₸ $1');
  }).join('');
}
const DOCS = require('./docs');
const TPLT = require('./templates/texts');
const TPL = Object.fromEntries(Object.entries(TPLT).map(([l, x]) => [l, [x.app.file, x.desc.file, x.budget.file, x.cv.file, x.letter.file]]));
const TPLZIP = Object.fromEntries(Object.entries(TPLT).map(([l, x]) => [l, x.zip]));
const FBT = {
  ru: { btn: 'Написать нам', h: 'Напишите нам', p: 'Ответим в течение 3 рабочих дней на указанную почту.', close: 'Закрыть', ok: 'Ваша заявка принята. Спасибо!', okP: 'Мы ответим вам на указанную почту.', err: 'Не удалось отправить. Попробуйте ещё раз или напишите на', sending: 'Отправляем…', audit: 'Прошу предоставить аудиторское заключение фонда.', cvH: 'Отправить резюме', pos: 'Желаемая позиция', posPh: 'Например, аналитик программ', cv: 'Резюме (PDF или Word, до 8 МБ)', cvMsg: 'Сопроводительное письмо', cvMsgPh: 'Коротко о себе и почему хотите работать в фонде' },
  kz: { btn: 'Бізге жазыңыз', h: 'Бізге жазыңыз', p: 'Көрсетілген поштаға 3 жұмыс күні ішінде жауап береміз.', close: 'Жабу', ok: 'Өтініміңіз қабылданды. Рақмет!', okP: 'Көрсетілген поштаға жауап береміз.', err: 'Жіберу мүмкін болмады. Қайталап көріңіз немесе мына поштаға жазыңыз:', sending: 'Жіберілуде…', audit: 'Қордың аудиторлық есебін беруіңізді сұраймын.', cvH: 'Түйіндеме жіберу', pos: 'Қалаған лауазым', posPh: 'Мысалы, бағдарламалар талдаушысы', cv: 'Түйіндеме (PDF немесе Word, 8 МБ-қа дейін)', cvMsg: 'Ілеспе хат', cvMsgPh: 'Өзіңіз туралы және неге қорда жұмыс істегіңіз келетіні туралы қысқаша' },
  en: { btn: 'Contact us', h: 'Write to us', p: 'We reply within 3 working days to the email you provide.', close: 'Close', ok: 'Your request has been received. Thank you!', okP: 'We will reply to the email you provided.', err: 'Could not send. Please try again or email', sending: 'Sending…', audit: 'Please send me the Fund’s audit report.', cvH: 'Send your CV', pos: 'Position of interest', posPh: 'e.g. Programme analyst', cv: 'CV (PDF or Word, up to 8 MB)', cvMsg: 'Cover letter', cvMsgPh: 'A few words about yourself and why you want to join the Fund' },
};

const PARTNERS = [['alageum', 'Alageum Electric', 48], ['mnvo', 'Министерство науки и высшего образования РК', 70], ['freedom', 'Freedom Broker', 52], ['sdu', 'SDU University', 92]]; // логотип, название, макс. высота // фото к новостям по порядку
const BOARD_IMG = ['ilyasov', 'nurbek', 'turlov', 'dzhumadildaev', 'stvaev', 'kuanganov', 'madibekov', 'abdrakhmanov'];
const DIR_ICONS = ['<path d="M2 9.5 12 4l10 5.5L12 15 2 9.5Z"/><path d="M6 11.7V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3"/><path d="M22 9.5V15"/>', '<path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3"/><path d="M7.5 15h9"/>', '<path d="M12 15l-3-3c1.2-4.3 4.4-7.6 10-8.5-.9 5.6-4.2 8.8-8.5 10"/><path d="M9 12H5.5L8 8.5h4"/><path d="M12 15v3.5L15.5 16v-4"/><path d="M5.5 15.5c-1.4 1-2 3-2 5 2 0 4-.6 5-2"/><circle cx="15" cy="9" r="1.3"/>', '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.4c2 .9 3.2 2.9 3.5 5.6"/>'];
const EMAIL = 'endowment@alageum.com';
// Аналитика: вставьте номера счётчиков — код появится на всех страницах автоматически
const YM_ID = ''; // Яндекс Метрика, например '98765432'
const GA_ID = ''; // Google Analytics 4, например 'G-XXXXXXXXXX'
const ANALYTICS = (YM_ID ? `<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${YM_ID},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});window.__ym=${YM_ID};</script><noscript><div><img src="https://mc.yandex.ru/watch/${YM_ID}" style="position:absolute;left:-9999px" alt=""></div></noscript>\n` : '')
  + (GA_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script>\n` : '');
const FS = 'https://formsubmit.co/' + EMAIL; // пересылка форм на почту (FormSubmit)
const FORM_SUBJ = { feedback: 'Обратная связь', contact: 'Обращение (Контакты)', contributor: 'Заявка вкладчика', 'grant-application': 'Заявка на грант', subscribe: 'Подписка на новости (СМИ)', resume: 'Резюме (Вакансии)' };
const SOCIAL = `<div class="soc"><a class="soc-ic" href="https://www.facebook.com/timur.makenov" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 176 176" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M152 0H24A24 24 0 0 0 0 24v128a24 24 0 0 0 24 24h128a24 24 0 0 0 24-24V24a24 24 0 0 0-24-24m-36.12 77.59-1.77 15.32a2.860 2.86 0 0 1-2.82 2.57h-16l-.08 45.45a2.05 2.05 0 0 1-2 2.07H77a2 2 0 0 1-2-2.08V95.48H63a2.87 2.87 0 0 1-2.84-2.9l-.06-15.33a2.88 2.88 0 0 1 2.84-2.92H75v-14.8C75 42.350 85.2 33 100.16 33h12.26a2.88 2.88 0 0 1 2.85 2.92v12.91a2.88 2.88 0 0 1-2.85 2.92h-7.52c-8.13 0-9.71 4-9.71 9.77v12.81h17.87a2.89 2.89 0 0 1 2.82 3.26"/></svg></a><a class="soc-ic" href="https://www.instagram.com/makenov.t.k" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 512 512" width="36" height="36" aria-hidden="true"><g fill="currentColor"><path d="M301 256c0 24.852-20.148 45-45 45s-45-20.148-45-45 20.148-45 45-45 45 20.148 45 45m0 0"/><path d="M332 120H180c-33.086 0-60 26.914-60 60v152c0 33.086 26.914 60 60 60h152c33.086 0 60-26.914 60-60V180c0-33.086-26.914-60-60-60m-76 211c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75m86-146c-8.285 0-15-6.715-15-15s6.715-15 15-15 15 6.715 15 15-6.715 15-15 15m0 0"/><path d="M377 0H135C60.563 0 0 60.563 0 135v242c0 74.438 60.563 135 135 135h242c74.438 0 135-60.562 135-135V135C512 60.563 451.438 0 377 0m45 332c0 49.625-40.375 90-90 90H180c-49.625 0-90-40.375-90-90V180c0-49.625 40.375-90 90-90h152c49.625 0 90 40.375 90 90zm0 0"/></g></svg></a><a class="soc-ic" href="https://www.linkedin.com/in/timur-makenov-2b9319193" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 176 176" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M152 0H24A24 24 0 0 0 0 24v128a24 24 0 0 0 24 24h128a24 24 0 0 0 24-24V24a24 24 0 0 0-24-24M60 139.28a3.710 3.71 0 0 1-3.71 3.72H40.48a3.71 3.71 0 0 1-3.72-3.72V73a3.72 3.72 0 0 1 3.72-3.72h15.81A3.72 3.72 0 0 1 60 73zM48.38 63a15 15 0 1 1 15-15 15 15 0 0 1-15 15m94.26 76.54a3.410 3.41 0 0 1-3.42 3.42h-17a3.41 3.41 0 0 1-3.42-3.42v-31.05c0-4.64 1.36-20.32-12.13-20.32-10.45 0-12.580 10.73-13 15.55v35.86A3.42 3.42 0 0 1 90.3 143H73.88a3.41 3.41 0 0 1-3.41-3.42V72.71a3.41 3.41 0 0 1 3.41-3.42H90.3a3.42 3.42 0 0 1 3.42 3.42v5.78c3.88-5.83 9.63-10.31 21.9-10.31 27.18 0 27 25.38 27 39.320z"/></svg></a></div>`;
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
  const hidden = name => `<input type="hidden" name="_subject" value="Сайт endowment-fund.kz: ${FORM_SUBJ[name]} [${lang.toUpperCase()}]"><input type="hidden" name="_next" value="${SITE}/${pre}thanks.html"><input type="hidden" name="_captcha" value="false"><input type="hidden" name="_template" value="table"><input type="hidden" name="Форма" value="${FORM_SUBJ[name]}"><input type="hidden" name="Язык" value="${lang}"><input type="text" name="_honey" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true">`;
  const formOpen = (name, extra = '') => `<form class="form"${extra} name="${name}" method="POST" action="${FS}">${hidden(name)}`;
  const phero = (crumb, title, lead) => `<section class="phero pat pat-bg"><div class="wrap"><div class="crumbs"><a href="index.html">${u.home}</a> &nbsp;/&nbsp; ${crumb}</div><h1 class="h1-page">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;
  const langLinks = file => Object.keys(LANGS).map(l => `<a${l === lang ? ' class="on" aria-current="true"' : ''} href="${R}${PREFIX[l]}${file}" hreflang="${HREFLANG[l]}" lang="${HREFLANG[l]}">${LANGS[l].ui.langCode}</a>`).join('');

  const progCard = (i, withCat = true) => {
    const [cat, tc, cls, img] = PROG_META[i]; const [tag, catName, h, txt] = t.progs[i];
    return `<article class="card" data-cat="${cat}">${ph(t.progs[i][2], cls, null, img)}<div class="card-b"><div class="tags"><span class="tag ${tc}">${tag}</span>${withCat ? `<span class="tag vi">${catName}</span>` : ''}</div><h3 class="h3">${h}</h3><p class="txt">${txt}</p><a class="link" href="grants.html">${u.conditions} →</a></div></article>`;
  };
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const newsCard = (m) => `<article class="card media" data-cat="${m.date ? 'y' + m.date.slice(-4) : 'other'}">${m.image ? `<div class="ph has-img"><img src="${esc(m.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove('has-img');this.remove()"><span>${m.source}</span></div>` : `<div class="ph"><span>${m.source}</span></div>`}<div class="card-b"><div class="tags"><span class="tag vi">${m.source}</span>${m.date ? `<span class="date">${m.date}</span>` : ''}</div><h3 class="h3"><a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.title)}</a></h3><a class="link" href="${esc(m.url)}" target="_blank" rel="noopener">${t.press.readSrc} ↗</a></div></article>`;
  const partners = PARTNERS.map(([f, n, h]) => `<div class="logo-box"><img src="${R}assets/img/partners/${f}.png" alt="${n}" style="max-height:${h}px" loading="lazy"></div>`).join('');
  const people = (n, roles) => Array.from({ length: n }, (_, i) => `<div class="person">${ph(u.portrait, i % 2 ? '' : 'dark')}<h3 class="h3">${u.fullName}</h3><p class="txt">${roles[i % roles.length]}</p></div>`).join('');

  const header = (active, file) => `<header class="hdr"><div class="wrap">
<a class="logo" href="index.html" aria-label="${t.name} — ${u.toHome}"><img src="${logo}" alt="${t.name}" width="282" height="48"></a>
<nav class="nav" aria-label="${u.mainMenu}">${NAV_FILES.map((f, i) => `<a href="${f}"${f === active ? ' class="active"' : ''}>${[u.home, ...u.nav][i]}</a>`).join('')}</nav>
<div class="hdr-act"><div class="lang">${langLinks(file)}</div>
<button class="burger" aria-label="${u.menu}" aria-expanded="false"><span></span><span></span><span></span></button></div>
</div></header>
<nav class="mnav" aria-label="${u.mobileMenu}">${NAV_FILES.map((f, i) => `<a href="${f}">${[u.home, ...u.nav][i]}</a>`).join('')}<div class="lang">${langLinks(file)}</div></nav>`;

  const f = t.footer;
  const footer = `<footer class="ftr"><div class="wrap">
<div class="ftr-top">
<div><a class="logo" href="index.html"><img src="${logoW}" alt="${t.name}" width="306" height="52"></a>
<p>${f.about}</p>
${SOCIAL}</div>
<div><h4>${f.fund}</h4><ul>${['about.html', 'about.html#board', 'about.html#team', 'about.html#docs', 'careers.html'].map((h, i) => `<li><a href="${h}">${f.fundLinks[i]}</a></li>`).join('')}</ul></div>
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
    fs.writeFileSync(path.join(DIR, file), typo(`<!doctype html>
<html lang="${t.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-site-verification" content="V7ffDn1bHGTTOfkTkZstXrfHQqtrApGwDvL6qk_sNV8">
<meta name="yandex-verification" content="3e591661c62697b8">
<title>${full}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
${alt}
<link rel="alternate" hreflang="x-default" href="${SITE}/${file === 'index.html' ? '' : file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${full}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="${t.og}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${t.name}">
<meta property="og:image" content="${SITE}/assets/img/og-${lang}-v2.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/img/og-${lang}-v2.jpg">
<meta name="theme-color" content="#2B005B">
<link rel="icon" href="${R}favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="theme-color" content="#2B005B">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${R}assets/css/style.css">
${ANALYTICS}<script>(function(d){if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');setTimeout(function(){if(!window.__rv)d.classList.remove('motion')},3000)}})(document.documentElement)</script>
</head>
<body>
${header(active, file)}
<main>
${body}
</main>
${footer}
<div class="fab-nav" aria-hidden="false">${file === 'index.html' ? '' : `<a class="fab-btn" href="index.html" aria-label="${u.home}" title="${u.home}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg></a>`}<button class="fab-btn fab-top" type="button" aria-label="${{ ru: 'Наверх', kz: 'Жоғары', en: 'Back to top' }[lang]}" title="${{ ru: 'Наверх', kz: 'Жоғары', en: 'Back to top' }[lang]}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></button></div>
${['thanks.html', '404.html'].includes(file) ? '' : `<dialog class="fb-dlg" aria-labelledby="fb-h"><div class="fb-box"><button class="fb-x" type="button" aria-label="${FBT[lang].close}">×</button>
<div class="fb-body"><span class="eb">${t.contacts.fbEb}</span><h2 class="h2 h2-sm" id="fb-h">${FBT[lang].h}</h2><p class="txt">${FBT[lang].p}</p>
<form class="fb-form" name="feedback" method="POST" action="${FS}" data-ajax="https://formsubmit.co/ajax/${EMAIL}" data-sending="${FBT[lang].sending}">${hidden('feedback')}<input type="hidden" name="Страница" value="">
<div class="frow"><div class="field"><label for="fb-name">${t.contacts.f.name}</label><input id="fb-name" name="name" required placeholder="${u.namePh}"></div><div class="field"><label for="fb-email">E-mail</label><input id="fb-email" name="email" type="email" required placeholder="name@mail.kz"></div></div>
<div class="field"><label for="fb-topic">${t.contacts.f.topic}</label><select id="fb-topic" name="topic" required><option value="">${u.choose}</option>${t.contacts.f.topics.map(o => `<option>${o}</option>`).join('')}</select></div>
<div class="field"><label for="fb-msg">${t.contacts.f.message}</label><textarea id="fb-msg" name="message" required placeholder="${t.contacts.f.messagePh}"></textarea></div>
<label class="agree"><input type="checkbox" required> ${u.agree}</label><button class="btn btn-gold" type="submit">${t.contacts.f.submit}</button>
<p class="fb-err" hidden>${FBT[lang].err} <a href="mailto:${EMAIL}">${EMAIL}</a></p></form></div>
<div class="fb-ok" hidden><span class="fb-ok-ic" aria-hidden="true">✓</span><h2 class="h2 h2-sm">${FBT[lang].ok}</h2><p class="txt">${FBT[lang].okP}</p><button class="btn btn-outline fb-close2" type="button">${FBT[lang].close}</button></div>
</div></dialog>`}
<script src="${R}assets/js/main.js" defer></script>
</body>
</html>
`, lang));
  }

  // ---------- ГЛАВНАЯ ----------
  const x = t.index;
  page('index.html', u.home, x.desc, 'index.html', `
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
<div class="grid g3">${x.dirs.map(([h, d], i) => `<div class="val"><span class="dir-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${DIR_ICONS[i]}</svg></span><h3 class="h3">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div>
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
<section class="sec bg-vi hero-bg"><div class="wrap cta"><div class="txt-col"><span class="eb">${x.ctaEb}</span><h2 class="h2">${x.ctaH}</h2><p class="lead" style="margin-top:20px">${x.ctaP}</p></div>
<div class="stack" style="gap:16px"><a class="btn btn-gold" href="grants.html#apply">${x.ctaBtn}</a><a class="btn btn-light" href="grants.html">${x.ctaBtn2}</a></div></div></section>
<section class="sec bg-wh" style="padding:96px 0"><div class="wrap">${head(x.donEb, x.donH, `<div class="head-btns"><a class="btn btn-outline" href="partners.html">${x.donAll}</a><a class="btn btn-gold" href="donate.html">${x.donBtn}</a></div>`)}
</div>${(() => {
  const L = PARTNERS_ALL.items.filter(i => i.logo && !i.noMq).filter((i, n, arr) => arr.findIndex(z => z.logo === i.logo) === n).map(i => ({ s: i.logo.startsWith('local:') ? `${R}assets/img/partners/${i.logo.slice(6)}` : i.logo, t: i[lang], l: i.logo.startsWith('local:') }));
  const item = (o, hid) => `<a class="mq-item" href="partners.html" title="${o.t}"><img src="${o.s}" alt="${hid ? '' : o.t}" referrerpolicy="no-referrer"></a>`;
  const local = L.filter(o => o.l);
  return `<div class="marquee" aria-label="${x.donH}" data-logos='${JSON.stringify(L).replace(/'/g, '&#39;')}'><div class="mq-track">${[0, 1, 2, 3].map(k => `<div class="mq-set"${k ? ' aria-hidden="true"' : ''}>${local.map(o => item(o, k)).join('')}</div>`).join('')}</div></div>`;
})()}</section>
<section class="sec bg-li"><div class="wrap">${head(x.newsEb, x.newsH, `<a class="btn btn-outline" href="press.html">${u.allNews}</a>`)}
<div class="grid g3">${MEDIA.slice(0, 3).map(newsCard).join('')}</div></div></section>
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
<section class="sec bg-wh" id="team"><div class="wrap">${head(a.teamEb, a.teamH)}<div class="grid dir-grid"><div class="person">${ph(a.director[0], 'dark', null, 'makenov', 'center 25%')}<h3 class="h3">${a.director[0]}</h3><p class="txt">${a.director[1]}</p>${SOCIAL.replace('class="soc"', 'class="soc soc-dark"')}</div>
<div class="dir-info"><p class="lead-dk">${a.bio}</p><h3 class="h3" style="margin-top:40px">${a.govH}</h3><div class="grid g3" style="margin-top:20px">${a.gov.map(([h, d]) => `<div class="vline"><h3 class="h3" style="font-size:18px">${h}</h3><p class="txt">${d}</p></div>`).join('')}</div></div></div></div></section>
<section class="sec bg-li" id="docs"><div class="wrap">${head(a.docsEb, a.docsH)}
${DOCS.map(grp => { const its = lang === 'kz' && grp.items[0].file === 'ustav-ru.pdf' ? [...grp.items].reverse() : grp.items; return `<div class="doc-group"><h3 class="doc-gh">${grp.g[lang]}</h3>${its.map(d => { const mb = (fs.statSync(path.join(STATIC, 'docs', d.file)).size / 1048576).toFixed(1).replace('.', lang === 'en' ? '.' : ','); return `<a class="rowline doc-row" href="/docs/${d.file}" target="_blank" rel="noopener" download><span class="pdf">PDF</span><span class="grow"><span class="h3 doc-t">${d[lang]}</span><span class="doc-meta">${d.tp ? (d.tp === 2 ? { ru: 'Первая и последняя страницы с отметкой о госрегистрации', kz: 'Мемлекеттік тіркеу белгісі бар бірінші және соңғы беттер', en: 'First and last pages with state registration stamp' } : { ru: 'Титульный лист с отметкой об утверждении', kz: 'Бекітілгені туралы белгісі бар титулдық парақ', en: 'Title page with approval stamp' })[lang] + ' · ' : ''}${mb} ${lang === 'en' ? 'MB' : 'МБ'}</span></span><span class="link">${u.download} ↓</span></a>`; }).join('')}</div>`; }).join('')}
</div></section>
<section class="band bg-go" id="jobs"><div class="wrap cta"><div><h2 class="h2 h2-sm">${a.jobsH}</h2><p style="opacity:.75;margin-top:8px">${a.jobsP}</p></div><a class="btn btn-dark" href="careers.html">${a.jobsBtn}</a></div></section>
`);

  // ---------- ПРОГРАММЫ ----------
  const p = t.programs;
  page('programs.html', p.title, p.desc, 'programs.html', `
${phero(p.title, p.title, p.lead)}
<section class="sec bg-wh"><div class="wrap">${head(p.mainEb, p.mainH)}
<div class="grid g3 pm-grid">${p.main.map(([cat, h, bud, per, d, l], mi) => `<div class="form prog-main" style="gap:16px"><span class="pm-cat"><span class="dir-ic pm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${DIR_ICONS[mi]}</svg></span>${cat}</span><h3 class="h3">${h}</h3><dl class="pm-meta"><div><dt>${p.budgetL}</dt><dd>${bud}</dd></div><div><dt>${p.periodL}</dt><dd>${per}</dd></div></dl><div class="pm-rest"><p class="txt">${d}</p><hr style="border:0;border-top:1px solid var(--ln);margin:4px 0;width:100%">${l.slice(0, 3).map(y => `<span class="check">${y}</span>`).join('')}${l.length > 3 ? `<details class="pm-more"><summary><span class="pm-open">${{ ru: 'Подробнее', kz: 'Толығырақ', en: 'More' }[lang]} (${l.length - 3})</span><span class="pm-close">${{ ru: 'Свернуть', kz: 'Жасыру', en: 'Less' }[lang]}</span></summary><div class="pm-list">${l.slice(3).map(y => `<span class="check">${y}</span>`).join('')}</div></details>` : ''}</div></div>`).join('')}</div>
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
<div>${g.docs.map((y, i) => i === 0
  ? `<a class="rowline tpl-row" href="/docs/templates/${lang}/${TPL[lang][0]}" download><span class="tpl-ext">DOCX</span><span class="grow" style="font-size:16px">${y}</span><span class="link tpl-dl">${u.download} ↓</span></a>`
  : `<div class="rowline" style="padding:14px 0"><span class="tpl-ext tpl-free" aria-hidden="true">—</span><span class="grow" style="font-size:16px">${y}<span class="doc-meta">${{ ru: 'в свободной форме', kz: 'еркін нысанда', en: 'free format' }[lang]}</span></span></div>`).join('')}</div></div>
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
<section class="sec bg-li"><div class="wrap">${head(r.keyEb, r.keyH, `<a class="btn btn-outline" href="about.html#docs">${r.keyBtn}</a>`)}
<div class="grid g4">${r.kpis.map(([n, s, dd]) => `<div class="numbox"><b>${n}</b><p style="font-size:16px">${s}</p><em>${dd}</em></div>`).join('')}</div>
<div class="grid mt-40" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)" id="charts">
<div class="form"><h3 class="h3">${r.chartH}</h3><div class="bars" role="img" aria-label="${r.chartAria}">${r.chart.map(([y, v], i) => `<div><b class="bv">${v.toLocaleString('ru-RU')}</b><i class="${i === r.chart.length - 1 ? 'g' : 'r'}" style="height:${Math.round(v / Math.max(...r.chart.map(c => c[1])) * 85)}%"></i><span>${y}</span></div>`).join('')}</div><p class="small">${r.chartNote}</p></div>
<div class="mv bg-dp" style="padding:40px"><h3 class="h3">${r.allocH}</h3><div class="alloc">${r.alloc.map(([l, val, pc], i) => { const c = ['var(--go)', '#fff', 'var(--vi)', 'var(--mu)'][i]; return `<div><div class="t"><span>${l}</span><b>${val}</b></div><div class="tr"><i style="width:${pc}%;background:${c}"></i></div></div>`; }).join('')}</div><div style="margin-top:auto"><p style="font-size:14px;opacity:.6">${r.totalLabel}</p><b style="font-size:36px;color:var(--go);font-weight:800">${r.total}</b></div></div>
</div></div></section>
<section class="sec bg-wh" id="archive"><div class="wrap">${(() => {
  const R1 = { ru: ['Отчёты', 'Годовой отчёт', 'Годовой отчёт за 2026 год', 'Скоро'], kz: ['Есептер', 'Жылдық есеп', '2026 жылғы жылдық есеп', 'Жақында'], en: ['Reports', 'Annual report', 'Annual report 2026', 'Coming soon'] }[lang];
  const f = 'otchet-2026.pdf', has = fs.existsSync(path.join(STATIC, 'docs', f));
  return `<h2 class="h2" style="margin-bottom:40px">${R1[0]}</h2><div class="grid g4"><div class="rep"><div class="cover"><small>${R1[1]}</small><b>2026</b></div><h3 class="h3" style="font-size:20px">${R1[2]}</h3><div style="display:flex;justify-content:space-between"><span class="meta">PDF</span>${has ? `<a class="link" href="/docs/${f}" download style="font-size:15px">${u.download} ↓</a>` : `<span class="meta">${R1[3]}</span>`}</div></div></div>`;
})()}
</div></section>
<section class="band bg-vi" style="padding:64px 0"><div class="wrap cta"><div class="txt-col"><span class="eb">${r.auditEb}</span><h2 class="h2 h2-sm">${r.auditH}</h2></div><button class="btn btn-light" type="button" data-fb data-fb-topic="0" data-fb-msg="${FBT[lang].audit}">${r.auditBtn}</button></div></section>
`);

  // ---------- ПРЕСС-ЦЕНТР ----------
  const s = t.press;
  page('press.html', s.title, s.desc, 'press.html', `
${phero(s.title, s.title, s.lead)}
<section class="sec bg-li" style="padding-top:72px"><div class="wrap">
${(() => { const ys = [...new Set(MEDIA.filter(m => m.date).map(m => m.date.slice(-4)))]; const vals = ['all', ...ys.map(y => 'y' + y), 'other']; const labs = [s.all, ...ys, s.other]; return `<div class="toolbar"><div class="chips" data-filter>${vals.map((v, i) => `<button class="chip${i ? '' : ' on'}" data-value="${v}">${labs[i]}</button>`).join('')}</div><span class="meta">${s.count}: ${MEDIA.length}</span></div>`; })()}
<div class="grid g3" data-paged="12">${MEDIA.map(newsCard).join('')}</div>
<div class="more-wrap"><button class="btn btn-outline more-btn" type="button">${{ ru: 'Показать ещё', kz: 'Тағы көрсету', en: 'Show more' }[lang]}</button></div>
</div></section>
<section class="sec bg-vi" style="padding:72px 0"><div class="wrap cta"><div><span class="eb">${s.journEb}</span><h2 class="h2 h2-sm">${s.journH}</h2><p style="opacity:.8;margin-top:8px"><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
<form class="sub" name="subscribe" method="POST" action="${FS}">${hidden('subscribe')}<label class="visually-hidden" for="sub-email">E-mail</label><input id="sub-email" type="email" name="email" placeholder="${s.subPh}" required><button class="btn btn-gold" type="submit">${s.subBtn}</button></form></div></section>
`);

  // ---------- ПАРТНЁРЫ ----------
  const pp = t.partnersPage;
  const ptCard = it => {
    const src = it.logo ? (it.logo.startsWith('local:') ? `${R}assets/img/partners/${it.logo.slice(6)}` : it.logo) : '';
    if (!src) return `<div class="pt pt-nl"><p class="pt-name">${it[lang]}</p></div>`;
    return `<div class="pt"><div class="pt-logo"><img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="var c=this.closest('.pt'),g=c.closest('.pt-group'),n=g.querySelector('.pt-grid-nl');if(!n){n=document.createElement('div');n.className='pt-grid pt-grid-nl';g.appendChild(n)}c.classList.add('pt-nl');this.parentNode.remove();n.appendChild(c)"></div><p class="pt-name">${it[lang]}</p></div>`;
  };
  page('partners.html', pp.title, pp.desc, '', `
${phero(pp.title, pp.title, pp.lead)}
<section class="sec bg-li"><div class="wrap">
<p class="pt-total"><b>${PARTNERS_ALL.items.length}</b> ${pp.count}</p>
${PARTNERS_ALL.groups.map(g => { const its = PARTNERS_ALL.items.filter(i => i.g === g.id).sort((a, b) => (b.logo ? 1 : 0) - (a.logo ? 1 : 0)); return `<div class="pt-group"><h2 class="h3 pt-gh">${g[lang]} <span>${its.length}</span></h2>${its.some(i => i.logo) ? `<div class="pt-grid">${its.filter(i => i.logo).map(ptCard).join('')}</div>` : ''}${its.some(i => !i.logo) ? `<div class="pt-grid pt-grid-nl">${its.filter(i => !i.logo).map(ptCard).join('')}</div>` : ''}</div>`; }).join('')}
</div></section>
`);

  // ---------- ВАКАНСИИ ----------
  const v = t.careers;
  page('careers.html', v.title, v.desc, 'about.html', `
${phero(v.title, v.title, v.lead)}
<section class="sec bg-li"><div class="wrap">
<div class="mv bg-wh empty-state"><span class="eb">${v.eb}</span><h2 class="h2 h2-sm">${v.emptyH}</h2><p class="txt" style="max-width:640px">${v.emptyP}</p>
<p class="small">${EMAIL}</p></div>
<div class="mv bg-wh mt-24" id="cv"><h2 class="h2 h2-sm">${FBT[lang].cvH}</h2>
<form class="form" style="padding:0;background:none;margin-top:24px" name="resume" method="POST" action="${FS}" enctype="multipart/form-data">${hidden('resume')}
<div class="frow">${field(t.contacts.f.name, 'name', u.namePh)}${field('E-mail', 'email', 'name@mail.kz', 'email')}</div>
${field(FBT[lang].pos, 'position', FBT[lang].posPh)}
<div class="field"><label for="f-cv">${FBT[lang].cv}</label><input id="f-cv" name="cv" type="file" accept=".pdf,.doc,.docx" required></div>
<div class="field"><label for="f-cvmsg">${FBT[lang].cvMsg}</label><textarea id="f-cvmsg" name="message" placeholder="${FBT[lang].cvMsgPh}"></textarea></div>
${agree}<button class="btn btn-gold" type="submit">${v.btn}</button></form></div>
</div></section>
`);

  // ---------- КОНТАКТЫ ----------
  const c = t.contacts;
  page('contacts.html', c.title, c.desc, 'contacts.html', `
${phero(c.title, c.title, c.lead)}
<section class="sec bg-li"><div class="wrap">
<div class="numbox" style="background:var(--wh)"><span class="eb" style="margin-bottom:10px">${c.allQ}</span><a class="h3" style="font-size:clamp(22px,2.4vw,32px);display:block;word-break:break-all" href="mailto:${EMAIL}">${EMAIL}</a></div>
<div class="grid mt-24 map-grid" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr)">
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
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><span class="thx-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><h1 class="h1-page">${t.thanks.title}</h1><p class="lead">${t.thanks.p}</p><div class="btn-row mt-40"><a class="btn btn-gold" href="index.html">${t.thanks.btn}</a></div></div></section>`);
  page('404.html', t.nf.title, t.nf.p, '', `
<section class="phero pat pat-bg" style="padding:120px 0"><div class="wrap"><h1 class="h1-page">${t.nf.h1}</h1><p class="lead">${t.nf.p}</p><div class="btn-row mt-40"><a class="btn btn-gold" href="${R}${pre}index.html">${t.thanks.btn}</a></div></div></section>`);
}
