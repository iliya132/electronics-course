import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ac-basics');

  // 1. Синусоида с подписями
  const f = new Fig(480, 320, 'Синусоида: амплитуда, размах и период');
  const L = 50, R = 450, mid = 160, A = 90, T = 200;
  const X = t => L + t;
  f.line(L, 40, L, 290, { width: 1.5 });
  f.line(L, mid, R, mid, { width: 1.5 });
  f.poly(Array.from({ length: 401 }, (_, i) => [X(i), mid - A * Math.sin(2 * Math.PI * i / T)]), { stroke: C.accent, width: 3.5 });
  f.line(L, mid - A, R, mid - A, { stroke: C.grid, width: 1, dash: '5 5' });
  f.line(L, mid + A, R, mid + A, { stroke: C.grid, width: 1, dash: '5 5' });
  f.arrow(X(50) + 24, mid, X(50) + 24, mid - A + 3, { stroke: C.ok, width: 2.5, head: 8 });
  f.text(X(50) + 32, mid - 38, 'амплитуда Um', { size: 14, fill: C.ok, weight: 700 });
  f.line(X(255), mid - A, X(255), mid + A, { stroke: C.bad, width: 2.5 });
  f.arrow(X(262), mid - A + 2, X(262), mid + A - 2, { stroke: C.bad, width: 2 });
  f.text(X(268), mid + 8, 'размах Uпп = 2·Um', { size: 13, fill: C.bad, weight: 700 });
  f.arrow(X(0), mid + A + 22, X(T), mid + A + 22, { stroke: C.warn, width: 2.5 });
  f.text(X(T / 2), mid + A + 44, 'период T', { anchor: 'middle', size: 14, fill: C.warn, weight: 700 });
  f.text(L + 8, 54, 'U, В', { size: 12, fill: C.muted });
  f.text(R - 4, mid - 8, 't', { anchor: 'end', size: 13, fill: C.muted });
  f.text(240, 24, 'u(t) = Um · sin(2π·f·t),   f = 1 / T', { anchor: 'middle', size: 15, weight: 700 });
  f.save(out('ac-basics', 'sine'));

  // 2. Две частоты на одной оси времени
  const g = chart({
    title: 'Чем выше частота, тем короче период',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 40], yRange: [-2, 2], yTicks: [-1, 0, 1], samples: 600,
    series: [
      { fn: t => Math.sin(2 * Math.PI * 50 * t / 1000), label: '50 Гц: T = 20 мс', color: C.accent, width: 2.5 },
      { fn: t => Math.sin(2 * Math.PI * 200 * t / 1000), label: '200 Гц: T = 5 мс', color: C.bad, width: 1.8 },
    ],
    legendAt: { x: 90, y: 86, cols: 2, dx: 150 },
  });
  g.save(out('ac-basics', 'frequencies'));

  // 3. Фазовый сдвиг 90°
  const h = chart({
    title: 'Фазовый сдвиг на 90°',
    xLabel: 'Время, мс (f = 1 кГц, T = 1 мс)', yLabel: 'Напряжение, В',
    xRange: [0, 2], yRange: [-2, 2], yTicks: [-1, 0, 1], samples: 400,
    series: [
      { fn: t => Math.sin(2 * Math.PI * t), label: 'сигнал 1', color: C.accent, width: 2.8 },
      { fn: t => Math.sin(2 * Math.PI * t + Math.PI / 2), label: 'сигнал 2 опережает на 90°', color: C.bad, width: 2.8 },
    ],
    legendAt: { x: 90, y: 86, cols: 1 },
    markers: [{ x: 0.25, y: 0, label: 'сдвиг T/4 = 250 мкс', dx: 6, dy: -12 }],
  });
  h.save(out('ac-basics', 'phase'));
}
