import { barsFig, diagram } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('usb-basics');

  barsFig({
    title: 'Скорости USB (шкала логарифмическая по смыслу: значения в Мбит/с)',
    items: [
      { label: 'Low Speed (мышь)', value: 1.5, text: '1,5 Мбит/с', tone: 'muted' },
      { label: 'Full Speed (USB 1.1)', value: 12, text: '12 Мбит/с', tone: 'ok' },
      { label: 'High Speed (USB 2.0)', value: 480, text: '480 Мбит/с', tone: 'accent' },
    ],
    max: 480, w: 780, labelW: 220,
  }).save(out('usb-basics', 'speeds'));

  diagram({
    title: 'Подключение USB-устройства: от обнаружения до работы',
    w: 800, h: 300,
    boxes: [
      { id: 'a', x: 20, y: 110, w: 130, h: 70, text: 'устройство\nвтыкают\n(D+ через 1,5 кОм)', tone: 'warn', size: 12 },
      { id: 'b', x: 190, y: 110, w: 130, h: 70, text: 'хост видит\nподтяжку,\nсбрасывает шину', tone: 'accent', size: 12 },
      { id: 'c', x: 360, y: 110, w: 130, h: 70, text: 'enumeration:\nхост запрашивает\nдескрипторы', tone: 'accent', size: 12 },
      { id: 'd', x: 530, y: 110, w: 130, h: 70, text: 'выбирается\nдрайвер по\nVID/PID и классу', tone: 'ok', size: 12 },
      { id: 'e', x: 690, y: 110, w: 100, h: 70, text: 'обмен\nданными', tone: 'ok', size: 12 },
    ],
    arrows: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']],
    notes: [{ x: 20, y: 240, text: 'классы: CDC — виртуальный COM-порт, HID — клавиатура и мышь, MSC — флешка', size: 13, weight: 700 }],
  }).save(out('usb-basics', 'enumeration'));
}
