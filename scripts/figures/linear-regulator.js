import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('linear-regulator');

  // 1. Упрощённая структура линейного стабилизатора
  const f = new Fig(480, 290, 'Структура линейного стабилизатора');
  f.circle(24, 80, 4.5, { fill: 'none' });
  f.text(24, 62, 'Uвх', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[28, 80], [170, 80]]);
  f.rect(170, 55, 100, 50, { r: 8, width: 2.4, stroke: C.accent });
  f.text(220, 77, 'проходной', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
  f.text(220, 94, 'транзистор', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
  sch.wire(f, [[270, 80], [440, 80]]);
  f.circle(444, 80, 4.5, { fill: 'none' });
  f.text(444, 62, 'Uвых', { anchor: 'end', size: 13, weight: 700, fill: C.ok });
  sch.node(f, 360, 80);
  sch.wire(f, [[360, 80], [360, 110]]);
  sch.resistor(f, 360, 138, { rot: 90, len: 50, name: 'R1', off: 22 });
  sch.node(f, 360, 178);
  sch.resistor(f, 360, 208, { rot: 90, len: 50, name: 'R2', off: 22 });
  sch.wire(f, [[360, 233], [360, 252]]);
  sch.gnd(f, 360, 252);
  f.rect(170, 150, 100, 60, { r: 8, width: 2.4 });
  f.text(220, 176, 'усилитель', { anchor: 'middle', size: 12, weight: 700 });
  f.text(220, 193, 'ошибки', { anchor: 'middle', size: 12, weight: 700 });
  f.arrow(220, 150, 220, 105, { width: 2.4, stroke: C.accent });
  f.rect(30, 150, 90, 60, { r: 8, width: 2.4, stroke: C.warn });
  f.text(75, 176, 'опорное', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  f.text(75, 193, '1,25 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  f.arrow(120, 168, 170, 168, { width: 2 });
  f.text(150, 160, '+', { anchor: 'middle', size: 14, weight: 700 });
  sch.wire(f, [[360, 178], [310, 178], [310, 194], [270, 194]]);
  f.text(290, 189, '−', { anchor: 'end', size: 15, weight: 700 });
  f.text(240, 278, 'Uвых упало — транзистор открывается шире, выросло — прикрывается', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('linear-regulator', 'structure'));

  // 2. Мощность потерь: P = (Uвх − 5)·I
  const g = chart({
    title: 'Тепло в стабилизаторе 5 В: P = (Uвх − 5 В)·I',
    xLabel: 'Входное напряжение, В', yLabel: 'Мощность потерь, Вт',
    xRange: [7, 20], yRange: [0, 8],
    series: [
      { fn: u => (u - 5) * 0.1, label: 'ток 0,1 А', color: C.ok, width: 3 },
      { fn: u => (u - 5) * 0.3, label: 'ток 0,3 А', color: C.accent, width: 3 },
      { fn: u => (u - 5) * 0.5, label: 'ток 0,5 А', color: C.bad, width: 3 },
    ],
    legendAt: { x: 90, y: 92, cols: 1 },
    markers: [{ x: 12, y: 2.1, label: '12 В, 0,3 А: 2,1 Вт', dx: 10, dy: 22, anchor: 'start', color: C.accent }],
  });
  g.save(out('linear-regulator', 'heat'));
}
