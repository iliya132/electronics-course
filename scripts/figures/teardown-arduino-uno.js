import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('teardown-arduino-uno');

  diagram({
    title: 'Arduino Uno R3: блоки и найденные узлы',
    w: 900, h: 400,
    boxes: [
      { id: 'usb', x: 20, y: 40, w: 150, h: 60, text: 'USB-B разъём\n+ PTC 500 мА', tone: 'warn', size: 11 },
      { id: 'uart', x: 20, y: 140, w: 150, h: 60, text: 'ATmega16U2\n(USB-UART)', tone: 'accent', size: 11 },
      { id: 'dc', x: 20, y: 240, w: 150, h: 60, text: 'DC-гнездо\nдиод защиты M7', tone: 'warn', size: 11 },
      { id: 'sel', x: 220, y: 240, w: 160, h: 60, text: 'выбор источника\nOУ + P-MOSFET', tone: 'ok', size: 11 },
      { id: 'ldo', x: 420, y: 240, w: 150, h: 60, text: 'NCP1117\n5 В', tone: 'ok', size: 12 },
      { id: 'mcu', x: 420, y: 90, w: 200, h: 110, text: 'ATmega328P\nвыводы D0–D13, A0–A5', tone: 'accent', size: 12 },
      { id: 'xt', x: 680, y: 40, w: 190, h: 60, text: 'кварц 16 МГц\n+ 2 × 22 пФ', tone: 'muted', size: 11 },
      { id: 'rs', x: 680, y: 130, w: 190, h: 60, text: 'автосброс\n100 нФ от DTR', tone: 'muted', size: 11 },
      { id: 'cap', x: 680, y: 220, w: 190, h: 60, text: 'развязка 100 нФ\n+ 10 мкФ', tone: 'muted', size: 11 },
    ],
    arrows: [['usb', 'uart'], ['usb', 'sel'], ['dc', 'sel'], ['sel', 'ldo'], ['ldo', 'mcu'], ['uart', 'mcu', '', { both: true }], ['xt', 'mcu'], ['rs', 'mcu'], ['cap', 'mcu']],
  }).save(out('teardown-arduino-uno', 'blocks'));

  tableFig({
    title: 'Узлы Arduino Uno и уроки курса',
    cols: ['Узел', 'Что делает', 'Урок'],
    rows: [
      ['PTC на USB', 'ограничивает ток порта 500 мА', 'предохранители и PTC'],
      ['NCP1117', 'снижает 7–12 В до 5 В; потери (Uвх − 5)·I', 'линейный стабилизатор'],
      ['Выбор источника', 'USB или внешнее питание без конфликта', 'идеальный диод'],
      ['Кварц + 22 пФ', 'тактовая частота 16 МГц', 'тактирование МК'],
      ['100 нФ от DTR', 'автосброс для загрузки скетча', 'сброс и загрузка'],
    ],
    widths: [1.4, 2.4, 1.8], w: 860,
  }).save(out('teardown-arduino-uno', 'lessons'));
}
