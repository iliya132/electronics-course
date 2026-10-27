import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('lc-pi-filter');

  // 1. Г-образный LC и π-фильтр
  const f = new Fig(480, 340, 'LC-фильтр и π-фильтр питания');
  const row = (y0, title, pi) => {
    f.text(14, y0 - 22, title, { size: 14, weight: 700, fill: C.accent });
    f.circle(30, y0 + 40, 4.5, { fill: 'none' });
    sch.wire(f, [[34, y0 + 40], [pi ? 70 : 100, y0 + 40]]);
    if (pi) {
      sch.node(f, 70, y0 + 40);
      sch.wire(f, [[70, y0 + 40], [70, y0 + 62]]);
      sch.capacitor(f, 70, y0 + 85, { rot: 90, len: 46, name: 'C1', off: -22 });
      sch.wire(f, [[70, y0 + 108], [70, y0 + 120]]);
      sch.gnd(f, 70, y0 + 120);
    }
    const lx = pi ? 160 : 150;
    sch.wire(f, [[pi ? 70 : 100, y0 + 40], [lx - 40, y0 + 40]]);
    sch.inductor(f, lx, y0 + 40, { len: 80, name: 'L', off: 28 });
    sch.wire(f, [[lx + 40, y0 + 40], [320, y0 + 40]]);
    sch.node(f, 260, y0 + 40);
    sch.wire(f, [[260, y0 + 40], [260, y0 + 62]]);
    sch.capacitor(f, 260, y0 + 85, { rot: 90, len: 46, name: pi ? 'C2' : 'C', off: 22 });
    sch.wire(f, [[260, y0 + 108], [260, y0 + 120]]);
    sch.gnd(f, 260, y0 + 120);
    f.circle(324, y0 + 40, 4.5, { fill: 'none' });
    f.text(340, y0 + 46, 'к нагрузке', { size: 12, fill: C.muted });
    f.text(14, y0 + 20, 'вход с шумом', { size: 11, fill: C.bad });
  };
  row(52, 'Г-образный LC-фильтр', false);
  row(204, 'π-фильтр (C–L–C)', true);
  f.save(out('lc-pi-filter', 'schematics'));

  // 2. АЧХ второго порядка при разной добротности (fc = 15,9 кГц)
  const fc = 15900;
  const H = (q) => fr => { const x = fr / fc; return -10 * Math.log10((1 - x * x) ** 2 + (x / q) ** 2); };
  const g = chart({
    title: 'LC-фильтр 10 мкГн + 10 мкФ: пик на резонансе',
    xLabel: 'Частота, Гц (лог.)', yLabel: 'Усиление, дБ',
    xRange: [1000, 1e6], yRange: [-70, 25], log: true, xTicks: [1000, 1e4, 1e5, 1e6], yTicks: [20, 0, -20, -40, -60],
    xFormat: v => (v >= 1e6 ? v / 1e6 + ' М' : v / 1000 + ' к'),
    series: [
      { fn: H(10), label: 'Q = 10: «звенит»', color: C.bad, width: 2.6 },
      { fn: H(1), label: 'Q = 1', color: C.warn, width: 2.6 },
      { fn: H(0.5), label: 'Q = 0,5: демпфирован', color: C.ok, width: 2.6 },
    ],
    legendAt: { x: 270, y: 84, cols: 1 },
    vlines: [{ v: fc, label: 'fc', color: C.muted }],
    markers: [{ x: 5e5, y: H(0.5)(5e5), label: '500 кГц: −60 дБ', dx: -8, dy: -12, anchor: 'end' }],
  });
  g.save(out('lc-pi-filter', 'response'));
}
