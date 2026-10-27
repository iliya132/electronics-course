import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('buck');

  // 1. Схема buck
  const f = new Fig(480, 280, 'Понижающий импульсный преобразователь (buck)');
  const y = 90;
  f.circle(18, y, 4.5, { fill: 'none' });
  f.text(18, y - 14, 'Uвх', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[22, y], [86, y]]);
  sch.node(f, 50, y);
  sch.wire(f, [[50, y], [50, y + 20]]);
  sch.capacitor(f, 50, y + 48, { rot: 90, len: 52, name: 'Cвх', off: 22 });
  sch.wire(f, [[50, y + 74], [50, 235]]);
  sch.gnd(f, 50, 235);
  f.rect(86, y - 28, 64, 56, { r: 8, width: 2.6, stroke: C.accent });
  f.text(118, y - 4, 'ключ', { anchor: 'middle', size: 13, weight: 700, fill: C.accent });
  f.text(118, y + 14, 'Q', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[150, y], [200, y]]);
  sch.node(f, 190, y);
  f.text(190, y - 12, 'SW', { anchor: 'middle', size: 11, weight: 700, fill: C.bad });
  sch.wire(f, [[190, y], [190, y + 26]]);
  sch.diode(f, 190, y + 70, { rot: 270, len: 64, name: 'D', off: 24 });
  sch.wire(f, [[190, y + 102], [190, 235]]);
  sch.gnd(f, 190, 235);
  sch.wire(f, [[190, y], [220, y]]);
  sch.inductor(f, 270, y, { len: 80, name: 'L', off: 24 });
  sch.wire(f, [[310, y], [454, y]]);
  sch.node(f, 380, y);
  sch.wire(f, [[380, y], [380, y + 20]]);
  sch.capacitor(f, 380, y + 48, { rot: 90, len: 52, name: 'Cвых', off: 22 });
  sch.wire(f, [[380, y + 74], [380, 235]]);
  sch.gnd(f, 380, 235);
  f.circle(458, y, 4.5, { fill: 'none' });
  f.text(458, y - 14, 'Uвых', { anchor: 'end', size: 13, weight: 700, fill: C.ok });
  f.text(240, 270, 'Ключ открыт — дроссель заряжается; закрыт — ток идёт через диод D', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('buck', 'circuit'));

  // 2. Напряжение на SW и ток дросселя: 12 → 5 В, L = 100 мкГн, f = 100 кГц, Iвых = 1 А
  const U = 12, Uo = 5, L = 100, fr = 100, T = 1000 / fr; // T в мкс = 10
  const D = Uo / U, dI = (U - Uo) * D / (L * 1e-6 * fr * 1e3);
  const g = new Fig(480, 330, 'Работа buck: SW и ток дросселя');
  const x0 = 70, w = 390, tmax = 30;
  const X = t => x0 + t / tmax * w;
  // верхняя панель — SW
  const t1 = 52, h1 = 84;
  const Ys = v => t1 + h1 - v / U * h1;
  g.text(x0, t1 - 12, 'Напряжение на SW (12 В или 0 В)', { size: 12, weight: 700, fill: C.bad });
  g.line(x0, t1, x0, t1 + h1, { width: 1.5 });
  g.line(x0, Ys(0), x0 + w, Ys(0), { stroke: C.muted, width: 1.2 });
  let pts = [];
  for (let k = 0; k < 3; k++) {
    const a = k * T, b = a + D * T, c = a + T;
    pts.push([X(a), Ys(0)], [X(a), Ys(U)], [X(b), Ys(U)], [X(b), Ys(0)], [X(c), Ys(0)]);
  }
  g.poly(pts, { stroke: C.bad, width: 2.8 });
  g.text(x0 - 6, Ys(U) + 4, '12', { anchor: 'end', size: 11, fill: C.muted });
  g.text(x0 - 6, Ys(0) + 4, '0', { anchor: 'end', size: 11, fill: C.muted });
  g.line(x0, Ys(Uo), x0 + w, Ys(Uo), { stroke: C.ok, width: 1.8, dash: '7 5' });
  g.text(x0 + w, Ys(Uo) - 5, 'среднее 5 В', { anchor: 'end', size: 11, fill: C.ok, weight: 700 });
  // нижняя панель — ток дросселя
  const t2 = 188, h2 = 90, imin = 0.6, imax = 1.4;
  const Yi = i => t2 + h2 - (i - imin) / (imax - imin) * h2;
  g.text(x0, t2 - 14, 'Ток дросселя (среднее 1 А, пульсации ≈ 0,29 А)', { size: 12, weight: 700, fill: C.accent });
  g.line(x0, t2, x0, t2 + h2, { width: 1.5 });
  g.line(x0, Yi(1), x0 + w, Yi(1), { stroke: C.ok, width: 1.8, dash: '7 5' });
  const ip = [];
  for (let k = 0; k < 3; k++) {
    const a = k * T, b = a + D * T, c = a + T;
    ip.push([X(a), Yi(1 - dI / 2)], [X(b), Yi(1 + dI / 2)], [X(c), Yi(1 - dI / 2)]);
  }
  g.poly(ip, { stroke: C.accent, width: 2.8 });
  [0.8, 1, 1.2].forEach(v => g.text(x0 - 6, Yi(v) + 4, String(v).replace('.', ','), { anchor: 'end', size: 11, fill: C.muted }));
  g.text(x0 + w, Yi(1) - 6, 'Iвых = 1 А', { anchor: 'end', size: 11, fill: C.ok, weight: 700 });
  g.line(x0, t2 + h2, x0 + w, t2 + h2, { stroke: C.muted, width: 1.2 });
  [0, 10, 20, 30].forEach(t => g.text(X(t), 306, String(t), { anchor: 'middle', size: 11, fill: C.muted }));
  g.text(x0 + w, 322, 'время, мкс (f = 100 кГц, L = 100 мкГн, D = 42 %)', { anchor: 'end', size: 11, fill: C.muted });
  g.save(out('buck', 'waveforms'));
  console.log('D', D.toFixed(3), 'dI', dI.toFixed(3));
}
