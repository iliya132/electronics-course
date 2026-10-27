import { Fig, C, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('units-prefixes');

  // 1. Лестница приставок
  const rows = [
    ['Г', 'гига', '10⁹', 'ГГц — частота процессора'],
    ['М', 'мега', '10⁶', 'МОм, МГц — 16 МГц у Arduino'],
    ['к', 'кило', '10³', 'кОм — типичные резисторы'],
    ['', 'основная', '1', 'А, В, Ом, Вт, Ф, Гн'],
    ['м', 'милли', '10⁻³', 'мА — токи светодиодов'],
    ['мк', 'микро', '10⁻⁶', 'мкФ, мкА — ток во сне МК'],
    ['н', 'нано', '10⁻⁹', 'нФ — 100 нФ рядом с МК'],
    ['п', 'пико', '10⁻¹²', 'пФ — 22 пФ у кварца'],
  ];
  const f = new Fig(480, 372, 'Лестница приставок СИ');
  f.text(240, 24, 'Каждая ступень вниз — в 1000 раз меньше', { anchor: 'middle', size: 17, weight: 600 });
  rows.forEach(([sym, name, pw, use], i) => {
    const y = 40 + i * 40, base = sym === '';
    f.rect(16, y, 66, 32, { fill: base ? C.accent : C.surface, stroke: base ? C.accent : C.muted, r: 6 });
    f.text(49, y + 22, base ? '1' : sym, { anchor: 'middle', size: 20, weight: 700, fill: base ? '#fff' : C.ink });
    f.text(94, y + 22, name, { size: 15, fill: C.muted });
    f.text(176, y + 22, pw, { size: 17, weight: 700, fill: i < 3 ? C.ok : i === 3 ? C.accent : C.bad });
    f.text(246, y + 22, use, { size: 14 });
  });
  f.save(out('units-prefixes', 'ladder'));

  // 2. Согласованные наборы единиц
  const g = new Fig(480, 300, 'Наборы единиц, в которых не нужно ничего переводить');
  g.text(240, 26, 'Если брать эти единицы вместе, перевод не нужен', { anchor: 'middle', size: 17, weight: 600 });
  const cards = [
    ['В  /  кОм  =  мА', 'напряжение, сопротивление → ток', C.accent],
    ['мА  ×  кОм  =  В', 'ток, сопротивление → напряжение', C.warn],
    ['В  ×  мА  =  мВт', 'напряжение, ток → мощность', C.ok],
    ['В  /  МОм  =  мкА', 'для очень больших сопротивлений', C.bad],
  ];
  cards.forEach(([formula, note, color], i) => {
    const y = 44 + i * 62;
    g.rect(20, y, 440, 54, { stroke: color, width: 2.5, r: 8 });
    g.text(40, y + 28, formula, { size: 22, weight: 700, fill: color });
    g.text(40, y + 46, note, { size: 13, fill: C.muted });
  });
  g.save(out('units-prefixes', 'consistent-units'));
}
