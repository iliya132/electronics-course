import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('diode-logic-or');
  const f = new Fig(480, 280, 'Диодное ИЛИ: выбор источника питания');
  // источники
  f.circle(24, 70, 4.5, { fill: 'none' });
  f.text(24, 52, 'USB 5 В', { size: 13, weight: 700, fill: C.warn });
  f.circle(24, 190, 4.5, { fill: 'none' });
  f.text(24, 172, 'внешнее 5–12 В', { size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[28, 70], [100, 70]]);
  sch.diode(f, 140, 70, { len: 80, name: 'D1', off: 24 });
  sch.wire(f, [[180, 70], [270, 70], [270, 130]]);
  sch.wire(f, [[28, 190], [100, 190]]);
  sch.diode(f, 140, 190, { len: 80, name: 'D2', off: 24 });
  sch.wire(f, [[180, 190], [270, 190], [270, 130]]);
  sch.node(f, 270, 130);
  sch.wire(f, [[270, 130], [350, 130]]);
  f.rect(350, 100, 100, 60, { r: 8, width: 2.4 });
  f.text(400, 126, 'нагрузка', { anchor: 'middle', size: 13, weight: 700 });
  f.text(400, 146, '≈ Uмакс − Vf', { anchor: 'middle', size: 12, fill: C.accent, weight: 700 });
  f.text(240, 244, 'Открыт диод источника с большим напряжением, диод второго', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(240, 262, 'закрыт обратным напряжением: источники не текут друг в друга.', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('diode-logic-or', 'power-path'));

  const g = chart({
    title: 'Просадка в узле ИЛИ при токе нагрузки',
    xLabel: 'Ток нагрузки, А', yLabel: 'Падение напряжения, В',
    xRange: [0, 1], yRange: [0, 0.8],
    series: [
      { fn: () => 0.7, label: 'кремниевый диод ≈ 0,7 В', color: C.bad, width: 3 },
      { fn: () => 0.35, label: 'диод Шоттки ≈ 0,35 В', color: C.warn, width: 3 },
      { fn: i => 0.05 * i, label: 'MOSFET 50 мОм: I·R', color: C.accent, width: 3 },
    ],
    legendAt: { x: 120, y: 110, cols: 1 },
    notes: [{ x: 0.3, y: 0.25, text: 'модель: Vf постоянно\n(в реальности слабо растёт с током)', color: C.muted }],
  });
  g.save(out('diode-logic-or', 'drop'));
}
