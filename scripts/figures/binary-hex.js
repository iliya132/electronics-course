import { Fig, C, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('binary-hex');

  // 1. Байт 0xA5: веса разрядов
  const f = new Fig(720, 260, 'Байт 0xA5: веса разрядов и сумма');
  const bits = [1, 0, 1, 0, 0, 1, 0, 1];
  bits.forEach((b, i) => {
    const x = 40 + i * 80, w = 7 - i;
    f.text(x + 34, 40, `2${'⁷⁶⁵⁴³²¹⁰'[i]}`, { anchor: 'middle', size: 15, fill: C.muted });
    f.text(x + 34, 62, String(2 ** w), { anchor: 'middle', size: 16, weight: 700, fill: C.muted });
    f.rect(x, 74, 68, 56, { r: 8, width: 2.4, fill: b ? C.accent : 'none', opacity: b ? 0.28 : 1 });
    f.text(x + 34, 112, String(b), { anchor: 'middle', size: 26, weight: 700, fill: b ? C.accent : C.muted });
  });
  f.rect(36, 148, 304, 4, { fill: C.warn, stroke: 'none', r: 2 });
  f.rect(380, 148, 304, 4, { fill: C.ok, stroke: 'none', r: 2 });
  f.text(188, 176, '1010₂ = A₁₆', { anchor: 'middle', size: 15, weight: 700, fill: C.warn });
  f.text(532, 176, '0101₂ = 5₁₆', { anchor: 'middle', size: 15, weight: 700, fill: C.ok });
  f.text(360, 222, '128 + 32 + 4 + 1 = 165₁₀ = 0xA5', { anchor: 'middle', size: 18, weight: 700 });
  f.save(out('binary-hex', 'byte'));

  // 2. Таблица полубайтов
  const g = new Fig(720, 300, 'Соответствие шестнадцатеричных цифр и четырёх битов');
  for (let i = 0; i < 16; i++) {
    const col = i % 8, row = Math.floor(i / 8);
    const x = 20 + col * 86, y = 40 + row * 112;
    g.rect(x, y, 78, 92, { r: 8, width: 2 });
    g.text(x + 39, y + 36, i.toString(16).toUpperCase(), { anchor: 'middle', size: 26, weight: 700, fill: C.accent });
    g.text(x + 39, y + 60, i.toString(2).padStart(4, '0'), { anchor: 'middle', size: 15 });
    g.text(x + 39, y + 80, String(i), { anchor: 'middle', size: 13, fill: C.muted });
  }
  g.text(360, 26, 'одна шестнадцатеричная цифра = ровно четыре бита', { anchor: 'middle', size: 14, weight: 600 });
  g.save(out('binary-hex', 'nibbles'));
}
