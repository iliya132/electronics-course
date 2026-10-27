import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('why-regulators');

  // 1. Типичная цепочка питания платы
  const f = new Fig(480, 270, 'Цепочка питания платы 12 В → 5 В → 3,3 В');
  const y = 70, h = 56;
  const blocks = [
    [10, 'адаптер\n12 В', C.warn],
    [140, 'buck\n12 → 5 В', C.accent],
    [270, 'LDO\n5 → 3,3 В', C.accent],
    [380, 'МК, Wi-Fi\n3,3 В', C.ok],
  ];
  blocks.forEach(([x, t, col], i) => {
    const w = i === 3 ? 90 : 90;
    f.rect(x, y, w, h, { r: 8, width: 2.4, stroke: col });
    const lines = t.split('\n');
    f.text(x + w / 2, y + 24, lines[0], { anchor: 'middle', size: 13, weight: 700, fill: col });
    f.text(x + w / 2, y + 43, lines[1], { anchor: 'middle', size: 12, fill: C.muted });
  });
  f.arrow(100, y + h / 2, 140, y + h / 2, { width: 2.4 });
  f.arrow(230, y + h / 2, 270, y + h / 2, { width: 2.4 });
  f.arrow(360, y + h / 2, 380, y + h / 2, { width: 2.4 });
  f.text(120, y + h / 2 - 8, '12 В', { anchor: 'middle', size: 11, weight: 700, fill: C.warn });
  f.text(250, y + h / 2 - 8, '5 В', { anchor: 'middle', size: 11, weight: 700, fill: C.accent });
  // ответвление 5 В вниз
  sch.node(f, 250, y + h / 2);
  f.arrow(250, y + h / 2, 250, 160, { width: 2.4 });
  f.rect(205, 160, 90, 52, { r: 8, width: 2.4, stroke: C.accent });
  f.text(250, 182, 'реле, моторы', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
  f.text(250, 200, '5 В', { anchor: 'middle', size: 12, fill: C.muted });
  // ответвление 3,3 В вниз к датчику
  sch.node(f, 370, y + h / 2);
  f.arrow(370, y + h / 2, 370, 160, { width: 2.4 });
  f.rect(325, 160, 100, 52, { r: 8, width: 2.4, stroke: C.ok });
  f.text(375, 182, 'датчик', { anchor: 'middle', size: 12, weight: 700, fill: C.ok });
  f.text(375, 200, '3,3 В, малый шум', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(240, 250, 'Каждая ступень решает свою задачу: понижает напряжение, чистит шум', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(240, 24, 'Типичное питание платы', { anchor: 'middle', size: 16, weight: 700 });
  f.save(out('why-regulators', 'chain'));

  // 2. Литий-ионная ячейка и выход LDO 3,3 В (иллюстративно)
  const cell = [[0, 4.2], [10, 4.05], [30, 3.85], [55, 3.72], [80, 3.55], [92, 3.4], [100, 3.0]];
  const vin = p => {
    for (let i = 1; i < cell.length; i++) if (p <= cell[i][0]) {
      const [x0, y0] = cell[i - 1], [x1, y1] = cell[i];
      return y0 + (y1 - y0) * (p - x0) / (x1 - x0);
    }
    return cell.at(-1)[1];
  };
  const g = chart({
    title: 'Ячейка Li-ion и выход LDO 3,3 В (иллюстративно)',
    xLabel: 'Израсходовано ёмкости, %', yLabel: 'Напряжение, В',
    xRange: [0, 100], yRange: [2.8, 4.4],
    series: [
      { fn: vin, label: 'напряжение ячейки (типичная кривая)', color: C.warn, width: 3 },
      { fn: p => Math.min(3.3, vin(p) - 0.2), label: 'выход LDO 3,3 В (dropout 0,2 В)', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 90, cols: 1 },
    samples: 200,
    notes: [{ x: 8, y: 3.05, text: 'ниже 3,5 В выход LDO\nидёт вслед за входом', color: C.muted }],
  });
  g.save(out('why-regulators', 'battery-ldo'));
}
