import { chart, C, out, fresh } from '../lib/fig.js';

const lg = Math.log10;
const pow = v => String(Number((10 ** v).toPrecision(2))).replace('.', ',');

export function generate() {
  fresh('capacitor-ratings-esr');

  // 1. Срок службы электролита: правило «−10 °C → ×2»
  const life = t => 2000 * Math.pow(2, (105 - t) / 10);
  const g = chart({
    title: 'Срок службы электролита 2000 ч при 105 °C',
    xLabel: 'Температура корпуса, °C', yLabel: 'Срок службы, ч (лог.)',
    xRange: [45, 105], yRange: [3, 5], yTicks: [3, 3.5, 4, 4.5, 5], yFormat: pow,
    series: [{ fn: t => lg(life(t)), color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 105, y: lg(2000), label: '105 °C: 2000 ч', dx: -10, dy: -12, anchor: 'end', color: C.bad },
      { x: 85, y: lg(8000), label: '85 °C: 8000 ч', dx: 10, dy: -12 },
      { x: 65, y: lg(32000), label: '65 °C: 32 000 ч', dx: 10, dy: -12, color: C.ok },
    ],
    notes: [{ x: 47, y: 3.2, text: 'каждые −10 °C — срок ×2', color: C.muted }],
  });
  g.save(out('capacitor-ratings-esr', 'life'));

  // 2. ESR электролита от температуры (иллюстративно)
  const esr = t => 0.12 * Math.exp(-(t - 25) / 45);
  const e = chart({
    title: 'ESR электролита растёт на морозе',
    xLabel: 'Температура, °C', yLabel: 'ESR, Ом',
    xRange: [-40, 105], yRange: [0, 0.35], yTicks: [0, 0.1, 0.2, 0.3],
    series: [{ fn: esr, color: C.bad, width: 3 }],
    legend: false,
    markers: [
      { x: 25, y: esr(25), label: '+25 °C: 0,12 Ом', dx: 10, dy: -12 },
      { x: -20, y: esr(-20), label: '−20 °C: 0,33 Ом', dx: 10, dy: 6, color: C.bad },
    ],
  });
  e.save(out('capacitor-ratings-esr', 'esr-temp'));
}
