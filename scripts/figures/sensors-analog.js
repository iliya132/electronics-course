import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('sensors-analog');

  const T = code => {
    const rn = 10000 * code / (1024 - code);
    return 1 / (1 / 298.15 + Math.log(rn / 10000) / 3950) - 273.15;
  };
  chart({
    title: 'NTC 10 кОм (B = 3950): температура по коду АЦП',
    xLabel: 'analogRead, код', yLabel: 'Температура, °C',
    xRange: [150, 900], yRange: [-10, 90],
    series: [{ fn: T, label: 'NTC снизу, 10 кОм сверху, 5 В', color: C.accent, width: 3 }],
    markers: [{ x: 512, y: T(512), label: 'код 512 → 25 °C', dx: 12, dy: 26, anchor: 'start' }, { x: 600, y: T(600), label: 'код 600 → 17,4 °C', dx: 12, dy: 26, anchor: 'start', color: C.ok }],
    xTicks: [150, 300, 450, 600, 750, 900], yTicks: [0, 20, 40, 60, 80],
    legendAt: { x: 90, y: 90, cols: 1 },
    samples: 300,
  }).save(out('sensors-analog', 'ntc-code'));

  // иллюстрация шума и усреднения
  const noise = i => 0.5 * Math.sin(i * 1.7) + 0.4 * Math.sin(i * 4.3 + 1) + 0.3 * Math.sin(i * 7.1 + 2);
  const raw = Array.from({ length: 80 }, (_, i) => [i, 25 + noise(i)]);
  const avg = raw.map(([i], k) => { const w = raw.slice(Math.max(0, k - 7), k + 1); return [i, w.reduce((s, p) => s + p[1], 0) / w.length]; });
  chart({
    title: 'Шум датчика и скользящее среднее (иллюстрация)',
    xLabel: 'Номер измерения', yLabel: 'Температура, °C',
    xRange: [0, 79], yRange: [23, 27],
    series: [
      { points: raw, label: 'сырые отсчёты', color: C.muted, width: 2 },
      { points: avg, label: 'среднее по 8', color: C.ok, width: 3 },
    ],
    xTicks: [0, 20, 40, 60, 79], yTicks: [23, 24, 25, 26, 27],
    legendAt: { x: 300, y: 250, cols: 1 },
  }).save(out('sensors-analog', 'filter'));
}
