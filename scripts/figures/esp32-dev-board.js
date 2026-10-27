import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-dev-board');

  diagram({
    title: 'DevKit ESP32 по блокам',
    w: 800, h: 340,
    boxes: [
      { id: 'usb', x: 20, y: 130, w: 130, h: 70, text: 'USB-разъём\n5 В, D+/D−', tone: 'warn', size: 12 },
      { id: 'uart', x: 200, y: 40, w: 160, h: 70, text: 'USB-UART\nCP2102 / CH340', tone: 'accent', size: 12 },
      { id: 'ldo', x: 200, y: 220, w: 160, h: 70, text: 'LDO AMS1117\n5 В → 3,3 В', tone: 'bad', size: 12 },
      { id: 'tr', x: 410, y: 40, w: 150, h: 70, text: '2 транзистора\nавто-программирование\nDTR, RTS → EN, IO0', tone: 'ok', size: 11 },
      { id: 'mod', x: 600, y: 120, w: 170, h: 90, text: 'модуль\nESP32-WROOM-32', tone: 'accent', size: 13 },
      { id: 'btn', x: 410, y: 220, w: 150, h: 70, text: 'кнопки EN и BOOT\nEN: RC 10 кОм + 1 мкФ', tone: 'muted', size: 11 },
    ],
    arrows: [['usb', 'uart'], ['usb', 'ldo'], ['uart', 'tr'], ['tr', 'mod'], ['ldo', 'mod'], ['btn', 'mod']],
  }).save(out('esp32-dev-board', 'blocks'));

  tableFig({
    title: 'Автопрограммирование: DTR и RTS → EN и GPIO0',
    cols: ['DTR', 'RTS', 'EN', 'GPIO0', 'Результат'],
    rows: [
      ['1', '1', '1', '1', 'обычная работа'],
      ['0', '0', '1', '1', 'обычная работа'],
      ['1', '0', '0', '1', 'сброс (EN в нуле)'],
      ['0', '1', '1', '0', 'GPIO0 в нуле — режим загрузки'],
    ],
    widths: [0.6, 0.6, 0.6, 0.8, 2.6], w: 740,
  }).save(out('esp32-dev-board', 'autoreset'));
}
