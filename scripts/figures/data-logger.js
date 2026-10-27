import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('data-logger');

  diagram({
    title: 'Регистратор C2: измерение, время, хранение и показ',
    w: 900, h: 340,
    boxes: [
      { id: 'src', x: 20, y: 110, w: 130, h: 70, text: 'источник\nи нагрузка\n(до 3 А, 26 В)', tone: 'warn', size: 11 },
      { id: 'ina', x: 190, y: 110, w: 150, h: 70, text: 'INA219\nI²C 0x40\nшунт 0,1 Ом', tone: 'accent', size: 11 },
      { id: 'uno', x: 390, y: 90, w: 170, h: 110, text: 'Arduino Nano\nI²C: A4, A5\nSPI: D10–D13', tone: 'accent', size: 12 },
      { id: 'rtc', x: 620, y: 30, w: 160, h: 60, text: 'DS3231 (RTC)\nI²C 0x68', tone: 'ok', size: 11 },
      { id: 'lcd', x: 620, y: 120, w: 160, h: 60, text: 'LCD1602 I²C\n0x27', tone: 'ok', size: 11 },
      { id: 'sd', x: 620, y: 210, w: 160, h: 60, text: 'SD-модуль (SPI)\nLOG.CSV', tone: 'ok', size: 11 },
    ],
    arrows: [['src', 'ina'], ['ina', 'uno', 'I²C', { both: true }], ['uno', 'rtc', '', { both: true }], ['uno', 'lcd'], ['uno', 'sd', '', { both: true }]],
    notes: [{ x: 20, y: 300, text: 'LCD вместо OLED: без буфера в RAM Nano (2 КБ); три I²C-устройства с разными адресами', size: 12 }],
  }).save(out('data-logger', 'system'));

  tableFig({
    title: 'Бюджет погрешности измерения тока (шунт 0,1 Ом, INA219)',
    cols: ['Источник ошибки', 'Вклад', 'Как уменьшить'],
    rows: [
      ['Допуск шунта 1 %', '±1 % показания', 'калибровка по эталону'],
      ['Усиление и смещение INA219', '±0,5 % и ±0,1 мВ ≈ ±1 мА', 'калибровка двумя точками'],
      ['Шаг по току', '0,1 мА', 'достаточно для токов 10 мА и выше'],
      ['Температура', '±0,2 % на 10 °C', 'стабильный режим, прогрев'],
    ],
    widths: [1.8, 1.8, 2], w: 860,
  }).save(out('data-logger', 'accuracy'));
}
