import { diagram } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('current-logger-ina');

  diagram({
    title: 'Измеритель на INA219: шунт в плюсовом проводе, связь по I²C',
    w: 820, h: 320,
    boxes: [
      { id: 'src', x: 20, y: 110, w: 140, h: 70, text: 'источник\n5 В', tone: 'warn', size: 13 },
      { id: 'ina', x: 230, y: 90, w: 190, h: 110, text: 'INA219\nшунт 0,1 Ом на плате\nVIN+ → VIN−', tone: 'accent', size: 12 },
      { id: 'load', x: 490, y: 110, w: 130, h: 70, text: 'нагрузка', tone: 'ok', size: 13 },
      { id: 'uno', x: 330, y: 230, w: 170, h: 70, text: 'Arduino Uno\nA4 (SDA), A5 (SCL)', tone: 'accent', size: 12 },
      { id: 'pc', x: 600, y: 230, w: 190, h: 70, text: 'Serial → компьютер\nUвх, I, P, энергия', tone: 'muted', size: 12 },
    ],
    arrows: [['src', 'ina'], ['ina', 'load'], ['ina', 'uno', 'I²C 0x40', { both: true }], ['uno', 'pc']],
  }).save(out('current-logger-ina', 'wiring'));

  chart({
    title: 'Накопленная энергия при нагрузке 1 Вт',
    xLabel: 'Время, ч', yLabel: 'Энергия, Вт·ч',
    xRange: [0, 8], yRange: [0, 8.5],
    series: [{ fn: t => 1.0 * t, label: 'P = 5 В · 0,2 А = 1 Вт', color: C.accent, width: 3 }],
    hlines: [{ v: 7.4, label: 'аккумулятор 2000 мА·ч × 3,7 В = 7,4 Вт·ч', color: C.warn }],
    legendAt: { x: 90, y: 100, cols: 1 },
    xTicks: [0, 2, 4, 6, 8], yTicks: [0, 2, 4, 6, 8],
    samples: 40,
  }).save(out('current-logger-ina', 'energy'));
}
