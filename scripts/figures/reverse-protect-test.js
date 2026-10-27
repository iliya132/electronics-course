import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('reverse-protect-test');

  // 1. Схема измерения
  const f = new Fig(480, 280, 'Схема измерения защиты от переполюсовки');
  sch.battery(f, 50, 140, { rot: 90 });
  f.text(50, 190, '4×AA ≈ 6 В', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[50, 100], [50, 60], [110, 60]]);
  f.rect(110, 36, 130, 48, { r: 8, width: 2.4, dash: '6 4' });
  f.text(175, 56, 'защита', { anchor: 'middle', size: 13, weight: 700 });
  f.text(175, 74, 'Si / Шоттки / P-MOSFET', { anchor: 'middle', size: 11, fill: C.muted });
  sch.node(f, 300, 60);
  sch.wire(f, [[240, 60], [380, 60]]);
  sch.wire(f, [[380, 60], [380, 100]]);
  sch.resistor(f, 380, 140, { rot: 90, len: 70, name: '33 Ом', off: 14 });
  sch.wire(f, [[380, 175], [380, 220], [50, 220], [50, 180]]);
  f.circle(300, 140, 18, { width: 2.2 });
  f.text(300, 146, 'V', { anchor: 'middle', size: 16, weight: 700 });
  sch.wire(f, [[300, 60], [300, 122]]);
  sch.wire(f, [[300, 158], [300, 220]]);
  sch.node(f, 300, 220);
  f.text(250, 252, 'Меряем Uнагр и Uбат, потом меняем полярность батареи', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('reverse-protect-test', 'setup'));

  // 2. Ожидаемые потери: столбики
  const g = new Fig(480, 300, 'Ожидаемые потери в защите при 6 В и 33 Ом');
  g.text(240, 26, 'Ожидаемые потери в защите (расчёт)', { anchor: 'middle', size: 16, weight: 700 });
  const items = [
    ['1N4007', 0.65 * 0.162, C.bad, '0,65 В · 0,16 А'],
    ['1N5819', 0.30 * 0.173, C.warn, '0,30 В · 0,17 А'],
    ['IRF9540N', 0.03 * 0.18, C.accent, '0,03 В · 0,18 А'],
  ];
  const x0 = 70, base = 230, scale = 1200;
  g.line(x0, base, 450, base, { width: 1.5 });
  items.forEach(([name, w, col, note], i) => {
    const x = x0 + 24 + i * 120, h = w * scale;
    g.rect(x, base - h, 70, h, { fill: col, stroke: col, r: 3 });
    g.text(x + 35, base - h - 8, `${(w * 1000).toFixed(0)} мВт`, { anchor: 'middle', size: 14, weight: 700, fill: col });
    g.text(x + 35, base + 20, name, { anchor: 'middle', size: 13, weight: 700 });
    g.text(x + 35, base + 38, note, { anchor: 'middle', size: 10.5, fill: C.muted });
  });
  g.text(x0 - 8, 52, 'Pпотерь', { anchor: 'start', size: 11, fill: C.muted });
  g.text(240, 286, 'Vf постоянно; Rds(on) ≈ 0,17 Ом при Vgs = −6 В (приблизительно)', { anchor: 'middle', size: 11, fill: C.muted });
  g.save(out('reverse-protect-test', 'expected'));
}
