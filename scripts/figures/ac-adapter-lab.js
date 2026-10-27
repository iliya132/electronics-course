import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ac-adapter-lab');

  // 1. Схема опыта
  const f = new Fig(480, 300, 'Схема измерений на низковольтном AC-адаптере');
  f.rect(20, 80, 120, 110, { r: 8, width: 2.5, fill: C.surface });
  f.text(80, 118, 'адаптер', { anchor: 'middle', size: 15, weight: 700 });
  f.text(80, 140, 'AC 12 В\n(заводской)', { anchor: 'middle', size: 12, fill: C.muted });
  sch.wire(f, [[140, 105], [190, 105]]);
  sch.fuse(f, 230, 105, { name: 'F 1 А', len: 80 });
  sch.wire(f, [[270, 105], [360, 105], [360, 135]]);
  sch.resistor(f, 360, 175, { rot: 90, name: '33 Ом', off: 28, len: 80 });
  sch.wire(f, [[360, 215], [360, 250], [160, 250], [160, 165], [140, 165]]);
  sch.wire(f, [[300, 105], [300, 140]], { color: C.accent });
  sch.meter(f, 300, 175, { rot: 90, sym: 'V~', color: C.accent, len: 60 });
  sch.wire(f, [[300, 205], [300, 250]], { color: C.accent });
  sch.node(f, 300, 105); sch.node(f, 300, 250);
  f.text(240, 24, 'Режим мультиметра: V~ (переменное напряжение)', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(240, 284, 'Сначала измерь без нагрузки, потом с резистором', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('ac-adapter-lab', 'setup'));

  // 2. Эталонная осциллограмма: 13,7 В RMS
  const rms = 13.7, pk = rms * Math.SQRT2;
  const g = chart({
    title: 'Эталон: 13,7 В RMS, пик 19,4 В',
    xLabel: 'Время, мс (50 Гц)', yLabel: 'Напряжение, В',
    xRange: [0, 40], yRange: [-24, 24], yTicks: [-19.4, -10, 0, 10, 19.4], samples: 500,
    series: [{ fn: t => pk * Math.sin(2 * Math.PI * 50 * t / 1000), color: C.accent, width: 3 }],
    legend: false,
    hlines: [{ v: rms, label: 'RMS 13,7 В', color: C.ok }, { v: -rms, label: '', color: C.ok }],
    markers: [{ x: 5, y: pk, label: 'пик 19,4 В', dx: 8, dy: -8, color: C.bad }, { x: 15, y: -pk, label: 'размах 38,8 В', dx: 8, dy: 22, color: C.bad }],
  });
  g.save(out('ac-adapter-lab', 'reference'));
}
