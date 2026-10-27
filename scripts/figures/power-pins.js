import { diagram } from '../lib/diag.js';
import { chart } from '../lib/fig.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('power-pins');

  diagram({
    title: 'Минимальная схема питания МК',
    w: 780, h: 380,
    boxes: [
      { id: 'src', x: 20, y: 150, w: 120, h: 60, text: 'источник\n5 В', tone: 'warn' },
      { id: 'bulk', x: 190, y: 40, w: 130, h: 50, text: '10 мкФ\nобщий конденсатор', tone: 'muted', size: 12 },
      { id: 'mcu', x: 380, y: 100, w: 190, h: 170, text: 'ATmega328P\nVCC (7), GND (8, 22)\nAVCC (20), AREF (21)', tone: 'accent' },
      { id: 'c1', x: 190, y: 230, w: 130, h: 50, text: '100 нФ\nу VCC–GND', tone: 'ok', size: 12 },
      { id: 'lc', x: 620, y: 40, w: 140, h: 56, text: 'AVCC: 10 мкГн\n+ 100 нФ', tone: 'ok', size: 12 },
      { id: 'aref', x: 620, y: 180, w: 140, h: 50, text: 'AREF: 100 нФ\nна землю', tone: 'ok', size: 12 },
    ],
    arrows: [['src', 'bulk'], ['src', 'c1'], ['bulk', 'mcu'], ['c1', 'mcu'], ['mcu', 'lc'], ['mcu', 'aref']],
    notes: [{ x: 20, y: 330, text: 'конденсаторы 100 нФ ставят вплотную к выводам питания, общий 10 мкФ — рядом с входом питания платы', size: 12 }],
  }).save(out('power-pins', 'minimal'));

  const fmax = v => v < 1.8 ? 0 : v < 2.7 ? 4 : v < 4.5 ? 10 : 20;
  chart({
    title: 'ATmega328P: допустимая частота от питания',
    xLabel: 'Напряжение питания, В', yLabel: 'Макс. частота, МГц',
    xRange: [1.5, 5.5], yRange: [0, 24],
    series: [{ points: [[1.8, 0], [1.8, 4], [2.7, 4], [2.7, 10], [4.5, 10], [4.5, 20], [5.5, 20]], label: 'область допустимых режимов (даташит)', color: C.accent, width: 3 }],
    markers: [{ x: 3.3, y: 10, label: '3,3 В: не более 10 МГц', dx: 10, dy: -14, anchor: 'start', color: C.bad }, { x: 5, y: 20, label: '5 В: до 20 МГц', dx: -8, dy: -12, anchor: 'end', color: C.ok }],
    xTicks: [1.8, 2.7, 3.3, 4.5, 5.5], yTicks: [0, 4, 10, 16, 20],
    legendAt: { x: 90, y: 100, cols: 1 },
  }).save(out('power-pins', 'safe-area'));
}
