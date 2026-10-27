import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('switching-practical');

  // 1. Плохая и хорошая трассировка горячей петли (вид сверху, схематично)
  const f = new Fig(480, 300, 'Петля тока входного конденсатора');
  const panel = (x0, good) => {
    const col = good ? C.ok : C.bad;
    f.text(x0 + 110, 26, good ? 'Хорошо: конденсатор вплотную' : 'Плохо: конденсатор далеко', { anchor: 'middle', size: 13, weight: 700, fill: col });
    f.rect(x0 + 100, 90, 80, 60, { r: 6, width: 2.4 });
    f.text(x0 + 140, 125, 'IC', { anchor: 'middle', size: 14, weight: 700 });
    f.text(x0 + 92, 108, 'VIN', { anchor: 'end', size: 10, fill: C.muted });
    f.text(x0 + 92, 142, 'GND', { anchor: 'end', size: 10, fill: C.muted });
    if (good) {
      f.rect(x0 + 62, 96, 24, 48, { r: 4, width: 2.2, stroke: C.accent });
      f.text(x0 + 74, 124, 'C', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
      f.poly([[x0 + 86, 104], [x0 + 100, 104], [x0 + 100, 136], [x0 + 86, 136]], { stroke: col, width: 2, close: true, fill: col, opacity: 0.35 });
      f.text(x0 + 110, 200, 'петля ≈ 0,3 см²', { anchor: 'middle', size: 12, weight: 700, fill: col });
      f.text(x0 + 110, 220, 'выбросы малы', { anchor: 'middle', size: 12, fill: C.muted });
    } else {
      f.rect(x0 + 10, 200, 24, 48, { r: 4, width: 2.2, stroke: C.accent });
      f.text(x0 + 22, 228, 'C', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
      f.poly([[x0 + 22, 200], [x0 + 22, 104], [x0 + 100, 104], [x0 + 100, 136], [x0 + 46, 136], [x0 + 46, 248], [x0 + 22, 248]], { stroke: col, width: 2, close: true, fill: col, opacity: 0.3 });
      f.text(x0 + 140, 228, 'петля ≈ 6 см²', { anchor: 'middle', size: 12, weight: 700, fill: col });
      f.text(x0 + 140, 248, 'выбросы и излучение', { anchor: 'middle', size: 12, fill: C.muted });
    }
  };
  panel(0, false);
  panel(240, true);
  f.line(240, 44, 240, 270, { stroke: C.grid, width: 1.5 });
  f.text(240, 290, 'Заливка — площадь контура, по которому текут быстрые токи переключения', { anchor: 'middle', size: 11.5, fill: C.muted });
  f.save(out('switching-practical', 'loop'));

  // 2. Индуктивность дросселя при насыщении (иллюстративная модель)
  const L0 = 100, Isat = 2.5;
  const Lf = i => L0 / (1 + Math.pow(i / (Isat * 1.15), 6));
  const g = chart({
    title: 'Насыщение дросселя (иллюстрация)',
    xLabel: 'Ток через дроссель, А', yLabel: 'Индуктивность, мкГн',
    xRange: [0, 5], yRange: [0, 110],
    series: [{ fn: Lf, color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: Isat, label: 'Isat = 2,5 А', color: C.bad }],
    notes: [{ x: 3.2, y: 60, text: 'выше Isat L падает,\nток растёт лавиной', color: C.muted }],
    samples: 300,
  });
  g.save(out('switching-practical', 'saturation'));
}
