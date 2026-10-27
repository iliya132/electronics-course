import { barsFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('power-arduino');

  barsFig({
    title: 'Типичное потребление плат Arduino без нагрузки (порядок величин)',
    items: [
      { label: 'Uno (USB, регулятор, светодиоды)', value: 45, text: '≈ 45 мА', tone: 'bad' },
      { label: 'Nano (CH340)', value: 20, text: '≈ 20 мА', tone: 'warn' },
      { label: 'Pro Mini 5 В, без LED', value: 5, text: '≈ 5 мА', tone: 'ok' },
      { label: 'ATmega328P (чип, 16 МГц)', value: 10, text: '≈ 10 мА', tone: 'ok' },
    ],
    max: 50, w: 800, labelW: 270,
  }).save(out('power-arduino', 'current'));

  chart({
    title: 'Нагрев регулятора при токе 0,2 А',
    xLabel: 'Напряжение на разъёме питания, В', yLabel: 'Мощность потерь, Вт',
    xRange: [6, 20], yRange: [0, 3.2],
    series: [{ fn: v => (v - 5) * 0.2, label: 'P = (Uвх − 5 В)·0,2 А', color: C.accent, width: 3 }],
    hlines: [{ v: 1, label: 'предел без радиатора ≈ 1 Вт', color: C.bad }],
    markers: [{ x: 9, y: 0.8, label: '9 В: 0,8 Вт', dx: 10, dy: 22, anchor: 'start' }, { x: 12, y: 1.4, label: '12 В: 1,4 Вт', dx: 10, dy: 40, anchor: 'start', color: C.warn }],
    xTicks: [6, 9, 12, 15, 20], yTicks: [0, 1, 2, 3],
    legendAt: { x: 90, y: 90, cols: 1 },
    samples: 100,
  }).save(out('power-arduino', 'regulator'));
}
