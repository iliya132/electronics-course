import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('liion-charger-module');

  // 1. Схема опыта с измерением тока и напряжения
  const f = new Fig(480, 320, 'Подключение модуля TP4056, аккумулятора и приборов');
  f.rect(20, 50, 100, 70, { r: 8, width: 2.2 });
  f.text(70, 80, 'USB 5 В', { anchor: 'middle', size: 14, weight: 700, fill: C.warn });
  f.text(70, 100, 'зарядка или\nповербанк', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[120, 80], [160, 80]]);
  f.rect(160, 50, 130, 160, { r: 8, width: 2.5, stroke: C.accent });
  f.text(225, 78, 'Модуль TP4056', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(225, 98, 'с защитой\nDW01 + 8205A', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(178, 188, 'OUT+', { size: 10 }); f.text(250, 188, 'OUT−', { size: 10 });
  // амперметр в плюсовой цепи
  sch.wire(f, [[290, 80], [290, 80]]);
  sch.meter(f, 325, 80, { sym: 'A', len: 70, color: C.bad });
  sch.wire(f, [[360, 80], [395, 80], [395, 124]]);
  sch.battery(f, 395, 160, { rot: 90, len: 72, name: '18650', off: 30 });
  sch.wire(f, [[395, 196], [395, 250], [225, 250], [225, 210]]);
  sch.wire(f, [[360, 80], [360, 120]], { color: C.accent });
  sch.meter(f, 360, 160, { rot: 90, sym: 'V', color: C.accent, len: 60 });
  sch.wire(f, [[360, 190], [360, 250]], { color: C.accent });
  sch.node(f, 360, 80); sch.node(f, 360, 250);
  f.text(240, 292, 'Амперметр — в разрыв «плюса», вольтметр — на клеммы аккумулятора', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('liion-charger-module', 'setup'));

  // 2. Ожидаемое напряжение при заряде
  const volt = t => (t <= 100 ? 3.75 + 0.45 * (1 - Math.pow(1 - t / 100, 1.7)) : 4.2);
  const g = chart({
    title: 'Ожидаемое напряжение на клеммах при заряде',
    xLabel: 'Время заряда, мин', yLabel: 'Напряжение, В',
    xRange: [0, 180], yRange: [3.6, 4.3], yTicks: [3.7, 3.9, 4.1, 4.2],
    series: [{ fn: volt, color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: 100, label: 'начало CV', color: C.warn }],
    markers: [
      { x: 0, y: 3.75, label: '3,75 В', dx: 8, dy: 20 },
      { x: 60, y: volt(60), label: '60 мин: 4,07 В', dx: 8, dy: 22 },
      { x: 120, y: 4.2, label: '4,2 В (CV)', dx: -8, dy: 22, anchor: 'end', color: C.warn },
    ],
  });
  g.save(out('liion-charger-module', 'voltage'));
}
