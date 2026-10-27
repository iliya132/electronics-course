import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('opamp-basics');

  // 1. Символ и внутренние блоки
  const f = new Fig(740, 330, 'Операционный усилитель: символ и внутренние блоки');
  const p = sch.opamp(f, 120, 120);
  f.text(60, 92, 'IN−', { anchor: 'end', size: 14, weight: 700 });
  f.text(60, 146, 'IN+', { anchor: 'end', size: 14, weight: 700 });
  f.text(256, 114, 'OUT', { size: 14, weight: 700 });
  f.text(156, 52, 'V+', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  f.text(156, 196, 'V−', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  f.text(30, 250, 'Vвых = A · (V+ − V−), A = 10⁵ и больше,\nно не выше напряжения питания', { size: 13, fill: C.muted });
  // блоки
  const bx = 380, by = 70;
  sch.block(f, bx, by, 90, 70, 'входной\nдифф. каскад', { size: 12 });
  sch.block(f, bx + 120, by, 90, 70, 'усилитель\nнапряжения', { size: 12 });
  sch.block(f, bx + 240, by, 90, 70, 'выходной\nкаскад', { size: 12 });
  f.arrow(bx + 90, by + 35, bx + 120, by + 35, { width: 2, head: 8 });
  f.arrow(bx + 210, by + 35, bx + 240, by + 35, { width: 2, head: 8 });
  f.text(bx - 6, by + 28, 'IN−\nIN+', { anchor: 'end', size: 12, weight: 700 });
  f.text(bx + 334, by + 20, 'OUT', { size: 12, weight: 700 });
  f.text(bx, by + 110, 'на входе — разность напряжений,\nна выходе — сильно усиленная копия', { size: 12, fill: C.muted });
  f.save(out('opamp-basics', 'symbol'));

  // 2. Передаточная характеристика без обратной связи (однополярное питание 5 В)
  const A = 1e5, mid = 2.5;
  const g = chart({
    title: 'ОУ без обратной связи (модель)',
    xLabel: 'Разность входов V+ − V−, мкВ', yLabel: 'Выход, В',
    xRange: [-100, 100], yRange: [0, 5],
    series: [{ fn: v => Math.min(5, Math.max(0, A * v * 1e-6)), label: 'питание 0…5 В, A = 10⁵', color: C.accent, width: 3 }],
    vlines: [{ v: 50, label: '50 мкВ', color: C.muted }],
    markers: [{ x: 25, y: 2.5, label: 'линейно лишь 0…50 мкВ', dx: -14, dy: 26, anchor: 'end' }],
    xTicks: [-100, -50, 0, 50, 100], yTicks: [0, 1, 2, 3, 4, 5],
    legendAt: { x: 100, y: 110, cols: 1 },
    samples: 400,
  });
  g.save(out('opamp-basics', 'transfer'));
}
