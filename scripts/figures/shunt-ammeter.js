import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('shunt-ammeter');

  // 1. Схема: нижний шунт 0,1 Ом, ОУ с K = 11
  const f = new Fig(860, 420, 'Амперметр на шунте 0,1 Ом и неинвертирующем усилителе');
  sch.wire(f, [[40, 40], [200, 40]]);
  f.circle(40, 40, 4.5, { fill: 'none' });
  f.text(40, 26, '+5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[120, 40], [120, 60]]);
  sch.node(f, 120, 40);
  sch.resistor(f, 120, 100, { rot: 90, len: 80, name: 'нагрузка', value: '10 Ом 5 Вт', off: -30 });
  sch.wire(f, [[120, 140], [120, 200]]);
  sch.node(f, 120, 200);
  sch.resistor(f, 120, 240, { rot: 90, len: 80, name: 'Rш', value: '0,1 Ом 1 Вт', off: -30 });
  sch.wire(f, [[120, 280], [120, 300]]);
  sch.gnd(f, 120, 300);
  // ОУ, неинвертирующий: + сверху
  sch.opamp(f, 340, 200, { swap: true, supply: false });
  sch.wire(f, [[120, 200], [160, 200], [160, 178], [300, 178]]);
  f.text(200, 172, 'Uш', { size: 13, weight: 700, fill: C.warn });
  sch.node(f, 480, 200);
  sch.wire(f, [[460, 200], [480, 200], [480, 280], [440, 280]]);
  sch.resistor(f, 400, 280, { len: 80, name: 'Rf', value: '9,1 кОм + 2 кОм', off: 28 });
  sch.wire(f, [[360, 280], [300, 280], [300, 222]]);
  sch.node(f, 300, 280);
  sch.wire(f, [[300, 280], [300, 320]]);
  sch.resistor(f, 300, 350, { rot: 90, len: 60, name: 'Rg', value: '1 кОм', off: -30 });
  sch.gnd(f, 300, 380);
  sch.wire(f, [[480, 200], [560, 200]]);
  f.circle(560, 200, 4.5, { fill: 'none' });
  f.text(560, 184, 'Uвых', { anchor: 'middle', size: 13, weight: 700 });
  f.text(580, 230, 'Uвых = I·Rш·K = I · 0,1 · 11\n= 1,1 В на каждый ампер', { size: 13, fill: C.ok, weight: 700 });
  f.text(580, 290, 'питание ОУ 5 В (rail-to-rail),\nполная шкала 3 А → 3,3 В', { size: 12, fill: C.muted });
  f.save(out('shunt-ammeter', 'schematic'));

  // 2. Идеальная характеристика и влияние смещения ОУ
  const K = 11, Rsh = 0.1, Vos = 0.002;
  const g = chart({
    title: 'Выход амперметра: идеал и смещение ОУ 2 мВ',
    xLabel: 'Ток, А', yLabel: 'Uвых, В',
    xRange: [0, 3], yRange: [0, 3.5],
    series: [
      { fn: i => K * Rsh * i, label: 'идеал: 1,1 В/А', color: C.accent, width: 3 },
      { fn: i => K * Rsh * i + K * Vos, label: 'со смещением +2 мВ (×11 = 22 мВ)', color: C.bad, width: 2.4, dash: '8 5' },
    ],
    hlines: [{ v: 3.3, label: 'предел 3,3 В', color: C.warn }],
    legendAt: { x: 90, y: 100, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], yTicks: [0, 1, 2, 3],
    samples: 100,
  });
  g.save(out('shunt-ammeter', 'transfer'));
}
