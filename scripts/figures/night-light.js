import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('night-light');

  // 1. Схема ночника
  const f = new Fig(640, 400, 'Схема ночника: фоторезистор в делителе управляет MOSFET');
  sch.wire(f, [[110, 40], [520, 40]]);
  f.circle(520, 40, 4.5, { fill: 'none' });
  f.text(520, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.node(f, 180, 40); sch.node(f, 400, 40);
  sch.wire(f, [[180, 40], [180, 60]]);
  sch.resistor(f, 180, 100, { rot: 90, len: 80, name: 'R1', value: '22 кОм', off: -30 });
  sch.wire(f, [[180, 140], [180, 140]]);
  sch.resistor(f, 180, 180, { rot: 90, len: 80, name: 'RV1', value: '47 кОм', off: -30 });
  sch.wire(f, [[180, 220], [180, 250]]);
  sch.node(f, 180, 235);
  sch.resistor(f, 180, 290, { rot: 90, len: 80, name: 'LDR', value: '15 кОм при 10 лк', off: -30 });
  sch.wire(f, [[180, 330], [180, 345]]);
  sch.gnd(f, 180, 345);
  sch.wire(f, [[180, 235], [230, 235]]);
  sch.resistor(f, 260, 235, { len: 60, name: 'Rз 1 кОм', off: 26 });
  sch.wire(f, [[290, 235], [326, 235]]);
  sch.wire(f, [[400, 40], [400, 60]]);
  sch.resistor(f, 400, 110, { rot: 90, len: 100, name: 'лента', value: '12 В, 0,4 А', off: 30 });
  sch.wire(f, [[400, 160], [400, 185]]);
  sch.mosfet(f, 360, 235);
  sch.wire(f, [[390, 285], [390, 300]]);
  sch.gnd(f, 390, 300);
  f.text(30, 236, 'Uз', { size: 14, weight: 700, fill: C.warn });
  f.text(430, 236, 'Uз = 12·Rldr / (Rверх + Rldr)', { size: 12, fill: C.muted });
  f.text(430, 262, 'темно: Rldr и Uз растут,\nключ открыт, лента горит', { size: 12, fill: C.ok, weight: 600 });
  f.save(out('night-light', 'schematic'));

  // 2. Напряжение на затворе от освещённости (модель)
  const R = e => Math.min(1e6, 15e3 * Math.pow(10 / e, 0.6));
  const vg = rv => e => 12 * R(e) / (22e3 + rv + R(e));
  const g = chart({
    title: 'Напряжение на затворе от освещённости (модель)',
    xLabel: 'Освещённость, лк (логарифмическая шкала)', yLabel: 'Uз, В',
    xRange: [1, 1000], yRange: [0, 10], log: true,
    series: [
      { fn: vg(10e3), label: 'RV1 = 10 кОм', color: C.ok, width: 3 },
      { fn: vg(30e3), label: 'RV1 = 30 кОм', color: C.accent, width: 3 },
      { fn: vg(50e3), label: 'RV1 = 50 кОм', color: C.warn, width: 3, dash: '8 5' },
    ],
    hlines: [{ v: 2.5, label: 'порог открытия ≈ 2,5 В', color: C.bad }],
    legendAt: { x: 330, y: 100, cols: 1 },
    xTicks: [1, 10, 100, 1000], yTicks: [0, 2.5, 5, 7.5, 10],
    samples: 300,
  });
  g.save(out('night-light', 'threshold'));
}
