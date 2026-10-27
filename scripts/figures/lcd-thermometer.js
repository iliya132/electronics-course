import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('lcd-thermometer');

  diagram({
    title: 'Термометр: NTC → Arduino → LCD1602',
    w: 780, h: 340,
    boxes: [
      { id: 'ntc', x: 30, y: 60, w: 190, h: 70, text: 'делитель\n10 кОм + NTC 10 кОм\nнижнее плечо — NTC', tone: 'warn', size: 12 },
      { id: 'uno', x: 300, y: 60, w: 180, h: 140, text: 'Arduino Uno\nA0 ← делитель\nA4, A5 → LCD (I²C)\nD2 ← кнопка сброса', tone: 'accent', size: 13 },
      { id: 'lcd', x: 570, y: 60, w: 180, h: 70, text: 'LCD1602 I²C\nадрес 0x27', tone: 'ok', size: 13 },
      { id: 'btn', x: 30, y: 180, w: 190, h: 56, text: 'кнопка D2–GND\nсбрасывает мин/макс', tone: 'muted', size: 12 },
    ],
    arrows: [['ntc', 'uno'], ['uno', 'lcd'], ['btn', 'uno']],
    notes: [{ x: 30, y: 290, text: 'разрешение около 0,13 °C на отсчёт АЦП при 25 °C; усреднение 16 отсчётов уменьшает шум в 4 раза', size: 12 }],
  }).save(out('lcd-thermometer', 'wiring'));

  tableFig({
    title: 'Раскладка экрана LCD1602',
    cols: ['Строка', 'Содержимое', 'Пример'],
    rows: [
      ['1', 'текущая температура', 'T = 23.4 C'],
      ['2', 'минимум и максимум', 'min 21.8 max 25.1'],
    ],
    widths: [0.8, 2, 2], w: 720,
  }).save(out('lcd-thermometer', 'layout'));
}
