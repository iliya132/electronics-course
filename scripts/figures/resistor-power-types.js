import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('resistor-power-types');

  // 1. Размеры корпусов в масштабе 40 px на мм
  const k = 40;
  const chips = [
    ['0402', 1.0, 0.5, '0,063 Вт'],
    ['0603', 1.6, 0.8, '0,1 Вт'],
    ['0805', 2.0, 1.25, '0,125 Вт'],
    ['1206', 3.2, 1.6, '0,25 Вт'],
  ];
  const f = new Fig(480, 300, 'Размеры резисторов в одном масштабе');
  f.text(240, 24, 'Реальные размеры в масштабе (1 мм = 40 px)', { anchor: 'middle', size: 15, weight: 700 });
  let x = 24;
  chips.forEach(([name, w, h, p]) => {
    const W = w * k, H = h * k, y = 110 - H;
    f.rect(x, y, W, H, { fill: '#222', stroke: C.muted, r: 2, width: 1.2 });
    f.rect(x, y, W * 0.14, H, { fill: '#b7b7b7', stroke: 'none', r: 1 });
    f.rect(x + W * 0.86, y, W * 0.14, H, { fill: '#b7b7b7', stroke: 'none', r: 1 });
    f.text(x + W / 2, 134, name, { anchor: 'middle', size: 15, weight: 700 });
    f.text(x + W / 2, 152, p, { anchor: 'middle', size: 12, fill: C.accent, weight: 700 });
    f.text(x + W / 2, 168, `${String(w).replace('.', ',')}×${String(h).replace('.', ',')} мм`, { anchor: 'middle', size: 11, fill: C.muted });
    x += W + 24;
  });
  // выводной резистор 0,25 Вт: корпус 6,3×2,3 мм
  const by = 236;
  f.line(60, by, 420, by, { width: 2.5 });
  f.rect(114, by - 46, 252, 92, { fill: '#e4c99e', stroke: C.muted, r: 40, width: 2 });
  f.text(240, by + 8, 'выводной 0,25 Вт: 6,3×2,3 мм', { anchor: 'middle', size: 13, fill: '#222', weight: 700 });
  f.line(24, 190, 64, 190, { width: 3, stroke: C.ink });
  f.text(44, 208, '1 мм', { anchor: 'middle', size: 11, fill: C.muted });
  f.save(out('resistor-power-types', 'sizes'));

  // 2. Снижение допустимой мощности с температурой
  const derate = t => (t <= 70 ? 100 : Math.max(0, 100 * (155 - t) / 85));
  const g = chart({
    title: 'Допустимая мощность падает при нагреве',
    xLabel: 'Температура среды, °C', yLabel: 'Допустимая мощность, % от номинала',
    xRange: [0, 160], yRange: [0, 120], yTicks: [0, 25, 50, 75, 100],
    series: [{ fn: derate, color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: 70, label: '70 °C', color: C.muted }],
    markers: [
      { x: 100, y: derate(100), label: '100 °C → 65 %', dx: 10, dy: -10, color: C.bad },
      { x: 155, y: 0, label: '155 °C → 0', dx: -8, dy: -12, anchor: 'end' },
    ],
  });
  g.save(out('resistor-power-types', 'derating'));
}
