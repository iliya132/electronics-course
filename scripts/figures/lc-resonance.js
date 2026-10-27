import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('lc-resonance');

  // 1. Схема контура: энергия перетекает между L и C
  const f = new Fig(480, 280, 'LC-контур');
  const T = 80, B = 210;
  sch.inductor(f, 150, T, { name: 'L', len: 90, off: 28 });
  sch.wire(f, [[105, T], [70, T], [70, 105]]);
  sch.wire(f, [[195, T], [330, T], [330, 105]]);
  sch.capacitor(f, 330, 145, { rot: 90, name: 'C', off: 28, len: 80 });
  sch.wire(f, [[330, 185], [330, B], [70, B], [70, 105]]);
  f.arrow(190, 118, 230, 118, { stroke: C.accent, width: 3 });
  f.arrow(230, 138, 190, 138, { stroke: C.accent, width: 3 });
  f.text(210, 168, 'энергия «перетекает»', { anchor: 'middle', size: 13, fill: C.accent, weight: 700 });
  f.text(210, 186, 'между полем C и полем L', { anchor: 'middle', size: 13, fill: C.accent, weight: 700 });
  f.text(240, 252, 'f₀ = 1 / (2π · √(L · C))', { anchor: 'middle', size: 18, weight: 700, fill: C.warn });
  f.save(out('lc-resonance', 'circuit'));

  // 2. Затухающие колебания в контуре
  const g = chart({
    title: 'Свободные колебания контура 1 МГц',
    xLabel: 'Время, мкс', yLabel: 'Напряжение на C, отн. ед.',
    xRange: [0, 10], yRange: [-1.1, 1.1], yTicks: [-1, 0, 1], samples: 800,
    series: [
      { fn: t => Math.exp(-t / 3) * Math.cos(2 * Math.PI * t), color: C.accent, width: 2.2 },
      { fn: t => Math.exp(-t / 3), color: C.bad, width: 1.5, dash: '6 5' },
    ],
    legend: false,
    notes: [{ x: 3.2, y: 0.85, text: 'огибающая: потери R гасят колебания', color: C.bad }],
  });
  g.save(out('lc-resonance', 'ringing'));

  // 3. АЧХ при разной добротности
  const h = (q) => x => 1 / Math.sqrt(1 + q * q * (x - 1 / x) ** 2);
  const r = chart({
    title: 'Резонансная кривая контура',
    xLabel: 'Частота f / f₀', yLabel: 'Отклик (отн.)',
    xRange: [0.5, 1.5], yRange: [0, 1.1], yTicks: [0, 0.5, 0.707, 1], xTicks: [0.5, 0.75, 1, 1.25, 1.5], samples: 500,
    series: [
      { fn: h(5), label: 'Q = 5 (широкая)', color: C.accent, width: 3 },
      { fn: h(20), label: 'Q = 20 (острая)', color: C.bad, width: 3 },
    ],
    legendAt: { x: 90, y: 100, cols: 1 },
    hlines: [{ v: 0.707, label: '−3 дБ', color: C.muted }],
  });
  r.save(out('lc-resonance', 'q-curves'));
}
