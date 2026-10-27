import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('boost-buckboost');

  // 1. Схема boost
  const f = new Fig(480, 290, 'Повышающий преобразователь (boost)');
  const y = 90;
  f.circle(18, y, 4.5, { fill: 'none' });
  f.text(18, y - 14, 'Uвх', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[22, y], [50, y]]);
  sch.node(f, 50, y);
  sch.wire(f, [[50, y], [50, y + 20]]);
  sch.capacitor(f, 50, y + 48, { rot: 90, len: 52, name: 'Cвх', off: 22 });
  sch.wire(f, [[50, y + 74], [50, 240]]);
  sch.gnd(f, 50, 240);
  sch.wire(f, [[50, y], [70, y]]);
  sch.inductor(f, 110, y, { len: 80, name: 'L', off: 24 });
  sch.wire(f, [[150, y], [180, y]]);
  sch.node(f, 180, y);
  f.text(180, y - 12, 'SW', { anchor: 'middle', size: 11, weight: 700, fill: C.bad });
  sch.wire(f, [[180, y], [180, 135]]);
  f.rect(150, 135, 60, 44, { r: 8, width: 2.6, stroke: C.accent });
  f.text(180, 162, 'ключ Q', { anchor: 'middle', size: 12, weight: 700, fill: C.accent });
  sch.wire(f, [[180, 179], [180, 240]]);
  sch.gnd(f, 180, 240);
  sch.wire(f, [[180, y], [220, y]]);
  sch.diode(f, 260, y, { len: 70, name: 'D', off: 24 });
  sch.wire(f, [[295, y], [454, y]]);
  sch.node(f, 380, y);
  sch.wire(f, [[380, y], [380, y + 20]]);
  sch.capacitor(f, 380, y + 48, { rot: 90, len: 52, name: 'Cвых', off: 22 });
  sch.wire(f, [[380, y + 74], [380, 240]]);
  sch.gnd(f, 380, 240);
  f.circle(458, y, 4.5, { fill: 'none' });
  f.text(458, y - 14, 'Uвых', { anchor: 'end', size: 13, weight: 700, fill: C.ok });
  f.text(240, 278, 'Ключ замкнут — дроссель запасает энергию; разомкнут — отдаёт через D', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('boost-buckboost', 'boost'));

  // 2. Входной ток boost 5 В / 0,5 А при КПД 85 %
  const g = chart({
    title: 'Входной ток boost: выход 5 В, 0,5 А, КПД 85 %',
    xLabel: 'Входное напряжение, В', yLabel: 'Входной ток, А',
    xRange: [2.5, 4.5], yRange: [0, 1.4],
    series: [
      { fn: u => 5 * 0.5 / 0.85 / u, label: 'Iвх = Pвых/(η·Uвх)', color: C.accent, width: 3 },
      { fn: () => 0.5, label: 'Iвых = 0,5 А', color: C.ok, width: 2, dash: '6 5' },
    ],
    legendAt: { x: 260, y: 78, cols: 1 },
    markers: [
      { x: 3.0, y: 2.5 / 0.85 / 3.0, label: '3,0 В: 0,98 А', dx: 10, dy: -8, anchor: 'start', color: C.accent },
      { x: 4.2, y: 2.5 / 0.85 / 4.2, label: '4,2 В: 0,70 А', dx: -6, dy: 26, anchor: 'end', color: C.accent },
    ],
  });
  g.save(out('boost-buckboost', 'input-current'));
}
