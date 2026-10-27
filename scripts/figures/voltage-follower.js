import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('voltage-follower');

  // 1. Делитель -> повторитель -> АЦП
  const f = new Fig(640, 360, 'Повторитель напряжения между высокоомным делителем и АЦП');
  sch.wire(f, [[60, 40], [120, 40]]);
  f.circle(60, 40, 4.5, { fill: 'none' });
  f.text(60, 26, '+5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[120, 40], [120, 100]]);
  sch.resistor(f, 120, 150, { rot: 90, len: 100, name: 'R1', value: '100 кОм', off: -30 });
  sch.wire(f, [[120, 200], [120, 222]]);
  sch.node(f, 120, 222);
  sch.resistor(f, 120, 272, { rot: 90, len: 100, name: 'R2', value: '100 кОм', off: -30 });
  sch.wire(f, [[120, 322], [120, 336]]);
  sch.gnd(f, 120, 336 - 12);
  const p = sch.opamp(f, 330, 200, { supply: false });
  sch.wire(f, [[120, 222], [290, 222]]);
  sch.wire(f, [[450, 200], [500, 200]]);
  sch.node(f, 470, 200);
  sch.wire(f, [[470, 200], [470, 100], [250, 100], [250, 178], [290, 178]]);
  sch.block(f, 500, 170, 110, 60, 'вход\nАЦП', { size: 14 });
  f.text(150, 205, 'U = 2,5 В\nRист = 50 кОм', { size: 12, fill: C.warn, weight: 600 });
  f.text(300, 270, 'Rвых ОУ ≈ единицы Ом', { size: 12, fill: C.ok, weight: 600 });
  f.text(480, 138, 'вход АЦП берёт\nмикроампер утечки', { size: 12, fill: C.muted });
  f.save(out('voltage-follower', 'buffer'));

  // 2. Ошибка из-за утечки входа АЦП (1 мкА) в единицах LSB
  const lsb = 5 / 1024;
  const g = chart({
    title: 'Ошибка АЦП от сопротивления источника (модель)',
    xLabel: 'Сопротивление источника, кОм', yLabel: 'Ошибка, LSB (10 бит, 5 В)',
    xRange: [0, 100], yRange: [0, 22],
    series: [
      { fn: r => 1e-6 * r * 1e3 / lsb, label: 'без буфера, утечка 1 мкА', color: C.bad, width: 3 },
      { fn: r => 1e-6 * 10 / lsb, label: 'с буфером (Rвых ≈ 10 Ом)', color: C.ok, width: 3 },
    ],
    markers: [{ x: 50, y: 1e-6 * 50e3 / lsb, label: 'делитель 100к/100к: 10 LSB', dx: -12, dy: -14, anchor: 'end', color: C.bad }],
    legendAt: { x: 110, y: 100, cols: 1 },
    xTicks: [0, 25, 50, 75, 100], yTicks: [0, 5, 10, 15, 20],
    samples: 60,
  });
  g.save(out('voltage-follower', 'adc-error'));
}
