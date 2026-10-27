import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('reference-voltage');

  // 1. TL431 как регулируемый стабилитрон на 5 В
  const f = new Fig(640, 380, 'TL431 как источник опорного напряжения 5 В');
  sch.wire(f, [[60, 40], [330, 40]]);
  f.circle(60, 40, 4.5, { fill: 'none' });
  f.text(60, 26, 'Uвх = 12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[200, 40], [200, 60]]);
  sch.resistor(f, 200, 100, { rot: 90, len: 80, name: 'Rс', value: '2,2 кОм', off: -30 });
  sch.wire(f, [[200, 140], [200, 150]]);
  sch.node(f, 200, 150);
  sch.wire(f, [[200, 150], [330, 150]]);
  f.circle(330, 150, 4.5, { fill: 'none' });
  f.text(344, 154, 'Uоп = 4,99 В', { size: 13, weight: 700, fill: C.ok });
  // TL431: катод вверху, анод внизу
  sch.wire(f, [[270, 150], [270, 190]]);
  sch.node(f, 270, 150);
  f.rect(240, 190, 60, 70, { r: 6, width: 2.4 });
  f.text(270, 230, 'TL431', { anchor: 'middle', size: 13, weight: 700 });
  f.text(284, 186, 'K', { size: 12, weight: 700 });
  f.text(284, 276, 'A', { size: 12, weight: 700 });
  sch.wire(f, [[270, 260], [270, 330]]);
  sch.gnd(f, 270, 330);
  // делитель R1/R2 к REF
  sch.wire(f, [[130, 150], [130, 175]]);
  sch.wire(f, [[200, 150], [130, 150]]);
  sch.resistor(f, 130, 205, { rot: 90, len: 60, name: 'R1', value: '10 кОм', off: -30 });
  sch.wire(f, [[130, 235], [130, 240]]);
  sch.node(f, 130, 240);
  sch.wire(f, [[130, 240], [240, 240]]);
  f.text(246, 244, 'REF', { size: 11, weight: 700 });
  sch.wire(f, [[130, 240], [130, 255]]);
  sch.resistor(f, 130, 285, { rot: 90, len: 60, name: 'R2', value: '10 кОм', off: -30 });
  sch.wire(f, [[130, 315], [130, 330]]);
  sch.gnd(f, 130, 330);
  f.text(400, 220, 'Uоп = 2,495 В·(1 + R1/R2)\n= 2,495 · 2 = 4,99 В', { size: 12, fill: C.muted });
  f.save(out('reference-voltage', 'tl431'));

  // 2. Выход от входа (модель)
  const g = chart({
    title: 'Выход TL431 от входного напряжения (модель)',
    xLabel: 'Входное напряжение, В', yLabel: 'Выход, В',
    xRange: [0, 15], yRange: [0, 6],
    series: [{ fn: v => v < 5.0 ? v : 4.99 + 0.0005 * (v - 5), label: 'Rс = 2,2 кОм, нагрузка 1 мА', color: C.accent, width: 3 }],
    hlines: [{ v: 4.99, label: '4,99 В', color: C.ok }],
    legendAt: { x: 90, y: 200, cols: 1 },
    xTicks: [0, 3, 6, 9, 12, 15], yTicks: [0, 1, 2, 3, 4, 5, 6],
    samples: 200,
  });
  g.save(out('reference-voltage', 'regulation'));
}
