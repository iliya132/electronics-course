import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('power-energy');

  // 1. P(I) для R = 100 Ом: парабола
  const g = chart({
    title: 'Мощность на резисторе 100 Ом',
    xLabel: 'Ток I, мА', yLabel: 'Мощность P = I²·R, мВт',
    xRange: [0, 100], yRange: [0, 1000],
    series: [{ fn: i => 100 * (i / 1000) ** 2 * 1000, color: C.accent }],
    legend: false,
    markers: [
      { x: 25, y: 62.5, label: '25 мА → 62,5 мВт', dx: 10, dy: -12 },
      { x: 50, y: 250, label: '50 мА → 250 мВт', dx: -10, dy: -10, anchor: 'end' },
      { x: 100, y: 1000, label: '100 мА → 1 Вт', dx: -10, dy: 20, anchor: 'end' },
    ],
    notes: [{ x: 5, y: 880, text: 'ток ×2 → мощность ×4', color: C.bad }],
  });
  g.save(out('power-energy', 'p-vs-i'));

  // 2. Энергия батарей: мА·ч не сравнимы без вольт
  const cells = [
    { name: 'щелочная AA', spec: '1,5 В · 2500 мА·ч', wh: 3.75, color: C.ok },
    { name: 'Li-ion 18650', spec: '3,7 В · 2500 мА·ч', wh: 9.25, color: C.accent },
    { name: 'батарея «Крона»', spec: '9 В · 500 мА·ч', wh: 4.5, color: C.warn },
  ];
  const f = new Fig(480, 270, 'Энергия батарей в ватт-часах');
  f.text(240, 24, 'Энергия = напряжение × ёмкость', { anchor: 'middle', size: 17, weight: 600 });
  cells.forEach((c, i) => {
    const y = 56 + i * 64;
    f.text(14, y + 14, c.name, { size: 15, weight: 600 });
    f.text(14, y + 34, c.spec, { size: 13, fill: C.muted });
    const w = c.wh * 22;
    f.rect(178, y, w, 34, { fill: c.color, stroke: 'none', r: 4, opacity: 0.85 });
    f.text(178 + w + 8, y + 23, String(c.wh).replace('.', ',') + ' Вт·ч', { size: 15, weight: 700, fill: c.color });
  });
  f.text(240, 254, 'Ёмкость AA и 18650 одинакова, а энергия — в 2,5 раза разная', { anchor: 'middle', size: 13, fill: C.muted });
  f.save(out('power-energy', 'battery-energy'));
}
