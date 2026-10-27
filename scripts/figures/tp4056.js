import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('tp4056');

  // 1. Профиль заряда CC/CV: напряжение и ток по времени (элемент 2000 мА·ч, ток 1 А)
  const f = new Fig(480, 420, 'Профиль заряда Li-ion: постоянный ток, затем постоянное напряжение');
  const L = 64, R = 462, tMax = 160;
  const X = t => L + t / tMax * (R - L);
  const U = t => (t <= 90 ? 3.5 + 0.7 * (1 - Math.exp(-t / 30)) / (1 - Math.exp(-3)) * 1 - 0 : 4.2);
  // напряжение: плавный рост 3,3 → 4,2 за 90 мин
  const volt = t => (t <= 90 ? 3.3 + 0.9 * (1 - Math.pow(1 - t / 90, 1.8)) : 4.2);
  const cur = t => (t <= 90 ? 1 : Math.max(0.1, Math.exp(-(t - 90) / 28)));
  const panel = (top, h, vMin, vMax, fn, color, ticksY, title, unit) => {
    f.text(L, top - 8, title, { size: 14, weight: 700, fill: color });
    const Y = v => top + h - (v - vMin) / (vMax - vMin) * h;
    f.line(L, top, L, top + h, { width: 1.5 });
    f.line(L, top + h, R, top + h, { width: 1.5 });
    ticksY.forEach(v => {
      f.line(L, Y(v), R, Y(v), { stroke: C.grid, width: 1 });
      f.text(L - 8, Y(v) + 5, String(v).replace('.', ','), { anchor: 'end', size: 12, fill: C.muted });
    });
    const pts = [];
    for (let t = 0; t <= tMax; t += 2) pts.push([X(t), Y(fn(t))]);
    f.poly(pts, { stroke: color, width: 3 });
    f.text(L - 8, top - 8, unit, { anchor: 'end', size: 12, fill: C.muted });
  };
  panel(40, 120, 3, 4.4, volt, C.accent, [3.0, 3.6, 4.2], 'Напряжение на элементе', 'В');
  panel(230, 120, 0, 1.2, cur, C.bad, [0, 0.5, 1.0], 'Ток заряда', 'А');
  f.line(X(90), 40, X(90), 350, { stroke: C.muted, width: 1.5, dash: '6 5' });
  f.text(X(45), 380, 'CC: постоянный ток 1 А', { anchor: 'middle', size: 13, weight: 700, fill: C.ok });
  f.text(X(125), 380, 'CV: постоянное 4,2 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  f.text(X(125), 304, 'заряд окончен при\nI = 0,1 А (1/10)', { anchor: 'middle', size: 12, fill: C.bad });
  f.text(L, 408, 'время заряда 0 … 160 мин', { size: 12, fill: C.muted });
  f.save(out('tp4056', 'cc-cv'));

  // 2. Упрощённая схема модуля TP4056
  const g = new Fig(480, 320, 'Упрощённая схема зарядного модуля на TP4056');
  g.text(240, 24, 'Модуль TP4056: вход USB 5 В, выход к аккумулятору', { anchor: 'middle', size: 15, weight: 700 });
  g.circle(28, 70, 5, { fill: 'none' });
  g.text(40, 62, 'USB 5 В', { size: 13, weight: 700, fill: C.warn });
  sch.wire(g, [[33, 70], [140, 70]]);
  g.rect(140, 50, 150, 150, { r: 8, width: 2.5 });
  g.text(215, 78, 'TP4056', { anchor: 'middle', size: 17, weight: 700 });
  g.text(215, 98, 'линейный контроллер\nзаряда CC/CV', { anchor: 'middle', size: 12, fill: C.muted });
  g.text(150, 66, 'IN', { size: 11, weight: 700 });
  g.text(270, 66, 'BAT', { size: 11, weight: 700, anchor: 'end' });
  g.text(150, 190, 'GND', { size: 11, weight: 700 });
  g.text(262, 190, 'PROG', { size: 11, weight: 700, anchor: 'end' });
  sch.wire(g, [[290, 70], [400, 70]]);
  g.circle(405, 70, 5, { fill: 'none' });
  g.text(420, 62, 'B+', { size: 13, weight: 700 });
  // PROG - резистор на землю
  sch.wire(g, [[250, 200], [250, 230]]);
  sch.resistor(g, 250, 262, { rot: 90, name: 'Rprog', off: 30, len: 64, value: '1,2 кОм = 1 А' });
  sch.wire(g, [[250, 294], [250, 300]]);
  sch.gnd(g, 250, 300);
  g.circle(34, 250, 6, { fill: C.bad, stroke: 'none' });
  g.text(48, 255, 'CHRG, красный: идёт заряд', { size: 12, fill: C.bad, weight: 600 });
  g.circle(34, 280, 6, { fill: C.ok, stroke: 'none' });
  g.text(48, 285, 'STDBY, зелёный: заряд окончен', { size: 12, fill: C.ok, weight: 600 });
  g.save(out('tp4056', 'module'));
}
