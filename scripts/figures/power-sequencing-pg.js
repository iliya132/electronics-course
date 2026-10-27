import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('power-sequencing-pg');

  // 1. Временная диаграмма запуска (схематично)
  const f = new Fig(480, 330, 'Запуск питания: EN, мягкий старт, PG');
  const x0 = 100, w = 360;
  const tr = [
    ['Uвх', C.warn, 36, t => Math.min(1, t / 0.12)],
    ['EN', C.accent, 100, t => (t > 0.25 ? 1 : 0)],
    ['Uвых', C.ok, 164, t => (t < 0.25 ? 0 : Math.min(1, (t - 0.25) / 0.3))],
    ['PG', C.bad, 228, t => (t > 0.56 ? 1 : 0)],
  ];
  tr.forEach(([name, col, top, fn]) => {
    const h = 44;
    f.text(x0 - 12, top + h / 2 + 5, name, { anchor: 'end', size: 14, weight: 700, fill: col });
    f.line(x0, top + h, x0 + w, top + h, { stroke: C.grid, width: 1 });
    const pts = [];
    for (let k = 0; k <= 360; k++) { const t = k / 360; pts.push([x0 + t * w, top + h - fn(t) * h]); }
    f.poly(pts, { stroke: col, width: 2.8 });
  });
  f.line(x0 + 0.25 * w, 30, x0 + 0.25 * w, 276, { stroke: C.muted, width: 1.2, dash: '5 4' });
  f.line(x0 + 0.56 * w, 30, x0 + 0.56 * w, 276, { stroke: C.muted, width: 1.2, dash: '5 4' });
  f.text(x0 + 0.25 * w, 20, 'EN вверх', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(x0 + 0.56 * w, 20, 'выход в норме: PG вверх', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(x0 + 0.4 * w, 158, 'мягкий старт', { anchor: 'middle', size: 11, fill: C.ok, weight: 700 });
  f.text(240, 322, 'По сигналу PG запускают следующую ступень или снимают сброс МК', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('power-sequencing-pg', 'timing'));

  // 2. Пусковой ток при зарядке выходной ёмкости: I = C·U/tss
  const g = chart({
    title: 'Пусковой ток при зарядке выхода до 5 В',
    xLabel: 'Время мягкого старта, мс', yLabel: 'Пусковой ток, А',
    xRange: [0.5, 10], yRange: [0, 2.2],
    series: [
      { fn: t => 47e-6 * 5 / (t * 1e-3), label: 'C = 47 мкФ', color: C.ok, width: 3 },
      { fn: t => 100e-6 * 5 / (t * 1e-3), label: 'C = 100 мкФ', color: C.accent, width: 3 },
      { fn: t => 220e-6 * 5 / (t * 1e-3), label: 'C = 220 мкФ', color: C.bad, width: 3 },
    ],
    legendAt: { x: 250, y: 92, cols: 1 },
    markers: [{ x: 1, y: 0.5, label: '100 мкФ, 1 мс: 0,5 А', dx: 14, dy: 20, anchor: 'start', color: C.accent }],
  });
  g.save(out('power-sequencing-pg', 'inrush'));
}
