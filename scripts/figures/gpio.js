import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('gpio');

  diagram({
    title: 'Упрощённая схема вывода GPIO',
    w: 760, h: 380,
    boxes: [
      { id: 'reg', x: 30, y: 150, w: 130, h: 70, text: 'регистры\nPORT, DDR, PIN', tone: 'accent' },
      { id: 'drv', x: 230, y: 40, w: 160, h: 64, text: 'выходной драйвер\nверхний + нижний ключ', tone: 'warn' },
      { id: 'pu', x: 230, y: 135, w: 160, h: 50, text: 'подтяжка pull-up\n20–50 кОм', tone: 'muted' },
      { id: 'in', x: 230, y: 230, w: 160, h: 56, text: 'входной буфер\n(пороги VIL / VIH)', tone: 'ok' },
      { id: 'prot', x: 450, y: 135, w: 150, h: 60, text: 'защитные диоды\nк питанию и земле', tone: 'bad' },
      { id: 'pin', x: 650, y: 150, w: 90, h: 50, text: 'вывод\nМК', tone: 'plain' },
    ],
    arrows: [['reg', 'drv'], ['reg', 'pu'], ['in', 'reg'], ['drv', 'prot'], ['pu', 'prot'], ['in', 'prot'], ['prot', 'pin', '', { both: true }]],
    notes: [{ x: 230, y: 320, text: 'push-pull: драйвер даёт и 0, и 1; open-drain: только 0 (нижний ключ);\nвход: драйвер выключен, читается буфер', size: 12 }],
  }).save(out('gpio', 'pin'));

  tableFig({
    title: 'Допустимые токи выводов (типично, проверяй даташит)',
    cols: ['МК', 'Макс. на вывод', 'Рекомендуется', 'Суммарно'],
    rows: [
      ['ATmega328P (5 В)', '40 мА', 'до 20 мА', '200 мА на порт'],
      ['ESP32 (3,3 В)', '40 мА', 'до 12 мА', 'ограничено питанием'],
      ['STM32F103 (3,3 В)', '25 мА', 'до 8 мА', '150 мА суммарно'],
    ],
    widths: [1.6, 1.3, 1.4, 1.6], w: 760,
  }).save(out('gpio', 'limits'));
}
