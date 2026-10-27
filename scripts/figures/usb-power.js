import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('usb-power');

  // 1. Приёмник USB-C: два резистора 5,1 кОм на CC1 и CC2
  const f = new Fig(480, 320, 'Приёмник питания USB-C: резисторы Rd на линиях CC');
  f.rect(24, 46, 116, 214, { r: 10, width: 2.5, fill: C.surface });
  f.text(82, 70, 'USB-C', { anchor: 'middle', size: 15, weight: 700 });
  const pins = [['VBUS', 96], ['CC1', 136], ['CC2', 176], ['GND', 226]];
  pins.forEach(([t, y]) => {
    f.text(130, y + 5, t, { anchor: 'end', size: 13, weight: 700 });
    f.circle(140, y, 4, { fill: C.ink, stroke: 'none' });
  });
  sch.wire(f, [[140, 96], [430, 96]], { color: C.warn });
  f.circle(434, 96, 5, { fill: 'none' });
  f.text(300, 86, '5 В на плату', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[140, 136], [330, 136], [330, 172]]);
  sch.resistor(f, 330, 204, { rot: 90, len: 64, name: 'Rd 5,1 кОм', off: 26 });
  sch.wire(f, [[140, 176], [240, 176]]);
  sch.resistor(f, 240, 204, { rot: 90, len: 64, name: 'Rd', off: -22 });
  sch.wire(f, [[240, 236], [240, 262]]);
  sch.wire(f, [[330, 236], [330, 262], [240, 262]]);
  sch.wire(f, [[140, 226], [170, 226], [170, 262], [240, 262]]);
  sch.node(f, 240, 262);
  sch.gnd(f, 240, 262);
  f.text(240, 24, 'Без двух Rd зарядка USB-C питание не включит', { anchor: 'middle', size: 15, weight: 700, fill: C.bad });
  f.save(out('usb-power', 'usbc-sink'));

  // 2. Ток разных источников
  const g = new Fig(480, 300, 'Максимальный ток разных источников USB');
  g.text(240, 24, 'Сколько тока может дать источник', { anchor: 'middle', size: 16, weight: 700 });
  const rows = [
    ['USB 2.0 до настройки', 0.1, C.muted],
    ['USB 2.0', 0.5, C.accent],
    ['USB 3.x', 0.9, C.accent],
    ['зарядный порт BC1.2', 1.5, C.ok],
    ['USB-C 1,5 А', 1.5, C.ok],
    ['USB-C 3 А', 3, C.warn],
    ['USB PD 5 А (20 В)', 5, C.bad],
  ];
  const x0 = 188, k = 52;
  rows.forEach(([name, a, col], i) => {
    const y = 44 + i * 34;
    g.text(x0 - 10, y + 19, name, { anchor: 'end', size: 12 });
    g.rect(x0, y, a * k, 26, { fill: col, stroke: 'none', r: 4, opacity: 0.8 });
    g.text(x0 + a * k + 6, y + 19, String(a).replace('.', ',') + ' А', { size: 13, weight: 700, fill: col });
  });
  g.save(out('usb-power', 'currents'));

  // 3. Блок-схема входа питания USB на плате
  const h = new Fig(480, 220, 'Типичный вход питания от USB на своей плате');
  h.text(240, 24, 'Цепочка защиты по пути питания', { anchor: 'middle', size: 15, weight: 700 });
  const boxes = [['USB-C\nразъём', C.ink], ['Rd на CC\n5,1 кОм', C.warn], ['PTC\nF1', C.bad], ['TVS\nзащита', C.muted], ['LDO/DC-DC\n3,3 В', C.ok]];
  boxes.forEach(([t, col], i) => {
    const x = 8 + i * 94;
    h.rect(x, 64, 80, 64, { stroke: col, r: 8, width: 2.5 });
    h.text(x + 40, 92, t, { anchor: 'middle', size: 12, weight: 700, fill: col });
    if (i < 4) h.arrow(x + 80, 96, x + 94, 96, { width: 2.5, head: 8 });
  });
  h.text(240, 168, 'Rd — сообщает источнику, что на плате приёмник', { anchor: 'middle', size: 13, fill: C.muted });
  h.text(240, 190, 'PTC и TVS защищают от перегрузки и выбросов', { anchor: 'middle', size: 13, fill: C.muted });
  h.save(out('usb-power', 'input-chain'));
}
