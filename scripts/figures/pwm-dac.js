import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('pwm-dac');

  // 1. ШИМ при разной скважности
  const f = new Fig(480, 330, 'ШИМ 5 В с разным коэффициентом заполнения');
  [25, 50, 75].forEach((d, i) => {
    const top = 36 + i * 100, h = 52, x0 = 70, w = 380, T = w / 4;
    const Y = v => top + h - v / 5 * h;
    f.text(x0, top - 10, `D = ${d} %  →  Uср = ${(5 * d / 100).toFixed(2).replace('.', ',')} В`, { size: 14, weight: 700, fill: C.accent });
    f.line(x0, top, x0, top + h, { width: 1.5 });
    f.line(x0, top + h, x0 + w, top + h, { width: 1.5 });
    const pts = [];
    for (let k = 0; k < 4; k++) pts.push([x0 + k * T, Y(0)], [x0 + k * T, Y(5)], [x0 + k * T + T * d / 100, Y(5)], [x0 + k * T + T * d / 100, Y(0)]);
    pts.push([x0 + w, Y(0)]);
    f.poly(pts, { stroke: C.accent, width: 3 });
    f.line(x0, Y(5 * d / 100), x0 + w, Y(5 * d / 100), { stroke: C.bad, width: 2, dash: '7 5' });
    f.text(x0 - 6, Y(5) + 5, '5', { anchor: 'end', size: 12, fill: C.muted });
    f.text(x0 - 6, Y(0) + 5, '0', { anchor: 'end', size: 12, fill: C.muted });
  });
  f.text(470, 322, 'красный пунктир — среднее значение', { anchor: 'end', size: 12, fill: C.bad });
  f.save(out('pwm-dac', 'duty'));

  // 2. RC-фильтр: ШИМ 490 Гц, D = 0,5, разные RC (численное моделирование)
  const T = 1 / 490 * 1000, U = 5, D = 0.5, dt = 0.1;
  const sim = rc => {
    let y = 0;
    const pts = [];
    for (let t = 0; t <= 150; t += dt) {
      const x = (t % T) / T < D ? U : 0;
      y += (x - y) / rc * dt;
      pts.push([t, y]);
    }
    return pts;
  };
  const g = chart({
    title: 'ШИМ через RC-фильтр, f = 490 Гц, D = 50 %',
    xLabel: 'Время, мс', yLabel: 'Выход фильтра, В',
    xRange: [0, 150], yRange: [0, 5], yTicks: [0, 1.25, 2.5, 5], samples: 10,
    series: [
      { points: sim(2), label: 'RC = 2 мс: быстро, но рябь', color: C.bad, width: 1.4 },
      { points: sim(10), label: 'RC = 10 мс', color: C.warn, width: 1.8 },
      { points: sim(47), label: 'RC = 47 мс: гладко, но медленно', color: C.accent, width: 2.6 },
    ],
    legendAt: { x: 200, y: 232, cols: 1 },
    hlines: [{ v: 2.5, label: 'Uср = 2,5 В', color: C.ok }],
  });
  g.save(out('pwm-dac', 'filtered'));

  // 3. Схема
  const h = new Fig(480, 200, 'ШИМ-выход, RC-фильтр и аналоговый выход');
  h.rect(14, 64, 100, 60, { r: 8, width: 2.5 });
  h.text(64, 90, 'МК', { anchor: 'middle', size: 18, weight: 700 });
  h.text(64, 110, 'ШИМ-выход', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(h, [[114, 94], [150, 94]]);
  sch.resistor(h, 190, 94, { name: 'R', len: 80, off: 28 });
  sch.wire(h, [[230, 94], [370, 94]]);
  sch.node(h, 300, 94);
  sch.wire(h, [[300, 94], [300, 112]]);
  sch.capacitor(h, 300, 138, { rot: 90, name: 'C', off: 24, len: 52 });
  sch.wire(h, [[300, 164], [300, 172]]);
  sch.gnd(h, 300, 172);
  h.circle(374, 94, 5, { fill: 'none' });
  h.text(386, 99, 'Uср', { size: 15, weight: 700, fill: C.accent });
  h.text(240, 24, 'Uср = D · U, ripple ≈ U·D(1−D) / (f·R·C)', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  h.save(out('pwm-dac', 'circuit'));
}
