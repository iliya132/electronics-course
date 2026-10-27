import { Fig, C, out, fresh } from '../lib/fig.js';

// Диаграмма уровней: напряжение растёт вверх
function levels(f, x, y0, h, vmax, name, supply, d) {
  const Y = v => y0 + h - v / vmax * h;
  f.rect(x, Y(supply), 100, Y(0) - Y(supply), { r: 2, width: 2 });
  // зона «1»
  f.rect(x, Y(supply), 100, Y(d.vih) - Y(supply), { fill: C.ok, stroke: 'none', r: 0, opacity: 0.25 });
  // неопределённая зона
  f.rect(x, Y(d.vih), 100, Y(d.vil) - Y(d.vih), { fill: C.warn, stroke: 'none', r: 0, opacity: 0.25 });
  // зона «0»
  f.rect(x, Y(d.vil), 100, Y(0) - Y(d.vil), { fill: C.accent, stroke: 'none', r: 0, opacity: 0.25 });
  for (const [k, v, col] of [['VIH', d.vih, C.ok], ['VIL', d.vil, C.accent]]) {
    f.line(x - 8, Y(v), x + 108, Y(v), { stroke: col, width: 2.4 });
    f.text(x + 112, Y(v) + 5, `${k} ${String(v).replace('.', ',')} В`, { size: 12, weight: 700, fill: col });
  }
  f.text(x + 50, Y(0) + 24, name, { anchor: 'middle', size: 14, weight: 700 });
  f.text(x + 50, Y(0) + 42, `питание ${String(supply).replace('.', ',')} В`, { anchor: 'middle', size: 12, fill: C.muted });
}

export function generate() {
  fresh('logic-levels');

  // 1. Диаграммы уровней входов
  const f = new Fig(760, 380, 'Пороги логических входов для питания 5 В и 3,3 В');
  levels(f, 40, 40, 260, 5.5, '74HC при 5 В', 5, { vih: 3.5, vil: 1.5 });
  levels(f, 300, 40, 260, 5.5, '74HCT / TTL', 5, { vih: 2.0, vil: 0.8 });
  levels(f, 540, 40, 260, 5.5, 'LVCMOS 3,3 В', 3.3, { vih: 2.0, vil: 0.8 });
  f.text(380, 24, 'зелёная зона — «1», жёлтая — неопределённая, синяя — «0»', { anchor: 'middle', size: 13, weight: 600 });
  f.save(out('logic-levels', 'thresholds'));

  // 2. Запас по шуму: выход 3,3 В МК в разные входы
  const g = new Fig(740, 300, 'Запас по шуму при выходе 3,3 В на разные входы');
  const rows = [
    ['вход 3,3 В CMOS (VIH 2,0 В)', 3.3 - 2.0, 'запас 1,3 В: хорошо', C.ok],
    ['вход 74HC при 5 В (VIH 3,5 В)', 3.3 - 3.5, 'запас −0,2 В: сигнал «1» не доходит', C.bad],
    ['вход 74HCT при 5 В (VIH 2,0 В)', 3.3 - 2.0, 'запас 1,3 В: хорошо', C.ok],
  ];
  rows.forEach(([name, m, txt, col], i) => {
    const y = 56 + i * 80;
    g.text(20, y, name, { size: 14, weight: 600 });
    const x0 = 360, k = 120;
    g.line(x0, y + 14, x0, y + 50, { width: 1.6, stroke: C.muted });
    g.rect(m >= 0 ? x0 : x0 + m * k, y + 18, Math.abs(m) * k, 24, { fill: col, stroke: 'none', r: 3, opacity: 0.55 });
    g.text(m >= 0 ? x0 + m * k + 8 : x0 + m * k - 8, y + 36, txt, { size: 12, weight: 700, fill: col, anchor: m >= 0 ? 'start' : 'end' });
  });
  g.text(360, 280, 'нулевая линия: VOH − VIH = 0; левее — «1» не распознаётся', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('logic-levels', 'noise-margin'));
}
