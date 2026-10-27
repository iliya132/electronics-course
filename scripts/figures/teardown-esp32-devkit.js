import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('teardown-esp32-devkit');

  diagram({
    title: 'ESP32 DevKit: блоки и найденные узлы',
    w: 900, h: 360,
    boxes: [
      { id: 'usb', x: 20, y: 130, w: 140, h: 70, text: 'USB micro/C\n5 В', tone: 'warn', size: 12 },
      { id: 'uart', x: 200, y: 40, w: 150, h: 60, text: 'CP2102 / CH340\n(USB-UART)', tone: 'accent', size: 11 },
      { id: 'ldo', x: 200, y: 230, w: 150, h: 60, text: 'AMS1117-3.3\n+ 2 конденсатора', tone: 'bad', size: 11 },
      { id: 'tr', x: 400, y: 40, w: 160, h: 60, text: '2 транзистора\nDTR/RTS → EN, IO0', tone: 'ok', size: 11 },
      { id: 'mod', x: 600, y: 110, w: 190, h: 120, text: 'ESP32-WROOM-32\nантенна на краю', tone: 'accent', size: 12 },
      { id: 'en', x: 400, y: 130, w: 160, h: 60, text: 'EN: 10 кОм + 1 мкФ\nкнопка EN', tone: 'muted', size: 11 },
      { id: 'bt', x: 400, y: 230, w: 160, h: 60, text: 'кнопка BOOT\nGPIO0', tone: 'muted', size: 11 },
      { id: 'led', x: 200, y: 310, w: 160, h: 40, text: 'светодиод питания', tone: 'muted', size: 11 },
    ],
    arrows: [['usb', 'uart'], ['usb', 'ldo'], ['uart', 'tr'], ['tr', 'mod'], ['ldo', 'mod'], ['en', 'mod'], ['bt', 'mod']],
  }).save(out('teardown-esp32-devkit', 'blocks'));

  tableFig({
    title: 'Узлы DevKit: роли и числа',
    cols: ['Узел', 'Роль', 'Ориентир'],
    rows: [
      ['AMS1117-3.3', '5 В → 3,3 В, ток до 800 мА', 'потери (5 − 3,3)·0,12 = 0,2 Вт'],
      ['EN: 10 кОм + 1 мкФ', 'задержка старта', 'τ = 10 мс'],
      ['DTR/RTS → EN, GPIO0', 'автопрограммирование', 'DTR=0, RTS=1: GPIO0=0'],
      ['Strapping-пины', 'уровень при сбросе', '0, 2, 5, 12, 15'],
    ],
    widths: [1.6, 2, 1.8], w: 860,
  }).save(out('teardown-esp32-devkit', 'numbers'));
}
