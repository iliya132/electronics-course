import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('battery-types');

  // 1. Кривые разряда (иллюстративные)
  const g = chart({
    title: 'Как падает напряжение при разряде',
    xLabel: 'Отдано от ёмкости, %', yLabel: 'Напряжение элемента, В',
    xRange: [0, 100], yRange: [0.5, 4.5], yTicks: [1, 2, 3, 4],
    series: [
      { label: 'Li-ion', color: C.accent, points: [[0, 4.15], [5, 4.0], [25, 3.85], [50, 3.7], [75, 3.55], [90, 3.4], [97, 3.2], [100, 3.0]] },
      { label: 'LiFePO4', color: C.ok, points: [[0, 3.4], [5, 3.32], [50, 3.28], [90, 3.2], [97, 3.0], [100, 2.5]] },
      { label: 'щелочная', color: C.warn, points: [[0, 1.6], [20, 1.4], [50, 1.25], [80, 1.1], [95, 0.95], [100, 0.8]] },
      { label: 'NiMH', color: C.bad, points: [[0, 1.4], [10, 1.28], [50, 1.22], [85, 1.15], [95, 1.05], [100, 0.9]] },
    ],
    legendAt: { x: 90, y: 192, cols: 2, dx: 150 },
  });
  g.save(out('battery-types', 'discharge'));

  // 2. Типоразмеры в масштабе 2,6 px на мм
  const k = 2.6, base = 232;
  const cells = [
    ['AAA', 10.5, 44.5, '1,5 / 1,2 В', '1000 мА·ч', '#8a8a8a'],
    ['AA', 14.5, 50.5, '1,5 / 1,2 В', '2500 мА·ч', '#b08d3c'],
    ['18650', 18.6, 65, '3,7 В', '2500 мА·ч', '#2b58ad'],
    ['21700', 21.7, 70, '3,7 В', '4000 мА·ч', '#2b8b45'],
    ['CR2032', 20, 3.2, '3 В', '220 мА·ч', '#555'],
  ];
  const f = new Fig(480, 280, 'Популярные типоразмеры батарей в масштабе');
  f.text(240, 22, 'Размеры в одном масштабе (2,6 px на мм)', { anchor: 'middle', size: 14, weight: 700 });
  let x = 26;
  cells.forEach(([name, d, h, v, cap, col]) => {
    const w = d * k, H = h * k;
    if (name === 'CR2032') {
      f.rect(x, base - 20, w, 20 * 0.5 + 6, { fill: col, stroke: C.muted, r: 4, width: 1.5 });
      f.text(x + w / 2, 250, name, { anchor: 'middle', size: 13, weight: 700 });
      f.text(x + w / 2, 266, v + ', ' + cap, { anchor: 'middle', size: 10, fill: C.muted });
    } else {
      f.rect(x, base - H, w, H, { fill: col, stroke: C.muted, r: 6, width: 1.5, opacity: 0.85 });
      f.rect(x + w * 0.3, base - H - 3, w * 0.4, 3, { fill: C.muted, stroke: 'none', r: 1 });
      f.text(x + w / 2, 250, name, { anchor: 'middle', size: 13, weight: 700 });
      f.text(x + w / 2, 266, v, { anchor: 'middle', size: 10, fill: C.muted });
    }
    x += w + 40;
  });
  f.save(out('battery-types', 'sizes'));
}
