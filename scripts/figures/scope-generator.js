import { Fig, C, out, fresh } from '../lib/fig.js';
import { diagram } from '../lib/diag.js';

export function generate() {
  fresh('scope-generator');

  // 1. Экран осциллографа: сетка 10 × 8 делений, масштаб и измерения
  const div = 44, x0 = 50, y0 = 30, cols = 10, rows = 8;
  const f = new Fig(690, 430, 'Экран осциллографа: сетка, масштабы, амплитуда и период');
  f.rect(x0, y0, cols * div, rows * div, { r: 4, stroke: C.muted, width: 1.5 });
  for (let i = 1; i < cols; i++) f.line(x0 + i * div, y0, x0 + i * div, y0 + rows * div, { stroke: C.grid, width: 1 });
  for (let j = 1; j < rows; j++) f.line(x0, y0 + j * div, x0 + cols * div, y0 + j * div, { stroke: j === rows / 2 ? C.muted : C.grid, width: j === rows / 2 ? 1.5 : 1 });
  const cy = y0 + rows * div / 2, amp = 2 * div, period = 5 * div;
  const pts = [];
  for (let i = 0; i <= 200; i++) { const x = i / 200 * cols * div; pts.push([x0 + x, cy - amp * Math.sin(2 * Math.PI * x / period)]); }
  f.poly(pts, { stroke: C.ok, width: 3 });
  // амплитуда «от пика до пика»
  const xp = x0 + period * 0.25;
  f.arrow(xp + 22, cy - amp, xp + 22, cy + amp, { stroke: C.bad, width: 2, head: 8 });
  f.arrow(xp + 22, cy + amp, xp + 22, cy - amp, { stroke: C.bad, width: 2, head: 8 });
  f.text(xp + 30, cy - 4, '4 дел.', { size: 14, weight: 700, fill: C.bad });
  // период
  const yT = y0 + rows * div - 24;
  f.arrow(x0, yT, x0 + period, yT, { stroke: C.accent, width: 2, head: 8 });
  f.arrow(x0 + period, yT, x0, yT, { stroke: C.accent, width: 2, head: 8 });
  f.text(x0 + period / 2, yT - 8, '5 дел.', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(x0, y0 - 10, 'CH1  2 В/дел   1 мс/дел', { size: 14, weight: 700, fill: C.ok });
  f.text(x0 + cols * div + 12, y0 + 22, 'Размах:', { size: 14, weight: 700 });
  f.text(x0 + cols * div + 12, y0 + 42, '4 × 2 В = 8 В', { size: 14 });
  f.text(x0 + cols * div + 12, y0 + 72, 'Период:', { size: 14, weight: 700 });
  f.text(x0 + cols * div + 12, y0 + 92, '5 × 1 мс = 5 мс', { size: 14 });
  f.text(x0 + cols * div + 12, y0 + 122, 'Частота:', { size: 14, weight: 700 });
  f.text(x0 + cols * div + 12, y0 + 142, '1 / 5 мс = 200 Гц', { size: 14 });
  f.text(x0 + cols * div / 2, y0 + rows * div + 24, 'горизонталь — время, вертикаль — напряжение', { anchor: 'middle', size: 14, fill: C.muted });
  f.save(out('scope-generator', 'screen'));

  // 2. Компенсация щупа: три формы меандра
  const g = new Fig(640, 250, 'Компенсация щупа: форма калибровочного меандра');
  const panels = [
    { name: 'Недокомпенсирован', note: 'скругленные фронты', tone: C.warn, shape: 'round' },
    { name: 'Компенсация верна', note: 'ровная «полка»', tone: C.ok, shape: 'flat' },
    { name: 'Перекомпенсирован', note: 'выбросы на фронтах', tone: C.bad, shape: 'spike' },
  ];
  panels.forEach((p, k) => {
    const px = 20 + k * 205, py = 50, w = 190, h = 120, hi = py + 30, lo = py + h - 20;
    g.rect(px, py, w, h, { r: 4, stroke: C.grid, width: 1.5 });
    const path = [];
    const half = 45;
    const level = t => (Math.floor(t / half) % 2 === 0 ? lo : hi);
    for (let x = 0; x <= w - 10; x += 1) {
      const t = x;
      const phase = t % half;
      const target = level(t);
      const prev = level(t - half);
      let y = target;
      if (p.shape === 'round') {
        y = target + (prev - target) * Math.exp(-phase / 9);
      } else if (p.shape === 'spike') {
        y = target + (target === hi ? -1 : 1) * 14 * Math.exp(-phase / 7);
      }
      path.push([px + 5 + x, y]);
    }
    g.poly(path, { stroke: p.tone, width: 2.8 });
    g.text(px + w / 2, py - 14, p.name, { anchor: 'middle', size: 14, weight: 700, fill: p.tone });
    g.text(px + w / 2, py + h + 22, p.note, { anchor: 'middle', size: 13, fill: C.muted });
  });
  g.text(320, 232, 'Подстройка: маленькой отвёрткой вращай подстроечный конденсатор на щупе.', { anchor: 'middle', size: 13, fill: C.muted });
  g.save(out('scope-generator', 'probe-comp'));

  // 3. Нагрузка генератора: Hi-Z и 50 Ом
  const d = diagram({
    title: 'Выходное сопротивление генератора 50 Ом и нагрузка',
    w: 820, h: 260,
    boxes: [
      { id: 'g1', x: 20, y: 40, w: 190, h: 80, text: 'Генератор\nвнутри 50 Ом', tone: 'accent' },
      { id: 'l1', x: 300, y: 40, w: 190, h: 80, text: 'Вход осциллографа\n1 МОм (Hi-Z)', tone: 'ok' },
      { id: 'g2', x: 20, y: 150, w: 190, h: 80, text: 'Генератор\nвнутри 50 Ом', tone: 'accent' },
      { id: 'l2', x: 300, y: 150, w: 190, h: 80, text: 'Нагрузка 50 Ом', tone: 'bad' },
    ],
    arrows: [['g1', 'l1', 'на нагрузке U'], ['g2', 'l2', 'на нагрузке U / 2']],
    notes: [
      { x: 520, y: 78, text: 'Нагрузка много больше 50 Ом:\nна выходе почти всё напряжение.', size: 13 },
      { x: 520, y: 188, text: 'Нагрузка равна 50 Ом:\nделитель, остаётся половина.', size: 13 },
    ],
  });
  d.save(out('scope-generator', 'awg-load'));
}
