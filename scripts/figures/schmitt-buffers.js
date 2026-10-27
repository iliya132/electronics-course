import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('schmitt-buffers');

  // 1. Зашумлённый медленный сигнал: простой порог и триггер Шмитта
  const input = t => 1.5 + 0.2 * t + 0.35 * Math.sin(5.1 * t) + 0.2 * Math.sin(11.7 * t + 1);
  const N = 800, tMax = 10;
  let plain = [], schm = [], st = 0;
  for (let i = 0; i <= N; i++) {
    const t = tMax * i / N, v = input(t);
    plain.push([t, v > 2.5 ? 4.6 : 0]);
    if (st === 0 && v > 2.7) st = 1;
    if (st === 1 && v < 1.8) st = 0;
    schm.push([t, st ? 4.6 : 0]);
  }
  const g = chart({
    title: 'Шумный вход: один порог и триггер Шмитта',
    xLabel: 'Время, с', yLabel: 'Напряжение, В',
    xRange: [0, 10], yRange: [-0.3, 5.2],
    series: [
      { points: Array.from({ length: N + 1 }, (_, i) => [tMax * i / N, input(tMax * i / N)]), label: 'вход с шумом', color: C.muted, width: 2 },
      { points: plain, label: 'один порог 2,5 В', color: C.bad, width: 1.8, dash: '5 3' },
      { points: schm, label: 'Шмитт: 1,8 и 2,7 В', color: C.ok, width: 3 },
    ],
    legendAt: { x: 300, y: 225, cols: 1 },
    xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 1, 2, 3, 4, 5],
    samples: 400,
  });
  g.save(out('schmitt-buffers', 'noisy'));

  // 2. Антидребезг RC + 74HC14
  const f = new Fig(640, 320, 'Антидребезг кнопки: RC-цепочка и триггер Шмитта 74HC14');
  sch.wire(f, [[60, 40], [220, 40]]);
  f.circle(60, 40, 4.5, { fill: 'none' });
  f.text(60, 26, '+5 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(f, [[140, 40], [140, 56]]);
  sch.node(f, 140, 40);
  sch.resistor(f, 140, 96, { rot: 90, len: 80, name: 'R', value: '10 кОм', off: -30 });
  sch.wire(f, [[140, 136], [140, 160]]);
  sch.node(f, 140, 160);
  sch.wire(f, [[140, 160], [140, 176]]);
  sch.switch(f, 140, 206, { rot: 90, len: 60, name: 'SB', off: -30 });
  sch.wire(f, [[140, 236], [140, 256]]);
  sch.gnd(f, 140, 256);
  sch.wire(f, [[140, 160], [220, 160]]);
  sch.node(f, 220, 160);
  sch.wire(f, [[220, 160], [220, 176]]);
  sch.capacitor(f, 220, 206, { rot: 90, len: 60, name: 'C', value: '1 мкФ', off: 30 });
  sch.wire(f, [[220, 236], [220, 256]]);
  sch.gnd(f, 220, 256);
  sch.wire(f, [[220, 160], [320, 160]]);
  sch.block(f, 320, 130, 80, 60, '74HC14\nШмитт', { size: 13 });
  f.circle(406, 160, 5, { width: 2 });
  sch.wire(f, [[411, 160], [520, 160]]);
  f.circle(520, 160, 4.5, { fill: 'none' });
  f.text(520, 144, 'выход (инверт.)', { anchor: 'middle', size: 12, weight: 700 });
  f.text(300, 270, 'τ = R·C = 10 мс; фронт до 2,7 В ≈ 7,8 мс', { size: 13, fill: C.ok, weight: 700 });
  f.save(out('schmitt-buffers', 'debounce'));
}
