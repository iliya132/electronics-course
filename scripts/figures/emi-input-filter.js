import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('emi-input-filter');

  // 1. Типичная схема входа питания
  const f = new Fig(480, 300, 'Типичный вход питания платы: защита и фильтр');
  const y = 100;
  f.circle(18, y, 4.5, { fill: 'none' });
  f.text(18, y - 18, '+12 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(f, [[22, y], [44, y]]);
  sch.fuse(f, 76, y, { len: 64, name: 'F1', off: 24 });
  sch.wire(f, [[108, y], [128, y]]);
  sch.diode(f, 156, y, { len: 56, name: 'D1', off: 24 });
  sch.wire(f, [[184, y], [206, y]]);
  sch.node(f, 206, y);
  sch.wire(f, [[206, y], [206, y + 18]]);
  sch.diode(f, 206, y + 52, { rot: 270, len: 70, zener: true, name: 'TVS', off: 30 });
  sch.wire(f, [[206, y + 87], [206, y + 100]]);
  sch.gnd(f, 206, y + 100);
  sch.wire(f, [[206, y], [240, y]]);
  sch.inductor(f, 270, y, { len: 60, name: 'FB', off: 26 });
  sch.wire(f, [[300, y], [330, y]]);
  sch.node(f, 330, y);
  sch.wire(f, [[330, y], [330, y + 18]]);
  sch.capacitor(f, 330, y + 46, { rot: 90, len: 56, name: 'C', off: 24 });
  sch.wire(f, [[330, y + 74], [330, y + 100]]);
  sch.gnd(f, 330, y + 100);
  sch.wire(f, [[330, y], [372, y]]);
  f.rect(372, y - 28, 92, 56, { r: 8, width: 2.5 });
  f.text(418, y + 5, 'стабилиз.', { anchor: 'middle', size: 13, weight: 700 });
  f.text(76, 190, 'F1: КЗ', { anchor: 'middle', size: 12, fill: C.bad, weight: 700 });
  f.text(156, 214, 'D1: переполюсовка', { anchor: 'middle', size: 12, fill: C.warn, weight: 700 });
  f.text(246, 228, 'TVS: выбросы', { anchor: 'middle', size: 12, fill: C.accent, weight: 700 });
  f.text(330, 252, 'FB + C: ВЧ-шум', { anchor: 'middle', size: 12, fill: C.ok, weight: 700 });
  f.text(240, 24, 'Порядок по ходу питания: от грубой защиты к тонкой фильтрации', { anchor: 'middle', size: 13, fill: C.muted });
  f.save(out('emi-input-filter', 'input'));

  // 2. Источники помех
  const g = new Fig(480, 280, 'Источники помех на входе питания');
  const items = [
    ['Импульсные блоки питания', 'ВЧ-рябь 20 кГц – 5 МГц', C.accent],
    ['Моторы и реле', 'выбросы при коммутации', C.bad],
    ['Длинные провода', 'наводки (синфазные)', C.warn],
    ['Подключение/отключение', 'броски, разряды (ESD)', C.ok],
  ];
  g.text(240, 26, 'Что фильтруем на входе платы', { anchor: 'middle', size: 16, weight: 700 });
  items.forEach(([a, b, col], i) => {
    const y = 50 + i * 56;
    g.rect(16, y, 448, 46, { stroke: col, r: 8, width: 2.2 });
    g.text(32, y + 20, a, { size: 15, weight: 700, fill: col });
    g.text(32, y + 38, b, { size: 13, fill: C.muted });
  });
  g.save(out('emi-input-filter', 'sources'));
}
