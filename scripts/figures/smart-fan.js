import { diagram } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('smart-fan');

  diagram({
    title: 'Умный вентилятор: датчик → Arduino → ШИМ → MOSFET → вентилятор',
    w: 820, h: 320,
    boxes: [
      { id: 'ntc', x: 20, y: 110, w: 140, h: 70, text: 'NTC 10 кОм\nделитель → A0', tone: 'warn', size: 12 },
      { id: 'uno', x: 210, y: 90, w: 170, h: 110, text: 'Arduino\nмасштаб T → ШИМ\nпорог и гистерезис', tone: 'accent', size: 12 },
      { id: 'mos', x: 430, y: 110, w: 150, h: 70, text: 'IRLZ44N\n+ Rз 100 Ом,\nRпд 10 кОм', tone: 'ok', size: 12 },
      { id: 'fan', x: 630, y: 110, w: 170, h: 70, text: 'вентилятор 12 В\n+ диод 1N4007', tone: 'muted', size: 12 },
    ],
    arrows: [['ntc', 'uno'], ['uno', 'mos', 'ШИМ D9'], ['mos', 'fan']],
    notes: [{ x: 20, y: 250, text: 'блок питания 12 В отдельный; земли Arduino и блока соединены', size: 13, tone: 'accent', weight: 700 }],
  }).save(out('smart-fan', 'block'));

  // зависимость скважности от температуры: 25 °C -> 30 %, 40 °C -> 100 %
  const duty = t => t <= 25 ? 30 : (t >= 40 ? 100 : 30 + (t - 25) * (70 / 15));
  chart({
    title: 'Скважность вентилятора от температуры',
    xLabel: 'Температура, °C', yLabel: 'Скважность, %',
    xRange: [20, 45], yRange: [0, 110],
    series: [{ fn: duty, label: '30 % до 25 °C, линейный рост до 100 % при 40 °C', color: C.accent, width: 3 }],
    markers: [{ x: 25, y: 30, label: '25 °C: 30 %', dx: 10, dy: 24, anchor: 'start' }, { x: 40, y: 100, label: '40 °C: 100 %', dx: -8, dy: 26, anchor: 'end' }],
    xTicks: [20, 25, 30, 35, 40, 45], yTicks: [0, 30, 60, 100],
    legend: false,
    samples: 100,
  }).save(out('smart-fan', 'curve'));
}
