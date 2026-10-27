import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-mini-schematic');

  diagram({
    title: 'Схема мини-платы ESP32-C3: листы и связи',
    w: 860, h: 340,
    boxes: [
      { id: 'usb', x: 20, y: 110, w: 150, h: 90, text: 'USB-C\nCC1, CC2 по 5,1 кОм\nF1 PTC 0,5 А, TVS', tone: 'warn', size: 11 },
      { id: 'ldo', x: 210, y: 110, w: 150, h: 90, text: 'LDO AP2112K-3.3\nCin 10 мкФ\nCout 10 мкФ', tone: 'ok', size: 11 },
      { id: 'mod', x: 400, y: 80, w: 200, h: 150, text: 'ESP32-C3-MINI-1\nразвязка 100 нФ + 10 мкФ\nEN: 10 кОм + 1 мкФ\nнативный USB: GPIO18/19', tone: 'accent', size: 11 },
      { id: 'sw', x: 210, y: 240, w: 150, h: 70, text: 'SW1 BOOT (GPIO9)\nSW2 EN (сброс)', tone: 'muted', size: 11 },
      { id: 'j', x: 650, y: 80, w: 190, h: 90, text: 'J2 датчик I²C\n3V3, GND, SDA GPIO4,\nSCL GPIO5; подтяжки 4,7 кОм', tone: 'ok', size: 11 },
      { id: 'led', x: 650, y: 200, w: 190, h: 60, text: 'D1 светодиод питания\nD2 пользовательский', tone: 'ok', size: 11 },
      { id: 'tp', x: 650, y: 280, w: 190, h: 50, text: 'TP1–TP4: 3V3, GND, TX, RX', tone: 'muted', size: 11 },
    ],
    arrows: [['usb', 'ldo'], ['ldo', 'mod'], ['sw', 'mod'], ['usb', 'mod', 'D+ / D−', { dy: -34 }], ['mod', 'j'], ['mod', 'led'], ['mod', 'tp']],
  }).save(out('esp32-mini-schematic', 'sheets'));

  tableFig({
    title: 'Бюджет питания мини-платы',
    cols: ['Блок', 'Среднее', 'Пик', 'Комментарий'],
    rows: [
      ['ESP32-C3 (Wi-Fi)', '80 мА', '350 мА', 'пики передачи'],
      ['Датчик BME280', '0,004 мА', '0,7 мА', 'ничтожно'],
      ['Светодиоды', '5 мА', '10 мА', 'через 150 Ом при 3,3 В'],
      ['Итого', '≈ 85 мА', '≈ 360 мА', 'с запасом 30 %: 470 мА → LDO 600 мА'],
    ],
    widths: [1.6, 1, 1, 2.6], w: 820,
  }).save(out('esp32-mini-schematic', 'budget'));
}
