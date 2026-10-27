import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('power-budget');

  // 1. Бюджет узлов: средний и пиковый ток
  const parts = [
    ['ESP32', 80, 350, C.accent],
    ['OLED', 20, 20, C.ok],
    ['BME280', 1, 1, C.warn],
    ['светодиод', 10, 10, C.bad],
  ];
  const f = new Fig(480, 300, 'Бюджет тока: средний и пиковый');
  f.text(240, 24, 'Ток узлов на шине 3,3 В, мА', { anchor: 'middle', size: 16, weight: 700 });
  const k = 0.88, x0 = 24;
  const row = (y, label, key) => {
    f.text(x0, y - 8, label, { size: 14, weight: 700 });
    let x = x0;
    parts.forEach(p => {
      const w = p[key] * k;
      f.rect(x, y, w, 34, { fill: p[3], stroke: C.surface, width: 1, r: 0, opacity: 0.85 });
      if (w > 24) f.text(x + w / 2, y + 22, String(p[key]), { anchor: 'middle', size: 13, weight: 700, fill: '#ffffff' });
      x += w;
    });
    return x;
  };
  const xa = row(70, 'Средний: 80 + 20 + 1 + 10 = 111 мА', 1);
  const xp = row(150, 'Пиковый: 350 + 20 + 1 + 10 = 381 мА', 2);
  f.text(x0, 214, 'ESP32', { size: 13, fill: C.accent, weight: 700 });
  f.text(x0 + 70, 214, 'OLED', { size: 13, fill: C.ok, weight: 700 });
  f.text(x0 + 140, 214, 'BME280', { size: 13, fill: C.warn, weight: 700 });
  f.text(x0 + 224, 214, 'светодиод', { size: 13, fill: C.bad, weight: 700 });
  f.text(240, 254, 'С запасом 30 % на пик: 381 × 1,3 ≈ 495 мА', { anchor: 'middle', size: 14, weight: 700, fill: C.accent });
  f.text(240, 280, 'Источник и стабилизатор выбирают по пику, батарею — по среднему', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('power-budget', 'budget'));

  // 2. Ток во времени: короткие пики и сон, средняя линия
  const g = chart({
    title: 'Датчик проснулся на 2 с каждую минуту',
    xLabel: 'Время, с', yLabel: 'Ток, мА (лог. шкала)',
    xRange: [0, 120], yRange: [-2, 2.3], yTicks: [-2, -1, 0, 1, 2],
    yFormat: v => String(Number((10 ** v).toPrecision(2))).replace('.', ','),
    series: [
      { steps: true, color: C.accent, width: 2.5, points: [[0, Math.log10(0.02)], [2, Math.log10(0.02)], [2, Math.log10(100)], [4, Math.log10(100)], [4, Math.log10(0.02)], [62, Math.log10(0.02)], [62, Math.log10(100)], [64, Math.log10(100)], [64, Math.log10(0.02)], [120, Math.log10(0.02)]] },
    ],
    legend: false,
    hlines: [{ v: Math.log10(3.35), label: 'средний ≈ 3,35 мА', color: C.bad }],
    markers: [{ x: 3, y: 2, label: '100 мА: 2 с', dx: 10, dy: 12 }, { x: 30, y: Math.log10(0.02), label: '0,02 мА: сон', dx: 0, dy: -12, anchor: 'middle' }],
  });
  g.save(out('power-budget', 'duty'));
}
