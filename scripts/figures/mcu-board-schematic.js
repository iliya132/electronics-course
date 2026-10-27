import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mcu-board-schematic');

  diagram({
    title: 'Блоки мини-платы ESP32',
    w: 840, h: 360,
    boxes: [
      { id: 'usb', x: 20, y: 130, w: 130, h: 80, text: 'USB-C\nCC1/CC2 5,1 кОм\nTVS, F1 0,5 А', tone: 'warn', size: 11 },
      { id: 'ldo', x: 190, y: 130, w: 140, h: 80, text: 'LDO 3,3 В 600 мА\nCin 10 мкФ,\nCout 10 мкФ', tone: 'ok', size: 11 },
      { id: 'mod', x: 380, y: 100, w: 190, h: 140, text: 'модуль ESP32\nразвязка 100 нФ + 10 мкФ\nEN: 10 кОм + 1 мкФ\nантенна на краю', tone: 'accent', size: 12 },
      { id: 'bt', x: 190, y: 250, w: 140, h: 60, text: 'кнопки EN и BOOT', tone: 'muted', size: 12 },
      { id: 'uart', x: 20, y: 250, w: 130, h: 60, text: 'USB-UART\nCH340 / CP2102', tone: 'muted', size: 11 },
      { id: 'io', x: 640, y: 80, w: 180, h: 70, text: 'разъём датчика\nI²C: 3V3, GND, SDA, SCL', tone: 'ok', size: 11 },
      { id: 'led', x: 640, y: 180, w: 180, h: 70, text: 'светодиод пользователя\nGPIO + 150 Ом', tone: 'ok', size: 11 },
      { id: 'tp', x: 640, y: 280, w: 180, h: 50, text: 'контрольные точки\n3V3, GND, TX, RX', tone: 'muted', size: 11 },
    ],
    arrows: [['usb', 'ldo'], ['ldo', 'mod'], ['uart', 'mod', '', { both: true }], ['bt', 'mod'], ['mod', 'io'], ['mod', 'led'], ['mod', 'tp']],
  }).save(out('mcu-board-schematic', 'blocks'));

  tableFig({
    title: 'Чек-лист схемы платы с МК',
    cols: ['Блок', 'Что проверить'],
    rows: [
      ['Питание', 'LDO на пик тока, конденсаторы на входе и выходе, dropout при минимальном входе'],
      ['Развязка', '100 нФ у каждого вывода питания, 10 мкФ у модуля'],
      ['Сброс/загрузка', 'EN с RC, кнопки EN и BOOT, режим загрузки доступен'],
      ['Тактирование', 'кварц и нагрузочные конденсаторы (если нет в модуле)'],
      ['Интерфейсы', 'подтяжки I²C, USB-UART, TVS на USB'],
      ['Сервис', 'контрольные точки, светодиод питания, шелкография'],
    ],
    widths: [1.2, 4.4], w: 900,
  }).save(out('mcu-board-schematic', 'checklist'));
}
