import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const lg = Math.log10;
const pow = v => String(Number((10 ** v).toPrecision(2))).replace('.', ',');

export function generate() {
  fresh('ferrite-beads');

  // 1. Импеданс бусины (типичная форма): 600 Ом на 100 МГц
  const z = fr => { const x = fr / 150e6; return 1400 * x / (1 + x * x); };
  const g = chart({
    title: 'Импеданс ферритовой бусины',
    xLabel: 'Частота, Гц (лог.)', yLabel: '|Z|, Ом (лог.)',
    xRange: [1e6, 1e9], yRange: [0, 3], log: true, yTicks: [0, 1, 2, 3], yFormat: pow, xTicks: [1e6, 1e7, 1e8, 1e9],
    xFormat: v => (v >= 1e9 ? v / 1e9 + ' ГГц' : v / 1e6 + ' МГц'),
    series: [{ fn: fr => lg(z(fr)), color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 1e7, y: lg(z(1e7)), label: '10 МГц: около 90 Ом', dx: 10, dy: 20 },
      { x: 1e8, y: lg(z(1e8)), label: '100 МГц: около 650 Ом', dx: -10, dy: -12, anchor: 'end', color: C.bad },
    ],
    notes: [{ x: 1.2e6, y: 2.7, text: 'на постоянном токе: доли ома', color: C.ok }],
  });
  g.save(out('ferrite-beads', 'impedance'));

  // 2. Синфазный дроссель: дифференциальный и синфазный ток
  const f = new Fig(480, 300, 'Синфазный дроссель');
  f.text(240, 22, 'Две обмотки на общем сердечнике', { anchor: 'middle', size: 15, weight: 700 });
  sch.wire(f, [[20, 80], [190, 80]]);
  sch.inductor(f, 240, 80, { len: 100 });
  sch.wire(f, [[290, 80], [460, 80]]);
  sch.wire(f, [[20, 150], [190, 150]]);
  sch.inductor(f, 240, 150, { len: 100 });
  sch.wire(f, [[290, 150], [460, 150]]);
  f.line(200, 102, 280, 102, { width: 2.5 });
  f.line(200, 128, 280, 128, { width: 2.5 });
  f.text(240, 120, 'сердечник', { anchor: 'middle', size: 11, fill: C.muted });
  f.arrow(70, 62, 130, 62, { stroke: C.ok, width: 3 });
  f.arrow(130, 168, 70, 168, { stroke: C.ok, width: 3 });
  f.text(20, 200, 'Сигнал (дифференциальный ток): токи в обмотках\nпротивоположны, поля вычитаются, дроссель проходим', { size: 12, fill: C.ok, weight: 600 });
  f.arrow(350, 62, 410, 62, { stroke: C.bad, width: 3 });
  f.arrow(350, 168, 410, 168, { stroke: C.bad, width: 3, dash: '' });
  f.text(20, 244, 'Синфазная помеха: токи в обмотках в одну сторону,\nполя складываются, дроссель даёт большое сопротивление', { size: 12, fill: C.bad, weight: 600 });
  f.save(out('ferrite-beads', 'common-mode'));
}
