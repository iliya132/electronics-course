import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('inductive-loads');

  // 1. Драйвер реле на NPN с обратным диодом
  const f = new Fig(560, 380, 'Драйвер реле на NPN-транзисторе с обратным диодом');
  sch.wire(f, [[250, 40], [480, 40]]);
  f.circle(480, 40, 4.5, { fill: 'none' });
  f.text(480, 26, '+5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.node(f, 330, 40); sch.node(f, 420, 40);
  sch.wire(f, [[330, 40], [330, 60]]);
  sch.inductor(f, 330, 110, { rot: 90, len: 100, name: 'катушка', value: '70 Ом, 71 мА', off: -30 });
  sch.wire(f, [[330, 160], [330, 200]]);
  sch.node(f, 330, 188); sch.node(f, 420, 188);
  sch.wire(f, [[420, 40], [420, 66]]);
  sch.diode(f, 420, 118, { rot: 270, len: 90, name: 'VD', off: 26 });
  sch.wire(f, [[420, 170], [420, 188], [330, 188]]);
  sch.bjt(f, 300, 250);
  sch.wire(f, [[330, 300], [330, 322]]);
  sch.gnd(f, 330, 322);
  sch.wire(f, [[60, 250], [110, 250]]);
  sch.resistor(f, 150, 250, { len: 80, name: 'Rб 330 Ом', off: 28 });
  sch.wire(f, [[190, 250], [260, 250]]);
  sch.node(f, 225, 250);
  sch.wire(f, [[225, 250], [225, 262]]);
  sch.resistor(f, 225, 292, { rot: 90, len: 60, name: 'Rбэ', value: '10 кОм', off: -30 });
  sch.gnd(f, 225, 322);
  f.circle(60, 250, 4.5, { fill: 'none' });
  f.text(14, 282, 'вывод МК, 3,3 В', { size: 12, fill: C.muted });
  f.text(440, 236, 'контакты реле\nработают в\nсвоей цепи', { size: 12, fill: C.muted });
  f.save(out('inductive-loads', 'relay-driver'));

  // 2. Ток катушки после выключения (иллюстративная модель)
  const tau = 1.43;
  const g = chart({
    title: 'Ток катушки реле после выключения (модель)',
    xLabel: 'Время после выключения, мс', yLabel: 'Ток катушки, мА',
    xRange: [0, 10], yRange: [0, 80],
    series: [
      { fn: t => 71 * Math.exp(-t / tau), label: 'с диодом: спад по e^(−t/τ)', color: C.accent, width: 3 },
      { fn: t => t < 0.02 ? 71 : 0, label: 'без диода: обрыв', color: C.bad, width: 2.5, dash: '6 4' },
    ],
    hlines: [{ v: 7, label: 'ток отпускания ≈ 10 %', color: C.warn }],
    legendAt: { x: 150, y: 110, cols: 1 },
    xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 20, 40, 60, 80],
    samples: 600,
  });
  g.save(out('inductive-loads', 'coil-decay'));

  // 3. Ток мотора при пуске (иллюстративная модель)
  const m = chart({
    title: 'Ток мотора при пуске (модель)',
    xLabel: 'Время от включения, мс', yLabel: 'Ток мотора, А',
    xRange: [0, 300], yRange: [0, 1.8],
    series: [{ fn: t => 0.3 + 1.2 * Math.exp(-t / 50), label: 'ток мотора', color: C.accent, width: 3 }],
    hlines: [{ v: 1.5, label: 'пусковой (стоп) 1,5 А', color: C.bad }, { v: 0.3, label: 'рабочий 0,3 А', color: C.ok }],
    legendAt: { x: 300, y: 130, cols: 1 },
    xTicks: [0, 50, 100, 150, 200, 250, 300], yTicks: [0, 0.5, 1, 1.5],
    samples: 300,
  });
  m.save(out('inductive-loads', 'motor-start'));
}
