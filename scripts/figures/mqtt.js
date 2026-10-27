import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mqtt');

  diagram({
    title: 'MQTT: издатели, брокер и подписчики',
    w: 800, h: 320,
    boxes: [
      { id: 'p1', x: 20, y: 40, w: 190, h: 64, text: 'ESP32-датчик\npublish home/room/temp', tone: 'accent', size: 12 },
      { id: 'p2', x: 20, y: 160, w: 190, h: 64, text: 'ESP32-реле\nsubscribe home/room/relay', tone: 'accent', size: 12 },
      { id: 'br', x: 310, y: 100, w: 170, h: 90, text: 'брокер\nmosquitto :1883', tone: 'warn', size: 14 },
      { id: 's1', x: 590, y: 40, w: 190, h: 64, text: 'Home Assistant\nsubscribe home/#', tone: 'ok', size: 12 },
      { id: 's2', x: 590, y: 160, w: 190, h: 64, text: 'телефон / Node-RED\nsubscribe home/room/temp', tone: 'ok', size: 12 },
    ],
    arrows: [['p1', 'br', 'publish'], ['br', 'p2', 'доставка'], ['br', 's1', 'доставка'], ['br', 's2', 'доставка']],
    notes: [{ x: 20, y: 280, text: 'издатель не знает подписчиков: брокер сам рассылает сообщения по темам (топикам)', size: 12 }],
  }).save(out('mqtt', 'pubsub'));

  tableFig({
    title: 'Уровни качества доставки MQTT (QoS)',
    cols: ['QoS', 'Гарантия', 'Когда использовать'],
    rows: [
      ['0', 'не более одного раза, без подтверждения', 'частые показания датчиков'],
      ['1', 'не менее одного раза (возможны дубли)', 'команды, события'],
      ['2', 'ровно один раз (четырёхшаговое подтверждение)', 'платежи, критичные команды'],
    ],
    widths: [0.6, 2.4, 2.2], w: 820,
  }).save(out('mqtt', 'qos'));
}
