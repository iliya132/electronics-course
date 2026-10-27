import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('h-bridge');

  // 1. Четыре состояния моста
  const f = new Fig(700, 620, 'Состояния H-моста: вперёд, назад, торможение и сквозной ток');
  const panel = (ox, oy, title, verdict, on, path, ok) => {
    f.rect(ox, oy, 340, 300, { r: 10, width: 1.4, stroke: C.grid });
    f.text(ox + 14, oy + 24, title, { size: 15, weight: 700 });
    f.text(ox + 14, oy + 44, verdict, { size: 12, weight: 600, fill: ok ? C.ok : C.bad });
    const xl = ox + 90, xr = ox + 250, yt = oy + 70, ym = oy + 170, yb = oy + 270;
    sch.wire(f, [[xl, yt], [xr, yt]]);
    f.text(ox + 170, yt - 8, '+U', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
    sch.wire(f, [[xl, yt], [xl, yt + 15]]);
    sch.wire(f, [[xr, yt], [xr, yt + 15]]);
    const keys = [['A', xl, yt + 45], ['B', xr, yt + 45], ['C', xl, ym + 30], ['D', xr, ym + 30]];
    keys.forEach(([n, x, y], i) => {
      sch.switch(f, x, y, { rot: 90, len: 60, closed: on.includes(n) });
      f.text(x + (x === xl ? -34 : 24), y + 5, n, { size: 14, weight: 700, fill: on.includes(n) ? C.accent : C.muted });
    });
    sch.wire(f, [[xl, yt + 75], [xl, ym + 0]]);
    sch.wire(f, [[xr, yt + 75], [xr, ym + 0]]);
    sch.wire(f, [[xl, ym], [xl, ym + 0]]);
    sch.wire(f, [[xl, ym], [xl + 38, ym]]);
    sch.wire(f, [[xr - 38, ym], [xr, ym]]);
    f.circle(ox + 170, ym, 22, { width: 2.2 });
    f.text(ox + 170, ym + 6, 'M', { anchor: 'middle', size: 17, weight: 700 });
    sch.wire(f, [[xl, ym], [xl, ym + 15]]);
    sch.wire(f, [[xr, ym], [xr, ym + 15]]);
    sch.wire(f, [[xl, yb - 0], [xl, yb + 0]]);
    sch.wire(f, [[xl, ym + 45], [xl, yb]]);
    sch.wire(f, [[xr, ym + 45], [xr, yb]]);
    sch.wire(f, [[xl, yb], [xr, yb]]);
    f.text(ox + 170, yb + 16, 'GND', { anchor: 'middle', size: 12, weight: 700, fill: C.muted });
    if (path) f.poly(path.map(([x, y]) => [ox + x, oy + y]), { stroke: ok ? C.accent : C.bad, width: 4, dash: '2 7' });
  };
  panel(10, 10, 'A + D: вперёд', 'ток слева направо через мотор', ['A', 'D'], [[90, 70], [90, 170], [250, 170], [250, 270]], true);
  panel(360, 10, 'B + C: назад', 'ток справа налево, мотор вращается обратно', ['B', 'C'], [[250, 70], [250, 170], [90, 170], [90, 270]], true);
  panel(10, 320, 'A + B: торможение', 'оба вывода мотора на +U, мотор тормозит', ['A', 'B'], null, true);
  panel(360, 320, 'A + C: сквозной ток', 'КОРОТКОЕ ЗАМЫКАНИЕ: никогда!', ['A', 'C'], [[90, 70], [90, 270]], false);
  f.save(out('h-bridge', 'states'));

  // 2. Потери драйверов (модель по типовым значениям)
  const g = chart({
    title: 'Потери в драйвере мотора (модель)',
    xLabel: 'Ток мотора, А', yLabel: 'Мощность потерь, Вт',
    xRange: [0, 1.5], yRange: [0, 4.5],
    series: [
      { fn: i => 2.0 * i, label: 'L298N: ≈ 2 В падения', color: C.bad, width: 3 },
      { fn: i => 0.5 * i * i, label: 'TB6612FNG: 0,5 Ом', color: C.accent, width: 3 },
      { fn: i => 0.36 * i * i, label: 'DRV8833: 0,36 Ом', color: C.ok, width: 3, dash: '8 5' },
    ],
    markers: [{ x: 1, y: 2, label: '1 А: 2 Вт', dx: -12, dy: -12, anchor: 'end', color: C.bad }],
    legendAt: { x: 120, y: 100, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5], yTicks: [0, 1, 2, 3, 4],
    samples: 100,
  });
  g.save(out('h-bridge', 'driver-loss'));
}
