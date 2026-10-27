import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('motor-relay-driver');

  // 1. Стенд: вентилятор 12 В, MOSFET, диод
  const f = new Fig(640, 380, 'Стенд: вентилятор 12 В на N-MOSFET с обратным диодом');
  sch.wire(f, [[250, 40], [520, 40]]);
  f.circle(520, 40, 4.5, { fill: 'none' });
  f.text(520, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.node(f, 330, 40); sch.node(f, 440, 40);
  sch.wire(f, [[330, 40], [330, 88]]);
  f.circle(330, 110, 22, { width: 2.4 });
  f.text(330, 116, 'M', { anchor: 'middle', size: 17, weight: 700 });
  f.text(300, 116, 'вентилятор', { anchor: 'end', size: 12, fill: C.muted });
  sch.wire(f, [[330, 132], [330, 185]]);
  sch.node(f, 330, 185);
  sch.wire(f, [[440, 40], [440, 68]]);
  sch.diode(f, 440, 120, { rot: 270, len: 90, name: 'VD', value: '1N4007', off: 26 });
  sch.wire(f, [[440, 172], [440, 185], [330, 185]]);
  sch.mosfet(f, 300, 235);
  sch.wire(f, [[330, 285], [330, 305]]);
  sch.gnd(f, 330, 305);
  sch.wire(f, [[50, 235], [110, 235]]);
  sch.resistor(f, 150, 235, { len: 80, name: 'Rз 100 Ом', off: 28 });
  sch.wire(f, [[190, 235], [266, 235]]);
  sch.node(f, 230, 235);
  sch.wire(f, [[230, 235], [230, 247]]);
  sch.resistor(f, 230, 277, { rot: 90, len: 60, name: 'Rпд', value: '10 кОм', off: -30 });
  sch.gnd(f, 230, 307);
  f.circle(50, 235, 4.5, { fill: 'none' });
  f.text(14, 268, 'вывод МК (ШИМ)', { size: 12, fill: C.muted });
  f.text(400, 250, 'измеряем:\nIвент — в разрыв +12 В,\nUси — сток–исток,\nT корпуса ключа', { size: 12, fill: C.muted });
  f.save(out('motor-relay-driver', 'test-bench'));

  // 2. Напряжение на моторе при разных способах включения (модель)
  const g = chart({
    title: 'Напряжение на моторе при питании 12 В (модель)',
    xLabel: 'Ток мотора, А', yLabel: 'Напряжение на моторе, В',
    xRange: [0, 1], yRange: [9, 12.5],
    series: [
      { fn: i => 12 - 0.03 * i, label: 'MOSFET 30 мОм', color: C.ok, width: 3 },
      { fn: i => 12 - 0.5 * i, label: 'TB6612 (0,5 Ом)', color: C.accent, width: 3 },
      { fn: i => 12 - (1.4 + 0.6 * i), label: 'L298N (≈ 2 В при 1 А)', color: C.bad, width: 3 },
    ],
    legendAt: { x: 120, y: 200, cols: 1 },
    xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [9, 10, 11, 12],
    samples: 60,
  });
  g.save(out('motor-relay-driver', 'motor-voltage'));
}
