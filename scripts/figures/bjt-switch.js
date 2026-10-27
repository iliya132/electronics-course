import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('bjt-switch');

  // 1. NPN-ключ: нагрузка 100 мА с вывода 3,3 В
  const f = new Fig(540, 370, 'NPN-транзистор как ключ для нагрузки 100 мА');
  sch.wire(f, [[330, 40], [470, 40]]);
  f.circle(470, 40, 4.5, { fill: 'none' });
  f.text(470, 26, '+5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[330, 40], [330, 60]]);
  sch.resistor(f, 330, 110, { rot: 90, len: 100, name: 'нагрузка', value: '48 Ом', off: -30 });
  sch.wire(f, [[330, 160], [330, 200]]);
  const q = sch.bjt(f, 300, 250);
  sch.wire(f, [[330, 300], [330, 322]]);
  sch.gnd(f, 330, 322);
  // база
  sch.wire(f, [[60, 250], [130, 250]]);
  sch.resistor(f, 170, 250, { len: 80, name: 'Rб 270 Ом', off: 28 });
  sch.wire(f, [[210, 250], [260, 250]]);
  sch.node(f, 235, 250);
  sch.wire(f, [[235, 250], [235, 262]]);
  sch.resistor(f, 235, 292, { rot: 90, len: 60, name: 'Rбэ', value: '10 кОм', off: -30 });
  sch.wire(f, [[235, 322], [235, 322]]);
  sch.gnd(f, 235, 322);
  f.circle(60, 250, 4.5, { fill: 'none' });
  f.text(14, 282, 'вывод МК, 3,3 В', { size: 12, fill: C.muted });
  sch.current(f, 100, 250, 'right', 'Iб = 9,6 мА', { off: -14, len: 36 });
  sch.current(f, 330, 182, 'down', 'Iк = 100 мА', { off: 14, len: 30 });
  f.text(392, 236, 'Uкэ ≈ 0,2 В', { size: 14, fill: C.warn, weight: 700 });
  f.text(392, 258, '(насыщение)', { size: 12, fill: C.muted });
  f.text(392, 292, 'Uбэ ≈ 0,7 В', { size: 14, fill: C.warn, weight: 700 });
  f.text(392, 168, 'Uнагр = 4,8 В', { size: 14, fill: C.warn, weight: 700 });
  f.save(out('bjt-switch', 'npn-switch'));

  // 2. Iк(Iб): линейный участок и насыщение (модель)
  const Isat = 100;
  const curve = beta => ib => Math.min(beta * ib, Isat);
  const g = chart({
    title: 'Ток коллектора от тока базы (модель)',
    xLabel: 'Ток базы Iб, мА', yLabel: 'Ток коллектора Iк, мА',
    xRange: [0, 12], yRange: [0, 130],
    series: [
      { fn: curve(100), label: 'β = 100', color: C.accent, width: 3 },
      { fn: curve(300), label: 'β = 300', color: C.ok, width: 3, dash: '8 5' },
    ],
    hlines: [{ v: Isat, label: 'предел нагрузки (5 В − 0,2 В) / 48 Ом = 100 мА', color: C.warn }],
    vlines: [{ v: 10, label: 'Iб = 10 мА', color: C.bad }],
    legendAt: { x: 300, y: 250, cols: 1 },
    xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [0, 25, 50, 75, 100, 125],
    samples: 480,
  });
  g.save(out('bjt-switch', 'ic-ib'));
}
