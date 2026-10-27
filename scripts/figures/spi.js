import { diagram, Fig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('spi');

  diagram({
    title: 'Шина SPI: ведущий и два ведомых',
    w: 780, h: 340,
    boxes: [
      { id: 'm', x: 30, y: 80, w: 170, h: 180, text: 'Ведущий (МК)\nSCK\nMOSI\nMISO\nCS1, CS2', tone: 'accent' },
      { id: 's1', x: 520, y: 40, w: 220, h: 100, text: 'Ведомый 1: SD-карта\nSCK, MOSI, MISO, CS1', tone: 'ok', size: 12 },
      { id: 's2', x: 520, y: 190, w: 220, h: 100, text: 'Ведомый 2: дисплей\nSCK, MOSI, MISO, CS2', tone: 'ok', size: 12 },
    ],
    arrows: [['m', 's1', 'SCK, MOSI, MISO общие'], ['m', 's2', 'CS — отдельный'] ],
    notes: [{ x: 30, y: 310, text: 'SCK, MOSI и MISO общие; у каждого ведомого свой CS: низкий уровень выбирает устройство', size: 12 }],
  }).save(out('spi', 'bus'));

  // Режим 0: CPOL = 0, CPHA = 0; передаём 0xA5 (10100101), MSB первым
  const f = new Fig(800, 320, 'SPI режим 0: передача байта 0xA5');
  const x0 = 100, w = 660, N = 10;
  const X = i => x0 + i / N * w;
  wave(f, x0, 30, w, 'CS', [[0, 1], [0.5, 0], [9.5, 1]], N, C.bad, 30);
  const sck = [[0, 0]];
  for (let k = 0; k < 8; k++) sck.push([1 + k + 0.5, 1], [1 + k + 1, 0]);
  wave(f, x0, 90, w, 'SCK', sck, N, C.muted, 30);
  const bits = [1, 0, 1, 0, 0, 1, 0, 1];
  const mosi = [[0, 0]]; let prev = 0;
  bits.forEach((b, k) => { const t = 1 + k; if (b !== prev) { mosi.push([t, b]); prev = b; } });
  mosi.push([9, 0]);
  wave(f, x0, 150, w, 'MOSI', mosi, N, C.accent, 30);
  bits.forEach((b, k) => { f.text(X(1 + k + 0.5), 210, String(b), { anchor: 'middle', size: 13, weight: 700 }); f.line(X(1 + k + 0.5), 80, X(1 + k + 0.5), 195, { stroke: C.grid, dash: '3 4', width: 1.2 }); });
  f.text(X(5), 245, 'данные считываются по нарастающему фронту SCK; старший бит передаётся первым', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(X(5), 268, '0xA5 = 1010 0101₂; режим 0: SCK в покое 0 (CPOL = 0), выборка по переднему фронту (CPHA = 0)', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('spi', 'mode0'));
}
