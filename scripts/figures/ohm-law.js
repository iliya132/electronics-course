import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ohm-law');

  // 1. Треугольник Ома
  const t = new Fig(480, 240, 'Треугольник Ома');
  t.poly([[130, 28], [30, 208], [230, 208]], { close: true, width: 2.5 });
  t.line(80, 118, 180, 118, { width: 2 });
  t.line(130, 118, 130, 208, { width: 2 });
  t.text(130, 98, 'U', { anchor: 'middle', size: 34, weight: 700, fill: C.warn });
  t.text(82, 178, 'I', { anchor: 'middle', size: 34, weight: 700, fill: C.accent });
  t.text(180, 178, 'R', { anchor: 'middle', size: 34, weight: 700, fill: C.bad });
  t.text(270, 56, 'Закрой нужную букву —', { size: 15, fill: C.muted });
  t.text(270, 76, 'останется формула:', { size: 15, fill: C.muted });
  t.text(270, 120, 'U = I · R', { size: 24, weight: 700, fill: C.warn });
  t.text(270, 160, 'I = U / R', { size: 24, weight: 700, fill: C.accent });
  t.text(270, 200, 'R = U / I', { size: 24, weight: 700, fill: C.bad });
  t.save(out('ohm-law', 'triangle'));

  // 2. ВАХ двух резисторов
  const g = chart({
    title: 'ВАХ двух резисторов',
    xLabel: 'Напряжение U, В', yLabel: 'Ток I, мА',
    xRange: [0, 10], yRange: [0, 100],
    series: [
      { fn: u => u / 100 * 1000, label: 'R = 100 Ом', color: C.accent },
      { fn: u => u / 470 * 1000, label: 'R = 470 Ом', color: C.ok },
    ],
    markers: [
      { x: 5, y: 50, label: '5 В → 50 мА', dx: 10, dy: 20 },
      { x: 5, y: 5 / 470 * 1000, label: '5 В → 10,6 мА', dx: 8, dy: -14, color: C.ok },
    ],
  });
  g.save(out('ohm-law', 'iv-resistors'));

  // 3. Лампа накаливания: закон Ома работает в каждой точке, но R меняется
  const lamp = u => 300 * Math.pow(u / 6, 0.58);
  const l = chart({
    title: 'Лампа 6 В / 0,3 А: ВАХ не прямая (модель)',
    xLabel: 'Напряжение U, В', yLabel: 'Ток I, мА',
    xRange: [0, 6], yRange: [0, 350],
    series: [
      { fn: u => lamp(u), label: 'лампа накаливания', color: C.bad },
      { fn: u => u / 20 * 1000, label: 'резистор 20 Ом', color: C.muted, dash: '7 5' },
    ],
    markers: [
      { x: 1, y: lamp(1), label: '1 В: R ≈ 9,4 Ом', dx: 10, dy: -12, color: C.bad },
      { x: 6, y: 300, label: '6 В: R = 20 Ом', dx: -8, dy: 22, anchor: 'end', color: C.bad },
    ],
  });
  l.save(out('ohm-law', 'iv-lamp'));
}
