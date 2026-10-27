import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('series');

  // 1. Схема: два резистора последовательно, токи и напряжения
  const f = new Fig(480, 290, 'Два резистора последовательно подключены к батарейке 9 В');
  const L = 70, R = 430, T = 80, B = 240, mid = 160;
  sch.battery(f, L, mid, { rot: 90, name: '9 В', off: -30 });
  sch.resistor(f, 170, T, { name: 'R1 = 100 Ом' });
  sch.resistor(f, 330, T, { name: 'R2 = 200 Ом' });
  sch.wire(f, [[L, mid - 40], [L, T], [130, T]]);
  sch.wire(f, [[210, T], [290, T]]);
  sch.wire(f, [[370, T], [R, T], [R, B], [L, B], [L, mid + 40]]);
  sch.voltage(f, 130, T, 210, T, 'U1 = 3 В', { bend: 30, color: C.warn });
  sch.voltage(f, 290, T, 370, T, 'U2 = 6 В', { bend: 30, color: C.bad });
  sch.current(f, 250, B, 'left', 'I = 30 мА (одинаков везде)', { color: C.accent, off: 26, len: 44 });
  f.save(out('series', 'circuit'));

  // 2. «Лесенка» потенциалов
  const g = chart({
    title: 'Потенциал вдоль цепи: «лесенка»',
    xLabel: 'путь заряда по цепи →', yLabel: 'потенциал, В',
    xRange: [0, 5], yRange: [0, 10.5], xTicks: [], yTicks: [0, 3, 6, 9],
    series: [{ points: [[0, 0], [1, 9], [1.4, 9], [2.4, 6], [2.9, 6], [4.1, 0], [5, 0]], color: C.accent, width: 3.5 }],
    legend: false,
    notes: [
      { x: 0.1, y: 5, text: 'батарейка\n+9 В', color: C.ok },
      { x: 1.7, y: 8.2, text: 'R1: падение 3 В', color: C.warn },
      { x: 3.1, y: 4.6, text: 'R2: падение 6 В', color: C.bad },
    ],
  });
  g.save(out('series', 'staircase'));
}
