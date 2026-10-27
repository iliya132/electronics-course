import { Fig, C, out, fresh } from '../lib/fig.js';

// Цифровая осциллограмма: steps — массив [время, уровень] (уровень 0/1), переходы мгновенные
function wave(f, x0, y0, w, label, steps, tMax, color = C.accent) {
  const h = 30, X = t => x0 + t / tMax * w;
  const pts = [];
  steps.forEach(([t, v], i) => {
    if (i) pts.push([X(t), y0 + (steps[i - 1][1] ? 0 : h)]);
    pts.push([X(t), y0 + (v ? 0 : h)]);
  });
  pts.push([X(tMax), y0 + (steps[steps.length - 1][1] ? 0 : h)]);
  f.poly(pts, { stroke: color, width: 2.6 });
  f.text(x0 - 12, y0 + 22, label, { anchor: 'end', size: 14, weight: 700, fill: color });
}
const clk = (tMax, period) => {
  const s = [[0, 0]];
  for (let t = period / 2; t < tMax; t += period / 2) s.push([t, s[s.length - 1][1] ? 0 : 1]);
  return s;
};
const levelAt = (steps, t) => steps.filter(([ts]) => ts <= t).pop()[1];

export function generate() {
  fresh('flipflops-counters');

  // 1. D-триггер: Q повторяет D в момент фронта
  const tMax = 400, f = new Fig(720, 280, 'D-триггер захватывает D по фронту тактового импульса');
  const edges = [40, 120, 200, 280, 360];
  const clock = [[0, 0]];
  edges.forEach(t => { clock.push([t, 1], [t + 40, 0]); });
  const D = [[0, 0], [70, 1], [150, 0], [230, 1], [330, 0]];
  const Q = [[0, 0]];
  let prev = 0;
  edges.forEach(t => { const d = levelAt(D, t); if (d !== prev) { Q.push([t, d]); prev = d; } });
  wave(f, 80, 50, 620, 'CLK', clock, tMax, C.muted);
  wave(f, 80, 120, 620, 'D', D, tMax, C.warn);
  wave(f, 80, 190, 620, 'Q', Q, tMax, C.ok);
  edges.forEach(t => f.line(80 + t / tMax * 620, 40, 80 + t / tMax * 620, 232, { stroke: C.muted, dash: '3 5', width: 1.4 }));
  f.text(80 + 40 / tMax * 620 + 6, 262, 'фронты тактов: D считывается только в эти моменты', { size: 12, fill: C.muted });
  f.save(out('flipflops-counters', 'dff'));

  // 2. 3-разрядный счётчик
  const g = new Fig(720, 340, 'Трёхразрядный двоичный счётчик делит частоту на 2, 4 и 8');
  const T = 640, period = 80;
  const edgesC = []; for (let t = 40; t < T; t += period) edgesC.push(t);
  const clockC = [[0, 0]];
  edgesC.forEach(t => clockC.push([t, 1], [t + 40, 0]));
  const bit = k => { const s = [[0, 0]]; edgesC.forEach((t, i) => { const v = ((i + 1) >> k) & 1; if (v !== s[s.length - 1][1]) s.push([t, v]); }); return s; };
  wave(g, 80, 30, 620, 'CLK', clockC, T, C.muted);
  wave(g, 80, 90, 620, 'Q0 (÷2)', bit(0), T, C.accent);
  wave(g, 80, 150, 620, 'Q1 (÷4)', bit(1), T, C.warn);
  wave(g, 80, 210, 620, 'Q2 (÷8)', bit(2), T, C.ok);
  edgesC.forEach((t, i) => g.text(80 + t / T * 620 + 6, 290, String(i + 1), { anchor: 'middle', size: 12, fill: C.muted }));
  g.text(80, 318, 'номер фронта тактов = состояние счётчика Q2 Q1 Q0 (двоичное)', { size: 12, fill: C.muted });
  g.save(out('flipflops-counters', 'counter'));
}
