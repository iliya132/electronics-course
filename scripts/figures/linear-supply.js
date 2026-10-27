import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('linear-supply');

  // 1. Схема линейного блока питания
  const f = new Fig(480, 280, 'Линейный блок питания: мост, конденсатор, 7805');
  const yT = 70, yB = 215;
  f.circle(30, 140, 18, { width: 2.2 });
  f.text(30, 147, '~', { anchor: 'middle', size: 20, weight: 700 });
  f.text(30, 176, 'AC 9 В', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[30, 122], [30, 104], [70, 104]]);
  sch.wire(f, [[30, 158], [30, 176], [30, 180], [70, 180]]);
  f.rect(70, 92, 66, 100, { r: 8, width: 2.4 });
  f.text(103, 140, 'мост', { anchor: 'middle', size: 13, weight: 700 });
  sch.wire(f, [[136, 104], [160, 104], [160, yT], [270, yT]]);
  sch.wire(f, [[136, 180], [160, 180], [160, yB], [440, yB]]);
  sch.node(f, 200, yT);
  sch.wire(f, [[200, yT], [200, 105]]);
  sch.capacitor(f, 200, 140, { rot: 90, len: 50, name: 'C1', off: 22 });
  sch.wire(f, [[200, 165], [200, yB]]);
  sch.node(f, 200, yB);
  f.rect(270, yT - 24, 80, 48, { r: 8, width: 2.6, stroke: C.accent });
  f.text(310, yT - 2, '7805', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(310, yT + 14, 'IN   OUT', { anchor: 'middle', size: 9.5, fill: C.muted });
  sch.wire(f, [[310, yT + 24], [310, yB]]);
  sch.node(f, 310, yB);
  sch.wire(f, [[350, yT], [440, yT]]);
  sch.node(f, 385, yT);
  sch.wire(f, [[385, yT], [385, 105]]);
  sch.capacitor(f, 385, 140, { rot: 90, len: 50, name: 'C2', off: 22 });
  sch.wire(f, [[385, 165], [385, yB]]);
  sch.node(f, 385, yB);
  sch.node(f, 430, yT);
  sch.wire(f, [[430, yT], [430, 105]]);
  sch.resistor(f, 430, 140, { rot: 90, len: 50, name: 'Rн', off: 22 });
  sch.wire(f, [[430, 165], [430, yB]]);
  f.text(240, 262, 'C1 = 1000 мкФ / 25 В, C2 = 100 мкФ, Rн: 16,5 Ом (≈ 0,3 А при 5 В)', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('linear-supply', 'setup'));

  // 2. Напряжение до и после 7805 (модель)
  const Vp = 12.5, dU = 3;
  const before = t => Vp - dU * ((t % 10) / 10);
  const g = chart({
    title: 'До и после 7805 при 0,3 А (модель)',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 40], yRange: [0, 14],
    series: [
      { fn: before, label: 'на C1 (вход 7805): пила 3 В', color: C.bad, width: 2.6 },
      { fn: () => 5, label: 'выход 7805 (пульсации ≈ мВ)', color: C.ok, width: 3 },
    ],
    legendAt: { x: 90, y: 92, cols: 1 },
    samples: 800,
    yTicks: [0, 5, 10, 14],
  });
  g.save(out('linear-supply', 'ripple'));
}
