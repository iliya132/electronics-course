import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('optocouplers');

  // 1. Вход 12–24 В на МК 3,3 В через PC817
  const f = new Fig(760, 400, 'Оптопара PC817: вход 12–24 В и выход 3,3 В с общей землёй только у МК');
  // входная сторона
  sch.wire(f, [[40, 70], [60, 70]]);
  f.circle(40, 70, 4.5, { fill: 'none' });
  f.text(40, 54, 'вход 12…24 В', { size: 12, weight: 700, fill: C.warn });
  sch.resistor(f, 100, 70, { len: 80, name: 'R', value: '4,7 кОм', off: 28 });
  sch.wire(f, [[140, 70], [300, 70], [300, 120]]);
  sch.diode(f, 300, 180, { rot: 90, len: 120, led: false, name: 'LED', off: -32 });
  sch.wire(f, [[300, 240], [300, 330]]);
  sch.wire(f, [[300, 330], [40, 330]]);
  f.circle(40, 330, 4.5, { fill: 'none' });
  f.text(40, 350, 'общий минус входа', { size: 12, fill: C.muted });
  // корпус
  f.rect(250, 100, 180, 160, { r: 8, width: 2.2, dash: '' });
  f.text(340, 94, 'PC817', { anchor: 'middle', size: 13, weight: 700 });
  f.line(340, 104, 340, 256, { stroke: C.bad, dash: '6 5', width: 1.8 });
  f.text(340, 276, 'барьер изоляции', { anchor: 'middle', size: 11, fill: C.bad });
  f.arrow(318, 160, 352, 168, { stroke: C.warn, width: 1.8, head: 7 });
  f.arrow(318, 186, 352, 194, { stroke: C.warn, width: 1.8, head: 7 });
  sch.bjt(f, 370, 180, { circle: false });
  f.line(330, 180, 330, 180);
  // выходная сторона
  sch.wire(f, [[400, 130], [400, 70]]);
  sch.wire(f, [[400, 70], [560, 70]]);
  f.circle(560, 70, 4.5, { fill: 'none' });
  f.text(560, 54, '+3,3 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.node(f, 470, 70);
  sch.wire(f, [[470, 70], [470, 90]]);
  sch.resistor(f, 470, 120, { rot: 90, len: 60, name: 'Rпу', value: '10 кОм', off: 28 });
  sch.wire(f, [[470, 150], [470, 180]]);
  sch.node(f, 470, 180);
  sch.wire(f, [[400, 230], [400, 330], [620, 330]]);
  sch.gnd(f, 620, 330);
  sch.wire(f, [[470, 180], [620, 180]]);
  f.circle(620, 180, 4.5, { fill: 'none' });
  f.text(626, 168, 'вывод МК', { size: 12, weight: 700 });
  f.text(470, 380, 'вход замкнут → LED светит → Q открыт → МК читает 0', { anchor: 'middle', size: 12, fill: C.ok, weight: 600 });
  f.save(out('optocouplers', 'input-circuit'));

  // 2. Выходной ток от входного для разных CTR
  const g = chart({
    title: 'Ток выхода оптопары, CTR 50 % и 200 %',
    xLabel: 'Ток светодиода If, мА', yLabel: 'Ток транзистора Ic, мА',
    xRange: [0, 10], yRange: [0, 20],
    series: [
      { fn: i => 0.5 * i, label: 'CTR = 50 %', color: C.bad, width: 3 },
      { fn: i => 2 * i, label: 'CTR = 200 %', color: C.ok, width: 3 },
    ],
    hlines: [{ v: 0.33, label: 'нужно 0,33 мА', color: C.warn }],
    markers: [{ x: 5, y: 2.5, label: '5 мА: 2,5 мА ≫ 0,33 мА', dx: 14, dy: -26, anchor: 'start', color: C.bad }],
    legendAt: { x: 90, y: 100, cols: 1 },
    xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 5, 10, 15, 20],
    samples: 50,
  });
  g.save(out('optocouplers', 'ctr'));
}
