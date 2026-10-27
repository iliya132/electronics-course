import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('buck-vs-linear');

  // 1. Схема измерений
  const f = new Fig(480, 280, 'Измерение КПД стабилизатора');
  const yT = 80, yB = 220;
  f.rect(10, 110, 70, 60, { r: 8, width: 2.4, stroke: C.warn });
  f.text(45, 138, 'адаптер', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  f.text(45, 156, '12 В DC', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[45, 110], [45, yT], [110, yT]]);
  f.circle(130, yT, 20, { width: 2.2 });
  f.text(130, yT + 6, 'A', { anchor: 'middle', size: 16, weight: 700 });
  f.text(130, yT - 26, 'Iвх', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[150, yT], [210, yT]]);
  sch.node(f, 180, yT);
  sch.wire(f, [[180, yT], [180, 118]]);
  f.circle(180, 138, 18, { width: 2.2 });
  f.text(180, 144, 'V', { anchor: 'middle', size: 15, weight: 700 });
  sch.wire(f, [[180, 156], [180, yB]]);
  f.rect(210, 52, 100, 56, { r: 8, width: 2.6, stroke: C.accent });
  f.text(260, 76, '7805 или', { anchor: 'middle', size: 13, weight: 700, fill: C.accent });
  f.text(260, 94, 'buck-модуль', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
  sch.wire(f, [[260, 108], [260, yB]]);
  sch.wire(f, [[310, yT], [440, yT]]);
  sch.node(f, 350, yT);
  sch.wire(f, [[350, yT], [350, 118]]);
  f.circle(350, 138, 18, { width: 2.2 });
  f.text(350, 144, 'V', { anchor: 'middle', size: 15, weight: 700 });
  sch.wire(f, [[350, 156], [350, yB]]);
  sch.node(f, 420, yT);
  sch.wire(f, [[420, yT], [420, 112]]);
  sch.resistor(f, 420, 148, { rot: 90, len: 60, name: 'Rн', off: -34 });
  sch.wire(f, [[420, 178], [420, yB]]);
  sch.wire(f, [[45, 170], [45, yB], [440, yB]]);
  f.text(240, 262, 'Rн: 16,5 Ом (≈ 0,3 А) и 8,25 Ом (≈ 0,6 А), КПД = Uвых·Iвых / (Uвх·Iвх)', { anchor: 'middle', size: 11.5, fill: C.muted });
  f.save(out('buck-vs-linear', 'setup'));

  // 2. Ожидаемое тепло в стабилизаторе при 12 → 5 В
  const g = new Fig(480, 300, 'Ожидаемое тепло в стабилизаторе');
  g.text(240, 26, 'Ожидаемые потери при 12 → 5 В (расчёт)', { anchor: 'middle', size: 16, weight: 700 });
  const base = 232, scale = 36; // Вт → px
  g.line(60, base, 450, base, { width: 1.5 });
  g.line(60, 50, 60, base, { width: 1.5 });
  [0, 1, 2, 3, 4].forEach(v => {
    g.text(52, base - v * scale + 4, String(v), { anchor: 'end', size: 11, fill: C.muted });
    g.line(60, base - v * scale, 450, base - v * scale, { stroke: C.grid, width: 1 });
  });
  g.text(52, 46, 'Вт', { anchor: 'end', size: 11, fill: C.muted });
  const groups = [
    ['0,3 А', [[2.1, C.bad, '7805'], [0.2, C.ok, 'buck']]],
    ['0,6 А', [[4.2, C.bad, '7805'], [0.41, C.ok, 'buck']]],
  ];
  groups.forEach(([name, bars], gi) => {
    const gx = 100 + gi * 190;
    bars.forEach(([v, col, lab], bi) => {
      const x = gx + bi * 70, h = v * scale;
      g.rect(x, base - h, 56, h, { fill: col, stroke: col, r: 3 });
      g.text(x + 28, base - h - 6, `${String(v).replace('.', ',')} Вт`, { anchor: 'middle', size: 12, weight: 700, fill: col });
      g.text(x + 28, base + 18, lab, { anchor: 'middle', size: 12, weight: 700 });
    });
    g.text(gx + 63, base + 38, name, { anchor: 'middle', size: 13, weight: 700, fill: C.muted });
  });
  g.text(240, 288, 'КПД по расчёту: 7805 ≈ 41 %, buck-модуль ≈ 88 % (принято)', { anchor: 'middle', size: 11.5, fill: C.muted });
  g.save(out('buck-vs-linear', 'expected'));
}
