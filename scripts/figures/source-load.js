import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('source-load');

  // 1. Модель реального источника + нагрузка
  const f = new Fig(480, 300, 'Реальный источник: ЭДС E и внутреннее сопротивление r, нагрузка Rн');
  f.rect(26, 46, 196, 214, { stroke: C.muted, dash: '7 5', r: 10, width: 1.8 });
  f.text(36, 252, 'источник', { size: 14, fill: C.muted, weight: 600 });
  sch.battery(f, 70, 160, { rot: 90, name: 'E', off: -26 });
  sch.wire(f, [[70, 120], [70, 90], [90, 90]]);
  sch.resistor(f, 130, 90, { name: 'r', off: 26 });
  sch.wire(f, [[170, 90], [210, 90]]);
  sch.wire(f, [[70, 200], [70, 230], [210, 230]]);
  f.circle(210, 90, 4.5, { fill: 'none' });
  f.circle(210, 230, 4.5, { fill: 'none' });
  sch.wire(f, [[214, 90], [340, 90], [340, 120]]);
  sch.wire(f, [[340, 200], [340, 230], [214, 230]]);
  sch.resistor(f, 340, 160, { rot: 90, name: 'Rн', off: 28 });
  sch.voltage(f, 260, 92, 260, 228, 'U', { color: C.warn, bend: -26 });
  sch.current(f, 300, 90, 'right', 'I', { color: C.accent, off: -14, len: 36 });
  f.text(240, 24, 'Uн = E − I·r = E · Rн / (r + Rн)', { anchor: 'middle', size: 16, weight: 700, fill: C.accent });
  f.save(out('source-load', 'model'));

  // 2. Нагрузочная характеристика U(I), E = 5 В, r = 0,3 Ом
  const E = 5, r = 0.3;
  const g = chart({
    title: 'Нагрузочная характеристика: E = 5 В, r = 0,3 Ом',
    xLabel: 'Ток нагрузки I, А', yLabel: 'Напряжение на клеммах U, В',
    xRange: [0, 5], yRange: [3, 5.2],
    series: [{ fn: i => E - r * i, color: C.accent }],
    legend: false,
    markers: [
      { x: 0, y: 5, label: 'без нагрузки: 5 В', dx: 10, dy: -10 },
      { x: 1, y: 4.7, label: '1 А → 4,7 В', dx: 10, dy: -12 },
      { x: 3, y: 4.1, label: '3 А → 4,1 В', dx: 10, dy: -12 },
    ],
  });
  g.save(out('source-load', 'load-line'));

  // 3. Мощность в нагрузке P(Rн), E = 6 В, r = 2 Ом
  const E2 = 6, r2 = 2;
  const p = chart({
    title: 'Мощность в нагрузке: E = 6 В, r = 2 Ом',
    xLabel: 'Сопротивление нагрузки Rн, Ом', yLabel: 'Мощность P, Вт',
    xRange: [0, 10], yRange: [0, 5],
    series: [{ fn: rn => E2 * E2 * rn / ((r2 + rn) ** 2), color: C.accent }],
    legend: false,
    markers: [
      { x: 2, y: 4.5, label: 'максимум 4,5 Вт при Rн = r = 2 Ом', dx: 12, dy: -10, color: C.bad },
      { x: 10, y: 36 * 10 / 144, label: '2,5 Вт', dx: -10, dy: -10, anchor: 'end' },
    ],
  });
  p.save(out('source-load', 'power-vs-r'));
}
