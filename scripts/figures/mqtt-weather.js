import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mqtt-weather');

  diagram({
    title: 'Метеостанция: BME280 → MQTT → график',
    w: 820, h: 300,
    boxes: [
      { id: 'bme', x: 20, y: 100, w: 140, h: 80, text: 'BME280\n(I²C)', tone: 'warn', size: 13 },
      { id: 'esp', x: 200, y: 90, w: 160, h: 100, text: 'ESP32\nPubSubClient\nпубликует раз в 30 с', tone: 'accent', size: 12 },
      { id: 'br', x: 400, y: 100, w: 150, h: 80, text: 'брокер Mosquitto\n(Raspberry Pi / ПК)', tone: 'warn', size: 12 },
      { id: 'nr', x: 600, y: 40, w: 200, h: 70, text: 'Node-RED\nграфик, история', tone: 'ok', size: 12 },
      { id: 'ha', x: 600, y: 160, w: 200, h: 70, text: 'Home Assistant\nили приложение на телефоне', tone: 'ok', size: 12 },
    ],
    arrows: [['bme', 'esp', '', { both: true }], ['esp', 'br', 'publish'], ['br', 'nr', 'subscribe'], ['br', 'ha', 'subscribe']],
  }).save(out('mqtt-weather', 'pipeline'));

  tableFig({
    title: 'Топики метеостанции',
    cols: ['Топик', 'Пример значения', 'Период'],
    rows: [
      ['weather/temp', '23.4', '30 с'],
      ['weather/hum', '48', '30 с'],
      ['weather/press', '1012', '30 с'],
      ['weather/status', 'online / offline (LWT)', 'при подключении'],
    ],
    widths: [1.6, 1.8, 1.2], w: 760,
  }).save(out('mqtt-weather', 'topics'));
}
