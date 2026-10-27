import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ble');

  diagram({
    title: 'Дерево GATT: сервис окружающей среды',
    w: 800, h: 340,
    boxes: [
      { id: 'dev', x: 30, y: 130, w: 170, h: 70, text: 'устройство\n(сервер GATT)\nESP32', tone: 'accent', size: 12 },
      { id: 'svc', x: 280, y: 130, w: 190, h: 70, text: 'сервис\nEnvironmental Sensing\nUUID 0x181A', tone: 'warn', size: 12 },
      { id: 'ch1', x: 560, y: 40, w: 220, h: 80, text: 'характеристика\nTemperature 0x2A6E\nчтение + уведомление\nsint16, 0,01 °C', tone: 'ok', size: 11 },
      { id: 'ch2', x: 560, y: 200, w: 220, h: 80, text: 'характеристика\nHumidity 0x2A6F\nчтение + уведомление\nuint16, 0,01 %', tone: 'ok', size: 11 },
    ],
    arrows: [['dev', 'svc'], ['svc', 'ch1'], ['svc', 'ch2']],
    notes: [{ x: 30, y: 310, text: 'телефон (клиент) подключается, читает значения или подписывается на уведомления (notify)', size: 12 }],
  }).save(out('ble', 'gatt'));

  tableFig({
    title: 'BLE: рассылка и соединение',
    cols: ['Режим', 'Интервал', 'Ток (порядок)', 'Для чего'],
    rows: [
      ['Advertising (рассылка)', '100 мс – 1 с', '0,1–5 мА в импульсах', 'маячки, поиск устройства'],
      ['Connected (соединение)', '7,5 мс – 4 с', '0,1–10 мА', 'чтение и notify'],
      ['Wi-Fi для сравнения', 'постоянно', '80–120 мА', 'сеть, интернет'],
    ],
    widths: [1.7, 1.4, 1.8, 1.6], w: 860,
  }).save(out('ble', 'modes'));
}
