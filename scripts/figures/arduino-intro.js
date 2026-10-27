import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('arduino-intro');

  tableFig({
    title: 'Популярные платы Arduino',
    cols: ['Плата', 'МК', 'Выводы', 'Особенность'],
    rows: [
      ['Uno', 'ATmega328P, 16 МГц', '14 цифр., 6 аналог.', 'эталон, разъём питания, USB-B'],
      ['Nano', 'ATmega328P, 16 МГц', '14 цифр., 8 аналог.', 'мини-формат, CH340, на макетку'],
      ['Mega 2560', 'ATmega2560, 16 МГц', '54 цифр., 16 аналог.', '256 КБ Flash, 4 UART'],
      ['Pro Mini', 'ATmega328P, 8 или 16 МГц', '14 цифр., 6 аналог.', 'без USB, 3,3 или 5 В, экономичная'],
    ],
    widths: [1, 1.7, 1.6, 2.3], w: 800,
  }).save(out('arduino-intro', 'boards'));

  diagram({
    title: 'Карта выводов Arduino Uno',
    w: 800, h: 360,
    boxes: [
      { id: 'uart', x: 30, y: 40, w: 170, h: 56, text: 'D0 (RX), D1 (TX)\nUART, USB-связь', tone: 'muted', size: 12 },
      { id: 'int', x: 30, y: 116, w: 170, h: 56, text: 'D2, D3\nвнешние прерывания', tone: 'warn', size: 12 },
      { id: 'pwm', x: 30, y: 192, w: 170, h: 56, text: '~3, ~5, ~6, ~9, ~10, ~11\nШИМ', tone: 'ok', size: 12 },
      { id: 'spi', x: 30, y: 268, w: 170, h: 56, text: 'D10 SS, D11 MOSI,\nD12 MISO, D13 SCK (LED L)', tone: 'accent', size: 12 },
      { id: 'uno', x: 300, y: 80, w: 190, h: 220, text: 'Arduino Uno\nATmega328P\n16 МГц, 5 В\n32 КБ Flash\n2 КБ RAM', tone: 'accent' },
      { id: 'an', x: 600, y: 40, w: 170, h: 70, text: 'A0–A5\n6 аналоговых входов\nАЦП 10 бит', tone: 'ok', size: 12 },
      { id: 'i2c', x: 600, y: 130, w: 170, h: 70, text: 'A4 (SDA), A5 (SCL)\nшина I²C', tone: 'accent', size: 12 },
      { id: 'pw', x: 600, y: 220, w: 170, h: 70, text: '5V, 3,3V, GND, Vin\nпитание и земля', tone: 'bad', size: 12 },
    ],
    arrows: [['uart', 'uno'], ['int', 'uno'], ['pwm', 'uno'], ['spi', 'uno'], ['uno', 'an'], ['uno', 'i2c'], ['uno', 'pw']],
  }).save(out('arduino-intro', 'uno-pins'));
}
