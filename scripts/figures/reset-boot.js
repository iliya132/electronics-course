import { diagram } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('reset-boot');

  diagram({
    title: 'Цепи сброса: подтяжка, кнопка и автосброс от USB-UART',
    w: 760, h: 380,
    boxes: [
      { id: 'vcc', x: 30, y: 30, w: 90, h: 36, text: '+5 В', tone: 'warn', size: 12 },
      { id: 'r', x: 30, y: 110, w: 110, h: 46, text: 'R 10 кОм\nподтяжка', tone: 'ok', size: 12 },
      { id: 'btn', x: 30, y: 220, w: 110, h: 46, text: 'кнопка\nRESET → GND', tone: 'muted', size: 12 },
      { id: 'mcu', x: 300, y: 120, w: 160, h: 90, text: 'МК\nвывод RESET\n(активный низкий)', tone: 'accent' },
      { id: 'c', x: 520, y: 110, w: 100, h: 46, text: 'C 100 нФ', tone: 'warn', size: 13 },
      { id: 'dtr', x: 640, y: 110, w: 100, h: 46, text: 'DTR\nUSB-UART', tone: 'muted', size: 12 },
    ],
    arrows: [['vcc', 'r'], ['r', 'mcu'], ['btn', 'mcu'], ['dtr', 'c'], ['c', 'mcu']],
    notes: [
      { x: 300, y: 260, text: 'RESET = 0 → МК стоит; RESET = 1 → программа работает', size: 13, tone: 'accent', weight: 700 },
      { x: 300, y: 300, text: 'автосброс: DTR падает → импульс через 100 нФ\nRESET на ≈ 1 мс → запуск загрузчика', size: 12 },
    ],
  }).save(out('reset-boot', 'circuits'));

  const tau = 10e3 * 100e-9 * 1000; // мс
  chart({
    title: 'Подъём RESET через 10 кОм и 100 нФ',
    xLabel: 'Время, мс', yLabel: 'Напряжение на RESET, В',
    xRange: [0, 5], yRange: [0, 5.5],
    series: [{ fn: t => 5 * (1 - Math.exp(-t / tau)), label: 'τ = 1 мс', color: C.accent, width: 3 }],
    hlines: [{ v: 3.5, label: 'порог «1» ≈ 0,7·Vcc = 3,5 В', color: C.warn }],
    markers: [{ x: tau * -Math.log(1 - 3.5 / 5), y: 3.5, label: '1,2 мс', dx: 10, dy: 22, anchor: 'start' }],
    xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 1, 2, 3, 4, 5],
    legendAt: { x: 300, y: 250, cols: 1 },
  }).save(out('reset-boot', 'rc-reset'));
}
