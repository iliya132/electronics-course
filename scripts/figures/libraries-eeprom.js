import { diagram } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('libraries-eeprom');

  diagram({
    title: 'Как подключается библиотека',
    w: 760, h: 300,
    boxes: [
      { id: 'mgr', x: 20, y: 110, w: 170, h: 70, text: 'Менеджер библиотек\nSketch → Include Library', tone: 'accent', size: 13 },
      { id: 'lib', x: 250, y: 110, w: 150, h: 70, text: 'библиотека\n.h + .cpp + примеры', tone: 'ok', size: 13 },
      { id: 'inc', x: 460, y: 110, w: 130, h: 70, text: '#include\n<Name.h>', tone: 'warn', size: 13 },
      { id: 'use', x: 630, y: 110, w: 110, h: 70, text: 'объект\nи методы', tone: 'muted', size: 13 },
    ],
    arrows: [['mgr', 'lib'], ['lib', 'inc'], ['inc', 'use']],
    notes: [{ x: 20, y: 240, text: 'сначала читаем File → Examples → имя библиотеки: готовый рабочий пример', size: 13, tone: 'ok', weight: 700 }],
  }).save(out('libraries-eeprom', 'flow'));

  const life = w => 100000 / w;    // суток при ресурсе 100 000 записей
  chart({
    title: 'Срок жизни ячейки EEPROM (100 000 записей)',
    xLabel: 'Записей в сутки (логарифмическая шкала)', yLabel: 'Срок жизни, суток',
    xRange: [1, 100000], yRange: [1, 100000], log: true,
    series: [{ fn: life, label: 'ресурс 100 000 циклов / записей в сутки', color: C.accent, width: 3 }],
    markers: [
      { x: 86400, y: life(86400), label: '1 раз в с: 1,2 сут', dx: -10, dy: -14, anchor: 'end', color: C.bad },
      { x: 24, y: life(24), label: '1 раз в час: 11,4 года', dx: 40, dy: 4, anchor: 'start', color: C.ok },
    ],
    xTicks: [10, 1000], yTicks: [10, 1000],
    legend: false,
    samples: 200,
  }).save(out('libraries-eeprom', 'wear'));
}
