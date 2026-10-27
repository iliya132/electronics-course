import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('displays');

  tableFig({
    title: 'Типичные дисплеи для Arduino',
    cols: ['Дисплей', 'Интерфейс', 'Адрес I²C', 'Выводы МК', 'Примечание'],
    rows: [
      ['7-сегментный 4 разряда', 'прямое управление', '—', '8 сегментов + 4 цифры', 'мультиплексирование, резисторы 220 Ом'],
      ['LCD 1602', 'I²C (PCF8574)', '0x27 или 0x3F', '2 (SDA, SCL)', '16×2 символа, LiquidCrystal_I2C'],
      ['OLED SSD1306 128×64', 'I²C', '0x3C', '2 (SDA, SCL)', 'буфер 1024 байта RAM'],
    ],
    widths: [1.7, 1.3, 1.1, 1.6, 2.9], w: 1000,
  }).save(out('displays', 'types'));

  diagram({
    title: 'Подключение I²C-дисплея к Arduino Uno',
    w: 740, h: 300,
    boxes: [
      { id: 'uno', x: 40, y: 80, w: 170, h: 140, text: 'Arduino Uno\nA4 = SDA\nA5 = SCL\n5 V, GND', tone: 'accent' },
      { id: 'oled', x: 420, y: 40, w: 170, h: 60, text: 'OLED 128×64\nадрес 0x3C', tone: 'ok' },
      { id: 'lcd', x: 420, y: 170, w: 170, h: 60, text: 'LCD1602\nадрес 0x27', tone: 'ok' },
      { id: 'pu', x: 620, y: 100, w: 100, h: 60, text: 'подтяжки\n4,7 кОм', tone: 'muted', size: 12 },
    ],
    arrows: [['uno', 'oled', 'SDA, SCL', { both: true }], ['uno', 'lcd', 'SDA, SCL', { both: true }], ['pu', 'oled'], ['pu', 'lcd']],
    notes: [{ x: 40, y: 270, text: 'два устройства на одной шине: адреса разные; подтяжки обычно уже стоят на модулях', size: 12 }],
  }).save(out('displays', 'wiring'));
}
