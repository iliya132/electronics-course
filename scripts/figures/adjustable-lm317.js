import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('adjustable-lm317');

  // 1. Схема LM317 с делителем
  const f = new Fig(480, 304, 'Регулируемый стабилизатор LM317');
  const y = 90;
  f.circle(18, y, 4.5, { fill: 'none' });
  f.text(18, y - 14, 'Uвх', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[22, y], [190, y]]);
  sch.node(f, 90, y);
  sch.wire(f, [[90, y], [90, y + 22]]);
  sch.capacitor(f, 90, y + 50, { rot: 90, len: 52, name: 'Cвх', off: 22 });
  sch.wire(f, [[90, y + 76], [90, 245]]);
  sch.gnd(f, 90, 245);
  f.rect(190, 62, 90, 56, { r: 8, width: 2.6, stroke: C.accent });
  f.text(235, 86, 'LM317', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(196, 56, 'IN', { size: 11, fill: C.muted });
  f.text(274, 56, 'OUT', { anchor: 'end', size: 11, fill: C.muted });
  f.text(246, 134, 'ADJ', { size: 11, fill: C.muted });
  sch.wire(f, [[280, y], [454, y]]);
  f.circle(458, y, 4.5, { fill: 'none' });
  f.text(458, y - 14, 'Uвых', { anchor: 'end', size: 13, weight: 700, fill: C.ok });
  // защитный диод D1 между входом и выходом
  sch.node(f, 160, y);
  sch.wire(f, [[160, y], [160, 28], [200, 28]]);
  sch.diode(f, 235, 28, { rot: 180, len: 60, name: 'D1', off: -18 });
  sch.wire(f, [[270, 28], [310, 28], [310, y]]);
  sch.node(f, 310, y);
  // делитель R1/R2
  sch.node(f, 360, y);
  sch.wire(f, [[360, y], [360, 116]]);
  sch.resistor(f, 360, 140, { rot: 90, len: 48, name: 'R1', off: 22 });
  sch.node(f, 360, 180);
  sch.wire(f, [[360, 164], [360, 180]]);
  sch.resistor(f, 360, 206, { rot: 90, len: 44, name: 'R2', off: 22 });
  sch.wire(f, [[360, 228], [360, 245]]);
  sch.gnd(f, 360, 245);
  sch.wire(f, [[360, 180], [235, 180], [235, 118]]);
  // выходной конденсатор
  sch.node(f, 420, y);
  sch.wire(f, [[420, y], [420, y + 22]]);
  sch.capacitor(f, 420, y + 50, { rot: 90, len: 52, name: 'Cвых', off: 22 });
  sch.wire(f, [[420, y + 76], [420, 245]]);
  sch.gnd(f, 420, 245);
  f.text(240, 294, 'Uвых = 1,25 В · (1 + R2/R1); между OUT и ADJ всегда 1,25 В', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('adjustable-lm317', 'circuit'));

  // 2. Зависимость Uвых(R2)
  const g = chart({
    title: 'Выход LM317 от сопротивления R2',
    xLabel: 'R2, Ом', yLabel: 'Uвых, В',
    xRange: [0, 2400], yRange: [0, 28],
    series: [
      { fn: r => 1.25 * (1 + r / 240), label: 'R1 = 240 Ом', color: C.accent, width: 3 },
      { fn: r => 1.25 * (1 + r / 120), label: 'R1 = 120 Ом', color: C.warn, width: 3 },
    ],
    legendAt: { x: 90, y: 92, cols: 1 },
    markers: [{ x: 1488, y: 9, label: 'R2 ≈ 1,49 кОм: 9 В', dx: -10, dy: -12, anchor: 'end', color: C.accent }],
    xTicks: [0, 600, 1200, 1800, 2400],
  });
  g.save(out('adjustable-lm317', 'vout'));
}
