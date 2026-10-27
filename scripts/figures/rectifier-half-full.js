import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('rectifier-half-full');

  // 1. Схема однополупериодного выпрямителя
  const f = new Fig(480, 250, 'Однополупериодный выпрямитель');
  f.circle(60, 120, 18, { width: 2.2 });
  f.text(60, 126, '~', { anchor: 'middle', size: 22, weight: 700 });
  sch.wire(f, [[60, 102], [60, 70], [110, 70]]);
  sch.diode(f, 150, 70, { len: 80, name: 'VD', off: 26 });
  sch.wire(f, [[190, 70], [330, 70], [330, 90]]);
  sch.resistor(f, 330, 120, { rot: 90, len: 60, name: 'Rн', off: 26 });
  sch.wire(f, [[330, 150], [330, 190], [60, 190], [60, 138]]);
  sch.voltage(f, 395, 78, 395, 182, 'Uвых', { color: C.accent, bend: -16 });
  f.text(240, 232, 'Положительные полуволны проходят, отрицательные отсекаются диодом', { anchor: 'middle', size: 13, fill: C.muted });
  f.save(out('rectifier-half-full', 'half-wave'));

  // 2. Три временные диаграммы: вход, однополупериодный, двухполупериодный (без учёта падения на диодах)
  const g = new Fig(480, 420, 'Формы напряжения при выпрямлении');
  const x0 = 70, w = 390, T = 20, tmax = 40;
  const X = t => x0 + t / tmax * w;
  const panels = [
    ['Вход: синусоида, пик Um = 10 В', t => 10 * Math.sin(2 * Math.PI * t / T), C.muted, null],
    ['Однополупериодный: Uср = Um/π = 3,18 В', t => Math.max(0, 10 * Math.sin(2 * Math.PI * t / T)), C.accent, 10 / Math.PI],
    ['Двухполупериодный: Uср = 2Um/π = 6,37 В', t => Math.abs(10 * Math.sin(2 * Math.PI * t / T)), C.bad, 20 / Math.PI],
  ];
  panels.forEach(([title, fn, color, avg], i) => {
    const top = 36 + i * 128, h = 84;
    const Y = v => top + h - (v + 10) / 20 * h;
    g.text(x0, top - 10, title, { size: 13, weight: 700, fill: color });
    g.line(x0, top, x0, top + h, { width: 1.5 });
    g.line(x0, Y(0), x0 + w, Y(0), { stroke: C.muted, width: 1.2 });
    const pts = [];
    for (let k = 0; k <= 400; k++) pts.push([X(k * tmax / 400), Y(fn(k * tmax / 400))]);
    g.poly(pts, { stroke: color, width: 2.8 });
    if (avg !== null) g.line(x0, Y(avg), x0 + w, Y(avg), { stroke: C.ok, width: 2, dash: '7 5' });
    g.text(x0 - 6, Y(10) + 4, '10', { anchor: 'end', size: 11, fill: C.muted });
    g.text(x0 - 6, Y(0) + 4, '0', { anchor: 'end', size: 11, fill: C.muted });
  });
  [0, 10, 20, 30, 40].forEach(t => g.text(X(t), 414, String(t), { anchor: 'middle', size: 11, fill: C.muted }));
  g.text(x0 + w, 402, 'мс', { anchor: 'end', size: 11, fill: C.muted });
  g.text(x0 + w, 28, 'зелёный пунктир — среднее', { anchor: 'end', size: 11, fill: C.ok });
  g.save(out('rectifier-half-full', 'waveforms'));
}
