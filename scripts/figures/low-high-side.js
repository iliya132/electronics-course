import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('low-high-side');

  // 1. Четыре схемы: две рабочие и две ошибочные
  const f = new Fig(740, 640, 'Нижний и верхний ключ: две рабочие схемы и две ошибочные');
  const rail = (ox, oy) => {
    sch.wire(f, [[ox + 170, oy + 62], [ox + 300, oy + 62]]);
    f.circle(ox + 300, oy + 62, 4.5, { fill: 'none' });
    f.text(ox + 300, oy + 48, '+12 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  };
  const head = (ox, oy, title, verdict, ok) => {
    f.rect(ox, oy, 360, 300, { r: 10, width: 1.4, stroke: C.grid });
    f.text(ox + 14, oy + 24, title, { size: 15, weight: 700 });
    f.text(ox + 14, oy + 44, verdict, { size: 12, weight: 600, fill: ok ? C.ok : C.bad });
  };
  const gate = (ox, oy, y, label) => {
    sch.wire(f, [[ox + 20, y], [ox + 136, y]]);
    f.circle(ox + 20, y, 4.5, { fill: 'none' });
    f.text(ox + 14, y + 22, label, { size: 12, fill: C.muted });
  };

  // а) N-MOSFET снизу
  let ox = 10, oy = 10;
  head(ox, oy, 'Нижний ключ: N-MOSFET', 'работает: затвору хватает 3,3 В', true);
  rail(ox, oy);
  sch.wire(f, [[ox + 200, oy + 62], [ox + 200, oy + 70]]);
  sch.resistor(f, ox + 200, oy + 100, { rot: 90, len: 60, name: 'нагрузка', off: -30 });
  sch.wire(f, [[ox + 200, oy + 130], [ox + 200, oy + 130]]);
  sch.mosfet(f, ox + 170, oy + 180);
  sch.wire(f, [[ox + 200, oy + 230], [ox + 200, oy + 246]]);
  sch.gnd(f, ox + 200, oy + 246);
  gate(ox, oy, oy + 180, 'МК 3,3 В');
  f.text(ox + 232, oy + 184, 'Uзи = 3,3 В', { size: 12, fill: C.ok, weight: 600 });

  // б) P-MOSFET сверху
  ox = 370; oy = 10;
  head(ox, oy, 'Верхний ключ: P-MOSFET', 'работает со сдвигом уровня затвора', true);
  rail(ox, oy);
  sch.wire(f, [[ox + 200, oy + 62], [ox + 200, oy + 90]]);
  sch.mosfet(f, ox + 170, oy + 140, { p: true, flip: true });
  sch.wire(f, [[ox + 200, oy + 190], [ox + 200, oy + 190]]);
  sch.resistor(f, ox + 200, oy + 220, { rot: 90, len: 60, name: 'нагрузка', off: -30 });
  sch.wire(f, [[ox + 200, oy + 250], [ox + 200, oy + 262]]);
  sch.gnd(f, ox + 200, oy + 262);
  sch.wire(f, [[ox + 136, oy + 140], [ox + 100, oy + 140]]);
  f.rect(ox + 20, oy + 120, 80, 40, { r: 6, width: 2 });
  f.text(ox + 60, oy + 145, 'драйвер', { anchor: 'middle', size: 13, weight: 600 });
  f.text(ox + 228, oy + 120, 'Uзатв: 12 В — выкл.\n0 В — вкл.', { size: 12, fill: C.ok, weight: 600 });

  // в) N-MOSFET сверху напрямую от МК
  ox = 10; oy = 320;
  head(ox, oy, 'Верхний N-MOSFET от МК', 'не работает: Uзи падает', false);
  rail(ox, oy);
  sch.wire(f, [[ox + 200, oy + 62], [ox + 200, oy + 80]]);
  sch.mosfet(f, ox + 170, oy + 130);
  sch.wire(f, [[ox + 200, oy + 180], [ox + 200, oy + 180]]);
  sch.resistor(f, ox + 200, oy + 210, { rot: 90, len: 60, name: 'нагрузка', off: -30 });
  sch.wire(f, [[ox + 200, oy + 240], [ox + 200, oy + 262]]);
  sch.gnd(f, ox + 200, oy + 262);
  gate(ox, oy, oy + 130, 'МК 3,3 В');
  f.text(ox + 232, oy + 100, 'исток растёт\nдо ≈ 12 В', { size: 12, fill: C.bad, weight: 600 });
  f.text(ox + 232, oy + 218, 'Uзи = 3,3 − 12 < 0:\nключ закроет сам себя', { size: 12, fill: C.bad, weight: 600 });

  // г) P-MOSFET сверху напрямую от МК
  ox = 370; oy = 320;
  head(ox, oy, 'Верхний P-MOSFET от МК', 'не работает: выключить нельзя', false);
  rail(ox, oy);
  sch.wire(f, [[ox + 200, oy + 62], [ox + 200, oy + 80]]);
  sch.mosfet(f, ox + 170, oy + 130, { p: true, flip: true });
  sch.wire(f, [[ox + 200, oy + 180], [ox + 200, oy + 180]]);
  sch.resistor(f, ox + 200, oy + 210, { rot: 90, len: 60, name: 'нагрузка', off: -30 });
  sch.wire(f, [[ox + 200, oy + 240], [ox + 200, oy + 262]]);
  sch.gnd(f, ox + 200, oy + 262);
  gate(ox, oy, oy + 130, 'МК 3,3 В');
  f.text(ox + 232, oy + 100, 'МК = 3,3 В:\nUзи = −8,7 В', { size: 12, fill: C.bad, weight: 600 });
  f.text(ox + 232, oy + 218, 'всё ещё открыт,\nнагрузка не гаснет', { size: 12, fill: C.bad, weight: 600 });
  f.save(out('low-high-side', 'four-circuits'));

  // 2. Верхний P-MOSFET со сдвигом уровня
  const g = new Fig(620, 420, 'Верхний ключ на P-MOSFET с транзистором сдвига уровня');
  sch.wire(g, [[150, 40], [520, 40]]);
  g.circle(520, 40, 4.5, { fill: 'none' });
  g.text(520, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.node(g, 230, 40);
  sch.wire(g, [[230, 40], [230, 55]]);
  sch.resistor(g, 230, 105, { rot: 90, len: 100, name: 'Rпу', value: '100 кОм', off: -30 });
  sch.wire(g, [[230, 155], [230, 170]]);
  sch.node(g, 230, 170);
  sch.wire(g, [[330, 40], [330, 120]]);
  sch.node(g, 330, 40);
  sch.mosfet(g, 300, 170, { p: true, flip: true });
  sch.wire(g, [[230, 170], [266, 170]]);
  sch.resistor(g, 330, 270, { rot: 90, len: 100, name: 'лента', value: '1 А', off: -30 });
  sch.wire(g, [[330, 320], [330, 346]]);
  sch.gnd(g, 330, 346);
  sch.wire(g, [[230, 170], [230, 240]]);
  sch.bjt(g, 200, 290);
  sch.wire(g, [[230, 340], [230, 362]]);
  sch.gnd(g, 230, 362);
  sch.wire(g, [[30, 290], [60, 290]]);
  sch.resistor(g, 100, 290, { len: 80, name: 'Rб 4,7 кОм', off: 28 });
  sch.wire(g, [[140, 290], [160, 290]]);
  g.circle(30, 290, 4.5, { fill: 'none' });
  g.text(16, 322, 'вывод МК', { size: 12, fill: C.muted });
  g.text(250, 340, 'Q2', { size: 14, weight: 700 });
  g.text(395, 120, 'МК = 0:  Q2 закрыт,\nзатвор подтянут к +12 В,\nUзи = 0 → лента выключена', { size: 12, fill: C.muted });
  g.text(395, 240, 'МК = 1:  Q2 открыт,\nзатвор ≈ 0,2 В,\nUзи ≈ −11,8 В → лента включена', { size: 12, fill: C.ok, weight: 600 });
  g.save(out('low-high-side', 'pmos-level-shift'));
}
