import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('thermal-design');

  // 1. Тепловая цепь: P → θJC → θCS → θSA → Ta
  const f = new Fig(480, 250, 'Тепловая цепь стабилизатора с радиатором');
  const y = 100;
  f.circle(40, y, 5, { fill: C.bad, stroke: C.bad });
  f.text(40, y - 18, 'кристалл', { anchor: 'middle', size: 12, weight: 700, fill: C.bad });
  f.text(40, y + 28, 'Tj', { anchor: 'middle', size: 13, weight: 700, fill: C.bad });
  sch.wire(f, [[45, y], [60, y]]);
  sch.resistor(f, 100, y, { len: 70, name: 'θJC', off: 24 });
  sch.wire(f, [[135, y], [150, y]]);
  sch.node(f, 150, y);
  f.text(150, y + 28, 'корпус Tc', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[150, y], [170, y]]);
  sch.resistor(f, 205, y, { len: 70, name: 'θCS', off: 24 });
  sch.wire(f, [[240, y], [260, y]]);
  sch.node(f, 260, y);
  f.text(260, y + 28, 'радиатор', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[260, y], [280, y]]);
  sch.resistor(f, 315, y, { len: 70, name: 'θSA', off: 24 });
  sch.wire(f, [[350, y], [400, y]]);
  f.circle(404, y, 5, { fill: C.ok, stroke: C.ok });
  f.text(404, y - 18, 'воздух', { anchor: 'middle', size: 12, weight: 700, fill: C.ok });
  f.text(404, y + 28, 'Ta', { anchor: 'middle', size: 13, weight: 700, fill: C.ok });
  sch.current(f, 200, y - 52, 'right', 'P (тепловой поток)', { color: C.bad, off: -10, len: 60 });
  f.text(240, 206, 'Tj = Ta + P·(θJC + θCS + θSA)', { anchor: 'middle', size: 16, weight: 700 });
  f.text(240, 232, 'без радиатора вся цепь заменяется одним θJA', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('thermal-design', 'chain'));

  // 2. Температура кристалла в зависимости от мощности
  const Ta = 25;
  const g = chart({
    title: 'Температура кристалла при Ta = 25 °C',
    xLabel: 'Мощность потерь, Вт', yLabel: 'Tj, °C',
    xRange: [0, 3], yRange: [20, 200],
    series: [
      { fn: p => Ta + p * 100, label: 'SOT-223, θJA ≈ 100 °C/Вт', color: C.bad, width: 3 },
      { fn: p => Ta + p * 60, label: 'TO-220 без радиатора, ≈ 60', color: C.warn, width: 3 },
      { fn: p => Ta + p * 21, label: 'TO-220 + радиатор, ≈ 21', color: C.ok, width: 3 },
    ],
    hlines: [{ v: 125, label: 'предел 125 °C', color: C.muted }],
    legendAt: { x: 90, y: 92, cols: 1 },
    markers: [{ x: 2.1, y: 25 + 2.1 * 60, label: '2,1 Вт: 151 °C', dx: 12, dy: -12, anchor: 'start', color: C.warn }],
  });
  g.save(out('thermal-design', 'junction'));
}
