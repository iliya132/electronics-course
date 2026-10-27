import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('rl-circuit');

  // 1. Схема RL
  const f = new Fig(480, 280, 'RL-цепь: источник, резистор и катушка');
  const T = 70, B = 220;
  sch.battery(f, 70, 145, { rot: 90, name: 'E', off: -26 });
  sch.wire(f, [[70, 105], [70, T], [110, T]]);
  sch.switch(f, 150, T, { name: 'ключ', len: 80 });
  sch.wire(f, [[190, T], [220, T]]);
  sch.resistor(f, 260, T, { name: 'R', off: 28 });
  sch.wire(f, [[300, T], [380, T], [380, 105]]);
  sch.inductor(f, 380, 145, { rot: 90, name: 'L', off: 28 });
  sch.wire(f, [[380, 185], [380, B], [70, B], [70, 185]]);
  sch.current(f, 340, T, 'right', 'i', { color: C.accent, off: -14, len: 34 });
  f.text(240, 258, 'i(t) = (E / R) · (1 − e^(−t/τ)),   τ = L / R', { anchor: 'middle', size: 15, weight: 700, fill: C.accent });
  f.save(out('rl-circuit', 'circuit'));

  // 2. Включение и выключение (через диод) в единицах τ
  const g = chart({
    title: 'Ток катушки в долях τ = L/R',
    xLabel: 'Время t в долях τ', yLabel: 'Ток, % от E/R',
    xRange: [0, 5], yRange: [0, 100], yTicks: [0, 37, 63, 95, 100],
    series: [
      { fn: x => 100 * (1 - Math.exp(-x)), label: 'включение', color: C.accent, width: 3 },
      { fn: x => 100 * Math.exp(-x), label: 'выключение через диод', color: C.bad, width: 3 },
    ],
    legendAt: { x: 250, y: 150, cols: 1 },
    markers: [
      { x: 1, y: 63.2, label: '1τ: 63 %', dx: 8, dy: 20, color: C.accent },
      { x: 3, y: 95, label: '3τ: 95 %', dx: 8, dy: 20, color: C.accent },
      { x: 1, y: 36.8, label: '1τ: 37 %', dx: 8, dy: -10, color: C.bad },
    ],
  });
  g.save(out('rl-circuit', 'curves'));
}
