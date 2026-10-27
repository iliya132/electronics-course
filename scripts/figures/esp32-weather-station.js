import { diagram, tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('esp32-weather-station');

  diagram({
    title: 'Метеостанция C1: питание, датчик, сон и связь',
    w: 900, h: 360,
    boxes: [
      { id: 'usb', x: 20, y: 40, w: 130, h: 56, text: 'USB 5 В\n(зарядка)', tone: 'warn', size: 11 },
      { id: 'tp', x: 190, y: 40, w: 160, h: 56, text: 'TP4056 + защита\nDW01A / FS8205A', tone: 'bad', size: 11 },
      { id: 'cell', x: 390, y: 40, w: 150, h: 56, text: 'ячейка 18650\n2600 мА·ч', tone: 'ok', size: 12 },
      { id: 'ldo', x: 580, y: 40, w: 150, h: 56, text: 'LDO AP2112K\n3,3 В, 600 мА', tone: 'ok', size: 11 },
      { id: 'esp', x: 360, y: 170, w: 200, h: 90, text: 'ESP32 (модуль)\ndeep sleep 10 мин\nпробуждение по таймеру', tone: 'accent', size: 12 },
      { id: 'bme', x: 70, y: 170, w: 160, h: 70, text: 'BME280\nI²C, 3,3 В', tone: 'warn', size: 12 },
      { id: 'div', x: 70, y: 280, w: 160, h: 56, text: 'делитель 100 к + 100 к\nизмерение батареи', tone: 'muted', size: 11 },
      { id: 'mq', x: 640, y: 190, w: 220, h: 80, text: 'Wi-Fi → MQTT-брокер\nweather/temp, hum, press,\nbat', tone: 'ok', size: 11 },
    ],
    arrows: [['usb', 'tp'], ['tp', 'cell'], ['cell', 'ldo'], ['ldo', 'esp'], ['bme', 'esp', '', { both: true }], ['div', 'esp'], ['esp', 'mq']],
  }).save(out('esp32-weather-station', 'system'));

  const days = a => 2600 * 0.75 / (((100 * a) + 0.085 * (600 - a)) / 600) / 24;
  chart({
    title: 'Срок работы метеостанции (цикл 10 мин)',
    xLabel: 'Время активной фазы, с', yLabel: 'Срок работы, суток',
    xRange: [1, 15], yRange: [0, 400],
    series: [{ fn: days, label: 'Iакт 100 мА, сон 85 мкА', color: C.accent, width: 3 }],
    markers: [{ x: 4, y: days(4), label: '4 с: 108 суток', dx: 12, dy: -12, anchor: 'start' }],
    xTicks: [1, 4, 8, 12, 15], yTicks: [0, 100, 200, 300, 400],
    legendAt: { x: 200, y: 100, cols: 1 },
    samples: 100,
  }).save(out('esp32-weather-station', 'lifetime'));
}
