import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('rc-charge');

  // 1. Схема заряда и разряда
  const f = new Fig(480, 300, 'RC-цепь: заряд и разряд конденсатора через резистор');
  const T = 80, B = 230;
  sch.battery(f, 70, 155, { rot: 90, name: 'E', off: -26 });
  sch.wire(f, [[70, 115], [70, T], [110, T]]);
  sch.switch(f, 150, T, { len: 80, name: 'переключатель' });
  sch.wire(f, [[190, T], [220, T]]);
  sch.resistor(f, 260, T, { name: 'R', off: 28 });
  sch.wire(f, [[300, T], [380, T], [380, 115]]);
  sch.capacitor(f, 380, 155, { rot: 90, name: 'C', off: 28 });
  sch.node(f, 380, T);
  sch.wire(f, [[380, 195], [380, B], [70, B], [70, 195]]);
  sch.voltage(f, 410, 120, 410, 190, 'Uc', { color: C.warn, bend: -16 });
  sch.current(f, 340, T, 'right', 'I', { color: C.accent, off: -14, len: 34 });
  f.text(240, 270, 'Заряд: Uc = E · (1 − e^(−t/τ)),   τ = R · C', { anchor: 'middle', size: 15, weight: 700, fill: C.accent });
  f.text(240, 290, 'Ток максимален в начале и затухает вместе с разностью E − Uc', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('rc-charge', 'circuit'));

  // 2. Заряд и разряд в долях постоянной времени
  const g = chart({
    title: 'Заряд и разряд в единицах τ',
    xLabel: 'Время t в долях τ', yLabel: 'Напряжение на C, % от E',
    xRange: [0, 5], yRange: [0, 100], yTicks: [0, 37, 63, 95, 100], xTicks: [0, 1, 2, 3, 4, 5],
    series: [
      { fn: x => 100 * (1 - Math.exp(-x)), label: 'заряд', color: C.accent, width: 3 },
      { fn: x => 100 * Math.exp(-x), label: 'разряд', color: C.bad, width: 3 },
    ],
    legendAt: { x: 300, y: 150, cols: 1 },
    markers: [
      { x: 1, y: 63.2, label: '1τ: 63 %', dx: 8, dy: 18, color: C.accent },
      { x: 3, y: 95, label: '3τ: 95 %', dx: 8, dy: 18, color: C.accent },
      { x: 1, y: 36.8, label: '1τ: 37 %', dx: 8, dy: -10, color: C.bad },
      { x: 3, y: 5, label: '3τ: 5 %', dx: 8, dy: -10, color: C.bad },
    ],
  });
  g.save(out('rc-charge', 'curves'));
}
