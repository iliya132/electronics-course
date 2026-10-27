import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mcu-what');

  diagram({
    title: 'Блок-схема микроконтроллера',
    w: 760, h: 380,
    boxes: [
      { id: 'cpu', x: 270, y: 120, w: 150, h: 70, text: 'Ядро (CPU)\nвыполняет команды', tone: 'accent' },
      { id: 'flash', x: 40, y: 40, w: 150, h: 60, text: 'Flash\nпрограмма', tone: 'warn' },
      { id: 'ram', x: 40, y: 210, w: 150, h: 60, text: 'RAM\nпеременные', tone: 'warn' },
      { id: 'eeprom', x: 40, y: 290, w: 150, h: 50, text: 'EEPROM\nнастройки', tone: 'muted' },
      { id: 'clk', x: 270, y: 20, w: 150, h: 54, text: 'Генератор\nтактов', tone: 'muted' },
      { id: 'bus', x: 480, y: 140, w: 40, h: 30, text: 'шина', size: 11 },
      { id: 'gpio', x: 560, y: 40, w: 160, h: 56, text: 'GPIO\nвходы и выходы', tone: 'ok' },
      { id: 'tim', x: 560, y: 116, w: 160, h: 56, text: 'Таймеры\nи ШИМ', tone: 'ok' },
      { id: 'adc', x: 560, y: 192, w: 160, h: 56, text: 'АЦП', tone: 'ok' },
      { id: 'ser', x: 560, y: 268, w: 160, h: 56, text: 'UART, SPI, I²C', tone: 'ok' },
    ],
    arrows: [['flash', 'cpu'], ['ram', 'cpu', '', { both: true }], ['clk', 'cpu'], ['cpu', 'bus', '', { both: true }], ['bus', 'gpio'], ['bus', 'tim'], ['bus', 'adc'], ['bus', 'ser']],
    notes: [{ x: 290, y: 240, text: 'всё в одном корпусе:\nядро + память + периферия', size: 13, tone: 'accent', weight: 700 }, { x: 290, y: 292, text: 'питание и сброс — отдельно,\nвыводы идут наружу', size: 12 }],
  }).save(out('mcu-what', 'block'));

  tableFig({
    title: 'Три популярных микроконтроллера',
    cols: ['', 'ATmega328P', 'ESP32', 'STM32F103'],
    rows: [
      ['Ядро', '8 бит AVR', '2 × 32 бит Xtensa', '32 бит Cortex-M3'],
      ['Тактовая частота', '16 МГц', 'до 240 МГц', '72 МГц'],
      ['Flash / RAM', '32 КБ / 2 КБ', '4 МБ внешн. / 520 КБ', '64–128 КБ / 20 КБ'],
      ['Питание', '1,8–5,5 В', '3,3 В', '3,3 В'],
      ['Особенность', 'Arduino Uno', 'Wi-Fi и BLE', 'мощная периферия'],
    ],
    widths: [1.2, 1.3, 1.5, 1.4], w: 760,
  }).save(out('mcu-what', 'compare'));
}
