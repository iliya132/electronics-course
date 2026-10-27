import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-intro');

  tableFig({
    title: 'Семейство ESP32: основные отличия',
    cols: ['Чип', 'Ядро', 'Радио', 'USB', 'Особенность'],
    rows: [
      ['ESP32', '2 × Xtensa LX6, 240 МГц', 'Wi-Fi 4 + BT + BLE', 'нет (мост)', 'классика, много выводов'],
      ['ESP32-S2', '1 × Xtensa LX7, 240 МГц', 'Wi-Fi 4', 'нативный USB', 'без Bluetooth'],
      ['ESP32-S3', '2 × Xtensa LX7, 240 МГц', 'Wi-Fi 4 + BLE 5', 'нативный USB', 'ИИ-инструкции'],
      ['ESP32-C3', '1 × RISC-V, 160 МГц', 'Wi-Fi 4 + BLE 5', 'USB Serial/JTAG', 'дёшев, малое число выводов'],
      ['ESP32-C6', '1 × RISC-V, 160 МГц', 'Wi-Fi 6 + BLE 5 + 802.15.4', 'USB Serial/JTAG', 'Zigbee/Thread'],
    ],
    widths: [1, 1.9, 1.9, 1.4, 1.9], w: 940,
  }).save(out('esp32-intro', 'family'));

  diagram({
    title: 'Модуль ESP32-WROOM-32: что внутри «металлической коробочки»',
    w: 780, h: 320,
    boxes: [
      { id: 'chip', x: 280, y: 90, w: 200, h: 120, text: 'кристалл ESP32\nядра, RAM 520 КБ,\nWi-Fi/BT, периферия', tone: 'accent', size: 12 },
      { id: 'flash', x: 40, y: 50, w: 170, h: 56, text: 'Flash 4 МБ\n(SPI)', tone: 'warn', size: 12 },
      { id: 'xtal', x: 40, y: 140, w: 170, h: 56, text: 'кварц 40 МГц', tone: 'muted', size: 12 },
      { id: 'ant', x: 570, y: 50, w: 170, h: 56, text: 'печатная антенна\nна краю модуля', tone: 'ok', size: 12 },
      { id: 'pin', x: 570, y: 150, w: 170, h: 70, text: '38 выводов:\n3V3, GND, EN, GPIO,\nUART0', tone: 'muted', size: 12 },
    ],
    arrows: [['flash', 'chip', '', { both: true }], ['xtal', 'chip'], ['chip', 'ant'], ['chip', 'pin', '', { both: true }]],
    notes: [{ x: 40, y: 270, text: 'модуль 18 × 25,5 мм сертифицирован как готовое радиоустройство; антенну нельзя накрывать металлом и землёй', size: 12 }],
  }).save(out('esp32-intro', 'module'));
}
