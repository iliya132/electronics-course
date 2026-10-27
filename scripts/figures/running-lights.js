import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('running-lights');

  // 1. Блок-схема: 555 -> 4017 -> светодиоды
  const f = new Fig(920, 360, 'Бегущие огни: тактовый генератор 555, счётчик 74HC4017 и десять светодиодов');
  sch.block(f, 30, 120, 150, 110, 'LMC555\nмультивибратор\nf ≈ 6,3 Гц', { size: 14 });
  f.arrow(180, 175, 250, 175, { width: 2.6, head: 10 });
  f.text(215, 165, 'такт', { anchor: 'middle', size: 12, fill: C.muted });
  sch.block(f, 250, 100, 170, 150, '74HC4017\nдесятичный\nсчётчик', { size: 14 });
  f.text(335, 272, 'CE (13) и CLR (15) → GND', { anchor: 'middle', size: 11, fill: C.muted });
  for (let i = 0; i < 10; i++) {
    const y = 28 + i * 31;
    f.line(420, y + 12, 500, y + 12, { width: 1.8 });
    f.text(428, y + 8, `Q${i}`, { size: 10, fill: C.muted });
    f.rect(500, y + 4, 34, 16, { r: 3, width: 1.8 });
    f.circle(570, y + 12, 8, { width: 2, fill: i === 3 ? C.warn : 'none', opacity: 1 });
    f.line(534, y + 12, 562, y + 12, { width: 1.8 });
    f.line(578, y + 12, 612, y + 12, { width: 1.8 });
  }
  f.text(517, 20, '1 кОм', { anchor: 'middle', size: 11, fill: C.muted });
  f.line(612, 40, 612, 340, { width: 2 });
  sch.gnd(f, 612, 340);
  f.text(640, 100, 'светодиоды\nзагораются по\nочереди: Q0, Q1, … Q9,\nзатем снова Q0', { size: 13, fill: C.ok, weight: 600 });
  f.text(640, 220, 'ток LED ≈ (4,5 − 1,9)/1 кОм\n≈ 2,6 мА от выхода HC', { size: 12, fill: C.muted });
  f.save(out('running-lights', 'block'));

  // 2. Осциллограммы выходов
  const g = new Fig(720, 320, 'Осциллограммы: такт и выходы Q0…Q3');
  const T = 400, period = 100;
  const x0 = 80, w = 600;
  const X = t => x0 + t / T * w;
  const line = (y0, label, steps, col) => {
    const h = 28, pts = [];
    steps.forEach(([t, v], i) => {
      if (i) pts.push([X(t), y0 + (steps[i - 1][1] ? 0 : h)]);
      pts.push([X(t), y0 + (v ? 0 : h)]);
    });
    pts.push([X(T), y0 + (steps[steps.length - 1][1] ? 0 : h)]);
    g.poly(pts, { stroke: col, width: 2.6 });
    g.text(x0 - 12, y0 + 20, label, { anchor: 'end', size: 14, weight: 700, fill: col });
  };
  const clk = [[0, 0]];
  for (let t = period / 2; t < T; t += period / 2) clk.push([t, clk[clk.length - 1][1] ? 0 : 1]);
  line(30, 'CLK', clk, C.muted);
  for (let k = 0; k < 4; k++) {
    // Qk = 1 между (k+1)-м и (k+2)-м фронтом такта
    const st = [[0, 0], [period * (k + 1) / 1 - period / 2 * 0 + 0, 0]];
    const s2 = [[0, 0]];
    const rise = period / 2 + period * k, fall = rise + period;
    if (rise < T) s2.push([rise, 1]);
    if (fall < T) s2.push([fall, 0]);
    line(90 + k * 52, `Q${k}`, s2, [C.accent, C.warn, C.ok, C.bad][k]);
  }
  g.text(360, 300, 'в каждый момент горит один выход; фронт такта переносит «огонь» на следующий', { anchor: 'middle', size: 12, fill: C.muted });
  g.save(out('running-lights', 'waves'));
}
