import { Fig, C, out, fresh } from '../lib/fig.js';

// Условное обозначение по ГОСТ: прямоугольник с символом функции
function gate(f, x, y, sym, name, { inv = false, two = true } = {}) {
  f.rect(x, y, 70, 64, { r: 4, width: 2.4 });
  f.text(x + 35, y + 40, sym, { anchor: 'middle', size: 22, weight: 700 });
  f.line(x - 24, y + (two ? 20 : 32), x, y + (two ? 20 : 32));
  if (two) f.line(x - 24, y + 44, x, y + 44);
  f.line(x + 70 + (inv ? 10 : 0), y + 32, x + 100, y + 32);
  if (inv) f.circle(x + 75, y + 32, 5, { width: 2 });
  f.text(x + 35, y + 90, name, { anchor: 'middle', size: 14, weight: 700 });
}

export function generate() {
  fresh('logic-gates');

  // 1. Шесть вентилей
  const f = new Fig(760, 330, 'Условные обозначения логических вентилей');
  const items = [['&', 'И (AND)', false, true], ['1', 'ИЛИ (OR)', false, true], ['1', 'НЕ (NOT)', true, false], ['&', 'И-НЕ (NAND)', true, true], ['1', 'ИЛИ-НЕ (NOR)', true, true], ['=1', 'XOR', false, true]];
  items.forEach(([sym, name, inv, two], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 50 + col * 250, y = 30 + row * 150;
    const s = name.startsWith('ИЛИ') ? '≥1' : sym;
    gate(f, x, y, s, name, { inv: inv && name !== 'И-НЕ (NAND)' && name !== 'ИЛИ-НЕ (NOR)' ? true : inv, two });
  });
  f.save(out('logic-gates', 'symbols'));

  // 2. Полусумматор из XOR и AND
  const g = new Fig(720, 330, 'Полусумматор: сумма на XOR, перенос на AND');
  gate(g, 200, 40, '=1', 'XOR', {});
  gate(g, 200, 170, '&', 'AND', {});
  g.text(40, 76, 'A', { size: 16, weight: 700 });
  g.text(40, 206, 'B', { size: 16, weight: 700 });
  g.line(70, 60, 176, 60); g.line(70, 84, 176, 84);
  g.line(70, 190, 176, 190); g.line(70, 214, 176, 214);
  g.circle(70, 60, 4, { fill: 'none' });
  g.line(70, 60, 70, 190, { dash: '3 4', width: 1.6 });
  g.line(70, 84, 70, 214, { dash: '3 4', width: 1.6 });
  g.text(310, 76, 'S = A ⊕ B', { size: 15, weight: 700, fill: C.accent });
  g.text(310, 206, 'C = A · B', { size: 15, weight: 700, fill: C.ok });
  // таблица
  const rows = [['A', 'B', 'S', 'C'], [0, 0, 0, 0], [0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1]];
  rows.forEach((r, i) => r.forEach((v, j) => g.text(500 + j * 50, 70 + i * 36, String(v), { anchor: 'middle', size: 16, weight: i ? 400 : 700, fill: i ? C.ink : C.muted })));
  g.line(480, 82, 680, 82, { width: 1.6 });
  g.text(590, 40, 'таблица истинности', { anchor: 'middle', size: 13, fill: C.muted });
  g.text(500, 270, '1 + 1 = 10₂: сумма 0, перенос 1', { size: 13, fill: C.muted });
  g.save(out('logic-gates', 'half-adder'));
}
