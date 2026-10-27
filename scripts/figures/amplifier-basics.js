import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('amplifier-basics');

  // 1. Усилитель с общим эмиттером
  const f = new Fig(640, 470, 'Усилительный каскад с общим эмиттером');
  sch.wire(f, [[140, 40], [480, 40]]);
  f.circle(480, 40, 4.5, { fill: 'none' });
  f.text(480, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.node(f, 200, 40); sch.node(f, 330, 40);
  sch.wire(f, [[200, 40], [200, 55]]);
  sch.resistor(f, 200, 105, { rot: 90, len: 100, name: 'R1', value: '180 кОм', off: -30 });
  sch.wire(f, [[200, 155], [200, 270]]);
  sch.node(f, 200, 250);
  sch.resistor(f, 200, 320, { rot: 90, len: 100, name: 'R2', value: '33 кОм', off: -30 });
  sch.wire(f, [[200, 370], [200, 400]]);
  sch.wire(f, [[330, 40], [330, 60]]);
  sch.resistor(f, 330, 110, { rot: 90, len: 100, name: 'Rк', value: '5,6 кОм', off: -30 });
  sch.wire(f, [[330, 160], [330, 200]]);
  sch.node(f, 330, 200);
  sch.bjt(f, 300, 250);
  sch.wire(f, [[200, 250], [260, 250]]);
  sch.wire(f, [[330, 300], [330, 310]]);
  sch.node(f, 330, 305);
  sch.resistor(f, 330, 350, { rot: 90, len: 80, name: 'Rэ', value: '1 кОм', off: -30 });
  sch.wire(f, [[330, 390], [330, 400]]);
  sch.wire(f, [[330, 305], [400, 305], [400, 310]]);
  sch.capacitor(f, 400, 350, { rot: 90, len: 80, name: 'Cэ', value: '100 мкФ', off: 30, polar: true });
  sch.wire(f, [[400, 390], [400, 400]]);
  sch.wire(f, [[200, 400], [400, 400]]);
  sch.gnd(f, 300, 400);
  // вход и выход
  sch.wire(f, [[30, 250], [70, 250]]);
  sch.capacitor(f, 100, 250, { len: 60, name: 'C1', value: '1 мкФ', off: 26 });
  sch.wire(f, [[130, 250], [200, 250]]);
  f.circle(30, 250, 4.5, { fill: 'none' });
  f.text(14, 232, 'вход', { size: 13, weight: 700 });
  sch.wire(f, [[330, 200], [440, 200]]);
  sch.capacitor(f, 470, 200, { len: 60, name: 'C2', value: '1 мкФ', off: 26 });
  sch.wire(f, [[500, 200], [600, 200]]);
  f.circle(600, 200, 4.5, { fill: 'none' });
  f.text(600, 182, 'выход', { anchor: 'middle', size: 13, weight: 700 });
  f.text(430, 270, 'Uк ≈ 6,3 В\nIк ≈ 1 мА\nUэ ≈ 1 В', { size: 12, fill: C.warn, weight: 600 });
  f.save(out('amplifier-basics', 'common-emitter'));

  // 2. Выходной сигнал: линейный режим и ограничение (модель)
  const dc = 6.34, f0 = 1000;
  const sinw = t => Math.sin(2 * Math.PI * f0 * t / 1000);
  const g = chart({
    title: 'Выход каскада на частоте 1 кГц (модель)',
    xLabel: 'Время, мс', yLabel: 'Напряжение на коллекторе, В',
    xRange: [0, 2], yRange: [0, 13],
    series: [
      { fn: t => dc - 2.24 * sinw(t), label: 'вход 10 мВ: усиление ×224', color: C.accent, width: 3 },
      { fn: t => Math.min(12, Math.max(1.2, dc - 6.72 * sinw(t))), label: 'вход 30 мВ: ограничение', color: C.bad, width: 2.6, dash: '8 4' },
    ],
    hlines: [{ v: 12, label: 'шина 12 В', color: C.warn }],
    legendAt: { x: 120, y: 130, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5, 2], yTicks: [0, 3, 6, 9, 12],
    samples: 400,
  });
  g.save(out('amplifier-basics', 'waveform'));
}
