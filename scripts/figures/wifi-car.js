import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('wifi-car');

  diagram({
    title: 'Робот C3: раздельное питание моторов и логики',
    w: 900, h: 380,
    boxes: [
      { id: 'bat', x: 20, y: 150, w: 140, h: 80, text: 'аккумулятор 2S\n7,4 В (2 × 18650)\nBMS 2S', tone: 'warn', size: 11 },
      { id: 'cap', x: 200, y: 40, w: 150, h: 50, text: '470 мкФ\nбуфер моторов', tone: 'ok', size: 11 },
      { id: 'drv', x: 390, y: 40, w: 170, h: 70, text: 'TB6612FNG\nVM 7,4 В, 2 моста\nPWM, IN1, IN2, STBY', tone: 'accent', size: 11 },
      { id: 'm1', x: 620, y: 20, w: 120, h: 50, text: 'мотор A', tone: 'ok', size: 12 },
      { id: 'm2', x: 620, y: 90, w: 120, h: 50, text: 'мотор B', tone: 'ok', size: 12 },
      { id: 'buck', x: 200, y: 250, w: 160, h: 70, text: 'понижающий\nпреобразователь\n7,4 → 5 В', tone: 'ok', size: 11 },
      { id: 'esp', x: 420, y: 230, w: 190, h: 90, text: 'ESP32 DevKit\nWi-Fi AP + веб-страница\nуправление', tone: 'accent', size: 11 },
      { id: 'ph', x: 680, y: 240, w: 180, h: 70, text: 'телефон\nкнопки направления', tone: 'muted', size: 11 },
    ],
    arrows: [['bat', 'cap'], ['cap', 'drv'], ['drv', 'm1'], ['drv', 'm2'], ['bat', 'buck'], ['buck', 'esp'], ['esp', 'drv', 'PWM и направление'], ['ph', 'esp', 'Wi-Fi', { both: true }]],
  }).save(out('wifi-car', 'system'));

  tableFig({
    title: 'Токи и бюджет робота',
    cols: ['Узел', 'Ток', 'Комментарий'],
    rows: [
      ['Мотор N20 (6 В), ход', '0,25–0,3 А', 'по два'],
      ['Мотор в стопоре', '0,8–1,5 А', 'драйвер держит 1,2 А непрерывно'],
      ['ESP32 + Wi-Fi', '0,12 А (пик 0,4 А)', 'через понижающий модуль'],
      ['Итого ход', '≈ 0,75 А от 7,4 В', 'время работы 2600 мА·ч / 0,75 А ≈ 3,5 ч'],
    ],
    widths: [1.8, 1.4, 2.4], w: 860,
  }).save(out('wifi-car', 'budget'));
}
