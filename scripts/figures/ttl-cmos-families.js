import { Fig, C, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ttl-cmos-families');

  // 1. Диапазоны питания
  const f = new Fig(720, 330, 'Диапазоны питания семейств микросхем');
  const rows = [['74HC', 2, 6, C.accent], ['74HCT', 4.5, 5.5, C.warn], ['74LVC', 1.65, 3.6, C.ok], ['74AHC', 2, 5.5, C.accent], ['74LS (TTL)', 4.75, 5.25, C.muted]];
  const X = v => 150 + v / 7 * 520;
  [0, 1, 2, 3, 4, 5, 6, 7].forEach(v => {
    f.line(X(v), 54, X(v), 262, { stroke: C.grid, width: 1.4 });
    f.text(X(v), 284, String(v), { anchor: 'middle', size: 12, fill: C.muted });
  });
  f.text(X(7) + 4, 300, 'В', { size: 12, fill: C.muted });
  rows.forEach(([n, a, b, col], i) => {
    const y = 60 + i * 40;
    f.text(20, y + 20, n, { size: 14, weight: 700 });
    f.rect(X(a), y + 4, X(b) - X(a), 22, { fill: col, stroke: 'none', r: 4, opacity: 0.55 });
    f.text(X(b) + 6, y + 20, `${String(a).replace('.', ',')}…${String(b).replace('.', ',')} В`, { size: 12, fill: C.muted });
  });
  f.text(360, 28, 'рабочий диапазон питания по типовым даташитам', { anchor: 'middle', size: 13, weight: 600 });
  f.save(out('ttl-cmos-families', 'supply'));

  // 2. Типовая задержка
  const g = new Fig(720, 300, 'Типовая задержка вентиля при питании 5 В');
  const d = [['74LS', 10], ['74HC', 8], ['74HCT', 8], ['74AHC', 4], ['74LVC', 3]];
  d.forEach(([n, ns], i) => {
    const y = 40 + i * 46;
    g.text(20, y + 20, n, { size: 14, weight: 700 });
    g.rect(110, y + 4, ns * 50, 24, { fill: C.accent, stroke: 'none', r: 4, opacity: 0.5 });
    g.text(110 + ns * 50 + 8, y + 22, `${ns} нс`, { size: 13, weight: 700 });
  });
  g.text(360, 28, 'порядок величин: меньше — быстрее; значения типовые, проверяй даташит', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('ttl-cmos-families', 'delay'));
}
