import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('capacitor-types');

  // 1. Потеря ёмкости керамики от постоянного смещения (иллюстративно)
  const x5r = u => 100 * (1 - 0.7 * Math.pow(Math.min(u, 6.3) / 6.3, 1.1));
  const x7r = u => 100 * (1 - 0.45 * Math.pow(u / 16, 1.2));
  const g = chart({
    title: 'Ёмкость керамики при напряжении смещения',
    xLabel: 'Постоянное напряжение на конденсаторе, В', yLabel: 'Остаётся от номинала, %',
    xRange: [0, 6.5], yRange: [0, 110], yTicks: [0, 25, 50, 75, 100],
    series: [
      { label: 'C0G (стабильный)', fn: () => 100, color: C.ok },
      { label: 'X7R, 16 В, 10 мкФ', fn: x7r, color: C.accent },
      { label: 'X5R, 6,3 В, 10 мкФ', fn: x5r, color: C.bad },
    ],
    legendAt: { x: 90, y: 236, cols: 1 },
    markers: [
      { x: 5, y: x5r(5), label: '5 В: около 46 %', dx: -8, dy: 22, anchor: 'end', color: C.bad },
      { x: 3.3, y: x5r(3.3), label: '3,3 В: 66 %', dx: 8, dy: -10, color: C.bad },
    ],
  });
  g.save(out('capacitor-types', 'dc-bias'));

  // 2. Таблица сравнения
  const f = new Fig(480, 330, 'Сравнение типов конденсаторов');
  const cols = [[8, 'Тип'], [132, 'Ёмкость'], [238, 'Полярн.'], [292, 'Главное']];
  const rows = [
    ['Керамика (MLCC)', '1 пФ – 100 мкФ', 'нет', 'малый ESR, для развязки, C падает'],
    ['Алюм. электролит', '1 – 10 000 мкФ', 'да', 'большая ёмкость, ESR выше, старение'],
    ['Тантал', '1 – 470 мкФ', 'да', 'компактный, боится перенапряжения'],
    ['Плёночный', '100 пФ – 10 мкФ', 'нет', 'точный, стабильный, фильтры, аудио'],
    ['Ионистор', '0,1 – 100 Ф', 'да', '2,7 В, резервное питание, ESR велик'],
  ];
  f.rect(4, 6, 472, 30, { fill: C.surface, r: 4, width: 1.5, stroke: C.muted });
  cols.forEach(([x, t]) => f.text(x, 26, t, { size: 13, weight: 700 }));
  rows.forEach((r, i) => {
    const y = 44 + i * 56;
    f.rect(4, y, 472, 50, { r: 4, width: 1, stroke: C.grid });
    f.text(8, y + 22, r[0], { size: 13, weight: 700, fill: C.accent });
    f.text(132, y + 22, r[1], { size: 12 });
    f.text(238, y + 22, r[2], { size: 12, fill: r[2] === 'да' ? C.bad : C.ok, weight: 700 });
    const [first, ...rest] = r[3].split(', ');
    f.text(292, y + 20, first, { size: 11.5 });
    if (rest.length) f.text(292, y + 36, rest.join(', '), { size: 11.5 });
  });
  f.save(out('capacitor-types', 'comparison'));
}
