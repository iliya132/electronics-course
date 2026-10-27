import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('inductor-basics');

  // 1. Ток нарастает по линейному закону — напряжение на катушке постоянно
  const f = new Fig(480, 380, 'Ток и напряжение на катушке 10 мГн при линейном росте тока');
  const L = 70, R = 462, tMax = 3;
  const X = t => L + t / tMax * (R - L);
  const panel = (top, h, vMax, fn, color, ticks, title, unit) => {
    const Y = v => top + h - v / vMax * h;
    f.text(L, top - 10, title, { size: 14, weight: 700, fill: color });
    f.text(L - 8, top - 10, unit, { anchor: 'end', size: 12, fill: C.muted });
    f.line(L, top, L, top + h, { width: 1.5 });
    f.line(L, top + h, R, top + h, { width: 1.5 });
    ticks.forEach(v => {
      f.line(L, Y(v), R, Y(v), { stroke: C.grid, width: 1 });
      f.text(L - 8, Y(v) + 5, String(v).replace('.', ','), { anchor: 'end', size: 12, fill: C.muted });
    });
    const pts = [];
    for (let t = 0; t <= tMax + 1e-9; t += 0.01) pts.push([X(t), Y(fn(t))]);
    f.poly(pts, { stroke: color, width: 3 });
  };
  panel(42, 120, 120, t => (t <= 1 ? 100 * t : 100), C.accent, [0, 50, 100], 'Ток через катушку', 'мА');
  panel(228, 100, 1.4, t => (t > 0 && t <= 1 ? 1 : 0), C.warn, [0, 1], 'Напряжение на катушке U = L·ΔI/Δt', 'В');
  [0, 1, 2, 3].forEach(t => f.text(X(t), 346, String(t), { anchor: 'middle', size: 12, fill: C.muted }));
  f.text(L + (R - L) / 2, 368, 'Время, мс', { anchor: 'middle', size: 13 });
  f.line(X(1), 42, X(1), 328, { stroke: C.muted, width: 1.5, dash: '6 5' });
  f.text(X(0.5), 190, 'ток растёт', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(X(2), 190, 'ток постоянен: U = 0', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('inductor-basics', 'ramp'));

  // 2. Энергия E = L·I²/2
  const g = chart({
    title: 'Энергия катушки',
    xLabel: 'Ток I, А', yLabel: 'Энергия E, мДж',
    xRange: [0, 2], yRange: [0, 220],
    series: [
      { fn: i => 0.5 * 0.1 * i * i * 1000, label: 'L = 100 мГн', color: C.bad },
      { fn: i => 0.5 * 0.01 * i * i * 1000, label: 'L = 10 мГн', color: C.accent },
    ],
    markers: [
      { x: 1, y: 50, label: '100 мГн, 1 А: 50 мДж', dx: -10, dy: -10, anchor: 'end', color: C.bad },
      { x: 1, y: 5, label: '10 мГн, 1 А: 5 мДж', dx: 10, dy: -14, color: C.accent },
    ],
  });
  g.save(out('inductor-basics', 'energy'));
}
