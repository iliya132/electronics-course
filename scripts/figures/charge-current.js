import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

// Точки вдоль незамкнутой ломаной с равным шагом.
function along(path, step, start = 0) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const len = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    segs.push({ a: path[i - 1], b: path[i], len, from: total });
    total += len;
  }
  const pts = [];
  for (let s = start; s < total; s += step) {
    const seg = segs.find(g => s >= g.from && s < g.from + g.len);
    const t = (s - seg.from) / seg.len;
    pts.push([seg.a[0] + (seg.b[0] - seg.a[0]) * t, seg.a[1] + (seg.b[1] - seg.a[1]) * t]);
  }
  return pts;
}

function loopRow(f, oy, kind) {
  const L = 50, R = 430, T = oy + 30, B = oy + 110, cy = oy + 70;
  const path = [[L, cy + 20], [L, B], [R, B], [R, T], [L, T], [L, cy - 20]];
  const water = kind === 'water', color = water ? C.accent : C.warn;
  f.text(24, oy, water ? 'Вода в трубах' : 'Электроны в проводе', { size: 17, weight: 700 });
  if (water) f.poly(path, { stroke: C.muted, width: 18, opacity: 0.28 });
  else f.poly(path, { stroke: C.ink, width: 2 });
  for (const [x, y] of along(path, 27, 6)) f.dot(x, y, water ? 5 : 4.5, color);
  if (water) {
    f.circle(L, cy, 20, { stroke: C.accent, fill: C.surface, width: 2.5 });
    f.arrow(L, cy - 9, L, cy + 11, { stroke: C.accent, width: 2.5, head: 9 });
    f.text(L + 34, cy + 5, 'насос', { size: 15, fill: C.muted });
  } else {
    sch.battery(f, L, cy, { rot: 90, len: 40, name: 'батарейка', off: 34 });
  }
  f.arrow(290, T - 20, 220, T - 20, { stroke: color, width: 2.5 });
  f.text(300, T - 15, water ? 'течёт вода' : 'идут электроны', { size: 15, fill: color, weight: 600 });
  f.text(24, oy + 142, water
    ? 'Труба уже полна воды. Насос не добавляет её,\nа только заставляет всю воду двигаться.'
    : 'Провод уже полон свободных электронов. Батарейка не\nпоставляет их, а только заставляет двигаться.', { size: 14, fill: C.muted });
}

export function generate() {
  fresh('charge-current');

  // 1. Аналогия: труба и провод
  const a = new Fig(480, 372, 'Труба с водой и провод со свободными электронами');
  loopRow(a, 26, 'water');
  loopRow(a, 206, 'wire');
  a.save(out('charge-current', 'analogy'));

  // 2. Цепь и два направления
  const f = new Fig(480, 320, 'Цепь из батарейки, выключателя и лампы: направление тока и движение электронов');
  const L = 130, R = 420, T = 70, B = 220, mid = 145;
  sch.battery(f, L, mid, { rot: 90, name: 'батарейка', off: -34 });
  sch.switch(f, 275, T, { name: 'выключатель', closed: true });
  sch.lamp(f, R, mid, { rot: 90, name: 'лампа', off: -34 });
  sch.wire(f, [[L, mid - 40], [L, T], [235, T]]);
  sch.wire(f, [[315, T], [R, T], [R, mid - 40]]);
  sch.wire(f, [[R, mid + 40], [R, B], [L, B], [L, mid + 40]]);
  sch.current(f, 185, T, 'right', '', { len: 40 });
  sch.current(f, R - 50, B, 'left', '', { len: 40, color: C.accent });
  f.arrow(260, B + 34, 340, B + 34, { stroke: C.warn, width: 2.5, dash: '7 5' });
  f.arrow(180, B + 34, 220, B + 34, { stroke: C.warn, width: 2.5, dash: '7 5' });
  f.arrow(360, B + 34, 400, B + 34, { stroke: C.warn, width: 2.5, dash: '7 5' });
  f.text(240, 160, 'Ток I\n(условно: от «+» к «−»)', { anchor: 'middle', size: 15, fill: C.accent, weight: 700 });
  f.text(275, B + 66, 'Электроны идут от «−» к «+», навстречу току', { anchor: 'middle', size: 14, fill: C.warn, weight: 600 });
  f.save(out('charge-current', 'direction'));

  // 3. Q(t) при двух токах
  const g = chart({
    title: 'Заряд, прошедший через провод: Q = I · t',
    xLabel: 'Время t, с', yLabel: 'Заряд Q, Кл', xRange: [0, 20], yRange: [0, 10],
    series: [
      { fn: t => 0.5 * t, label: 'ток 0,5 А', color: C.accent },
      { fn: t => 0.2 * t, label: 'ток 0,2 А', color: C.ok },
    ],
    markers: [
      { x: 10, y: 5, label: '5 Кл за 10 с', color: C.accent, dx: -8, dy: -12, anchor: 'end' },
      { x: 10, y: 2, label: '2 Кл за 10 с', color: C.ok, dx: 8, dy: 22 },
    ],
  });
  g.save(out('charge-current', 'charge-vs-time'));
}
