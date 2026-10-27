import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('parallel');

  // 1. Две ветви от одного источника
  const f = new Fig(480, 290, 'Два резистора параллельно подключены к батарейке 6 В');
  const T = 70, B = 230, mid = 150, X1 = 200, X2 = 340;
  sch.battery(f, 70, mid, { rot: 90, name: '6 В', off: -30 });
  sch.wire(f, [[70, mid - 40], [70, T], [X2, T]]);
  sch.wire(f, [[70, mid + 40], [70, B], [X2, B]]);
  for (const [x, name] of [[X1, 'R1 = 100 Ом'], [X2, 'R2 = 300 Ом']]) {
    sch.wire(f, [[x, T], [x, mid - 40]]);
    sch.wire(f, [[x, mid + 40], [x, B]]);
    sch.resistor(f, x, mid, { rot: 90, name, off: x === X1 ? -30 : 30 });
    sch.node(f, x, T); sch.node(f, x, B);
  }
  sch.current(f, 135, T, 'right', 'I = 80 мА', { off: -16, len: 44 });
  sch.current(f, X1, 96, 'down', 'I1 = 60 мА', { len: 24 });
  sch.current(f, X2, 96, 'down', 'I2 = 20 мА', { len: 24 });
  f.text(240, 268, 'На обеих ветвях по 6 В. Токи складываются: 60 + 20 = 80 мА', { anchor: 'middle', size: 14, fill: C.muted });
  f.save(out('parallel', 'circuit'));

  // 2. R общее при R1 = 100 Ом и растущем R2
  const g = chart({
    title: 'R1 = 100 Ом параллельно R2',
    xLabel: 'R2, Ом', yLabel: 'общее R, Ом',
    xRange: [0, 1000], yRange: [0, 120],
    series: [{ fn: r2 => 100 * r2 / (100 + r2), color: C.accent }],
    legend: false,
    hlines: [{ v: 100, label: 'предел: 100 Ом (R1)', color: C.muted }],
    markers: [
      { x: 100, y: 50, label: 'R2 = 100 → 50 Ом', dx: 10, dy: 20 },
      { x: 300, y: 75, label: 'R2 = 300 → 75 Ом', dx: 10, dy: 22 },
    ],
  });
  g.save(out('parallel', 'r-total'));
}
