import { barsFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('sleepy-sensor');

  barsFig({
    title: 'Ток в deep sleep: чип и разные платы (порядок величин)',
    items: [
      { label: 'DevKit (LDO + LED + USB-UART)', value: 10, text: '5–15 мА', tone: 'bad' },
      { label: 'DevKit без светодиода', value: 6, text: '≈ 6 мА', tone: 'warn' },
      { label: 'модуль + LDO HT7333', value: 0.03, text: '≈ 30 мкА', tone: 'ok' },
      { label: 'чип в deep sleep', value: 0.01, text: '≈ 10 мкА', tone: 'ok' },
    ],
    max: 12, w: 780, labelW: 250,
  }).save(out('sleepy-sensor', 'sleep-current'));

  const days = (sleepMa, activeS = 3) => 2600 / (((80 * activeS) + sleepMa * (600 - activeS)) / 600) / 24;
  chart({
    title: 'Срок работы от 18650 при токе сна платы',
    xLabel: 'Ток сна платы, мА (логарифмическая шкала)', yLabel: 'Срок работы, суток',
    xRange: [0.01, 10], yRange: [0, 300], log: true,
    series: [{ fn: s => days(s), label: 'цикл 10 мин, активность 3 с при 80 мА', color: C.accent, width: 3 }],
    markers: [{ x: 0.01, y: days(0.01), label: 'чип: 264 суток', dx: 12, dy: 20, anchor: 'start', color: C.ok }, { x: 6, y: days(6), label: 'DevKit 6 мА: 17 суток', dx: -10, dy: -14, anchor: 'end', color: C.bad }],
    xTicks: [0.01, 0.1, 1, 10], yTicks: [0, 100, 200, 300],
    legendAt: { x: 130, y: 90, cols: 1 },
    samples: 150,
  }).save(out('sleepy-sensor', 'lifetime'));
}
