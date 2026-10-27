import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('transformer');

  // 1. Схема трансформатора
  const f = new Fig(480, 300, 'Трансформатор: две обмотки на общем сердечнике');
  f.circle(66, 150, 18, { width: 2.2 });
  f.text(66, 156, '~', { anchor: 'middle', size: 22, weight: 700 });
  sch.wire(f, [[66, 132], [66, 100], [150, 100]]);
  sch.inductor(f, 150, 150, { rot: 90, len: 100, name: 'N1', off: -34 });
  sch.wire(f, [[150, 200], [66, 200], [66, 168]]);
  f.line(224, 96, 224, 204, { width: 2.5 });
  f.line(240, 96, 240, 204, { width: 2.5 });
  f.text(232, 82, 'сердечник', { anchor: 'middle', size: 13, fill: C.muted });
  sch.inductor(f, 314, 150, { rot: 90, len: 100, name: 'N2', off: 34 });
  sch.wire(f, [[314, 100], [410, 100], [410, 110]]);
  sch.resistor(f, 410, 150, { rot: 90, len: 80, name: 'Rн', off: -26 });
  sch.wire(f, [[410, 190], [410, 200], [314, 200]]);
  f.text(66, 232, 'U1 (вход)', { anchor: 'middle', size: 14, weight: 700, fill: C.warn });
  f.text(410, 232, 'U2 (выход)', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(240, 270, 'U2 / U1 = N2 / N1       I2 / I1 = N1 / N2', { anchor: 'middle', size: 15, weight: 700 });
  f.save(out('transformer', 'schematic'));

  // 2. Выходное напряжение адаптера от тока нагрузки
  const g = chart({
    title: 'Напряжение вторичной обмотки под нагрузкой',
    xLabel: 'Ток нагрузки, А', yLabel: 'U2 (RMS), В',
    xRange: [0, 1.2], yRange: [10, 16],
    series: [{ fn: i => 15 - 3 * i, color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 0, y: 15, label: 'холостой ход: 15 В', dx: 10, dy: 20, color: C.warn },
      { x: 1, y: 12, label: 'номинал: 12 В при 1 А', dx: -10, dy: -12, anchor: 'end', color: C.ok },
    ],
  });
  g.save(out('transformer', 'load-curve'));
}
