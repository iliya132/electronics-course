import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('teardown-tp4056-module');

  diagram({
    title: 'Модуль TP4056 с защитой: зарядка и защита ячейки',
    w: 900, h: 340,
    boxes: [
      { id: 'usb', x: 20, y: 100, w: 130, h: 70, text: 'USB micro\nили Type-C\n5 В', tone: 'warn', size: 11 },
      { id: 'tp', x: 190, y: 90, w: 150, h: 90, text: 'TP4056\nCC/CV, 4,2 В', tone: 'accent', size: 12 },
      { id: 'rp', x: 190, y: 220, w: 150, h: 50, text: 'Rprog 1,2 кОм\n→ 1 А', tone: 'ok', size: 11 },
      { id: 'led', x: 380, y: 40, w: 150, h: 50, text: 'LED CHRG / STDBY', tone: 'muted', size: 11 },
      { id: 'dw', x: 380, y: 220, w: 150, h: 60, text: 'DW01A\nзащита ячейки', tone: 'bad', size: 11 },
      { id: 'mos', x: 570, y: 220, w: 150, h: 60, text: 'FS8205A\nдва MOSFET', tone: 'bad', size: 11 },
      { id: 'cell', x: 570, y: 100, w: 130, h: 70, text: 'ячейка 18650\nB+ / B−', tone: 'ok', size: 12 },
      { id: 'out', x: 740, y: 100, w: 130, h: 70, text: 'нагрузка\nOUT+ / OUT−', tone: 'warn', size: 12 },
    ],
    arrows: [['usb', 'tp'], ['rp', 'tp'], ['tp', 'led'], ['tp', 'cell', 'зарядка'], ['dw', 'mos'], ['mos', 'cell', '', { both: true }], ['cell', 'out']],
  }).save(out('teardown-tp4056-module', 'blocks'));

  tableFig({
    title: 'Ток заряда TP4056 и пороги защиты',
    cols: ['Параметр', 'Значение', 'Комментарий'],
    rows: [
      ['Rprog 1,2 кОм', '≈ 1 А', 'I = 1200/R(кОм)'],
      ['Rprog 2 кОм', '≈ 600 мА', 'для ячейки 2000 мА·ч — 0,3 C'],
      ['Rprog 10 кОм', '≈ 120 мА', 'для маленьких ячеек'],
      ['Перезаряд', '≈ 4,25 В', 'DW01A отключает ячейку'],
      ['Переразряд', '≈ 2,4–2,5 В', 'защита от глубокого разряда'],
      ['Ток КЗ/перегрузка', 'порядка 3 А', 'по падению на MOSFET'],
    ],
    widths: [1.6, 1.2, 2.2], w: 860,
  }).save(out('teardown-tp4056-module', 'numbers'));
}
