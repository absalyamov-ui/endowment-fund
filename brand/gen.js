// Генерация файлов логотипа для страницы brand.html → static/brand/ (SVG, PNG, ZIP)
// Запуск: NODE_PATH=$(npm root -g) node brand/gen.js
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const IMG = path.join(__dirname, '..', 'static', 'assets', 'img');
const OUT = path.join(__dirname, '..', 'static', 'brand');
const DP = '#2B005B', GO = '#D6A86A';
// Цветовые решения по брендбуку: основная (полноцветная), чёрная, золотая (для тёмных и цветных фонов)
const VARIANTS = { color: s => s, black: s => s.replaceAll(DP, '#000000').replaceAll(GO, '#000000'), gold: s => s.replaceAll(DP, GO) };
const SRC = { 'vertical-ru': 'logo-v-ru.svg', 'vertical-kz': 'logo-v-kz.svg', 'vertical-en': 'logo-v-en.svg', 'horizontal-ru': 'logo-ru.svg', 'horizontal-kz': 'logo-kz.svg', 'horizontal-en': 'logo-en.svg', sign: 'sign.svg' };
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const d of ['svg', 'png']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  for (const [name, file] of Object.entries(SRC)) {
    const src = fs.readFileSync(path.join(IMG, file), 'utf8');
    const [, w, h] = src.match(/width="([\d.]+)" height="([\d.]+)"/).map(Number);
    for (const [v, fn] of Object.entries(VARIANTS)) {
      const svg = fn(src), base = `endowment-${name}-${v}`;
      fs.writeFileSync(path.join(OUT, 'svg', base + '.svg'), svg);
      const W = name === 'sign' ? 1200 : name.startsWith('vertical') ? 1800 : 2400, H = Math.round(W * h / w), pad = Math.round(W * 0.04);
      await p.setViewportSize({ width: W + pad * 2, height: H + pad * 2 });
      await p.setContent(`<html><body style="margin:0;background:transparent"><div style="padding:${pad}px">${svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`)}</div></body></html>`);
      await p.screenshot({ path: path.join(OUT, 'png', base + '.png'), omitBackground: true });
    }
  }
  await b.close();
  fs.copyFileSync(path.join(__dirname, 'README.txt'), path.join(OUT, 'README.txt'));
  execFileSync('zip', ['-qr', 'endowment-fund-logo.zip', 'svg', 'png', 'README.txt'], { cwd: OUT });
  fs.rmSync(path.join(OUT, 'README.txt'));
  console.log('brand ok', fs.statSync(path.join(OUT, 'endowment-fund-logo.zip')).size);
})();
