import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('measure-capacitance');

  // 1. Схема опыта: зарядка и разряд через резистор, вольтметр на конденсаторе
  const f = new Fig(480, 300, 'Схема измерения ёмкости по времени разряда через резистор');
  sch.battery(f, 60, 150, { rot: 90, name: '3 В', off: -28 });
  sch.wire(f, [[60, 110], [60, 60], [110, 60]]);
  sch.switch(f, 150, 60, { name: 'заряд', len: 80 });
  sch.wire(f, [[190, 60], [250, 60], [250, 100]]);
  sch.capacitor(f, 250, 135, { rot: 90, name: 'C', off: 28, polar: true, len: 70 });
  sch.wire(f, [[250, 170], [250, 240], [60, 240], [60, 190]]);
  sch.node(f, 250, 60); sch.node(f, 250, 240);
  // резистор и ключ разряда
  sch.wire(f, [[250, 60], [320, 60]]);
  sch.switch(f, 360, 60, { name: 'разряд', len: 80 });
  sch.wire(f, [[400, 60], [430, 60], [430, 100]]);
  sch.resistor(f, 430, 150, { rot: 90, name: 'R 100 кОм', off: -30, len: 100 });
  sch.wire(f, [[430, 200], [430, 240], [250, 240]]);
  // вольтметр на конденсаторе
  sch.wire(f, [[250, 100], [300, 100], [300, 130]], { color: C.accent });
  sch.meter(f, 300, 160, { rot: 90, sym: 'V', color: C.accent, len: 60 });
  sch.wire(f, [[300, 190], [300, 240]], { color: C.accent });
  sch.node(f, 300, 240);
  f.text(240, 278, 'Зарядить C до 3 В, потом замкнуть «разряд» и включить секундомер', { anchor: 'middle', size: 11, fill: C.muted });
  f.save(out('measure-capacitance', 'setup'));

  // 2. Кривые разряда для R = 100 кОм
  const g = chart({
    title: 'Разряд от 3 В через 100 кОм',
    xLabel: 'Время, с', yLabel: 'Напряжение на C, В',
    xRange: [0, 10], yRange: [0, 3.2], yTicks: [0, 1.1, 2, 3],
    series: [
      { fn: t => 3 * Math.exp(-t / 1), label: '10 мкФ, τ = 1 с', color: C.bad, width: 2.5 },
      { fn: t => 3 * Math.exp(-t / 2.2), label: '22 мкФ, τ = 2,2 с', color: C.accent, width: 2.5 },
      { fn: t => 3 * Math.exp(-t / 10), label: '100 мкФ, τ = 10 с', color: C.ok, width: 2.5 },
    ],
    legendAt: { x: 240, y: 80, cols: 1 },
    hlines: [{ v: 3 * Math.exp(-1), label: '37 % = 1,10 В', color: C.muted }],
  });
  g.save(out('measure-capacitance', 'discharge'));
}
