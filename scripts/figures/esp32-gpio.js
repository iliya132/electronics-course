import { tableFig, diagram } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-gpio');

  tableFig({
    title: 'ESP32: какие GPIO можно использовать',
    cols: ['GPIO', 'Ограничение', 'Рекомендация'],
    rows: [
      ['34, 35, 36, 39', 'только вход, без подтяжек', 'датчики, кнопки с внешним резистором'],
      ['6–11', 'подключены к Flash', 'не использовать'],
      ['0, 2, 5, 12, 15', 'strapping: уровень при сбросе задаёт загрузку', 'не тянуть наружу; GPIO12 в 1 даёт сбой Flash'],
      ['1, 3', 'UART0 (консоль, загрузка)', 'оставить для отладки'],
      ['остальные', 'обычные', 'ток до 12 мА на вывод'],
    ],
    widths: [1.2, 2.4, 2.4], w: 880,
  }).save(out('esp32-gpio', 'usable'));

  diagram({
    title: 'Согласование ESP32 с 5 В-устройствами',
    w: 780, h: 300,
    boxes: [
      { id: 'esp', x: 30, y: 90, w: 170, h: 100, text: 'ESP32\nлогика 3,3 В\nмакс. на выводе 3,6 В', tone: 'accent', size: 13 },
      { id: 'sh', x: 300, y: 90, w: 190, h: 100, text: 'делитель или\nсдвигатель уровня\n(BSS138, 74AHCT125)', tone: 'warn', size: 12 },
      { id: 'dev', x: 590, y: 90, w: 170, h: 100, text: 'устройство 5 В\n(лента, дисплей,\nмодуль)', tone: 'bad', size: 12 },
    ],
    arrows: [['esp', 'sh', '', { both: true }], ['sh', 'dev', '', { both: true }]],
    notes: [{ x: 30, y: 250, text: '5 В на вход ESP32 напрямую недопустимо: повреждение вывода и всего кристалла', size: 13, tone: 'bad', weight: 700 }],
  }).save(out('esp32-gpio', 'level'));
}
