import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('input-protection');

  // 1. Три варианта входа 12 В -> МК 3,3 В
  const f = new Fig(1040, 380, 'Три варианта входа 12 В для микроконтроллера 3,3 В');
  // А. Делитель + стабилитрон
  f.text(20, 24, 'А. Делитель и стабилитрон', { size: 15, weight: 700 });
  sch.wire(f, [[20, 90], [40, 90]]);
  f.circle(20, 90, 4.5, { fill: 'none' });
  f.text(20, 74, 'вход 12 В', { size: 12, fill: C.muted });
  sch.resistor(f, 80, 90, { len: 80, name: 'R1', value: '22 кОм', off: 28 });
  sch.wire(f, [[120, 90], [250, 90]]);
  sch.node(f, 150, 90);
  sch.wire(f, [[150, 90], [150, 130]]);
  sch.resistor(f, 150, 160, { rot: 90, len: 60, name: 'R2', value: '8,2 кОм', off: -30 });
  sch.wire(f, [[150, 190], [150, 220]]);
  sch.node(f, 150, 210);
  sch.gnd(f, 150, 222);
  sch.wire(f, [[150, 130], [190, 130]]);
  sch.diode(f, 190, 160, { rot: 90, len: 60, zener: true, name: 'VD', value: '3,6 В', off: 30 });
  sch.wire(f, [[190, 190], [190, 210], [150, 210]]);
  sch.wire(f, [[190, 130], [190, 90]]);
  f.text(250, 94, '→ Rс 1 кОм → вывод МК', { size: 11, fill: C.muted });
  f.text(20, 310, '12 В → 3,26 В;\n24 В → стабилитрон держит ≈ 3,6 В', { size: 12, fill: C.ok, weight: 600 });
  // Б. Оптопара
  const ox = 360;
  f.text(ox, 24, 'Б. Оптопара PC817', { size: 15, weight: 700 });
  sch.wire(f, [[ox, 90], [ox + 20, 90]]);
  f.circle(ox, 90, 4.5, { fill: 'none' });
  f.text(ox, 74, 'вход 12 В', { size: 12, fill: C.muted });
  sch.resistor(f, ox + 60, 90, { len: 80, name: 'R', value: '2,2 кОм', off: 28 });
  sch.wire(f, [[ox + 100, 90], [ox + 130, 90]]);
  sch.block(f, ox + 130, 60, 100, 90, 'PC817', { size: 14 });
  f.text(ox + 180, 172, 'гальваническая\nразвязка', { anchor: 'middle', size: 11, fill: C.bad });
  sch.wire(f, [[ox + 230, 90], [ox + 290, 90]]);
  f.text(ox + 130, 232, 'выход: Rпу 10 кОм к 3,3 В\nи вывод МК', { size: 11, fill: C.muted });
  f.text(ox, 310, '4,9 мА в светодиод;\nМК не связан с входной землёй', { size: 12, fill: C.ok, weight: 600 });
  // В. Компаратор
  const cx = 720;
  f.text(cx, 24, 'В. Компаратор LM393', { size: 15, weight: 700 });
  sch.wire(f, [[cx, 90], [cx + 20, 90]]);
  f.circle(cx, 90, 4.5, { fill: 'none' });
  f.text(cx, 74, 'вход 12 В', { size: 12, fill: C.muted });
  sch.block(f, cx + 20, 60, 90, 60, 'делитель\n30 кОм / 10 кОм', { size: 11 });
  sch.wire(f, [[cx + 110, 90], [cx + 140, 90]]);
  sch.block(f, cx + 140, 50, 100, 90, 'LM393\nпитание 3,3 В', { size: 12 });
  f.text(cx + 190, 160, 'опора 1,5 В\n(12 кОм / 10 кОм)', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(cx, 310, 'порог ≈ 6 В на входе;\nгистерезис добавляется Rf', { size: 12, fill: C.ok, weight: 600 });
  f.save(out('input-protection', 'three-options'));

  // 2. Напряжение на выводе МК для варианта А
  const div = v => v * 8.2 / 30.2;
  const clamp = v => { const d = div(v); return d <= 3.4 ? d : 3.4 + 0.18 * Math.log1p(d - 3.4) * 2; };
  const g = chart({
    title: 'Вариант А: напряжение на выводе МК',
    xLabel: 'Входное напряжение, В', yLabel: 'Напряжение на выводе МК, В',
    xRange: [0, 30], yRange: [0, 8.5],
    series: [
      { fn: div, label: 'только делитель', color: C.bad, width: 2.6, dash: '8 5' },
      { fn: clamp, label: 'делитель + стабилитрон 3,6 В', color: C.ok, width: 3 },
    ],
    hlines: [{ v: 3.6, label: 'предел вывода 3,6 В', color: C.warn }],
    markers: [{ x: 12, y: div(12), label: '12 В → 3,26 В', dx: 10, dy: 28, anchor: 'start' }],
    legendAt: { x: 100, y: 90, cols: 1 },
    xTicks: [0, 5, 10, 15, 20, 25, 30], yTicks: [0, 2, 4, 6, 8],
    samples: 150,
  });
  g.save(out('input-protection', 'clamp'));
}
