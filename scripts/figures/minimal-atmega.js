import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('minimal-atmega');

  diagram({
    title: 'ATmega328P на макетной плате: что куда подключается',
    w: 800, h: 420,
    boxes: [
      { id: 'mcu', x: 320, y: 90, w: 170, h: 230, text: 'ATmega328P-PU\nDIP-28\n\n1 RESET   2 RXD   3 TXD\n7 VCC   8 GND   9–10 XTAL\n19 PB5 (D13)\n20 AVCC   21 AREF   22 GND', tone: 'accent', size: 12 },
      { id: 'pwr', x: 20, y: 30, w: 150, h: 54, text: 'питание +5 В\n+ 100 нФ у VCC, AVCC', tone: 'warn', size: 12 },
      { id: 'xt', x: 20, y: 120, w: 150, h: 60, text: 'кварц 16 МГц\n+ 2 × 22 пФ на землю', tone: 'ok', size: 12 },
      { id: 'rst', x: 20, y: 210, w: 150, h: 56, text: 'RESET: 10 кОм к +5 В\n+ кнопка на землю', tone: 'muted', size: 12 },
      { id: 'uart', x: 20, y: 300, w: 150, h: 66, text: 'USB-UART (CH340)\nTX→RXD, RX→TXD\nDTR→100 нФ→RESET', tone: 'muted', size: 12 },
      { id: 'led', x: 620, y: 150, w: 160, h: 60, text: 'светодиод + 330 Ом\nна PB5 (вывод 19)', tone: 'ok', size: 12 },
      { id: 'aref', x: 620, y: 240, w: 160, h: 50, text: 'AREF: 100 нФ\nна землю', tone: 'muted', size: 12 },
    ],
    arrows: [['pwr', 'mcu'], ['xt', 'mcu', '', { both: true }], ['rst', 'mcu'], ['uart', 'mcu', '', { both: true }], ['mcu', 'led'], ['mcu', 'aref']],
  }).save(out('minimal-atmega', 'wiring'));

  tableFig({
    title: 'Выводы ATmega328P-PU, которые нужны в проекте',
    cols: ['Вывод', 'Имя', 'Подключение'],
    rows: [
      ['1', 'RESET', '10 кОм к +5 В, кнопка на GND, 100 нФ от DTR'],
      ['2 / 3', 'RXD / TXD', 'к TX / RX преобразователя USB-UART'],
      ['7 / 8 / 22', 'VCC / GND / GND', '+5 В, земля; 100 нФ у VCC–GND'],
      ['9 / 10', 'XTAL1 / XTAL2', 'кварц 16 МГц, по 22 пФ на землю'],
      ['19', 'PB5 (D13)', 'светодиод через 330 Ом на землю'],
      ['20 / 21', 'AVCC / AREF', 'к +5 В / 100 нФ на землю'],
    ],
    widths: [0.9, 1.1, 3], w: 780,
  }).save(out('minimal-atmega', 'pins'));
}
