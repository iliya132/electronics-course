import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('oled-i2c');

  diagram({
    title: 'OLED SSD1306 и логический анализатор на шине I²C',
    w: 800, h: 320,
    boxes: [
      { id: 'uno', x: 30, y: 90, w: 180, h: 120, text: 'Arduino Uno\nA4 = SDA\nA5 = SCL', tone: 'accent' },
      { id: 'oled', x: 500, y: 40, w: 200, h: 80, text: 'OLED 128×64\nSSD1306, 0x3C', tone: 'ok' },
      { id: 'la', x: 500, y: 180, w: 200, h: 80, text: 'логический анализатор\nканалы CH0 (SDA),\nCH1 (SCL), GND', tone: 'muted', size: 12 },
    ],
    arrows: [['uno', 'oled', 'SDA, SCL', { both: true }], ['uno', 'la', 'щупы']],
    notes: [{ x: 30, y: 280, text: 'анализатор — параллельно шине, общая земля обязательна', size: 12 }],
  }).save(out('oled-i2c', 'wiring'));

  tableFig({
    title: 'Что увидит анализатор при инициализации и выводе',
    cols: ['Байт', 'Значение', 'Смысл'],
    rows: [
      ['0x78', '0x3C << 1 | W', 'адрес OLED и бит записи'],
      ['0x00', 'управляющий байт', 'далее идут команды'],
      ['0xAE', 'команда', 'выключить дисплей'],
      ['0x40', 'управляющий байт', 'далее идут данные кадра'],
      ['…1024 байта', 'данные', 'содержимое экрана'],
    ],
    widths: [1.2, 1.6, 2.2], w: 780,
  }).save(out('oled-i2c', 'frames'));
}
