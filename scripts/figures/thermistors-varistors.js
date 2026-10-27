import { chart, C, out, fresh } from '../lib/fig.js';

const ntc = (tc, beta = 3950, r25 = 10) => r25 * Math.exp(beta * (1 / (tc + 273.15) - 1 / 298.15));

export function generate() {
  fresh('thermistors-varistors');

  // 1. R(T) NTC 10 кОм, beta = 3950
  const g = chart({
    title: 'NTC 10 кОм, β = 3950 K',
    xLabel: 'Температура, °C', yLabel: 'Сопротивление, кОм',
    xRange: [0, 100], yRange: [0, 36],
    series: [{ fn: ntc, color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 0, y: ntc(0), label: '0 °C: 33,6 кОм', dx: 10, dy: 8 },
      { x: 25, y: 10, label: '25 °C: 10 кОм', dx: 10, dy: -10 },
      { x: 50, y: ntc(50), label: '50 °C: 3,6 кОм', dx: 10, dy: -12 },
      { x: 100, y: ntc(100), label: '100 °C: 0,7 кОм', dx: -10, dy: -12, anchor: 'end' },
    ],
  });
  g.save(out('thermistors-varistors', 'ntc-curve'));

  // 2. ВАХ варистора (модель): I = 1 мА · (U / 18 В)^25
  const v = chart({
    title: 'Варистор 18 В: ток почти нулевой, затем лавина',
    xLabel: 'Напряжение на варисторе, В', yLabel: 'Ток, А',
    xRange: [0, 28], yRange: [0, 2],
    series: [
      { fn: u => 0.001 * Math.pow(u / 18, 25), label: 'варистор (модель)', color: C.bad, width: 3 },
      { fn: u => u / 200, label: 'резистор 200 Ом', color: C.muted, dash: '7 5' },
    ],
    markers: [
      { x: 18, y: 0.001, label: '18 В: 1 мА', dx: -8, dy: -12, anchor: 'end' },
      { x: 24, y: 0.001 * Math.pow(24 / 18, 25), label: '24 В: 1,3 А', dx: -8, dy: -10, anchor: 'end', color: C.bad },
    ],
  });
  v.save(out('thermistors-varistors', 'varistor-iv'));
}
