import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const rNtc = tc => 10 * Math.exp(3950 * (1 / (tc + 273.15) - 1 / 298.15));
const uOut = tc => 3 * 10 / (rNtc(tc) + 10);

export function generate() {
  fresh('ntc-thermometer');

  // 1. Схема делителя с NTC
  const f = new Fig(480, 320, 'Делитель с NTC и резистором 10 кОм, вольтметр на нижнем резисторе');
  sch.battery(f, 60, 160, { rot: 90, name: '3 В', off: -28 });
  sch.wire(f, [[60, 120], [60, 50], [200, 50], [200, 70]]);
  sch.resistor(f, 200, 110, { rot: 90, name: 'NTC 10 кОм', off: 30 });
  sch.wire(f, [[200, 150], [200, 190]]);
  sch.node(f, 200, 170);
  sch.resistor(f, 200, 230, { rot: 90, name: 'R 10 кОм', off: 30 });
  sch.wire(f, [[200, 270], [200, 296], [60, 296], [60, 200]]);
  sch.node(f, 200, 296);
  sch.wire(f, [[200, 170], [330, 170], [330, 200]], { color: C.accent });
  sch.meter(f, 330, 220, { rot: 90, sym: 'V', color: C.accent, len: 40 });
  sch.wire(f, [[330, 240], [330, 296], [200, 296]]);
  sch.node(f, 330, 296);
  f.text(232, 40, 'Uвых = Uвх · R / (R_NTC + R)', { size: 13, weight: 700, fill: C.accent });
  f.text(364, 214, 'Uвых', { size: 14, weight: 700, fill: C.accent });
  f.save(out('ntc-thermometer', 'circuit'));

  // 2. Ожидаемая зависимость Uвых(T)
  const g = chart({
    title: 'Ожидаемое напряжение Uвых при температуре',
    xLabel: 'Температура, °C', yLabel: 'Uвых на резисторе 10 кОм, В',
    xRange: [0, 60], yRange: [0, 2.6],
    series: [{ fn: uOut, color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 10, y: uOut(10), label: '10 °C: 0,99 В', dx: 10, dy: 22 },
      { x: 25, y: uOut(25), label: '25 °C: 1,50 В', dx: 10, dy: 22 },
      { x: 40, y: uOut(40), label: '40 °C: 1,96 В', dx: 10, dy: 22 },
      { x: 50, y: uOut(50), label: '50 °C: 2,21 В', dx: -10, dy: -12, anchor: 'end' },
    ],
  });
  g.save(out('ntc-thermometer', 'u-vs-t'));
}
