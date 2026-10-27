import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('lm317-bench');

  // 1. Схема регулируемого БП
  const f = new Fig(480, 310, 'Регулируемый блок питания на LM317');
  const y = 90;
  f.circle(16, y, 4.5, { fill: 'none' });
  f.text(16, y - 14, '+14 В', { size: 12, weight: 700, fill: C.warn });
  sch.wire(f, [[20, y], [170, y]]);
  sch.node(f, 70, y);
  sch.wire(f, [[70, y], [70, y + 22]]);
  sch.capacitor(f, 70, y + 50, { rot: 90, len: 52, name: 'C1', off: 22 });
  sch.wire(f, [[70, y + 76], [70, 255]]);
  sch.gnd(f, 70, 255);
  f.rect(170, 62, 80, 56, { r: 8, width: 2.6, stroke: C.accent });
  f.text(210, 86, 'LM317', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(176, 56, 'IN', { size: 10, fill: C.muted });
  f.text(244, 56, 'OUT', { anchor: 'end', size: 10, fill: C.muted });
  f.text(216, 134, 'ADJ', { size: 10, fill: C.muted });
  sch.node(f, 130, y);
  sch.wire(f, [[130, y], [130, 28], [170, 28]]);
  sch.diode(f, 205, 28, { rot: 180, len: 56, name: 'D1', off: -16 });
  sch.wire(f, [[240, 28], [290, 28], [290, y]]);
  sch.wire(f, [[250, y], [454, y]]);
  sch.node(f, 290, y);
  sch.node(f, 320, y);
  sch.wire(f, [[320, y], [320, 112]]);
  sch.resistor(f, 320, 136, { rot: 90, len: 44, name: 'R1', off: 14 });
  sch.node(f, 320, 172);
  sch.wire(f, [[320, 158], [320, 172]]);
  sch.resistor(f, 320, 200, { rot: 90, len: 44, name: 'R2', off: 14 });
  sch.wire(f, [[320, 222], [320, 255]]);
  sch.gnd(f, 320, 255);
  sch.wire(f, [[320, 172], [210, 172], [210, 118]]);
  // выходной конденсатор и светодиод-индикатор
  sch.node(f, 380, y);
  sch.wire(f, [[380, y], [380, y + 22]]);
  sch.capacitor(f, 380, y + 50, { rot: 90, len: 52, name: 'C2', off: 22 });
  sch.wire(f, [[380, y + 76], [380, 255]]);
  sch.gnd(f, 380, 255);
  sch.node(f, 432, y);
  sch.wire(f, [[432, y], [432, 112]]);
  sch.resistor(f, 432, 136, { rot: 90, len: 44, name: '1к', off: 16 });
  sch.wire(f, [[432, 158], [432, 180]]);
  sch.diode(f, 432, 206, { rot: 90, len: 40, led: true });
  f.text(418, 211, 'LED', { anchor: 'end', size: 12, weight: 700 });
  sch.wire(f, [[432, 226], [432, 255]]);
  sch.gnd(f, 432, 255);
  f.circle(458, y, 4.5, { fill: 'none' });
  f.text(458, y - 14, 'Uвых', { anchor: 'end', size: 12, weight: 700, fill: C.ok });
  f.text(240, 296, 'R1 = 240 Ом, R2 — потенциометр 2,2 кОм; Uвых = 1,25·(1 + R2/R1)', { anchor: 'middle', size: 11.5, fill: C.muted });
  f.save(out('lm317-bench', 'setup'));

  // 2. Теоретическая зависимость Uвых(R2) и ограничение по входу (14 В − 2 В)
  const g = chart({
    title: 'Ожидаемый выход: R1 = 240 Ом, вход 14 В',
    xLabel: 'R2, Ом', yLabel: 'Uвых, В',
    xRange: [0, 2200], yRange: [0, 14],
    series: [
      { fn: r => 1.25 * (1 + r / 240), label: 'по формуле', color: C.muted, width: 1.8, dash: '6 5' },
      { fn: r => Math.min(12, 1.25 * (1 + r / 240)), label: 'с учётом dropout (вход − 2 В)', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 90, cols: 1 },
    markers: [
      { x: 0, y: 1.25, label: '1,25 В', dx: 10, dy: -8, anchor: 'start', color: C.ok },
      { x: 910, y: 1.25 * (1 + 910 / 240), label: 'R2 = 910 Ом: 6 В', dx: 12, dy: 20, anchor: 'start', color: C.accent },
    ],
    xTicks: [0, 550, 1100, 1650, 2200],
  });
  g.save(out('lm317-bench', 'expected'));
}
