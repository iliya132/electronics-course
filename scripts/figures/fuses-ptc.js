import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const lg = Math.log10;
const pow = v => String(Number((10 ** v).toPrecision(3))).replace('.', ',');

export function generate() {
  fresh('fuses-ptc');

  // 1. Время-токовая характеристика плавкого предохранителя (типичные значения)
  const table = [[1.5, 600], [2, 20], [3, 1.2], [5, 0.08], [10, 0.004]];
  const g = chart({
    title: 'Время срабатывания быстрого предохранителя',
    xLabel: 'Ток в кратных номинала I / Iном', yLabel: 'Время срабатывания, с (лог. шкала)',
    xRange: [1, 10], yRange: [-3, 3.2], log: true, yTicks: [-3, -2, -1, 0, 1, 2, 3], xTicks: [1, 2, 3, 5, 10],
    yFormat: pow,
    series: [{ points: table.map(([x, t]) => [x, lg(t)]), color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 2, y: lg(20), label: '2×: около 20 с', dx: 10, dy: -10 },
      { x: 5, y: lg(0.08), label: '5×: около 0,08 с', dx: -10, dy: 24, anchor: 'end' },
      { x: 10, y: lg(0.004), label: '10×: 4 мс', dx: -10, dy: -12, anchor: 'end' },
    ],
    notes: [{ x: 1.03, y: 2.9, text: 'до ~1,3×: держит долго', color: C.ok }],
  });
  g.save(out('fuses-ptc', 'time-current'));

  // 2. PTC: сопротивление растёт на порядки при нагреве
  const yLog = t => -0.7 + 4.2 / (1 + Math.exp(-(t - 118) / 6));
  const p = chart({
    title: 'Самовосстанавливающийся предохранитель (PTC)',
    xLabel: 'Температура элемента, °C', yLabel: 'Сопротивление, Ом (лог. шкала)',
    xRange: [20, 160], yRange: [-1, 4], yTicks: [-1, 0, 1, 2, 3, 4], yFormat: pow,
    series: [{ fn: yLog, color: C.bad, width: 3 }],
    legend: false,
    markers: [
      { x: 25, y: yLog(25), label: 'в норме: 0,2 Ом', dx: 10, dy: -12, color: C.ok },
      { x: 150, y: yLog(150), label: 'сработал: тысячи Ом', dx: -10, dy: 22, anchor: 'end', color: C.bad },
    ],
  });
  p.save(out('fuses-ptc', 'ptc'));

  // 3. Где ставят предохранитель
  const f = new Fig(480, 220, 'Предохранитель на входе питания платы');
  const boxes = [
    ['разъём\nпитания', 10, C.muted],
    ['предохранитель\nF', 122, C.bad],
    ['защита:\nдиод, TVS', 234, C.muted],
    ['стабилизатор\nи схема', 346, C.muted],
  ];
  boxes.forEach(([t, x, col], i) => {
    f.rect(x, 70, 84, 62, { stroke: col, r: 8, width: 2.5 });
    f.text(x + 42, 96, t, { anchor: 'middle', size: 13, weight: 700, fill: col });
    if (i < 3) f.arrow(x + 84, 101, x + 112, 101, { stroke: C.ink, width: 2.5, head: 9 });
  });
  f.text(240, 30, 'Предохранитель стоит первым после разъёма', { anchor: 'middle', size: 16, weight: 700 });
  f.text(240, 172, 'Он защищает от тока короткого замыкания всю плату после себя', { anchor: 'middle', size: 13, fill: C.muted });
  f.text(240, 196, 'Перегорел — искать причину КЗ, а не просто менять', { anchor: 'middle', size: 13, fill: C.bad, weight: 600 });
  f.save(out('fuses-ptc', 'placement'));
}
