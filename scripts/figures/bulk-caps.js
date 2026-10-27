import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('bulk-caps');

  // 1. Просадка при импульсе 100 мА × 1 мс
  const droop = cap => t => {
    const I = 0.1, E = 3.3, drop = I * 1e-3 / (cap * 1e-6);
    if (t < 1) return E;
    if (t < 2) return E - drop * (t - 1);
    return E - drop * Math.exp(-(t - 2) / 1.2);
  };
  const g = chart({
    title: 'Импульс 100 мА × 1 мс на шине 3,3 В',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 6], yRange: [2.0, 3.5], yTicks: [2.2, 2.6, 3.0, 3.3],
    series: [
      { fn: droop(100), label: '100 мкФ: просадка 1,0 В', color: C.bad, width: 2.5 },
      { fn: droop(470), label: '470 мкФ: 0,21 В', color: C.accent, width: 2.5 },
      { fn: droop(1000), label: '1000 мкФ: 0,10 В', color: C.ok, width: 2.5 },
    ],
    legendAt: { x: 220, y: 100, cols: 1 },
    vlines: [{ v: 1, label: 'импульс', color: C.muted }],
  });
  g.save(out('bulk-caps', 'droop'));

  // 2. Пульсации после выпрямителя 100 Гц, ток 0,1 А
  const ripple = cap => t => {
    const T = 10, dv = 0.1 * 0.01 / (cap * 1e-6);
    const x = t % T;
    return 12 - dv * (x / T);
  };
  const r = chart({
    title: 'Пульсации при токе 0,1 А (100 Гц)',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 40], yRange: [9, 12.6], yTicks: [9, 10, 11, 12],
    series: [
      { fn: ripple(470), label: '470 мкФ: ΔU = 2,1 В', color: C.bad, width: 2.2 },
      { fn: ripple(1000), label: '1000 мкФ: ΔU = 1,0 В', color: C.accent, width: 2.2 },
      { fn: ripple(2200), label: '2200 мкФ: ΔU = 0,45 В', color: C.ok, width: 2.2 },
    ],
    legendAt: { x: 190, y: 250, cols: 1 },
    samples: 800,
  });
  r.save(out('bulk-caps', 'ripple'));

  // 3. Где стоят bulk и развязка
  const h = new Fig(480, 220, 'Расположение накопительного конденсатора и развязки');
  h.text(240, 24, 'Конденсаторы по цепочке питания', { anchor: 'middle', size: 16, weight: 700 });
  const blocks = [['разъём\nпитания', C.muted], ['bulk\n100–470 мкФ', C.accent], ['стабилиз.\n3,3 В', C.ink], ['100 нФ\nу каждой\nмикросхемы', C.ok]];
  blocks.forEach(([t, col], i) => {
    const x = 10 + i * 118;
    h.rect(x, 60, 100, 72, { stroke: col, r: 8, width: 2.5 });
    h.text(x + 50, 90, t, { anchor: 'middle', size: 12.5, weight: 700, fill: col });
    if (i < 3) h.arrow(x + 100, 96, x + 118, 96, { width: 2.5, head: 8 });
  });
  h.text(240, 172, 'Bulk закрывает миллисекундные пики и пульсации,', { anchor: 'middle', size: 13, fill: C.muted });
  h.text(240, 192, '100 нФ — наносекундные броски у каждой микросхемы', { anchor: 'middle', size: 13, fill: C.muted });
  h.save(out('bulk-caps', 'placement'));
}
