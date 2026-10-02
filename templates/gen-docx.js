// Генерация шаблонов .docx (RU/KZ/EN) → static/docs/templates/{lang}/
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType, Footer, Header } = require('docx');
const T = require('./texts');

const DP = '2B005B', VI = '6E3FA3', GO = 'B98A4E', GR = '7A7486', LN = 'CFC8DA';
const W = 9638; // ширина текста A4 с полями 2 см
const FONT = 'Arial';
const b1 = { style: BorderStyle.SINGLE, size: 4, color: LN };
const borders = { top: b1, bottom: b1, left: b1, right: b1 };
const n0 = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noB = { top: n0, bottom: n0, left: n0, right: n0 };

const p = (text, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, before: o.before ?? 0 }, alignment: o.align, children: [].concat(text).map(t => typeof t === 'string' ? new TextRun({ text: t, font: FONT, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color }) : t) });
const hint = t => p(t, { italics: true, color: GR, size: 19 });
const h = t => new Paragraph({ spacing: { before: 280, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GO, space: 4 } }, children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: DP })] });
const cell = (content, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: o.nob ? noB : borders, shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: [].concat(content).map(c => typeof c === 'string' ? p(c, { after: 0, bold: o.bold, size: o.size || 20, color: o.color }) : c) });
const table = (cols, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cols, rows: rows.map(r => new TableRow({ children: r })) });
const fieldTable = (labels, lw = 3600) => table([lw, W - lw], labels.map(l => [cell(l, lw, { fill: 'F4F1F8', bold: true }), cell('', W - lw)]));
const box = (lines = 4) => table([W], [[cell(Array.from({ length: lines }, () => p('', { after: 60 })), W)]]);
const grid = (head, n, ex) => {
  const w = Math.floor(W / head.length), cols = head.map((_, i) => i === head.length - 1 ? W - w * (head.length - 1) : w);
  const rows = [head.map((x, i) => cell(x, cols[i], { fill: DP, bold: true, color: 'FFFFFF', size: 18 }))];
  if (ex) rows.push(ex.map((x, i) => cell(x, cols[i], { color: GR, size: 18 })));
  for (let k = 0; k < n; k++) rows.push(head.map((_, i) => cell('', cols[i])));
  return table(cols, rows);
};
const check = t => p([new TextRun({ text: '☐  ', font: 'Segoe UI Symbol', size: 22 }), new TextRun({ text: t, font: FONT, size: 21 })], { after: 80 });
const signBlock = L => {
  const c = [3200, 3200, W - 6400];
  return table(c, [[cell('', c[0]), cell('', c[1]), cell('', c[2])], [cell(L.sign[0], c[0], { color: GR, size: 16 }), cell(L.sign[1], c[1], { color: GR, size: 16 }), cell(`${L.sign[2]} · ${L.sign[3]}`, c[2], { color: GR, size: 16 })]]);
};
const docOf = (L, children) => new Document({
  creator: L.fund, styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GO, space: 4 } }, children: [new TextRun({ text: L.fund, font: FONT, size: 16, color: VI, bold: true })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: L.site, font: FONT, size: 16, color: GR })] })] }) },
    children,
  }],
});
const titleBlock = (title, sub, hintText) => [p(title, { size: 32, bold: true, color: DP, align: AlignmentType.CENTER, after: 60, before: 120 }), p(sub, { size: 22, color: VI, align: AlignmentType.CENTER, after: 200 }), ...(hintText ? [hint(hintText)] : [])];

async function build() {
  for (const [lang, L] of Object.entries(T)) {
    const out = path.join(__dirname, '..', 'static', 'docs', 'templates', lang);
    fs.mkdirSync(out, { recursive: true });
    const A = L.app, D = L.desc, C = L.cv, Le = L.letter;

    const app = docOf(L, [
      ...titleBlock(A.title, A.sub, L.hint),
      h(A.s1), fieldTable(A.f1),
      h(A.s2), p(A.progL, { bold: true, size: 21, after: 60 }), ...A.progs.map(check), p('', { after: 60 }), fieldTable(A.f2),
      h(A.s3), hint(A.s3h), box(5),
      h(A.s4), hint(A.s4h), box(5),
      h(A.s5), hint(A.s5h), box(3),
      h(A.s6), ...A.att.map(check),
      h(A.s7), ...A.conf.map(check),
      p('', { after: 200 }), signBlock(L),
    ]);

    const descChildren = [...titleBlock(D.title, D.sub, L.hint), fieldTable(D.meta, 3000)];
    for (const [title, g, kind] of D.secs) {
      descChildren.push(h(title));
      if (kind === 'plan') descChildren.push(grid(D.plan, 5));
      else if (kind === 'kpi') descChildren.push(grid(D.kpi, 4, D.kpiEx));
      else descChildren.push(hint(g), p('[…]', { color: GR }));
    }
    const desc = docOf(L, descChildren);

    const cv = docOf(L, [
      ...titleBlock(C.title, C.sub),
      fieldTable(C.f),
      h(C.edu), grid(C.eduH, 3),
      h(C.job), grid(C.jobH, 4),
      h(C.pub), hint(C.pubH), ...[1, 2, 3, 4, 5].map(n => p(`${n}. […]`, { color: GR })),
      h(C.lang), box(1), h(C.other), box(3),
      p('', { after: 200 }), signBlock(L),
    ]);

    const letter = docOf(L, [
      p(Le.blank, { bold: true, color: GR, align: AlignmentType.CENTER, after: 360, size: 20 }),
      p(Le.out, { size: 20, after: 240 }),
      ...Le.to.map((t, i) => p(t, { align: AlignmentType.RIGHT, after: i === Le.to.length - 1 ? 360 : 0 })),
      p(Le.title, { bold: true, size: 26, color: DP, align: AlignmentType.CENTER, after: 240 }),
      ...Le.body.map(t => new Paragraph({ spacing: { after: 160, line: 300 }, alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 567 }, children: [new TextRun({ text: t, font: FONT, size: 22 })] })),
      p('', { after: 480 }),
      table([4200, 2600, W - 6800], [[cell(Le.signer[0], 4200, { size: 22, nob: 1 }), cell(Le.signer[1], 2600, { color: GR, size: 22, nob: 1 }), cell(Le.signer[2], W - 6800, { size: 22, nob: 1 })]].map(r => r)),
    ]);

    for (const [d, f] of [[app, A.file], [desc, D.file], [cv, C.file], [letter, Le.file]]) {
      fs.writeFileSync(path.join(out, f), await Packer.toBuffer(d));
    }
    console.log(lang, 'docx ok');
  }
}
build();
