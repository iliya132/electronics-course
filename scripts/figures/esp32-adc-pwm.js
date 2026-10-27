import { tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('esp32-adc-pwm');

  tableFig({
    title: 'АЦП ESP32: ослабление и рабочий диапазон (по документации ESP-IDF)',
    cols: ['Ослабление', 'Рабочий диапазон', 'Шаг (12 бит)'],
    rows: [
      ['0 дБ', '≈ 0,10…0,95 В', '≈ 0,23 мВ'],
      ['2,5 дБ', '≈ 0,10…1,25 В', '≈ 0,31 мВ'],
      ['6 дБ', '≈ 0,15…1,75 В', '≈ 0,43 мВ'],
      ['11 дБ', '≈ 0,15…2,45 В', '≈ 0,60 мВ'],
    ],
    widths: [1.2, 1.8, 1.6], w: 780,
  }).save(out('esp32-adc-pwm', 'attenuation'));

  // LEDC: максимальная частота от разрядности (f·2^res ≤ 80 МГц)
  const fmax = r => 80e6 / 2 ** r / 1000;
  chart({
    title: 'LEDC: предельная частота ШИМ от разрядности',
    xLabel: 'Разрядность, бит', yLabel: 'Максимальная частота, кГц (лог.)',
    xRange: [6, 16], yRange: [1, 2000], log: true,
    series: [{ points: [6, 8, 10, 12, 14, 16].map(r => [r, fmax(r)]), label: 'f_max = 80 МГц / 2^разрядность', color: C.accent, width: 3 }],
    markers: [{ x: 8, y: fmax(8), label: '8 бит: 312 кГц', dx: 10, dy: -10, anchor: 'start' }, { x: 16, y: fmax(16), label: '16 бит: 1,2 кГц', dx: -10, dy: -10, anchor: 'end' }],
    xTicks: [6, 8, 10, 12, 14, 16], yTicks: [10, 100, 1000],
    legend: false,
  }).save(out('esp32-adc-pwm', 'ledc'));
}
