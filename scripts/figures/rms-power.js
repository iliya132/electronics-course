import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('rms-power');

  // 1. Мгновенная мощность синусоиды и её среднее
  const g = chart({
    title: 'Мощность при синусоидальном напряжении',
    xLabel: 'Время, мс (50 Гц, период 20 мс)', yLabel: 'доля от максимума',
    xRange: [0, 40], yRange: [-1.1, 1.3], yTicks: [-1, 0, 0.5, 1], samples: 500,
    series: [
      { fn: t => Math.sin(2 * Math.PI * 50 * t / 1000), label: 'напряжение u / Um', color: C.accent, width: 2.2 },
      { fn: t => Math.pow(Math.sin(2 * Math.PI * 50 * t / 1000), 2), label: 'мощность p / pmax', color: C.bad, width: 2.8 },
    ],
    hlines: [{ v: 0.5, label: 'среднее 0,5', color: C.ok, dash: '7 5' }],
    legendAt: { x: 200, y: 100, cols: 1 },
  });
  g.save(out('rms-power', 'power'));

  // 2. Три формы сигнала и их действующие значения
  const f = new Fig(480, 300, 'Действующее значение сигналов разной формы');
  f.text(240, 22, 'Пунктир — действующее значение (RMS), амплитуда 1', { anchor: 'middle', size: 14, weight: 700 });
  const shapes = [
    ['синус', 0.707, t => Math.sin(2 * Math.PI * t)],
    ['прямоуг.', 1.0, t => (t % 1 < 0.5 ? 1 : -1)],
    ['треугольник', 0.577, t => { const x = t % 1; return x < 0.25 ? 4 * x : x < 0.75 ? 2 - 4 * x : 4 * x - 4; }],
  ];
  shapes.forEach(([name, rms, fn], i) => {
    const x0 = 14 + i * 156, w = 140, cy = 150, A = 62;
    f.line(x0, cy, x0 + w, cy, { stroke: C.muted, width: 1.2 });
    const pts = [];
    for (let k = 0; k <= 280; k++) pts.push([x0 + k * w / 280, cy - A * fn(k / 280 * 2)]);
    f.poly(pts, { stroke: C.accent, width: 2.6 });
    f.line(x0, cy - rms * A, x0 + w, cy - rms * A, { stroke: C.bad, width: 2, dash: '6 4' });
    f.line(x0, cy + rms * A, x0 + w, cy + rms * A, { stroke: C.bad, width: 2, dash: '6 4' });
    f.text(x0 + w / 2, 250, name, { anchor: 'middle', size: 14, weight: 700 });
    f.text(x0 + w / 2, 272, 'Uрмс = ' + String(rms).replace('.', ',') + ' · Um', { anchor: 'middle', size: 13, fill: C.bad, weight: 700 });
  });
  f.save(out('rms-power', 'shapes'));
}
