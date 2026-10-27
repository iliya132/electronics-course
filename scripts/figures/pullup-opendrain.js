import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('pullup-opendrain');

  // 1. Кнопка с pull-up и pull-down
  const f = new Fig(740, 330, 'Кнопка с подтяжкой к плюсу и к земле');
  // pull-up
  f.text(20, 24, 'Подтяжка к плюсу (pull-up)', { size: 15, weight: 700 });
  sch.wire(f, [[60, 50], [200, 50]]);
  f.circle(60, 50, 4.5, { fill: 'none' });
  f.text(60, 36, '+3,3 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(f, [[140, 50], [140, 62]]);
  sch.resistor(f, 140, 92, { rot: 90, len: 60, name: 'Rпу', value: '10 кОм', off: -30 });
  sch.wire(f, [[140, 122], [140, 175]]);
  sch.node(f, 140, 150);
  sch.wire(f, [[140, 150], [260, 150]]);
  f.circle(260, 150, 4.5, { fill: 'none' });
  f.text(266, 140, 'вывод МК', { size: 12, fill: C.muted });
  sch.switch(f, 140, 205, { rot: 90, len: 60, name: 'SB', off: 30 });
  sch.wire(f, [[140, 235], [140, 260]]);
  sch.gnd(f, 140, 260);
  f.text(20, 316, 'отпущена: 1 (3,3 В); нажата: 0 (≈ 0 В), ток 0,33 мА', { size: 12, fill: C.ok, weight: 600 });
  // pull-down
  const ox = 390;
  f.text(ox, 24, 'Подтяжка к земле (pull-down)', { size: 15, weight: 700 });
  sch.wire(f, [[ox + 40, 50], [ox + 180, 50]]);
  f.circle(ox + 40, 50, 4.5, { fill: 'none' });
  f.text(ox + 40, 36, '+3,3 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(f, [[ox + 120, 50], [ox + 120, 62]]);
  sch.switch(f, ox + 120, 92, { rot: 90, len: 60, name: 'SB', off: -30 });
  sch.wire(f, [[ox + 120, 122], [ox + 120, 175]]);
  sch.node(f, ox + 120, 150);
  sch.wire(f, [[ox + 120, 150], [ox + 240, 150]]);
  f.circle(ox + 240, 150, 4.5, { fill: 'none' });
  f.text(ox + 246, 140, 'вывод МК', { size: 12, fill: C.muted });
  sch.resistor(f, ox + 120, 205, { rot: 90, len: 60, name: 'Rпд', value: '10 кОм', off: -30 });
  sch.wire(f, [[ox + 120, 235], [ox + 120, 260]]);
  sch.gnd(f, ox + 120, 260);
  f.text(ox, 316, 'отпущена: 0; нажата: 1, ток 0,33 мА', { size: 12, fill: C.ok, weight: 600 });
  f.save(out('pullup-opendrain', 'button'));

  // 2. Две схемы с открытым стоком на общей шине (проводное И)
  const g = new Fig(720, 320, 'Шина с открытым стоком и общей подтяжкой');
  sch.wire(g, [[100, 40], [220, 40]]);
  g.circle(100, 40, 4.5, { fill: 'none' });
  g.text(100, 26, '+3,3 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(g, [[160, 40], [160, 52]]);
  sch.resistor(g, 160, 82, { rot: 90, len: 60, name: 'Rп', value: '4,7 кОм', off: -30 });
  sch.wire(g, [[160, 112], [160, 130]]);
  sch.node(g, 160, 130);
  sch.wire(g, [[160, 130], [600, 130]]);
  [[300, 'A'], [450, 'B']].forEach(([x, n]) => {
    sch.mosfet(g, x, 180);
    sch.node(g, x + 30, 130);
    sch.wire(g, [[x + 30, 230], [x + 30, 250]]);
    sch.gnd(g, x + 30, 250);
    sch.wire(g, [[x - 34, 180], [x - 70, 180]]);
    g.circle(x - 70, 180, 4.5, { fill: 'none' });
    g.text(x - 70, 164, `выход ${n}`, { anchor: 'middle', size: 12, fill: C.muted });
  });
  g.circle(600, 130, 4.5, { fill: 'none' });
  g.text(600, 114, 'шина', { anchor: 'middle', size: 13, weight: 700 });
  g.text(160, 300, 'шина = 1, только если оба ключа закрыты; любой ключ тянет её к нулю', { size: 13, fill: C.ok, weight: 600 });
  g.save(out('pullup-opendrain', 'wired-and'));

  // 3. Время нарастания шины I2C от подтяжки
  const rise = C0 => R => 0.8473 * R * 1e3 * C0 * 1e-12 * 1e9;
  const h = chart({
    title: 'Время нарастания шины от Rпу (30–70 %)',
    xLabel: 'Подтяжка Rпу, кОм', yLabel: 'Время нарастания, нс',
    xRange: [1, 20], yRange: [0, 1800],
    series: [
      { fn: rise(100), label: 'ёмкость шины 100 пФ', color: C.accent, width: 3 },
      { fn: rise(400), label: 'ёмкость шины 400 пФ', color: C.warn, width: 3, dash: '8 5' },
    ],
    hlines: [{ v: 1000, label: 'лимит 100 кГц: 1000 нс', color: C.ok }, { v: 300, label: 'лимит 400 кГц: 300 нс', color: C.bad }],
    legendAt: { x: 100, y: 150, cols: 1 },
    xTicks: [1, 5, 10, 15, 20], yTicks: [0, 300, 600, 1000, 1500],
    samples: 100,
  });
  h.save(out('pullup-opendrain', 'rise-time'));
}
