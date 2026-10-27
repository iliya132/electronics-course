import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ble-beacon');

  diagram({
    title: 'BLE-датчик и телефон с nRF Connect',
    w: 800, h: 300,
    boxes: [
      { id: 'esp', x: 20, y: 90, w: 230, h: 110, text: 'ESP32-Temp\nGATT: сервис 0x181A\nхарактеристика 0x2A6E\n(read + notify)', tone: 'accent', size: 12 },
      { id: 'ph', x: 520, y: 90, w: 260, h: 110, text: 'телефон: nRF Connect\n1. сканирование\n2. подключение\n3. подписка на notify', tone: 'ok', size: 12 },
    ],
    arrows: [['esp', 'ph', 'advertising → соединение', { both: true }]],
  }).save(out('ble-beacon', 'link'));

  tableFig({
    title: 'Значение характеристики температуры (little-endian)',
    cols: ['Температура', 'Целое (×100)', 'Байты в nRF Connect'],
    rows: [
      ['18,00 °C', '1800', '0x0807'],
      ['23,45 °C', '2345', '0x2909'],
      ['26,00 °C', '2600', '0x280A'],
    ],
    widths: [1.2, 1.2, 1.6], w: 740,
  }).save(out('ble-beacon', 'values'));
}
