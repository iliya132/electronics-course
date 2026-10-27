import { Fig, C, chart, out, fresh } from '../lib/fig.js';

const RHO = 0.0175; // Ом·мм²/м, медь при 20 °C

export function generate() {
  fresh('resistance');

  // 1. Электрон между ионами решётки
  const f = new Fig(480, 300, 'Свободный электрон в металле сталкивается с ионами решётки');
  const xs = [90, 170, 250, 330, 410], ys = [80, 150, 220];
  for (const y of ys) {
    for (const x of xs) {
      f.circle(x, y, 15, { stroke: C.muted, fill: C.surface, width: 2 });
      f.text(x, y + 5, '+', { anchor: 'middle', size: 16, fill: C.muted, weight: 700 });
    }
  }
  const path = [[30, 115], [130, 115], [150, 185], [210, 185], [230, 115], [290, 115], [310, 185], [370, 185], [390, 115], [452, 115]];
  f.poly(path, { stroke: C.warn, width: 3 });
  for (const [x, y] of [[130, 115], [210, 185], [290, 115], [370, 185]]) {
    f.dot(x, y, 4.5, C.bad);
  }
  f.circle(30, 115, 7, { stroke: C.warn, fill: C.warn });
  f.text(8, 98, 'электрон', { anchor: 'start', size: 14, fill: C.warn, weight: 600 });
  f.text(244, 264, 'Красные точки: столкновения. На каждом электрон отдаёт\nчасть энергии решётке, и провод нагревается.', { anchor: 'middle', size: 14, fill: C.muted });
  f.text(244, 24, 'Серые «+»: ионы кристаллической решётки (стоят на месте)', { anchor: 'middle', size: 14, fill: C.muted });
  f.save(out('resistance', 'lattice'));

  // 2. R от длины при трёх сечениях
  const L = chart({
    title: 'Сопротивление медного провода от длины',
    xLabel: 'Длина провода L, м', yLabel: 'Сопротивление R, Ом',
    xRange: [0, 20], yRange: [0, 1.5],
    series: [
      { fn: l => RHO * l / 0.25, label: 'сечение 0,25 мм²', color: C.bad },
      { fn: l => RHO * l / 0.5, label: 'сечение 0,5 мм²', color: C.accent },
      { fn: l => RHO * l / 1.5, label: 'сечение 1,5 мм²', color: C.ok },
    ],
    markers: [{ x: 10, y: 0.35, label: '10 м → 0,35 Ом', dx: 10, dy: 22, color: C.accent }],
  });
  L.save(out('resistance', 'r-vs-length'));

  // 3. R от сечения при длине 10 м
  const S = chart({
    title: 'Сопротивление 10 м меди от сечения',
    xLabel: 'Площадь сечения S, мм²', yLabel: 'Сопротивление R, Ом',
    xRange: [0.25, 4], yRange: [0, 0.8],
    series: [{ fn: s => RHO * 10 / s, color: C.accent }],
    legend: false,
    markers: [
      { x: 0.5, y: 0.35, label: '0,5 мм²: 0,35 Ом', dx: 10, dy: -8 },
      { x: 1, y: 0.175, label: '1 мм²: 0,175 Ом', dx: 10, dy: -10 },
      { x: 2, y: 0.0875, label: '2 мм²: 0,0875 Ом', dx: 10, dy: -12 },
    ],
  });
  S.save(out('resistance', 'r-vs-area'));
}
