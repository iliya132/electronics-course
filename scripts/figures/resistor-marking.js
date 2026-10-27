import { Fig, C, out, fresh } from '../lib/fig.js';

const COLORS = [
  ['чёрный', '#111111', 0], ['коричневый', '#80502d', 1], ['красный', '#c52626', 2], ['оранжевый', '#eb7d1c', 3], ['жёлтый', '#e5c834', 4],
  ['зелёный', '#2b8b45', 5], ['синий', '#2b58ad', 6], ['фиолетовый', '#853e95', 7], ['серый', '#888888', 8], ['белый', '#ffffff', 9],
];

export function generate() {
  fresh('resistor-marking');

  // 1. Цвета и пример резистора
  const f = new Fig(480, 360, 'Цветовой код резисторов');
  COLORS.forEach(([name, hex, d], i) => {
    const x = 14 + (i % 5) * 94, y = 14 + Math.floor(i / 5) * 84;
    f.rect(x, y, 82, 34, { fill: hex, stroke: C.muted, r: 6, width: 1.5 });
    f.text(x + 41, y + 58, String(d), { anchor: 'middle', size: 18, weight: 700 });
    f.text(x + 41, y + 74, name, { anchor: 'middle', size: 11, fill: C.muted });
  });
  const by = 262;
  f.line(24, by, 456, by, { width: 3 });
  f.rect(110, by - 28, 260, 56, { fill: '#e4c99e', stroke: C.muted, r: 24, width: 2 });
  [[148, '#c52626'], [186, '#c52626'], [224, '#80502d'], [316, '#c9a227']].forEach(([x, col]) => f.rect(x, by - 28, 16, 56, { fill: col, stroke: 'none', r: 0 }));
  f.text(156, by - 38, '2', { anchor: 'middle', size: 15, weight: 700 });
  f.text(194, by - 38, '2', { anchor: 'middle', size: 15, weight: 700 });
  f.text(232, by - 38, '×10', { anchor: 'middle', size: 15, weight: 700 });
  f.text(324, by - 38, '±5 %', { anchor: 'middle', size: 15, weight: 700 });
  f.text(240, 322, '22 × 10 = 220 Ом, допуск ±5 %', { anchor: 'middle', size: 16, weight: 700, fill: C.accent });
  f.text(240, 346, 'четвёртая золотая полоса означает допуск ±5 %', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('resistor-marking', 'colors'));

  // 2. Ряды E12 и E24 на логарифмической шкале
  const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const e24x = [11, 13, 16, 20, 24, 30, 36, 43, 51, 62, 75, 91];
  const g = new Fig(480, 230, 'Ряды E12 и E24 на логарифмической шкале');
  const X = v => 36 + (Math.log10(v) - 1) * 410;
  g.text(240, 24, 'Номиналы растут «по процентам», а не поровну', { anchor: 'middle', size: 16, weight: 700 });
  g.line(30, 96, 456, 96, { width: 1.5, stroke: C.muted });
  g.line(30, 176, 456, 176, { width: 1.5, stroke: C.muted });
  e12.forEach(v => { g.dot(X(v), 96, 6, C.accent); g.text(X(v), 120, String(v), { anchor: 'middle', size: 12, weight: 700, fill: C.accent }); });
  [...e12, ...e24x].forEach(v => g.dot(X(v), 176, 5, e24x.includes(v) ? C.ok : C.accent));
  e24x.forEach(v => g.text(X(v), 200, String(v), { anchor: 'middle', size: 11, fill: C.ok, weight: 700 }));
  g.text(30, 68, 'E12 (допуск ±10 %): 12 значений на декаду', { size: 14, fill: C.accent, weight: 700 });
  g.text(30, 150, 'E24 (±5 %): добавлены зелёные', { size: 14, fill: C.ok, weight: 700 });
  g.text(450, 220, 'Ом ×10, ×100, ×1000 …', { anchor: 'end', size: 12, fill: C.muted });
  g.save(out('resistor-marking', 'e-series'));

  // 3. SMD-коды
  const chips = [
    ['103', '10 × 10³', '10 кОм'],
    ['472', '47 × 10²', '4,7 кОм'],
    ['4R7', 'R — запятая', '4,7 Ом'],
    ['1002', '100 × 10²', '10 кОм'],
    ['01C', 'EIA-96', '10 кОм'],
  ];
  const s = new Fig(480, 220, 'Коды SMD-резисторов');
  s.text(240, 24, 'Коды на SMD-резисторах', { anchor: 'middle', size: 16, weight: 700 });
  chips.forEach(([code, how, value], i) => {
    const x = 12 + i * 94;
    s.rect(x, 44, 84, 52, { fill: '#222', stroke: C.muted, r: 4, width: 1.5 });
    s.rect(x - 2, 44, 10, 52, { fill: '#b7b7b7', stroke: 'none', r: 2 });
    s.rect(x + 76, 44, 10, 52, { fill: '#b7b7b7', stroke: 'none', r: 2 });
    s.text(x + 42, 78, code, { anchor: 'middle', size: 22, weight: 700, fill: '#ffffff' });
    s.text(x + 42, 122, how, { anchor: 'middle', size: 12, fill: C.muted });
    s.text(x + 42, 150, value, { anchor: 'middle', size: 16, weight: 700, fill: C.accent });
  });
  s.text(240, 196, 'Последняя цифра трёхзначного кода — число нулей (степень десяти)', { anchor: 'middle', size: 13, fill: C.muted });
  s.save(out('resistor-marking', 'smd'));
}
