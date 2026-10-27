import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('divider');

  // 1. Схема делителя
  const f = new Fig(480, 320, 'Делитель напряжения из двух резисторов');
  f.circle(150, 36, 4.5, { fill: 'none' });
  f.text(138, 40, 'Uвх', { anchor: 'end', size: 16, weight: 700, fill: C.warn });
  sch.wire(f, [[154, 36], [200, 36], [200, 80]]);
  sch.resistor(f, 200, 120, { rot: 90, name: 'R1', off: 30 });
  sch.wire(f, [[200, 160], [200, 190]]);
  sch.resistor(f, 200, 230, { rot: 90, name: 'R2', off: 30 });
  sch.wire(f, [[200, 270], [200, 280]]);
  sch.gnd(f, 200, 280);
  sch.node(f, 200, 175);
  sch.wire(f, [[200, 175], [300, 175]]);
  f.circle(304, 175, 4.5, { fill: 'none' });
  f.text(316, 180, 'Uвых', { size: 16, weight: 700, fill: C.accent });
  f.text(232, 40, 'Uвых = Uвх · R2 / (R1 + R2)', { size: 14, weight: 700, fill: C.accent });
  f.text(232, 64, 'Выход берут между средней\nточкой и землёй, то есть\nна нижнем резисторе R2.', { size: 13, fill: C.muted });
  f.save(out('divider', 'circuit'));

  // 2. Uвых от R2 при R1 = 10 кОм
  const g = chart({
    title: 'Делитель: Uвх = 12 В, R1 = 10 кОм',
    xLabel: 'R2, кОм', yLabel: 'Uвых, В',
    xRange: [0, 100], yRange: [0, 12],
    series: [{ fn: r2 => 12 * r2 / (10 + r2), color: C.accent }],
    legend: false,
    markers: [
      { x: 10, y: 6, label: 'R2 = R1 → 6 В', dx: 10, dy: 22 },
      { x: 30, y: 9, label: 'R2 = 30 кОм → 9 В', dx: 10, dy: 22 },
    ],
  });
  g.save(out('divider', 'vout-vs-r2'));

  // 3. Нагрузка просаживает выход
  const parallel = (a, b) => a * b / (a + b);
  const h = chart({
    title: 'Нагрузка просаживает выход',
    xLabel: 'Сопротивление нагрузки Rн, кОм', yLabel: 'Uвых, В',
    xRange: [1, 100], yRange: [0, 7], log: true, yTicks: [0, 2, 4, 6],
    series: [{ fn: rn => 12 * parallel(10, rn) / (10 + parallel(10, rn)), color: C.bad }],
    legend: false,
    hlines: [{ v: 6, label: 'без нагрузки: 6 В', color: C.ok }],
    markers: [
      { x: 1, y: 12 * parallel(10, 1) / (10 + parallel(10, 1)), label: '1 кОм → 1 В', dx: 10, dy: -10 },
      { x: 10, y: 4, label: '10 кОм → 4 В', dx: 10, dy: 20 },
      { x: 100, y: 12 * parallel(10, 100) / (10 + parallel(10, 100)), label: '100 кОм → 5,7 В', dx: -10, dy: 22, anchor: 'end' },
    ],
  });
  h.save(out('divider', 'loaded'));
}
