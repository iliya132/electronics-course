import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('continuity-tester');

  // 1. Схема прозвонки
  const f = new Fig(480, 300, 'Схема прозвонки: батарейки, резистор, светодиод и два щупа');
  const L = 60, T = 70, B = 240, mid = 155;
  sch.battery(f, L, mid, { rot: 90, name: '3 В', off: -28 });
  sch.wire(f, [[L, mid - 40], [L, T], [90, T]]);
  sch.resistor(f, 130, T, { name: 'R = 100 Ом' });
  sch.wire(f, [[170, T], [210, T]]);
  sch.diode(f, 250, T, { led: true, name: 'светодиод' });
  sch.wire(f, [[290, T], [400, T], [400, 118]]);
  f.circle(400, 124, 5, { fill: 'none' });
  f.text(412, 128, 'щуп A', { size: 14, weight: 700 });
  f.circle(400, 186, 5, { fill: 'none' });
  f.text(412, 192, 'щуп B', { size: 14, weight: 700 });
  sch.wire(f, [[400, 192], [400, B], [L, B], [L, mid + 40]]);
  f.rect(372, 134, 100, 42, { stroke: C.accent, dash: '6 5', r: 8, width: 1.8 });
  f.text(422, 152, 'проверяемая', { anchor: 'middle', size: 12, fill: C.accent, weight: 600 });
  f.text(422, 167, 'цепь', { anchor: 'middle', size: 12, fill: C.accent, weight: 600 });
  sch.current(f, 330, T, 'right', 'I ≈ 10 мА', { color: C.ok, off: -14, len: 34 });
  f.text(240, 282, 'Цепь замкнута щупами или целым проводом: светодиод светится', { anchor: 'middle', size: 14, fill: C.muted });
  f.save(out('continuity-tester', 'circuit'));

  // 2. Четыре случая
  const g = new Fig(480, 300, 'Что показывает прозвонка в четырёх случаях');
  const cards = [
    { t: 'Целый провод', lit: true, kind: 'wire' },
    { t: 'Оборванный провод', lit: false, kind: 'broken' },
    { t: 'Целый предохранитель', lit: true, kind: 'fuse' },
    { t: 'Перегоревший предохранитель', lit: false, kind: 'fusebroken' },
  ];
  cards.forEach((c, i) => {
    const x = 16 + (i % 2) * 236, y = 14 + Math.floor(i / 2) * 140;
    g.rect(x, y, 220, 124, { r: 10, width: 1.8, stroke: C.muted });
    g.text(x + 110, y + 26, c.t, { anchor: 'middle', size: 13, weight: 700 });
    const ly = y + 72;
    g.line(x + 16, ly, x + 62, ly);
    if (c.kind === 'wire') g.line(x + 62, ly, x + 114, ly);
    if (c.kind === 'broken') { g.line(x + 62, ly, x + 84, ly); g.line(x + 98, ly, x + 114, ly); g.text(x + 91, ly + 6, '×', { anchor: 'middle', size: 22, fill: C.bad, weight: 700 }); }
    if (c.kind === 'fuse') { g.rect(x + 62, ly - 9, 44, 18, { r: 3, width: 2 }); g.line(x + 62, ly, x + 106, ly, { width: 1.5 }); }
    if (c.kind === 'fusebroken') { g.rect(x + 62, ly - 9, 44, 18, { r: 3, width: 2 }); g.line(x + 62, ly, x + 78, ly, { width: 1.5 }); g.line(x + 90, ly, x + 106, ly, { width: 1.5 }); }
    g.line(x + 106, ly, x + 124, ly);
    if (c.kind === 'wire') g.line(x + 114, ly, x + 124, ly);
    // светодиод
    const cx = x + 170, cy = ly;
    g.circle(cx, cy, 16, { stroke: c.lit ? C.warn : C.muted, fill: c.lit ? C.warn : 'none', width: 2.2, opacity: 1 });
    if (c.lit) {
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4;
        g.line(cx + Math.cos(ang) * 22, cy + Math.sin(ang) * 22, cx + Math.cos(ang) * 30, cy + Math.sin(ang) * 30, { stroke: C.warn, width: 2.5 });
      }
    }
    g.text(x + 210, y + 114, c.lit ? 'светится: цепь есть' : 'не светится: обрыв', { anchor: 'end', size: 12, fill: c.lit ? C.ok : C.bad, weight: 700 });
  });
  g.save(out('continuity-tester', 'cases'));
}
