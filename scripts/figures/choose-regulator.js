import { Fig, C, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('choose-regulator');

  // 1. Дерево решений
  const f = new Fig(480, 330, 'Дерево выбора стабилизатора');
  const box = (x, y, w, h, t, col = C.ink, bold = false) => {
    f.rect(x, y, w, h, { r: 8, width: 2.2, stroke: col });
    const ls = t.split('\n');
    ls.forEach((s, i) => f.text(x + w / 2, y + h / 2 + 4 + (i - (ls.length - 1) / 2) * 15, s, { anchor: 'middle', size: 12, weight: bold ? 700 : 400, fill: col }));
  };
  box(150, 14, 180, 40, 'Uвх всегда выше Uвых?', C.ink, true);
  // нет → boost / buck-boost
  f.arrow(150, 34, 70, 34, { width: 2 });
  f.text(110, 28, 'нет', { anchor: 'middle', size: 11, weight: 700, fill: C.bad });
  box(8, 14, 62, 40, 'boost /\nbuck-boost', C.bad);
  // да → потери
  f.arrow(240, 54, 240, 84, { width: 2 });
  f.text(250, 74, 'да', { size: 11, weight: 700, fill: C.ok });
  box(135, 84, 210, 44, '(Uвх − Uвых)·I меньше ≈ 0,5 Вт?', C.ink, true);
  // да → линейный
  f.arrow(135, 106, 80, 106, { width: 2 });
  f.text(108, 100, 'да', { anchor: 'middle', size: 11, weight: 700, fill: C.ok });
  box(8, 84, 72, 44, 'линейный\n(LDO)', C.accent);
  // нет → buck
  f.arrow(240, 128, 240, 160, { width: 2 });
  f.text(250, 150, 'нет', { size: 11, weight: 700, fill: C.bad });
  box(180, 160, 120, 36, 'buck', C.warn, true);
  // нужен ли малый шум
  f.arrow(240, 196, 240, 224, { width: 2 });
  box(110, 224, 260, 44, 'Нужен малый шум (АЦП, радио)?', C.ink, true);
  f.arrow(370, 246, 410, 246, { width: 2 });
  f.text(390, 240, 'да', { anchor: 'middle', size: 11, weight: 700, fill: C.ok });
  box(410, 224, 66, 44, 'buck +\nLDO', C.ok);
  f.arrow(110, 246, 70, 246, { width: 2 });
  f.text(90, 240, 'нет', { anchor: 'middle', size: 11, weight: 700, fill: C.bad });
  box(8, 224, 62, 44, 'только\nbuck', C.warn);
  f.text(240, 306, 'Грубая схема: окончательный выбор делают по даташитам и цене', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('choose-regulator', 'tree'));

  // 2. Таблица сравнения
  const g = new Fig(480, 270, 'Линейный и импульсный стабилизатор');
  g.text(240, 26, 'Линейный и импульсный: сравнение', { anchor: 'middle', size: 16, weight: 700 });
  const cols = [12, 138, 318];
  g.rect(8, 40, 464, 30, { r: 6, fill: C.surface, stroke: C.grid, width: 1.2 });
  ['', 'Линейный (LDO, 78xx)', 'Импульсный (buck)'].forEach((t, i) => g.text(cols[i], 60, t, { size: 13, weight: 700 }));
  const rows = [
    ['КПД', '≈ Uвых/Uвх (часто 40–70 %)', '85–95 %'],
    ['Шум на выходе', 'очень малый', 'есть ВЧ-рябь'],
    ['Повышение Uвых', 'невозможно', 'возможно (boost)'],
    ['Детали вокруг', '2 конденсатора', 'дроссель, диод, 2 C'],
    ['Цена и размер', 'меньше (при малой P)', 'выше / больше'],
    ['Тепло', 'сильно растёт с P', 'малое'],
  ];
  rows.forEach((r, i) => {
    const y = 96 + i * 28;
    g.line(8, y + 10, 472, y + 10, { stroke: C.grid, width: 1 });
    r.forEach((t, j) => g.text(cols[j], y, t, { size: 12, weight: j === 0 ? 700 : 400 }));
  });
  g.text(240, 264, 'Выбор зависит от разницы напряжений, тока и требований к шуму', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('choose-regulator', 'compare'));
}
