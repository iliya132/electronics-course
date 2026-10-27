import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('li-ion-safety');

  // 1. Шкала напряжения Li-ion
  const f = new Fig(480, 330, 'Допустимые напряжения элемента Li-ion');
  const top = 40, bottom = 300, vMax = 4.6, vMin = 2.0;
  const Y = v => bottom - (v - vMin) / (vMax - vMin) * (bottom - top);
  const zones = [
    [4.25, 4.6, C.bad, 'опасность: перезаряд'],
    [3.0, 4.2, C.ok, 'рабочая область'],
    [2.5, 3.0, C.warn, 'нельзя разряжать'],
    [2.0, 2.5, C.bad, 'опасность: глубокий разряд'],
  ];
  zones.forEach(([a, b, col, t]) => {
    f.rect(200, Y(b), 60, Y(a) - Y(b), { fill: col, stroke: 'none', r: 0, opacity: 0.35 });
    f.text(276, (Y(a) + Y(b)) / 2 + 5, t, { size: 13, weight: 700, fill: col });
  });
  f.line(200, top, 200, bottom, { width: 2 });
  [[4.2, '4,2 В: полный заряд'], [3.7, '3,7 В: номинал'], [3.0, '3,0 В: порог'], [2.5, '2,5 В: защита']].forEach(([v, t]) => {
    f.line(192, Y(v), 206, Y(v), { width: 2 });
    f.text(186, Y(v) + 5, t, { anchor: 'end', size: 12, weight: 700 });
  });
  f.text(200, 26, 'Напряжение одного элемента', { anchor: 'middle', size: 14, weight: 700 });
  f.save(out('li-ion-safety', 'voltage-zones'));

  // 2. Плата защиты: DW01 и два ключа
  const g = new Fig(480, 300, 'Схема платы защиты элемента Li-ion');
  g.text(240, 24, 'Плата защиты: DW01 и два ключа в «минусовом» проводе', { anchor: 'middle', size: 15, weight: 700 });
  sch.battery(g, 84, 150, { rot: 90 });
  g.text(100, 100, 'B+', { size: 13, weight: 700 });
  g.text(100, 218, 'B−', { size: 13, weight: 700 });
  sch.wire(g, [[84, 110], [84, 64], [430, 64]]);
  g.circle(432, 64, 5, { fill: 'none' });
  g.text(420, 52, 'P+', { size: 13, weight: 700, anchor: 'end' });
  // DW01
  g.rect(150, 100, 120, 54, { r: 8, width: 2.5 });
  g.text(210, 124, 'DW01', { anchor: 'middle', size: 16, weight: 700 });
  g.text(210, 142, 'контроль U и I', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(g, [[210, 64], [210, 100]]);
  sch.node(g, 210, 64);
  // минусовая линия и ключи
  sch.wire(g, [[84, 190], [84, 240], [140, 240]]);
  g.rect(140, 224, 46, 32, { r: 4, width: 2.5, stroke: C.accent });
  g.text(163, 245, 'Q1', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  sch.wire(g, [[186, 240], [210, 240]]);
  g.rect(210, 224, 46, 32, { r: 4, width: 2.5, stroke: C.bad });
  g.text(233, 245, 'Q2', { anchor: 'middle', size: 14, weight: 700, fill: C.bad });
  sch.wire(g, [[256, 240], [432, 240]]);
  g.circle(432, 240, 5, { fill: 'none' });
  g.text(420, 232, 'P−', { size: 13, weight: 700, anchor: 'end' });
  // управляющие линии
  g.line(190, 154, 190, 190, { stroke: C.accent, width: 2 });
  g.line(190, 190, 163, 190, { stroke: C.accent, width: 2 });
  g.arrow(163, 190, 163, 224, { stroke: C.accent, width: 2, head: 8 });
  g.line(232, 154, 232, 190, { stroke: C.bad, width: 2 });
  g.arrow(232, 190, 232, 224, { stroke: C.bad, width: 2, head: 8 });
  g.text(286, 120, 'OD → Q1: откл. разряд\n(переразряд, КЗ, перегрузка)', { size: 11, fill: C.accent, weight: 600 });
  g.text(286, 168, 'OC → Q2: отключает заряд\n(перезаряд)', { size: 12, fill: C.bad, weight: 600 });
  g.text(240, 286, 'DW01 следит за напряжением и током', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('li-ion-safety', 'protection'));
}
