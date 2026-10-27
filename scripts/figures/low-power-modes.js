import { barsFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('low-power-modes');

  barsFig({
    title: 'Типичный ток ESP32 в разных режимах (порядок величин)',
    items: [
      { label: 'передача Wi-Fi', value: 240, text: '160–240 мА', tone: 'bad' },
      { label: 'активный, без радио', value: 40, text: '30–50 мА', tone: 'warn' },
      { label: 'light sleep', value: 0.8, text: '≈ 0,8 мА', tone: 'ok' },
      { label: 'deep sleep (чип)', value: 0.01, text: '≈ 10 мкА', tone: 'ok' },
    ],
    max: 240, w: 760, labelW: 190,
  }).save(out('low-power-modes', 'modes'));

  const avg = T => (80 * 1 + 0.01 * (T - 1)) / T; // мА: 80 мА 1 с, 10 мкА остальное
  chart({
    title: 'Средний ток при 80 мА в течение 1 с',
    xLabel: 'Период пробуждения T, с', yLabel: 'Средний ток, мА',
    xRange: [10, 600], yRange: [0, 8], log: true,
    series: [{ fn: avg, label: 'Iср = (80·1 + 0,01·(T − 1)) / T', color: C.accent, width: 3 }],
    markers: [{ x: 60, y: avg(60), label: '60 с: 1,34 мА', dx: 12, dy: -14, anchor: 'start' }],
    xTicks: [10, 60, 600], yTicks: [0, 2, 4, 6, 8],
    legendAt: { x: 150, y: 100, cols: 1 },
    samples: 200,
  }).save(out('low-power-modes', 'average'));
}
