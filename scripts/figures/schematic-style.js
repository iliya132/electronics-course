import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('schematic-style');

  diagram({
    title: 'Хорошая схема: поток слева направо, питание сверху, земля снизу',
    w: 820, h: 340,
    boxes: [
      { id: 'pwr', x: 20, y: 30, w: 780, h: 40, text: '+3V3 (питание сверху)', tone: 'warn', size: 14 },
      { id: 'in', x: 30, y: 120, w: 150, h: 90, text: 'вход\nUSB-C, защита\nTVS, предохранитель', tone: 'accent', size: 12 },
      { id: 'reg', x: 240, y: 120, w: 150, h: 90, text: 'питание\nLDO 3,3 В\nконденсаторы', tone: 'ok', size: 12 },
      { id: 'mcu', x: 450, y: 120, w: 150, h: 90, text: 'МК\nкварц, сброс,\nразвязка', tone: 'accent', size: 12 },
      { id: 'out', x: 660, y: 120, w: 140, h: 90, text: 'периферия\nдатчики, светодиоды,\nразъёмы', tone: 'ok', size: 12 },
      { id: 'gnd', x: 20, y: 270, w: 780, h: 40, text: 'GND (земля снизу)', tone: 'muted', size: 14 },
    ],
    arrows: [['in', 'reg'], ['reg', 'mcu'], ['mcu', 'out']],
  }).save(out('schematic-style', 'good'));

  tableFig({
    title: 'Обозначения элементов на схеме',
    cols: ['Буква', 'Элемент', 'Пример'],
    rows: [
      ['R', 'резистор', 'R1 10k'],
      ['C', 'конденсатор', 'C3 100n'],
      ['L', 'дроссель, катушка', 'L1 10u'],
      ['D', 'диод, светодиод', 'D2 LED'],
      ['Q', 'транзистор', 'Q1 IRLZ44N'],
      ['U', 'микросхема', 'U1 ESP32'],
      ['J', 'разъём', 'J1 USB-C'],
      ['F', 'предохранитель', 'F1 500 мА'],
      ['Y', 'кварц', 'Y1 16 МГц'],
      ['SW', 'кнопка, переключатель', 'SW1 BOOT'],
      ['TP', 'контрольная точка', 'TP1 3V3'],
    ],
    widths: [0.7, 1.6, 1.6], w: 640, rowH: 28,
  }).save(out('schematic-style', 'designators'));
}
