import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('own-board');

  diagram({
    title: 'C5: этапы собственной платы',
    w: 900, h: 260,
    boxes: [
      { id: 'a', x: 10, y: 80, w: 130, h: 70, text: 'ТЗ и бюджет\nпитания', tone: 'accent', size: 11 },
      { id: 'b', x: 160, y: 80, w: 130, h: 70, text: 'схема\nпо блокам', tone: 'accent', size: 11 },
      { id: 'c', x: 310, y: 80, w: 130, h: 70, text: 'ERC,\nпроверка\nпо даташитам', tone: 'warn', size: 11 },
      { id: 'd', x: 460, y: 80, w: 130, h: 70, text: 'плата:\nразмещение,\nтрассировка', tone: 'accent', size: 11 },
      { id: 'e', x: 610, y: 80, w: 130, h: 70, text: 'DRC, 3D,\nGerber, BOM', tone: 'warn', size: 11 },
      { id: 'f', x: 760, y: 80, w: 130, h: 70, text: 'заказ,\nсборка,\nотладка', tone: 'ok', size: 11 },
    ],
    arrows: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']],
  }).save(out('own-board', 'stages'));

  tableFig({
    title: 'Чек-лист перед заказом платы (фрагмент)',
    cols: ['Блок', 'Проверка'],
    rows: [
      ['Питание', 'LDO на пик с запасом 30 %; dropout при минимальном входе; конденсаторы по даташиту'],
      ['Защита', 'TVS и PTC на входе USB-C; резисторы CC 5,1 кОм; защита Li-ion'],
      ['МК', 'развязка у каждого вывода; EN с RC; доступ к TX, RX, BOOT'],
      ['Плата', 'антенна на краю без меди; сплошная земля; ширины дорожек по току; DRC чистый'],
      ['Файлы', 'Gerber проверен в просмотрщике; BOM и CPL согласованы; футпринты по даташитам'],
      ['План проверки', 'порядок включения, ток холостого хода, ожидаемые напряжения'],
    ],
    widths: [1.2, 4.4], w: 960,
  }).save(out('own-board', 'checklist'));
}
