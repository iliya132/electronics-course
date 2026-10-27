import { tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('adc-dac-mcu');

  tableFig({
    title: 'АЦП и ЦАП в популярных МК',
    cols: ['', 'Arduino Uno', 'ESP32', 'STM32F103'],
    rows: [
      ['Разрядность АЦП', '10 бит', '12 бит', '12 бит'],
      ['Опора по умолчанию', '5 В (VCC)', '≈ 1,1 В с ослаблением до 3,3 В', '3,3 В'],
      ['Шаг LSB', '4,88 мВ', '≈ 0,8 мВ (шкала 0–3,3)', '0,81 мВ'],
      ['Источник сигнала', 'до 10 кОм', 'до ≈ 10 кОм, нужен буфер', 'до 50 кОм'],
      ['ЦАП', 'нет (ШИМ + RC)', '2 канала, 8 бит', 'нет в F103'],
    ],
    widths: [1.3, 1.1, 1.8, 1.2], w: 780,
  }).save(out('adc-dac-mcu', 'compare'));

  // Иллюстративная нелинейность АЦП ESP32: сжатие вблизи краёв
  const real = v => {
    if (v < 0.15) return 0;
    if (v > 2.5) return 2.5 + (v - 2.5) * 0.55;
    return v - 0.04 * Math.sin((v - 0.12) / 2.93 * Math.PI) * 1.2 * 0 + (v - 1.6) * 0.02;
  };
  chart({
    title: 'АЦП ESP32: типичная нелинейность (иллюстрация)',
    xLabel: 'Входное напряжение, В', yLabel: 'Измеренное напряжение, В',
    xRange: [0, 3.3], yRange: [0, 3.4],
    series: [
      { fn: v => v, label: 'идеал', color: C.muted, width: 2, dash: '6 4' },
      { fn: real, label: 'типичный ход ESP32', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 90, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], yTicks: [0, 1, 2, 3],
    samples: 200,
  }).save(out('adc-dac-mcu', 'esp32-nonlinear'));
}
