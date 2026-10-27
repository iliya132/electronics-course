import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('battery-internal-r');

  // 1. Модель батарейки и схема измерения
  const f = new Fig(480, 290, 'Батарейка как ЭДС и внутреннее сопротивление, нагрузка 10 Ом и вольтметр');
  f.rect(26, 46, 196, 208, { stroke: C.muted, dash: '7 5', r: 10, width: 1.8 });
  f.text(36, 246, 'реальная батарейка', { size: 14, fill: C.muted, weight: 600 });
  sch.battery(f, 70, 160, { rot: 90, name: 'E', off: -26 });
  sch.wire(f, [[70, 120], [70, 90], [90, 90]]);
  sch.resistor(f, 130, 90, { name: 'r', off: 26 });
  sch.wire(f, [[170, 90], [210, 90]]);
  sch.wire(f, [[70, 200], [70, 230], [210, 230]]);
  f.circle(210, 90, 4.5, { fill: 'none' });
  f.circle(210, 230, 4.5, { fill: 'none' });
  f.text(222, 86, '+', { size: 18, weight: 700 });
  f.text(222, 242, '−', { size: 20, weight: 700 });
  sch.wire(f, [[214, 90], [330, 90], [330, 120]]);
  sch.wire(f, [[330, 200], [330, 230], [214, 230]]);
  sch.resistor(f, 330, 160, { rot: 90, name: 'R = 10 Ом', off: 30 });
  sch.wire(f, [[280, 90], [280, 120]], { color: C.accent });
  sch.wire(f, [[280, 200], [280, 230]], { color: C.accent });
  sch.meter(f, 280, 160, { rot: 90, sym: 'V', color: C.accent });
  sch.node(f, 280, 90); sch.node(f, 280, 230);
  f.text(240, 24, 'U на клеммах = E − I·r', { anchor: 'middle', size: 17, weight: 700, fill: C.accent });
  f.save(out('battery-internal-r', 'circuit'));

  // 2. Нагрузочные характеристики новой и старой батарейки
  const g = chart({
    title: 'Напряжение на клеммах при нагрузке',
    xLabel: 'Ток нагрузки I, А', yLabel: 'Напряжение U, В',
    xRange: [0, 0.6], yRange: [0, 1.8],
    series: [
      { fn: i => 1.58 - 0.33 * i, label: 'новая: E = 1,58 В, r ≈ 0,33 Ом', color: C.ok },
      { fn: i => 1.31 - 2.2 * i, label: 'старая: E = 1,31 В, r ≈ 2,2 Ом', color: C.bad },
    ],
    markers: [
      { x: 0.15, y: 1.58 - 0.33 * 0.15, label: '10 Ом: 1,53 В', dx: 8, dy: 24, color: C.ok },
      { x: 0.107, y: 1.31 - 2.2 * 0.107, label: '10 Ом: 1,07 В', dx: 8, dy: -10, color: C.bad },
    ],
    notes: [{ x: 0.2, y: 0.3, text: 'старая быстро проседает', color: C.muted }],
  });
  g.save(out('battery-internal-r', 'load-lines'));
}
