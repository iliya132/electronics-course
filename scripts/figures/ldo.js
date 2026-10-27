import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ldo');

  // 1. Схема включения LDO
  const f = new Fig(480, 260, 'Схема включения LDO');
  const y = 80;
  f.circle(22, y, 4.5, { fill: 'none' });
  f.text(22, y - 16, 'Uвх', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[26, y], [200, y]]);
  sch.node(f, 90, y);
  sch.wire(f, [[90, y], [90, y + 20]]);
  sch.capacitor(f, 90, y + 48, { rot: 90, len: 52, name: 'Cвх', off: 24 });
  sch.wire(f, [[90, y + 74], [90, 200]]);
  sch.gnd(f, 90, 200);
  f.rect(200, 52, 90, 56, { r: 8, width: 2.6, stroke: C.accent });
  f.text(245, 76, 'LDO', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(245, 96, '3,3 В', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(206, 46, 'IN', { size: 11, fill: C.muted });
  f.text(284, 46, 'OUT', { anchor: 'end', size: 11, fill: C.muted });
  sch.wire(f, [[245, 108], [245, 200]]);
  f.text(252, 130, 'GND', { size: 11, fill: C.muted });
  sch.gnd(f, 245, 200);
  sch.wire(f, [[290, y], [450, y]]);
  sch.node(f, 380, y);
  sch.wire(f, [[380, y], [380, y + 20]]);
  sch.capacitor(f, 380, y + 48, { rot: 90, len: 52, name: 'Cвых', off: 24 });
  sch.wire(f, [[380, y + 74], [380, 200]]);
  sch.gnd(f, 380, 200);
  f.circle(454, y, 4.5, { fill: 'none' });
  f.text(454, y - 16, 'Uвых', { anchor: 'end', size: 13, weight: 700, fill: C.ok });
  f.text(240, 244, 'Конденсаторы ставят вплотную к выводам: типично 1–10 мкФ, смотри даташит', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('ldo', 'wiring'));

  // 2. Таблица сравнения
  const g = new Fig(480, 250, 'Сравнение линейных стабилизаторов');
  const cols = [[12, 'Тип', 'start'], [132, 'Dropout', 'start'], [212, 'Ток покоя', 'start'], [304, 'Iвых', 'start'], [366, 'Cвых', 'start']];
  const rows = [
    ['7805', '≈ 2 В', '≈ 5 мА', '1 А', '0,1 мкФ'],
    ['AMS1117-3.3', '≈ 1,1 В', '5–10 мА', '0,8 А', '≥ 10 мкФ, ESR'],
    ['AP2112K-3.3', '≈ 0,25 В', '≈ 55 мкА', '0,6 А', '1 мкФ, керам.'],
    ['MCP1700-3.3', '≈ 0,18 В', '≈ 1,6 мкА', '0,25 А', '1 мкФ, керам.'],
  ];
  g.text(240, 26, 'Типичные значения (проверяй даташит)', { anchor: 'middle', size: 15, weight: 700 });
  g.rect(8, 40, 464, 30, { r: 6, fill: C.surface, stroke: C.grid, width: 1.2 });
  cols.forEach(([x, t]) => g.text(x, 60, t, { size: 13, weight: 700 }));
  rows.forEach((r, i) => {
    const yy = 94 + i * 38;
    g.line(8, yy + 14, 472, yy + 14, { stroke: C.grid, width: 1 });
    r.forEach((t, j) => g.text(cols[j][0], yy, t, { size: 12.5, weight: j === 0 ? 700 : 400, fill: j === 2 && i > 1 ? C.ok : C.ink }));
  });
  g.text(240, 244, 'Меньше dropout и ток покоя — лучше для батарейных устройств', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('ldo', 'compare'));
}
