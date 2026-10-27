import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('one-wire');

  diagram({
    title: 'Шина 1-Wire: три DS18B20 на одном проводе данных',
    w: 780, h: 320,
    boxes: [
      { id: 'uno', x: 30, y: 90, w: 170, h: 120, text: 'Arduino\nD2 ← DQ\n+5 В\nGND', tone: 'accent' },
      { id: 'pu', x: 260, y: 20, w: 130, h: 50, text: 'подтяжка\n4,7 кОм к +5 В', tone: 'warn', size: 12 },
      { id: 'd1', x: 460, y: 40, w: 180, h: 56, text: 'DS18B20 №1\nROM 28-xx-…', tone: 'ok', size: 12 },
      { id: 'd2', x: 460, y: 120, w: 180, h: 56, text: 'DS18B20 №2\nROM 28-yy-…', tone: 'ok', size: 12 },
      { id: 'd3', x: 460, y: 200, w: 180, h: 56, text: 'DS18B20 №3\nROM 28-zz-…', tone: 'ok', size: 12 },
    ],
    arrows: [['uno', 'd1', 'DQ', { both: true }], ['uno', 'd2', '', { both: true }], ['uno', 'd3', '', { both: true }], ['pu', 'uno']],
    notes: [{ x: 30, y: 290, text: 'у каждого датчика уникальный 64-битный адрес ROM; питание VDD и GND общие', size: 12 }],
  }).save(out('one-wire', 'bus'));

  tableFig({
    title: 'DS18B20: разрешение и время преобразования',
    cols: ['Разрешение', 'Шаг, °C', 'Время преобразования'],
    rows: [
      ['9 бит', '0,5', '93,75 мс'],
      ['10 бит', '0,25', '187,5 мс'],
      ['11 бит', '0,125', '375 мс'],
      ['12 бит', '0,0625', '750 мс'],
    ],
    widths: [1.2, 1, 1.6], w: 720,
  }).save(out('one-wire', 'resolution'));
}
