import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('wires-connectors');

  // 1. Падение напряжения на кабеле 2 м (туда и обратно) при токе 2 А
  const g = chart({
    title: 'Падение напряжения на кабеле 2 м при токе 2 А',
    xLabel: 'Сечение жилы S, мм²', yLabel: 'Падение ΔU, В',
    xRange: [0.1, 4], yRange: [0, 1.5],
    series: [{ fn: s => 2 * 2 * 0.0175 * 2 / s, color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 0.25, y: 0.56, label: '0,25 мм²: 0,56 В', dx: 10, dy: -8, color: C.bad },
      { x: 0.5, y: 0.28, label: '0,5 мм²: 0,28 В', dx: 10, dy: -10 },
      { x: 1, y: 0.14, label: '1 мм²: 0,14 В', dx: 10, dy: -10, color: C.ok },
    ],
  });
  g.save(out('wires-connectors', 'drop-vs-area'));

  // 2. Разъёмы схематично
  const f = new Fig(480, 340, 'Типичные разъёмы электроники');
  const cells = [
    ['Dupont 2,54 мм', 'около 1 А на контакт', i => {
      for (let k = 0; k < 4; k++) { f.rect(16 + k * 18, 36 + i, 12, 12, { fill: C.ink, stroke: 'none', r: 1 }); f.line(22 + k * 18, 48 + i, 22 + k * 18, 70 + i, { width: 2 }); }
    }],
    ['JST-XH 2,5 мм', 'до 3 А, есть ключ', i => {
      f.rect(14, 32 + i, 80, 34, { fill: '#e8e4d8', stroke: C.muted, r: 4, width: 2 });
      [0, 1, 2].forEach(k => f.circle(32 + k * 24, 49 + i, 5, { fill: '#caa12a', stroke: 'none' }));
      f.rect(52, 28 + i, 14, 5, { fill: C.muted, stroke: 'none', r: 1 });
    }],
    ['Винтовая клемма', 'до 10 А, шаг 5,08 мм', i => {
      f.rect(14, 28 + i, 80, 44, { fill: '#2b8b45', stroke: C.muted, r: 4, width: 2 });
      [0, 1].forEach(k => { f.circle(36 + k * 36, 44 + i, 11, { fill: '#cfcfcf', stroke: C.muted, width: 1.5 }); f.line(30 + k * 36, 44 + i, 42 + k * 36, 44 + i, { width: 2, stroke: '#555' }); });
    }],
    ['XT60 (батареи)', 'до 60 А', i => {
      f.rect(18, 30 + i, 70, 38, { fill: '#f2c200', stroke: C.muted, r: 8, width: 2 });
      [0, 1].forEach(k => f.rect(30 + k * 30, 40 + i, 18, 18, { fill: '#222', stroke: 'none', r: 3 }));
    }],
    ['USB-C', 'до 3 А (5 А с чипом)', i => {
      f.rect(14, 38 + i, 84, 24, { fill: 'none', stroke: C.ink, r: 12, width: 3 });
      f.rect(22, 46 + i, 68, 8, { fill: C.muted, stroke: 'none', r: 4 });
    }],
    ['USB Micro-B', 'до 1,8 А, хрупкий', i => {
      f.path(`M16 ${40 + i}h84l-8 22h-68z`, { width: 3 });
      f.rect(30, 50 + i, 54, 6, { fill: C.muted, stroke: 'none', r: 2 });
    }],
  ];
  cells.forEach(([name, note, draw], idx) => {
    const col = idx % 2, row = Math.floor(idx / 2);
    const ox = col * 240, oy = row * 108;
    f.add(`<g transform="translate(${ox} ${oy})">`);
    draw(0);
    f.add('</g>');
    f.text(ox + 108, oy + 50, name, { size: 12, weight: 700 });
    f.text(ox + 108, oy + 70, note, { size: 11, fill: C.muted });
  });
  f.save(out('wires-connectors', 'connectors'));
}
