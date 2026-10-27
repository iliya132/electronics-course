import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('current-sense');

  // 1. Нижний и верхний шунт
  const f = new Fig(780, 340, 'Нижний и верхний шунт для измерения тока');
  const panel = (ox, title, low) => {
    f.text(ox, 24, title, { size: 15, weight: 700 });
    sch.wire(f, [[ox + 60, 50], [ox + 220, 50]]);
    f.circle(ox + 60, 50, 4.5, { fill: 'none' });
    f.text(ox + 60, 36, '+12 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
    if (low) {
      sch.wire(f, [[ox + 160, 50], [ox + 160, 70]]);
      sch.resistor(f, ox + 160, 110, { rot: 90, len: 80, name: 'нагрузка', off: -30 });
      sch.wire(f, [[ox + 160, 150], [ox + 160, 180]]);
      sch.node(f, ox + 160, 180);
      sch.resistor(f, ox + 160, 220, { rot: 90, len: 80, name: 'Rшунт', value: '0,1 Ом', off: 30 });
      sch.wire(f, [[ox + 160, 260], [ox + 160, 280]]);
      sch.gnd(f, ox + 160, 280);
      sch.wire(f, [[ox + 160, 180], [ox + 80, 180]]);
      f.text(ox + 76, 176, 'к усилителю', { anchor: 'end', size: 12, fill: C.ok, weight: 600 });
      f.text(ox + 220, 300, 'земля нагрузки приподнята\nна I·R (0,1 В при 1 А)', { size: 12, fill: C.muted });
    } else {
      sch.wire(f, [[ox + 160, 50], [ox + 160, 70]]);
      sch.node(f, ox + 160, 50);
      sch.resistor(f, ox + 160, 110, { rot: 90, len: 80, name: 'Rшунт', value: '0,1 Ом', off: 30 });
      sch.wire(f, [[ox + 160, 150], [ox + 160, 170]]);
      sch.node(f, ox + 160, 150);
      sch.resistor(f, ox + 160, 210, { rot: 90, len: 80, name: 'нагрузка', off: 30 });
      sch.wire(f, [[ox + 160, 250], [ox + 160, 280]]);
      sch.gnd(f, ox + 160, 280);
      sch.wire(f, [[ox + 160, 50], [ox + 80, 50]]);
      sch.wire(f, [[ox + 160, 150], [ox + 80, 150]]);
      f.text(ox + 76, 100, 'к усилителю\nс высоким\nсинфазным', { anchor: 'end', size: 12, fill: C.ok, weight: 600 });
      f.text(ox + 220, 300, 'земля общая; усилитель\nвыдерживать напряжение шины', { size: 12, fill: C.muted });
    }
  };
  panel(10, 'Нижний шунт (в «минусе»)', true);
  panel(380, 'Верхний шунт (в «плюсе»)', false);
  f.save(out('current-sense', 'shunt-sides'));

  // 2. Напряжение и мощность на шунте 0,1 Ом
  const g = chart({
    title: 'Шунт 0,1 Ом: напряжение и мощность',
    xLabel: 'Ток, А', yLabel: 'Напряжение, В / мощность, Вт',
    xRange: [0, 3], yRange: [0, 1],
    series: [
      { fn: i => 0.1 * i, label: 'U = I·R, В', color: C.accent, width: 3 },
      { fn: i => 0.1 * i * i, label: 'P = I²·R, Вт', color: C.bad, width: 3 },
    ],
    markers: [{ x: 3, y: 0.9, label: '3 А: 0,9 Вт', dx: -10, dy: 20, anchor: 'end', color: C.bad }],
    legendAt: { x: 100, y: 90, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], yTicks: [0, 0.25, 0.5, 0.75, 1],
    samples: 100,
  });
  g.save(out('current-sense', 'shunt-vp'));
}
