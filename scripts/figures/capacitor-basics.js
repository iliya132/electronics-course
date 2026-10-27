import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('capacitor-basics');

  // 1. «Ведро» и конденсатор
  const f = new Fig(480, 300, 'Аналогия: ёмкость — это площадь дна ведра');
  f.text(120, 24, 'Ведро и вода', { anchor: 'middle', size: 15, weight: 700 });
  const bucket = (x, w, name, vol) => {
    const top = 70, h = 140, lvl = 80;
    f.rect(x, top, w, h, { r: 4, width: 2.5 });
    f.rect(x + 2, top + h - lvl, w - 4, lvl - 2, { fill: C.accent, stroke: 'none', r: 2, opacity: 0.45 });
    f.line(x + w + 8, top + h - lvl, x + w + 8, top + h, { stroke: C.warn, width: 2 });
    f.text(x + w / 2, top + h + 22, name, { anchor: 'middle', size: 13, weight: 700 });
    f.text(x + w / 2, top + h + 40, vol, { anchor: 'middle', size: 12, fill: C.muted });
  };
  bucket(26, 56, 'узкое: C мало', 'воды мало');
  bucket(128, 100, 'широкое: C велико', 'воды много');
  f.text(120, 52, 'уровень одинаков (U)', { anchor: 'middle', size: 12, fill: C.warn, weight: 700 });
  f.line(240, 40, 240, 280, { stroke: C.grid, width: 1.5 });
  // конденсатор
  f.text(360, 24, 'Конденсатор', { anchor: 'middle', size: 15, weight: 700 });
  f.line(290, 120, 340, 120, { width: 2.5 });
  f.line(340, 90, 340, 150, { width: 4 });
  f.line(376, 90, 376, 150, { width: 4 });
  f.line(376, 120, 430, 120, { width: 2.5 });
  f.text(330, 82, '+Q', { anchor: 'middle', size: 14, weight: 700, fill: C.bad });
  f.text(386, 82, '−Q', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.arrow(340, 176, 376, 176, { stroke: C.warn, width: 2 });
  f.text(358, 198, 'U', { anchor: 'middle', size: 16, weight: 700, fill: C.warn });
  f.text(358, 232, 'Q = C · U', { anchor: 'middle', size: 20, weight: 700, fill: C.accent });
  f.text(358, 256, 'заряд = ёмкость × напряжение', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('capacitor-basics', 'bucket'));

  // 2. Q(U) для трёх ёмкостей
  const g = chart({
    title: 'Заряд растёт с напряжением: Q = C·U',
    xLabel: 'Напряжение U, В', yLabel: 'Заряд Q, мкКл',
    xRange: [0, 10], yRange: [0, 5000],
    series: [
      { fn: u => 470 * u, label: 'C = 470 мкФ', color: C.bad },
      { fn: u => 100 * u, label: 'C = 100 мкФ', color: C.accent },
      { fn: u => 10 * u, label: 'C = 10 мкФ', color: C.ok },
    ],
    markers: [{ x: 5, y: 500, label: '100 мкФ при 5 В: 500 мкКл', dx: 8, dy: 22, color: C.accent }],
  });
  g.save(out('capacitor-basics', 'q-vs-u'));

  // 3. Энергия E = C·U²/2 для 1000 мкФ
  const e = chart({
    title: 'Энергия конденсатора 1000 мкФ',
    xLabel: 'Напряжение U, В', yLabel: 'Энергия E, мДж',
    xRange: [0, 12], yRange: [0, 80],
    series: [{ fn: u => 0.5 * 1000e-6 * u * u * 1000, color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 5, y: 12.5, label: '5 В: 12,5 мДж', dx: 10, dy: 20 },
      { x: 10, y: 50, label: '10 В: 50 мДж', dx: -10, dy: -10, anchor: 'end' },
    ],
    notes: [{ x: 0.6, y: 72, text: 'напряжение ×2 → энергия ×4', color: C.bad }],
  });
  e.save(out('capacitor-basics', 'energy'));
}
