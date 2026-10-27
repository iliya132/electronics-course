import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('kirchhoff');

  // 1. Узел: сумма входящих токов равна сумме исходящих
  const n = new Fig(480, 300, 'Токи в узле');
  sch.wire(n, [[50, 130], [240, 130]]);
  sch.wire(n, [[240, 30], [240, 130]]);
  sch.wire(n, [[240, 130], [430, 130]]);
  sch.wire(n, [[240, 130], [240, 240]]);
  sch.node(n, 240, 130);
  sch.current(n, 130, 130, 'right', '5 мА', { color: C.ok, off: -14 });
  sch.current(n, 240, 80, 'down', '3 мА', { color: C.ok });
  sch.current(n, 340, 130, 'right', '6 мА', { color: C.bad, off: -14 });
  sch.current(n, 240, 190, 'down', '2 мА', { color: C.bad });
  n.text(24, 26, 'зелёные стрелки: токи входят в узел', { size: 13, fill: C.ok, weight: 600 });
  n.text(24, 46, 'красные стрелки: токи выходят из узла', { size: 13, fill: C.bad, weight: 600 });
  n.text(240, 278, 'Входит 5 + 3 = 8 мА, выходит 6 + 2 = 8 мА', { anchor: 'middle', size: 15, weight: 700 });
  n.save(out('kirchhoff', 'node'));

  // 2. Контур: сумма подъёмов и падений равна нулю
  const l = new Fig(480, 300, 'Обход замкнутого контура');
  const L = 70, R = 350, T = 76, B = 232, mid = 154;
  sch.battery(l, L, mid, { rot: 90, name: '+9 В', off: -30 });
  sch.wire(l, [[L, mid - 40], [L, T], [170, T]]);
  sch.resistor(l, 210, T, { name: 'R1: −2 В', len: 80 });
  sch.wire(l, [[250, T], [R, T], [R, mid - 40]]);
  sch.resistor(l, R, mid, { rot: 90, name: 'R2: −3 В', off: 30 });
  sch.wire(l, [[R, mid + 40], [R, B], [250, B]]);
  sch.resistor(l, 210, B, { name: 'R3: −4 В', len: 80 });
  sch.wire(l, [[170, B], [L, B], [L, mid + 40]]);
  l.text(210, 138, 'Идём по кругу:', { anchor: 'middle', size: 14, fill: C.muted });
  l.text(210, 166, '+9 − 2 − 3 − 4 = 0', { anchor: 'middle', size: 20, weight: 700, fill: C.accent });
  l.text(210, 284, 'Вернулись в начало: потенциал вернулся к прежнему', { anchor: 'middle', size: 14, fill: C.muted });
  l.save(out('kirchhoff', 'loop'));

  // 3. Две батарейки и три ветви
  const f = new Fig(480, 330, 'Схема с двумя источниками и тремя ветвями');
  const T3 = 70, B3 = 250, X = [90, 240, 390];
  sch.wire(f, [[X[0], T3], [X[2], T3]]);
  sch.wire(f, [[X[0], B3], [X[2], B3]]);
  sch.resistor(f, X[0], 110, { rot: 90, name: 'R1', off: 26 });
  sch.battery(f, X[0], 210, { rot: 90, name: 'E1', off: -26 });
  sch.wire(f, [[X[0], 150], [X[0], 170]]);
  sch.resistor(f, X[1], 155, { rot: 90, name: 'R3', off: 26 });
  sch.wire(f, [[X[1], T3], [X[1], 115]]);
  sch.wire(f, [[X[1], 195], [X[1], B3]]);
  sch.resistor(f, X[2], 110, { rot: 90, name: 'R2', off: -26 });
  sch.battery(f, X[2], 210, { rot: 90, name: 'E2', off: 26 });
  sch.wire(f, [[X[2], 150], [X[2], 170]]);
  sch.node(f, X[1], T3); sch.node(f, X[1], B3);
  f.text(X[1] - 12, T3 - 10, 'a', { anchor: 'end', size: 16, weight: 700 });
  f.text(X[1] - 12, B3 + 22, 'b', { anchor: 'end', size: 16, weight: 700 });
  sch.current(f, 160, T3, 'right', 'I1 = 55 мА', { color: C.accent, off: -14 });
  sch.current(f, 330, T3, 'left', 'I2 = −10 мА', { color: C.bad, off: -14 });
  sch.current(f, X[1], 94, 'down', 'I3 = 45 мА', { color: C.ok, len: 22 });
  f.text(240, 292, 'E1 = 10 В, R1 = 100 Ом;  E2 = 4 В, R2 = 50 Ом;  R3 = 100 Ом', { anchor: 'middle', size: 14, fill: C.muted });
  f.text(240, 312, 'Минус у I2: ток идёт против нарисованной стрелки (E2 заряжается)', { anchor: 'middle', size: 13, fill: C.bad });
  f.save(out('kirchhoff', 'two-sources'));
}
