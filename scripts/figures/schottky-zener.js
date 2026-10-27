import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('schottky-zener');

  // 1. Прямая ВАХ: кремниевый диод и диод Шоттки
  const si = v => Math.exp((v - 0.9) / 0.044);
  const sk = v => Math.exp((v - 0.45) / 0.0285);
  const g = chart({
    title: 'Падение напряжения: кремний и Шоттки',
    xLabel: 'Прямое напряжение, В', yLabel: 'Прямой ток, А',
    xRange: [0, 1.1], yRange: [0, 2],
    series: [
      { fn: v => Math.min(si(v), 3), label: 'кремниевый 1N4007', color: C.bad, width: 3 },
      { fn: v => Math.min(sk(v), 3), label: 'Шоттки 1N5819', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 100, cols: 1 },
    markers: [
      { x: 0.9, y: 1, label: '1 А: 0,9 В', dx: -10, dy: 22, anchor: 'end', color: C.bad },
      { x: 0.45, y: 1, label: '1 А: 0,45 В', dx: -8, dy: -10, anchor: 'end', color: C.accent },
    ],
  });
  g.save(out('schottky-zener', 'schottky-vs-si'));

  // 2. Обратная ветка стабилитрона 5,1 В
  const z = v => Math.min(60, 5 * Math.exp((v - 5.1) / 0.12));
  const h = chart({
    title: 'Стабилитрон 5,1 В: обратная ветка',
    xLabel: 'Обратное напряжение, В', yLabel: 'Обратный ток, мА',
    xRange: [0, 6.5], yRange: [0, 60],
    series: [{ fn: z, color: C.accent, width: 3 }],
    legend: false,
    markers: [{ x: 5.1, y: 5, label: '5,1 В при 5 мА', dx: -10, dy: -12, anchor: 'end', color: C.bad }],
    notes: [{ x: 0.3, y: 50, text: 'до ~4,5 В тока почти нет;\nпотом напряжение «держится» около Uz', color: C.muted }],
  });
  h.save(out('schottky-zener', 'zener-iv'));

  // 3. Параметрический стабилизатор
  const f = new Fig(480, 300, 'Параметрический стабилизатор на стабилитроне');
  f.circle(24, 70, 4.5, { fill: 'none' });
  f.text(24, 94, 'Uвх 12 В', { anchor: 'start', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[28, 70], [50, 70]]);
  sch.resistor(f, 110, 70, { len: 120, name: 'R 330 Ом', off: 26 });
  sch.wire(f, [[170, 70], [300, 70]]);
  sch.node(f, 250, 70);
  sch.wire(f, [[250, 70], [250, 105]]);
  sch.diode(f, 250, 150, { rot: 270, len: 90, zener: true, name: 'VD 5,1 В', off: 30 });
  sch.wire(f, [[250, 195], [250, 230]]);
  sch.gnd(f, 250, 230);
  sch.wire(f, [[250, 70], [340, 70], [340, 105]]);
  sch.resistor(f, 340, 150, { rot: 90, len: 90, name: 'Rн', off: 22 });
  sch.wire(f, [[340, 195], [340, 230]]);
  sch.gnd(f, 340, 230);
  f.circle(304, 70, 4.5, { fill: 'none' });
  f.text(300, 54, 'Uвых 5,1 В', { anchor: 'end', size: 13, weight: 700, fill: C.accent });
  f.text(240, 284, 'Через R идёт ток нагрузки и ток стабилитрона: R = (Uвх − Uz)/(Iz + Iн)', { anchor: 'middle', size: 11.5, fill: C.muted });
  f.save(out('schottky-zener', 'regulator'));
}
