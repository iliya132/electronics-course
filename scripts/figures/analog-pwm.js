import { tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('analog-pwm');

  chart({
    title: 'map(x, 0, 1023, 0, 255): код АЦП в значение ШИМ',
    xLabel: 'analogRead, 0…1023', yLabel: 'результат map, 0…255',
    xRange: [0, 1023], yRange: [0, 270],
    series: [{ fn: x => Math.floor(x * 255 / 1023), label: 'целочисленное деление: ступени', color: C.accent, width: 3 }],
    markers: [{ x: 512, y: Math.floor(512 * 255 / 1023), label: '512 → 127', dx: 14, dy: 24, anchor: 'start' }],
    xTicks: [0, 256, 512, 768, 1023], yTicks: [0, 64, 128, 191, 255],
    legendAt: { x: 90, y: 100, cols: 1 },
    samples: 600,
  }).save(out('analog-pwm', 'map'));

  tableFig({
    title: 'analogWrite(значение): скважность и среднее напряжение (5 В)',
    cols: ['analogWrite', 'Скважность', 'Среднее напряжение', 'Яркость светодиода'],
    rows: [
      ['0', '0 %', '0 В', 'выключен'],
      ['64', '25 %', '1,25 В', 'слабая'],
      ['128', '50 %', '2,5 В', 'средняя'],
      ['191', '75 %', '3,75 В', 'яркая'],
      ['255', '100 %', '5 В', 'максимум'],
    ],
    widths: [1.1, 1, 1.5, 1.6], w: 780,
  }).save(out('analog-pwm', 'pwm-table'));
}
