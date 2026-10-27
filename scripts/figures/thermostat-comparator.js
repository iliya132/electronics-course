import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('thermostat-comparator');

  // 1. Схема термостата
  const f = new Fig(860, 420, 'Термостат на NTC и компараторе LM393 с гистерезисом и MOSFET');
  sch.wire(f, [[40, 40], [680, 40]]);
  f.circle(40, 40, 4.5, { fill: 'none' });
  f.text(40, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  // опорный делитель (слева)
  const xr = 100;
  sch.node(f, xr, 40);
  sch.wire(f, [[xr, 40], [xr, 55]]);
  sch.resistor(f, xr, 85, { rot: 90, len: 60, name: 'R3', value: '22 кОм', off: -30 });
  sch.wire(f, [[xr, 115], [xr, 125]]);
  sch.resistor(f, xr, 155, { rot: 90, len: 60, name: 'RV1', value: '50 кОм', off: -30 });
  sch.wire(f, [[xr, 185], [xr, 195]]);
  sch.resistor(f, xr, 225, { rot: 90, len: 60, name: 'R4', value: '22 кОм', off: -30 });
  sch.wire(f, [[xr, 255], [xr, 275]]);
  sch.gnd(f, xr, 275);
  sch.wire(f, [[xr + 24, 155], [xr + 60, 155]]);
  f.text(xr + 66, 159, 'движок', { size: 11, fill: C.muted });
  // NTC-делитель
  const xn = 260;
  sch.node(f, xn, 40);
  sch.wire(f, [[xn, 40], [xn, 60]]);
  sch.resistor(f, xn, 100, { rot: 90, len: 80, name: 'NTC', value: '10 кОм', off: -30 });
  sch.wire(f, [[xn, 140], [xn, 170]]);
  sch.node(f, xn, 170);
  sch.resistor(f, xn, 220, { rot: 90, len: 100, name: 'R5', value: '10 кОм', off: -30 });
  sch.wire(f, [[xn, 270], [xn, 290]]);
  sch.gnd(f, xn, 290);
  // компаратор
  sch.opamp(f, 420, 200, { supply: false });
  sch.wire(f, [[xn, 170], [330, 170], [330, 178], [380, 178]]);
  sch.wire(f, [[xr + 60, 155], [xr + 60, 330], [330, 330], [330, 222], [380, 222]]);
  sch.node(f, 330, 330);
  // положительная обратная связь Rf
  sch.wire(f, [[330, 330], [330, 380], [410, 380]]);
  sch.resistor(f, 450, 380, { len: 80, name: 'Rf 1,5 МОм', off: 28 });
  sch.wire(f, [[490, 380], [580, 380], [580, 200]]);
  // выход и подтяжка
  sch.node(f, 580, 200);
  sch.wire(f, [[540, 200], [580, 200]]);
  sch.node(f, 580, 40);
  sch.wire(f, [[580, 40], [580, 60]]);
  sch.resistor(f, 580, 100, { rot: 90, len: 80, name: 'Rп', value: '10 кОм', off: 30 });
  sch.wire(f, [[580, 140], [580, 200]]);
  // MOSFET и лампа
  sch.wire(f, [[580, 200], [610, 200], [610, 235], [636, 235]]);
  sch.mosfet(f, 670, 235);
  sch.node(f, 700, 40);
  sch.wire(f, [[700, 40], [700, 70]]);
  sch.lamp(f, 700, 110, { rot: 90, len: 80, name: 'нагреватель', value: 'лампа 12 В 5 Вт', off: 30 });
  sch.wire(f, [[700, 150], [700, 185]]);
  sch.wire(f, [[700, 285], [700, 305]]);
  sch.gnd(f, 700, 305);
  f.text(20, 408, 'NTC прижат к нагреваемому телу; холодно → напряжение на «−» ниже опоры → выход высокий → нагрев включён', { size: 12, fill: C.muted });
  f.save(out('thermostat-comparator', 'schematic'));

  // 2. Напряжение в узле NTC от температуры и пороги
  const Rn = T => 10e3 * Math.exp(3950 * (1 / (T + 273.15) - 1 / 298.15));
  const V = T => 12 * 10e3 / (10e3 + Rn(T));
  const g = chart({
    title: 'Узел NTC: напряжение и пороги термостата',
    xLabel: 'Температура, °C', yLabel: 'Напряжение в узле NTC, В',
    xRange: [30, 50], yRange: [6.5, 9.2],
    series: [{ fn: V, label: 'Uузла = 12·10/(10 + Rntc)', color: C.accent, width: 3 }],
    markers: [
      { x: 39.0, y: V(39.0), label: 'вкл. ниже 39,0 °C', dx: -10, dy: 26, anchor: 'end', color: C.ok },
      { x: 40.5, y: V(40.5), label: 'выкл. выше 40,5 °C', dx: 12, dy: -22, anchor: 'start', color: C.bad },
    ],
    legendAt: { x: 90, y: 85, cols: 1 },
    xTicks: [30, 35, 40, 45, 50], yTicks: [7, 8, 9],
    samples: 200,
  });
  g.save(out('thermostat-comparator', 'thresholds'));
}
