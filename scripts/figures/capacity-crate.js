import { Fig, C, chart, out, fresh } from '../lib/fig.js';

const lg = Math.log10;
const pow = v => String(Number((10 ** v).toPrecision(3))).replace('.', ',');

export function generate() {
  fresh('capacity-crate');

  // 1. Доступная ёмкость от тока разряда (иллюстративно)
  const g = chart({
    title: 'Ёмкость падает при большом токе',
    xLabel: 'Ток разряда, А (лог. шкала)', yLabel: 'Отданная ёмкость, мА·ч',
    xRange: [0.05, 3], yRange: [0, 3000], log: true, xTicks: [0.05, 0.1, 0.5, 1, 3],
    series: [
      { label: 'щелочная AA', color: C.warn, points: [[0.05, 2900], [0.1, 2800], [0.25, 2500], [0.5, 2000], [1, 1300], [2, 700], [3, 400]] },
      { label: 'Li-ion 18650', color: C.accent, points: [[0.05, 2520], [0.1, 2510], [0.5, 2480], [1, 2450], [2, 2400], [3, 2350]] },
    ],
    legendAt: { x: 90, y: 250, cols: 1 },
  });
  g.save(out('capacity-crate', 'capacity-vs-current'));

  // 2. Время работы t = C / I, идеально и реально
  const cap = 2500;
  const t = chart({
    title: 'Время работы батареи 2500 мА·ч',
    xLabel: 'Ток нагрузки, мА (лог. шкала)', yLabel: 'Время, ч (лог. шкала)',
    xRange: [10, 1000], yRange: [0, 2.6], log: true, yTicks: [0, 1, 2], yFormat: pow, xTicks: [10, 100, 1000],
    series: [
      { fn: i => lg(cap / i), label: 'идеально C / I', color: C.muted, dash: '7 5' },
      { fn: i => lg(0.75 * cap / i), label: 'реально, примерно ×0,75', color: C.accent },
    ],
    markers: [
      { x: 100, y: lg(0.75 * cap / 100), label: '100 мА: около 19 ч', dx: 10, dy: -12, color: C.accent },
    ],
    legendAt: { x: 230, y: 90, cols: 1 },
  });
  t.save(out('capacity-crate', 'runtime'));

  // 3. C-rate в одном взгляде
  const f = new Fig(480, 200, 'C-rate для элемента 2000 мА·ч');
  f.text(240, 24, 'Элемент 2000 мА·ч (2 А·ч)', { anchor: 'middle', size: 16, weight: 700 });
  const rows = [['0,5C', '1 А', 'около 2 часов'], ['1C', '2 А', 'около 1 часа'], ['2C', '4 А', 'около 30 минут'], ['5C', '10 А', 'около 12 минут']];
  rows.forEach(([c, a, tt], i) => {
    const y = 44 + i * 36;
    f.rect(20, y, 90, 28, { fill: C.accent, stroke: 'none', r: 6, opacity: 0.18 + i * 0.2 });
    f.text(65, y + 20, c, { anchor: 'middle', size: 17, weight: 700 });
    f.text(130, y + 20, 'ток ' + a, { size: 15 });
    f.text(250, y + 20, 'разряд за ' + tt, { size: 15, fill: C.muted });
  });
  f.save(out('capacity-crate', 'c-rate'));
}
