import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const fc = 1 / (2 * Math.PI * 1000 * 100e-9);

export function generate() {
  fresh('rc-lowpass');

  // 1. Схема ФНЧ
  const f = new Fig(480, 260, 'RC-фильтр низких частот');
  f.circle(40, 100, 5, { fill: 'none' });
  f.text(40, 80, 'вход', { anchor: 'middle', size: 14, weight: 700, fill: C.warn });
  sch.wire(f, [[45, 100], [90, 100]]);
  sch.resistor(f, 130, 100, { name: 'R 1 кОм', len: 80, off: 28 });
  sch.wire(f, [[170, 100], [300, 100]]);
  sch.node(f, 260, 100);
  sch.wire(f, [[260, 100], [260, 120]]);
  sch.capacitor(f, 260, 150, { rot: 90, name: 'C 100 нФ', off: 28, len: 60 });
  sch.wire(f, [[260, 180], [260, 200]]);
  sch.gnd(f, 260, 200);
  f.circle(304, 100, 5, { fill: 'none' });
  f.text(304, 80, 'выход', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(20, 160, 'низкие частоты:\nXc велико — сигнал\nпроходит на выход', { size: 12, fill: C.ok, weight: 600 });
  f.text(340, 160, 'высокие частоты:\nXc мало — сигнал\nуходит на землю', { size: 12, fill: C.bad, weight: 600 });
  f.text(240, 24, 'fc = 1 / (2π·R·C) = 1,59 кГц', { anchor: 'middle', size: 16, weight: 700, fill: C.accent });
  f.save(out('rc-lowpass', 'circuit'));

  // 2. АЧХ в дБ для R = 1 кОм, C = 100 нФ
  const h = (x) => -10 * Math.log10(1 + (x / fc) ** 2);
  const g = chart({
    title: 'АЧХ RC-фильтра: R = 1 кОм, C = 100 нФ',
    xLabel: 'Частота, Гц (лог.)', yLabel: 'Усиление, дБ',
    xRange: [10, 1e5], yRange: [-40, 3], log: true, xTicks: [10, 100, 1000, 1e4, 1e5], yTicks: [0, -3, -20, -40],
    xFormat: v => (v >= 1000 ? v / 1000 + ' к' : String(v)),
    series: [{ fn: h, color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: fc, label: 'fc 1,59 к', color: C.muted }],
    markers: [
      { x: 1e4, y: h(1e4), label: '10 кГц: −16 дБ', dx: -8, dy: 22, anchor: 'end', color: C.bad },
      { x: 5e4, y: h(5e4), label: '50 кГц: −30 дБ', dx: -8, dy: 22, anchor: 'end', color: C.bad },
    ],
  });
  g.save(out('rc-lowpass', 'response'));

  // 3. Сигнал с шумом до и после фильтра (fc = 159 Гц)
  const fcn = 159;
  const att = fr => 1 / Math.sqrt(1 + (fr / fcn) ** 2);
  const noisy = t => Math.sin(2 * Math.PI * 20 * t / 1000) + 0.35 * Math.sin(2 * Math.PI * 3000 * t / 1000) + 0.2 * Math.sin(2 * Math.PI * 4700 * t / 1000);
  const clean = t => att(20) * Math.sin(2 * Math.PI * 20 * t / 1000) + 0.35 * att(3000) * Math.sin(2 * Math.PI * 3000 * t / 1000) + 0.2 * att(4700) * Math.sin(2 * Math.PI * 4700 * t / 1000);
  const n = chart({
    title: 'Датчик 20 Гц с шумом 3–5 кГц',
    xLabel: 'Время, мс', yLabel: 'Напряжение, отн. ед.',
    xRange: [0, 60], yRange: [-2, 2], yTicks: [-1, 0, 1], samples: 1500,
    series: [
      { fn: noisy, label: 'до фильтра', color: C.bad, width: 1.2 },
      { fn: clean, label: 'после (fc = 159 Гц)', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 86, cols: 2, dx: 150 },
  });
  n.save(out('rc-lowpass', 'noise'));
}
