import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const fc = 1 / (2 * Math.PI * 10e3 * 100e-9);

export function generate() {
  fresh('rc-highpass');

  // 1. Схема ФВЧ
  const f = new Fig(480, 260, 'RC-фильтр высоких частот');
  f.circle(40, 100, 5, { fill: 'none' });
  f.text(40, 80, 'вход', { anchor: 'middle', size: 14, weight: 700, fill: C.warn });
  sch.wire(f, [[45, 100], [70, 100]]);
  sch.capacitor(f, 130, 100, { name: 'C 100 нФ', len: 120, off: 28 });
  sch.wire(f, [[190, 100], [300, 100]]);
  sch.node(f, 260, 100);
  sch.wire(f, [[260, 100], [260, 120]]);
  sch.resistor(f, 260, 155, { rot: 90, name: 'R 10 кОм', off: 30, len: 70 });
  sch.wire(f, [[260, 190], [260, 205]]);
  sch.gnd(f, 260, 205);
  f.circle(304, 100, 5, { fill: 'none' });
  f.text(304, 80, 'выход', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(20, 170, 'постоянное и медленное:\nXc велико — блокируется', { size: 12, fill: C.bad, weight: 600 });
  f.text(340, 170, 'быстрое: Xc мало —\nпроходит на выход', { size: 12, fill: C.ok, weight: 600 });
  f.text(240, 24, 'fc = 1 / (2π·R·C) = 159 Гц', { anchor: 'middle', size: 16, weight: 700, fill: C.accent });
  f.save(out('rc-highpass', 'circuit'));

  // 2. АЧХ ФВЧ в дБ, fc = 159 Гц
  const h = x => -10 * Math.log10(1 + (fc / x) ** 2);
  const g = chart({
    title: 'АЧХ RC-фильтра высоких частот, fc = 159 Гц',
    xLabel: 'Частота, Гц (лог.)', yLabel: 'Усиление, дБ',
    xRange: [1, 1e4], yRange: [-50, 3], log: true, xTicks: [1, 10, 100, 1000, 1e4], yTicks: [0, -3, -20, -40],
    xFormat: v => (v >= 1000 ? v / 1000 + ' к' : String(v)),
    series: [{ fn: h, color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: fc, label: 'fc', color: C.muted }],
    markers: [
      { x: 15.9, y: h(15.9), label: 'fc/10: −20 дБ', dx: 8, dy: -10, color: C.bad },
      { x: 1590, y: h(1590), label: '10·fc: почти 0 дБ', dx: -8, dy: 22, anchor: 'end', color: C.ok },
    ],
  });
  g.save(out('rc-highpass', 'response'));

  // 3. Отклик на прямоугольный сигнал при разных τ
  const dt = 0.01, T = 6;
  const sim = tau => {
    const a = tau / (tau + dt);
    let y = 0, xPrev = 0;
    const pts = [];
    for (let t = 0; t <= T; t += dt) {
      const x = Math.floor(t / 1) % 2 === 0 ? 5 : 0;
      y = a * (y + x - xPrev);
      xPrev = x;
      pts.push([t, y]);
    }
    return pts;
  };
  const sq = [];
  for (let t = 0; t <= T; t += dt) sq.push([t, Math.floor(t / 1) % 2 === 0 ? 5 : 0]);
  const panels = [['вход: прямоугольник 0 / 5 В (T = 2 мс)', sq, C.muted, 6], ['τ = 0,1 мс (малая): короткие пики на фронтах', sim(0.1), C.bad, 6], ['τ = 10 мс (большая): форма почти сохраняется', sim(10), C.accent, 6]];
  const f3 = new Fig(480, 390, 'Отклик ФВЧ на прямоугольные импульсы');
  const X = t => 60 + t / T * 400;
  panels.forEach(([title, pts, color], i) => {
    const top = 36 + i * 118, h = 74;
    const Y = v => top + h - (v + 5) / 11 * h;
    f3.text(60, top - 8, title, { size: 12.5, weight: 700, fill: color });
    f3.line(60, Y(0), 460, Y(0), { stroke: C.grid, width: 1 });
    f3.line(60, top, 60, top + h, { width: 1.5 });
    f3.poly(pts.map(([t, v]) => [X(t), Y(v)]), { stroke: color, width: 2.4 });
    f3.text(54, Y(0) + 4, '0', { anchor: 'end', size: 11, fill: C.muted });
  });
  [0, 2, 4, 6].forEach(t => f3.text(X(t), 384, String(t), { anchor: 'middle', size: 11, fill: C.muted }));
  f3.text(460, 384, 'мс', { anchor: 'end', size: 11, fill: C.muted });
  f3.save(out('rc-highpass', 'pulse'));
}
