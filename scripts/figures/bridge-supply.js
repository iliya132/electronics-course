import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('bridge-supply');

  // 1. Схема опыта
  const f = new Fig(480, 280, 'Схема проекта: мост, конденсатор и нагрузка');
  f.circle(46, 130, 20, { width: 2.2 });
  f.text(46, 137, '~', { anchor: 'middle', size: 22, weight: 700 });
  f.text(46, 168, 'адаптер AC', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[46, 110], [46, 92], [120, 92]]);
  sch.wire(f, [[46, 150], [46, 168], [46, 184], [120, 184]]);
  f.rect(120, 80, 90, 116, { r: 8, width: 2.4 });
  f.text(165, 124, 'мост', { anchor: 'middle', size: 14, weight: 700 });
  f.text(165, 146, '4×1N4007', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(130, 108, '~', { size: 14, weight: 700 });
  f.text(130, 176, '~', { size: 14, weight: 700 });
  f.text(196, 108, '+', { anchor: 'end', size: 15, weight: 700, fill: C.ok });
  f.text(196, 176, '−', { anchor: 'end', size: 17, weight: 700, fill: C.ok });
  sch.wire(f, [[210, 92], [250, 92], [250, 60], [420, 60]]);
  sch.wire(f, [[210, 184], [250, 184], [250, 220], [420, 220]]);
  sch.node(f, 300, 60);
  sch.wire(f, [[300, 60], [300, 100]]);
  sch.capacitor(f, 300, 140, { rot: 90, len: 56, name: 'C', off: 24 });
  sch.wire(f, [[300, 168], [300, 220]]);
  sch.node(f, 300, 220);
  sch.node(f, 370, 60);
  sch.wire(f, [[370, 60], [370, 100]]);
  sch.resistor(f, 370, 140, { rot: 90, len: 60, name: 'R', off: 24 });
  sch.wire(f, [[370, 170], [370, 220]]);
  sch.node(f, 370, 220);
  f.circle(440, 140, 18, { width: 2.2 });
  f.text(440, 146, 'V', { anchor: 'middle', size: 16, weight: 700 });
  sch.wire(f, [[420, 60], [440, 60], [440, 122]]);
  sch.wire(f, [[440, 158], [440, 220], [420, 220]]);
  f.text(240, 262, 'C = 1000 мкФ / 25 В (минус к «−»), R = 220 Ом 2 Вт; вольтметр на выходе', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('bridge-supply', 'setup'));

  // 2. Ожидаемый осциллограф-подобный график: Uвх = 10,2 В RMS, R = 220 Ом, C = 1000 мкФ (расчёт)
  const Um = 10.2 * Math.SQRT2, Vd = 1.4, R = 220;
  const rect = t => Math.max(0, Math.abs(Um * Math.sin(2 * Math.PI * t / 20)) - Vd);
  const run = capUF => {
    const cap = capUF * 1e-6, pts = []; let v = Um - Vd;
    for (let t = 0; t <= 60.001; t += 0.02) {
      v = Math.max(rect(t), v - v / R / cap * 0.02e-3);
      pts.push([t, v]);
    }
    const late = pts.filter(p => p[0] > 30);
    return { pts, dU: Math.max(...late.map(p => p[1])) - Math.min(...late.map(p => p[1])), avg: late.reduce((s, p) => s + p[1], 0) / late.length };
  };
  const a = run(1000);
  console.log('Um', Um.toFixed(2), 'peak', (Um - Vd).toFixed(2), '1000 мкФ: ΔU', a.dU.toFixed(2), 'avg', a.avg.toFixed(2));
  const g = chart({
    title: 'Ожидаемый выход: 10,2 В RMS, 220 Ом',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 60], yRange: [0, 16],
    series: [
      { fn: rect, label: 'мост без конденсатора', color: C.muted, width: 1.8, dash: '6 5' },
      { points: a.pts, label: 'с C = 1000 мкФ', color: C.accent, width: 3 },
    ],
    hlines: [{ v: Um - Vd, label: 'пик 13,0 В', color: C.ok }],
    legendAt: { x: 100, y: 96, cols: 1 },
    samples: 500,
  });
  g.save(out('bridge-supply', 'expected'));
}
