import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('level-shifting');

  const f = new Fig(920, 360, 'Три способа согласовать уровни 5 В и 3,3 В');
  // А. Делитель 5 В → 3,3 В (в одну сторону)
  f.text(20, 24, 'Делитель (5 В → 3,3 В)', { size: 15, weight: 700 });
  sch.wire(f, [[20, 120], [60, 120]]);
  f.circle(20, 120, 4.5, { fill: 'none' });
  f.text(20, 104, 'вход 5 В', { size: 12, fill: C.muted });
  sch.resistor(f, 100, 120, { len: 80, name: 'R1', value: '1,8 кОм', off: 28 });
  sch.wire(f, [[140, 120], [220, 120]]);
  sch.node(f, 170, 120);
  f.circle(220, 120, 4.5, { fill: 'none' });
  f.text(220, 104, 'выход 3,235 В', { anchor: 'middle', size: 12, weight: 700, fill: C.ok });
  sch.wire(f, [[170, 120], [170, 150]]);
  sch.resistor(f, 170, 180, { rot: 90, len: 60, name: 'R2', value: '3,3 кОм', off: 30 });
  sch.wire(f, [[170, 210], [170, 230]]);
  sch.gnd(f, 170, 230);
  f.text(20, 310, 'только в одну сторону;\nмедленнее при большой ёмкости', { size: 12, fill: C.muted });

  // Б. BSS138: двунаправленный сдвиг (I2C)
  const ox = 310;
  f.text(ox, 24, 'N-MOSFET BSS138 (двунаправленный)', { size: 15, weight: 700 });
  sch.wire(f, [[ox + 50, 52], [ox + 90, 52]]);
  f.circle(ox + 50, 52, 4.5, { fill: 'none' });
  f.text(ox + 50, 40, '+3,3 В', { anchor: 'middle', size: 11, weight: 700, fill: C.warn });
  sch.wire(f, [[ox + 230, 52], [ox + 260, 52]]);
  f.circle(ox + 260, 52, 4.5, { fill: 'none' });
  f.text(ox + 260, 40, '+5 В', { anchor: 'middle', size: 11, weight: 700, fill: C.warn });
  sch.wire(f, [[ox + 50, 52], [ox + 50, 64]]);
  sch.resistor(f, ox + 50, 94, { rot: 90, len: 60, name: 'Rп', value: '10 кОм', off: -30 });
  sch.wire(f, [[ox + 50, 124], [ox + 50, 190]]);
  sch.wire(f, [[ox + 230, 52], [ox + 230, 64]]);
  sch.resistor(f, ox + 230, 94, { rot: 90, len: 60, name: 'Rп', value: '10 кОм', off: 30 });
  sch.wire(f, [[ox + 230, 124], [ox + 230, 140]]);
  sch.node(f, ox + 230, 140);
  sch.mosfet(f, ox + 150, 150);
  sch.wire(f, [[ox + 180, 100], [ox + 180, 100], [ox + 230, 100]]);
  sch.wire(f, [[ox + 180, 200], [ox + 180, 214], [ox + 50, 214]]);
  sch.node(f, ox + 50, 190);
  sch.wire(f, [[ox + 50, 190], [ox + 50, 214], [ox + 50, 250]]);
  f.circle(ox + 50, 250, 4.5, { fill: 'none' });
  f.text(ox + 50, 270, 'сторона 3,3 В', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[ox + 230, 140], [ox + 230, 250]]);
  f.circle(ox + 230, 250, 4.5, { fill: 'none' });
  f.text(ox + 230, 270, 'сторона 5 В', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[ox + 116, 150], [ox + 80, 150], [ox + 80, 52], [ox + 90, 52]]);
  sch.wire(f, [[ox + 50, 52], [ox + 80, 52]]);
  f.text(ox, 310, 'затвор на 3,3 В; корпусный диод помогает\nпередавать ноль со стороны 5 В', { size: 12, fill: C.muted });

  // В. Микросхема
  const cx = 690;
  f.text(cx, 24, 'Готовая микросхема', { size: 15, weight: 700 });
  sch.block(f, cx + 30, 100, 130, 90, 'TXS0108E\n74LVC245', { size: 14 });
  f.arrow(cx, 128, cx + 30, 128, { width: 2.2, head: 8 });
  f.arrow(cx + 30, 164, cx, 164, { width: 2.2, head: 8 });
  f.text(cx - 6, 120, '3,3 В', { anchor: 'end', size: 12, weight: 700 });
  f.text(cx + 166, 120, '5 В', { size: 12, weight: 700 });
  f.arrow(cx + 160, 128, cx + 190, 128, { width: 2.2, head: 8 });
  f.arrow(cx + 190, 164, cx + 160, 164, { width: 2.2, head: 8 });
  f.text(cx, 310, 'много каналов, высокая скорость;\nTXS0108E не для I²C', { size: 12, fill: C.muted });
  f.save(out('level-shifting', 'three-ways'));

  // 2. Выход делителя при различных входах
  const g = chart({
    title: 'Выход делителя 1,8 кОм / 3,3 кОм',
    xLabel: 'Входное напряжение, В', yLabel: 'Выход, В',
    xRange: [0, 5.5], yRange: [0, 4],
    series: [{ fn: v => v * 3.3 / 5.1, label: 'Uвых = Uвх · 3,3 / 5,1', color: C.accent, width: 3 }],
    hlines: [{ v: 3.6, label: 'максимум входа МК ≈ 3,6 В', color: C.bad }],
    markers: [{ x: 5, y: 5 * 3.3 / 5.1, label: '5 В → 3,24 В', dx: -12, dy: 22, anchor: 'end' }],
    legendAt: { x: 90, y: 120, cols: 1 },
    xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 1, 2, 3, 4],
    samples: 60,
  });
  g.save(out('level-shifting', 'divider-out'));
}
