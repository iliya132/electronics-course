import { Fig, C, sch, out, fresh } from '../lib/fig.js';

function symbols() {
  const f = new Fig(480, 340, 'Условные обозначения основных элементов');
  const cell = (i) => [24 + (i % 3) * 156, 20 + Math.floor(i / 3) * 80];
  const items = [
    ['батарея', (x, y) => sch.battery(f, x, y, { len: 64 })],
    ['резистор', (x, y) => sch.resistor(f, x, y, { len: 64 })],
    ['лампа', (x, y) => sch.lamp(f, x, y, { len: 64 })],
    ['выключатель (разомкнут)', (x, y) => sch.switch(f, x, y, { len: 64 })],
    ['выключатель (замкнут)', (x, y) => sch.switch(f, x, y, { len: 64, closed: true })],
    ['провод', (x, y) => f.line(x - 32, y, x + 32, y)],
    ['соединение проводов', (x, y) => { f.line(x - 32, y, x + 32, y); f.line(x, y - 22, x, y + 22); sch.node(f, x, y); }],
    ['пересечение без точки', (x, y) => { f.line(x - 32, y, x - 7, y); f.path(`M${x - 7} ${y}a7 7 0 0 1 14 0`); f.line(x + 7, y, x + 32, y); f.line(x, y - 22, x, y + 22); }],
    ['земля (GND)', (x, y) => sch.gnd(f, x, y - 18)],
    ['вольтметр', (x, y) => sch.meter(f, x, y, { len: 64, sym: 'V' })],
    ['амперметр', (x, y) => sch.meter(f, x, y, { len: 64, sym: 'A' })],
    ['источник напряжения', (x, y) => { f.circle(x, y, 18); f.text(x, y + 6, '+', { anchor: 'middle', size: 20, weight: 700 }); f.line(x - 32, y, x - 18, y); f.line(x + 18, y, x + 32, y); }],
  ];
  items.forEach(([name, draw], i) => {
    const [x, y] = cell(i);
    draw(x + 64, y + 22);
    f.text(x + 64, y + 62, name, { anchor: 'middle', size: 13, fill: C.muted });
  });
  return f;
}

function pictorial() {
  const f = new Fig(480, 300, 'Реальные детали и их схема');
  f.text(12, 26, 'Как выглядят детали', { size: 15, weight: 700 });
  f.text(262, 26, 'Как рисуют на схеме', { size: 15, weight: 700 });
  f.line(246, 40, 246, 290, { stroke: C.grid, width: 1.5 });
  // батарейка
  f.rect(30, 70, 108, 44, { r: 8, width: 2.2, fill: C.surface });
  f.rect(138, 84, 10, 16, { r: 2, width: 2, fill: C.surface });
  f.text(44, 98, '−', { size: 22, weight: 700 });
  f.text(112, 98, '+', { size: 22, weight: 700 });
  f.text(84, 130, 'батарейка', { anchor: 'middle', size: 13, fill: C.muted });
  // лампа
  f.circle(196, 196, 24, { width: 2.2 });
  f.path('M184 202l4-12 8 12 8-12 4 12', { width: 1.8 });
  f.rect(184, 220, 24, 14, { r: 2, fill: C.surface });
  f.text(196, 258, 'лампа', { anchor: 'middle', size: 13, fill: C.muted });
  // выключатель
  f.rect(40, 196, 70, 14, { r: 3, fill: C.surface });
  f.circle(50, 196, 4, { fill: C.ink });
  f.circle(100, 196, 4, { fill: C.ink });
  f.line(50, 196, 94, 170, { width: 3 });
  f.text(75, 236, 'выключатель', { anchor: 'middle', size: 13, fill: C.muted });
  // провода
  f.path('M148 92H196V172', { width: 2.5, stroke: C.accent });
  f.path('M196 220V268H100V204', { width: 2.5, stroke: C.accent });
  f.path('M50 202H14V92H30', { width: 2.5, stroke: C.accent });
  // схема
  const L = 296, R = 440, T = 82, B = 250, mid = 166;
  sch.battery(f, L, mid, { rot: 90 });
  sch.switch(f, 368, T, {});
  sch.lamp(f, R, mid, { rot: 90 });
  sch.wire(f, [[L, mid - 40], [L, T], [328, T]]);
  sch.wire(f, [[408, T], [R, T], [R, mid - 40]]);
  sch.wire(f, [[R, mid + 40], [R, B], [L, B], [L, mid + 40]]);
  return f;
}

function shortCircuit() {
  const f = new Fig(480, 320, 'Нормальная цепь и короткое замыкание');
  const panel = (x0, title, load) => {
    const L = x0 + 40, R = x0 + 190, T = 90, B = 230, mid = 160;
    f.text(x0 + 10, 28, title, { size: 15, weight: 700, fill: load ? C.ok : C.bad });
    sch.battery(f, L, mid, { rot: 90 });
    sch.wire(f, [[L, mid - 40], [L, T], [R, T]]);
    sch.wire(f, [[L, mid + 40], [L, B], [R, B]]);
    if (load) {
      sch.wire(f, [[R, T], [R, mid - 40]]);
      sch.wire(f, [[R, mid + 40], [R, B]]);
      sch.lamp(f, R, mid, { rot: 90 });
      f.arrow(L + 36, T - 26, L + 94, T - 26, { stroke: C.ok, width: 2.5 });
      f.text(x0 + 10, 270, 'ток небольшой: 0,3 А\nограничивает лампа', { size: 14, fill: C.ok, weight: 600 });
    } else {
      sch.wire(f, [[R, T], [R, B]], { width: 2 });
      f.arrow(L + 30, T - 26, L + 108, T - 26, { stroke: C.bad, width: 5, head: 14 });
      f.arrow(R + 16, mid - 16, R + 16, mid + 20, { stroke: C.bad, width: 5, head: 14 });
      f.text(x0 + 10, 270, 'ток огромный: 5 А и выше\nограничен лишь r батарейки', { size: 14, fill: C.bad, weight: 600 });
    }
  };
  panel(0, 'Есть нагрузка', true);
  panel(240, 'Короткое замыкание', false);
  f.line(240, 44, 240, 300, { stroke: C.grid, width: 1.5 });
  return f;
}

export function generate() {
  fresh('circuit-basics');
  symbols().save(out('circuit-basics', 'symbols'));
  pictorial().save(out('circuit-basics', 'real-vs-schematic'));
  shortCircuit().save(out('circuit-basics', 'short-circuit'));
}
