import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-wifi');

  diagram({
    title: 'ESP32 как веб-сервер в домашней сети',
    w: 780, h: 300,
    boxes: [
      { id: 'esp', x: 30, y: 100, w: 190, h: 90, text: 'ESP32 (STA)\nWebServer, датчик', tone: 'accent', size: 13 },
      { id: 'rt', x: 300, y: 100, w: 180, h: 90, text: 'Wi-Fi роутер\n192.168.1.1', tone: 'warn', size: 13 },
      { id: 'br', x: 570, y: 100, w: 180, h: 90, text: 'браузер\nадрес 192.168.1.50', tone: 'ok', size: 13 },
    ],
    arrows: [['esp', 'rt', 'Wi-Fi', { both: true }], ['rt', 'br', 'Wi-Fi / Ethernet', { both: true }]],
    notes: [{ x: 30, y: 250, text: 'STA: ESP32 — клиент роутера; AP: ESP32 сам создаёт сеть (192.168.4.1) для настройки', size: 12 }],
  }).save(out('esp32-wifi', 'network'));

  tableFig({
    title: 'Уровень сигнала Wi-Fi (RSSI)',
    cols: ['RSSI, дБм', 'Качество', 'Что это значит'],
    rows: [
      ['−30…−50', 'отличное', 'рядом с роутером'],
      ['−50…−67', 'хорошее', 'стабильное соединение'],
      ['−67…−75', 'среднее', 'возможны потери пакетов'],
      ['−75…−85', 'слабое', 'нестабильно, низкая скорость'],
      ['ниже −85', 'почти нет связи', 'отключения'],
    ],
    widths: [1.2, 1.2, 2.4], w: 760,
  }).save(out('esp32-wifi', 'rssi'));
}
