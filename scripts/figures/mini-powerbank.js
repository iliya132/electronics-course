import { Fig, C, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mini-powerbank');

  // 1. Блок-схема
  const f = new Fig(480, 280, 'Блок-схема мини-повербанка');
  const box = (x, y, w, h, l1, l2, col) => {
    f.rect(x, y, w, h, { r: 8, width: 2.4, stroke: col });
    f.text(x + w / 2, y + h / 2 - 2, l1, { anchor: 'middle', size: 12.5, weight: 700, fill: col });
    f.text(x + w / 2, y + h / 2 + 15, l2, { anchor: 'middle', size: 10.5, fill: C.muted });
  };
  box(10, 60, 78, 56, 'USB 5 В', 'зарядка', C.warn);
  box(122, 60, 100, 56, 'TP4056', 'заряд + защита', C.accent);
  box(256, 60, 78, 56, '18650', 'с защитой', C.ok);
  box(370, 60, 100, 56, 'boost', '3–4,2 → 5 В', C.accent);
  f.arrow(88, 88, 122, 88, { width: 2.4 });
  f.arrow(222, 88, 256, 88, { width: 2.4 });
  f.arrow(334, 88, 370, 88, { width: 2.4 });
  f.text(272, 52, '2000 мА·ч', { size: 11, fill: C.muted });
  f.arrow(420, 116, 420, 156, { width: 2.4 });
  box(370, 156, 100, 50, 'нагрузка', '10 Ом 5 Вт', C.bad);
  f.circle(300, 168, 18, { width: 2.2 });
  f.text(300, 174, 'A', { anchor: 'middle', size: 15, weight: 700 });
  f.text(300, 198, 'ток батареи', { anchor: 'middle', size: 11, fill: C.muted });
  f.arrow(318, 168, 356, 168, { width: 1.8, dash: '5 4' });
  f.text(240, 252, 'Батарею не замыкай и не заряжай без платы защиты', { anchor: 'middle', size: 12, weight: 700, fill: C.bad });
  f.text(240, 24, 'Заряд — слева, питание нагрузки — справа', { anchor: 'middle', size: 14, weight: 700 });
  f.save(out('mini-powerbank', 'blocks'));

  // 2. Ёмкость: заявленная энергия и после boost (расчёт)
  const g = new Fig(480, 300, 'Энергия и ёмкость повербанка');
  g.text(240, 26, 'Откуда берётся «потерянная» ёмкость (расчёт)', { anchor: 'middle', size: 16, weight: 700 });
  const base = 228, k = 22;
  g.line(60, base, 450, base, { width: 1.5 });
  const bars = [
    ['на ячейке', 7.4, C.warn, '2000 мА·ч · 3,7 В'],
    ['после boost', 6.29, C.accent, 'КПД 85 %'],
    ['в пересчёте', 6.29, C.ok, '= 1258 мА·ч при 5 В'],
  ];
  bars.forEach(([name, v, col, note], i) => {
    const x = 80 + i * 125, h = v * k;
    g.rect(x, base - h, 80, h, { fill: col, stroke: col, r: 3 });
    g.text(x + 40, base - h - 8, i < 2 ? `${String(v).replace('.', ',')} Вт·ч` : '1258 мА·ч', { anchor: 'middle', size: 13, weight: 700, fill: col });
    g.text(x + 40, base + 18, name, { anchor: 'middle', size: 12, weight: 700 });
    g.text(x + 40, base + 36, note, { anchor: 'middle', size: 10.5, fill: C.muted });
  });
  g.text(240, 292, '7,4 Вт·ч × 0,85 = 6,29 Вт·ч; 6,29 / 5 В = 1,258 А·ч', { anchor: 'middle', size: 11.5, fill: C.muted });
  g.save(out('mini-powerbank', 'capacity'));
}
