import { diagram, tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('smart-irrigation');

  diagram({
    title: 'Умный полив C4: датчик, насос, защита и сон',
    w: 900, h: 360,
    boxes: [
      { id: 'sen', x: 20, y: 60, w: 160, h: 70, text: 'датчик влажности\nёмкостной, 3,3 В\nвыход в АЦП', tone: 'warn', size: 11 },
      { id: 'esp', x: 250, y: 120, w: 210, h: 110, text: 'ESP32\nпробуждение 2 раза в сутки\nизмерение, решение, полив', tone: 'accent', size: 11 },
      { id: 'mos', x: 520, y: 60, w: 150, h: 60, text: 'MOSFET IRLZ44N\n+ диод на насос', tone: 'ok', size: 11 },
      { id: 'pump', x: 720, y: 60, w: 150, h: 60, text: 'насос 5 В\n0,3 А', tone: 'ok', size: 12 },
      { id: 'fl', x: 520, y: 170, w: 150, h: 60, text: 'поплавок\n(уровень воды)', tone: 'bad', size: 12 },
      { id: 'wd', x: 720, y: 170, w: 150, h: 70, text: 'защита: лимит 30 с,\nWDT, PTC в питании', tone: 'bad', size: 11 },
      { id: 'bat', x: 250, y: 270, w: 210, h: 56, text: '18650 + TP4056 + LDO\n(+ солнечная панель)', tone: 'muted', size: 11 },
    ],
    arrows: [['sen', 'esp'], ['esp', 'mos'], ['mos', 'pump'], ['fl', 'esp'], ['wd', 'mos'], ['bat', 'esp']],
  }).save(out('smart-irrigation', 'system'));

  const mah = n => (0.085 * 24 + (90 * 8 * n) / 3600 + 0.3 * 1000 * 9 * n / 3600 * 0.0 + 300 * 9 * n / 3600);
  chart({
    title: 'Расход энергии за сутки от числа поливов',
    xLabel: 'Число поливов в сутки', yLabel: 'Расход, мА·ч в сутки',
    xRange: [0, 6], yRange: [0, 8],
    series: [{ fn: n => 0.085 * 24 + 90 * 8 * Math.max(n, 2) / 3600 + 300 * 9 * n / 3600, label: 'сон + два измерения + насос 9 с', color: C.accent, width: 3 }],
    markers: [{ x: 2, y: 0.085 * 24 + 90 * 8 * 2 / 3600 + 300 * 9 * 2 / 3600, label: '2 полива: 3,9 мА·ч', dx: 12, dy: 22, anchor: 'start' }],
    xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [0, 2, 4, 6, 8],
    legendAt: { x: 120, y: 100, cols: 1 },
    samples: 60,
  }).save(out('smart-irrigation', 'energy'));
}
