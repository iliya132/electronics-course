import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('web-sensor-server');

  diagram({
    title: 'Веб-датчик: BME280 → ESP32 → Wi-Fi → браузер',
    w: 800, h: 300,
    boxes: [
      { id: 'bme', x: 20, y: 100, w: 180, h: 90, text: 'BME280\nI²C 0x76\nVIN 3,3 В, GND', tone: 'warn', size: 13 },
      { id: 'esp', x: 280, y: 90, w: 200, h: 110, text: 'ESP32\nSDA = GPIO21\nSCL = GPIO22\nWebServer', tone: 'accent', size: 13 },
      { id: 'br', x: 570, y: 100, w: 200, h: 90, text: 'браузер\nстраница + /data (JSON)', tone: 'ok', size: 12 },
    ],
    arrows: [['bme', 'esp', 'I²C', { both: true }], ['esp', 'br', 'Wi-Fi, HTTP']],
    notes: [{ x: 20, y: 250, text: 'страница каждые 2 с запрашивает /data и обновляет показания без перезагрузки', size: 12 }],
  }).save(out('web-sensor-server', 'wiring'));

  tableFig({
    title: 'Датчик BME280 и ожидаемая точность',
    cols: ['Величина', 'Диапазон', 'Погрешность'],
    rows: [
      ['Температура', '−40…+85 °C', '±1 °C'],
      ['Влажность', '0…100 %', '±3 %'],
      ['Давление', '300…1100 гПа', '±1 гПа'],
    ],
    widths: [1.4, 1.6, 1.2], w: 700,
  }).save(out('web-sensor-server', 'bme280'));
}
