import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('sd-logger-spi');

  diagram({
    title: 'Регистратор: Arduino, SD-модуль по SPI и датчик',
    w: 800, h: 320,
    boxes: [
      { id: 'ntc', x: 20, y: 30, w: 170, h: 70, text: 'NTC 10 кОм + 10 кОм\nвход A0', tone: 'warn', size: 12 },
      { id: 'uno', x: 270, y: 90, w: 190, h: 140, text: 'Arduino Uno\nD13 SCK, D12 MISO,\nD11 MOSI, D10 CS\nA0 ← NTC', tone: 'accent', size: 12 },
      { id: 'sd', x: 570, y: 80, w: 200, h: 100, text: 'модуль SD-карты\n(стабилизатор 3,3 В\nи преобразователь уровней)', tone: 'ok', size: 12 },
    ],
    arrows: [['ntc', 'uno'], ['uno', 'sd', 'SPI', { both: true }]],
    notes: [{ x: 20, y: 270, text: 'питание модуля 5 В; обязательно общая земля; карта FAT16 или FAT32', size: 12 }],
  }).save(out('sd-logger-spi', 'wiring'));

  tableFig({
    title: 'Фрагмент файла LOG.CSV',
    cols: ['время, с', 'температура, °C', 'код АЦП'],
    rows: [['0', '23,4', '512'], ['10', '23,5', '511'], ['20', '23,5', '511'], ['30', '23,7', '509']],
    widths: [1, 1.4, 1.1], w: 640,
  }).save(out('sd-logger-spi', 'csv'));
}
