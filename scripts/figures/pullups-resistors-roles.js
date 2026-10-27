import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('pullups-resistors-roles');

  // 1. Кнопка с pull-up и pull-down
  const f = new Fig(480, 300, 'Кнопка со схемами подтяжки к питанию и к земле');
  const half = (x0, up) => {
    f.text(x0 + 110, 24, up ? 'Подтяжка к питанию (pull-up)' : 'Подтяжка к земле (pull-down)', { anchor: 'middle', size: 14, weight: 700 });
    const bx = x0 + 100;
    if (up) {
      f.text(bx + 8, 52, '+3,3 В', { size: 13, fill: C.warn, weight: 700 });
      sch.wire(f, [[bx, 56], [bx, 66]]);
      sch.resistor(f, bx, 106, { rot: 90, name: '10 кОм', off: -30, len: 80 });
      sch.wire(f, [[bx, 146], [bx, 220]]);
      sch.node(f, bx, 160);
      sch.switch(f, bx, 190, { rot: 90, len: 60 });
      sch.gnd(f, bx, 220);
    } else {
      f.text(bx + 8, 52, '+3,3 В', { size: 13, fill: C.warn, weight: 700 });
      sch.wire(f, [[bx, 56], [bx, 66]]);
      sch.switch(f, bx, 96, { rot: 90, len: 60 });
      sch.wire(f, [[bx, 126], [bx, 160]]);
      sch.node(f, bx, 160);
      sch.resistor(f, bx, 200, { rot: 90, name: '10 кОм', off: -30, len: 80 });
      sch.wire(f, [[bx, 240], [bx, 246]]);
      sch.gnd(f, bx, 246);
    }
    sch.wire(f, [[bx, 160], [bx + 56, 160]], { color: C.accent });
    f.circle(bx + 60, 160, 4.5, { fill: 'none' });
    f.text(bx + 68, 165, 'вход МК', { size: 12, fill: C.accent, weight: 700 });
  };
  half(8, true);
  half(248, false);
  f.line(240, 40, 240, 290, { stroke: C.grid, width: 1.5 });
  f.text(125, 280, 'нет нажатия: 1, нажата: 0', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(365, 280, 'нет нажатия: 0, нажата: 1', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('pullups-resistors-roles', 'pullup'));

  // 2. Шесть работ одного резистора
  const g = new Fig(480, 330, 'Шесть ролей резистора на плате');
  const cells = [
    ['Подтяжка', (ox, oy) => {
      g.text(ox + 66, oy + 48, '+Vcc', { size: 12, weight: 700, fill: C.warn });
      sch.wire(g, [[ox + 60, oy + 52], [ox + 60, oy + 60]]);
      sch.resistor(g, ox + 60, oy + 86, { rot: 90, len: 52, name: 'R', off: -24 });
      sch.wire(g, [[ox + 60, oy + 112], [ox + 60, oy + 118]]);
      sch.node(g, ox + 60, oy + 112);
      sch.wire(g, [[ox + 60, oy + 112], [ox + 110, oy + 112]], { color: C.accent });
      g.circle(ox + 114, oy + 112, 3.5, { fill: 'none' });
    }],
    ['Токоограничение', (ox, oy) => {
      g.text(ox + 66, oy + 48, '+Vcc', { size: 12, weight: 700, fill: C.warn });
      sch.wire(g, [[ox + 60, oy + 52], [ox + 60, oy + 56]]);
      sch.resistor(g, ox + 60, oy + 72, { rot: 90, len: 40, name: 'R', off: -22 });
      sch.diode(g, ox + 60, oy + 106, { rot: 90, len: 40, led: false });
      sch.wire(g, [[ox + 60, oy + 126], [ox + 60, oy + 128]]);
      sch.gnd(g, ox + 60, oy + 126);
    }],
    ['Делитель', (ox, oy) => {
      g.text(ox + 66, oy + 48, 'Uвх', { size: 12, weight: 700, fill: C.warn });
      sch.wire(g, [[ox + 60, oy + 52], [ox + 60, oy + 56]]);
      sch.resistor(g, ox + 60, oy + 72, { rot: 90, len: 40, name: 'R1', off: -22 });
      sch.node(g, ox + 60, oy + 92);
      sch.wire(g, [[ox + 60, oy + 92], [ox + 108, oy + 92]], { color: C.accent });
      g.text(ox + 112, oy + 96, 'Uвых', { size: 12, weight: 700, fill: C.accent });
      sch.resistor(g, ox + 60, oy + 112, { rot: 90, len: 40, name: 'R2', off: -22 });
      sch.wire(g, [[ox + 60, oy + 132], [ox + 60, oy + 134]]);
      sch.gnd(g, ox + 60, oy + 132);
    }],
    ['Шунт (датчик тока)', (ox, oy) => {
      g.text(ox + 8, oy + 66, 'ток I', { size: 12, weight: 700, fill: C.warn });
      sch.wire(g, [[ox + 10, oy + 80], [ox + 50, oy + 80]]);
      sch.resistor(g, ox + 80, oy + 80, { len: 60, name: '0,01 Ом', off: 22 });
      sch.wire(g, [[ox + 110, oy + 80], [ox + 152, oy + 80]]);
      g.arrow(ox + 50, oy + 118, ox + 110, oy + 118, { stroke: C.accent, width: 2 });
      g.text(ox + 80, oy + 138, 'U = I · R', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
    }],
    ['Демпфирование', (ox, oy) => {
      g.rect(ox + 8, oy + 62, 30, 38, { r: 4, width: 1.5 });
      g.text(ox + 23, oy + 86, 'МК', { anchor: 'middle', size: 11 });
      sch.wire(g, [[ox + 38, oy + 80], [ox + 52, oy + 80]]);
      sch.resistor(g, ox + 80, oy + 80, { len: 56, name: '33 Ом', off: 22 });
      sch.wire(g, [[ox + 108, oy + 80], [ox + 120, oy + 80]]);
      g.rect(ox + 120, oy + 62, 32, 38, { r: 4, width: 1.5 });
      g.text(ox + 136, oy + 86, 'ИС', { anchor: 'middle', size: 11 });
      g.text(ox + 80, oy + 124, 'гасит «звон» сигнала', { anchor: 'middle', size: 11, fill: C.muted });
    }],
    ['Согласование', (ox, oy) => {
      g.line(ox + 10, oy + 62, ox + 110, oy + 62, { width: 2 });
      g.line(ox + 10, oy + 100, ox + 110, oy + 100, { width: 2 });
      g.text(ox + 8, oy + 54, 'A', { size: 11, weight: 700 });
      g.text(ox + 8, oy + 118, 'B', { size: 11, weight: 700 });
      sch.wire(g, [[ox + 110, oy + 62], [ox + 120, oy + 62], [ox + 120, oy + 68]]);
      sch.resistor(g, ox + 120, oy + 81, { rot: 90, len: 26, name: '120', off: 14 });
      sch.wire(g, [[ox + 120, oy + 94], [ox + 120, oy + 100], [ox + 110, oy + 100]]);
      g.text(ox + 80, oy + 134, 'в конце линии', { anchor: 'middle', size: 11, fill: C.muted });
    }],
  ];
  cells.forEach(([name, draw], i) => {
    const ox = (i % 3) * 160, oy = Math.floor(i / 3) * 165;
    g.rect(ox + 6, oy + 6, 148, 154, { r: 8, stroke: C.grid, width: 1.5 });
    g.text(ox + 80, oy + 28, name, { anchor: 'middle', size: 13, weight: 700 });
    draw(ox, oy);
  });
  g.save(out('pullups-resistors-roles', 'six-roles'));
}
