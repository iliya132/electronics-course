import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('dfm-bom-order');

  diagram({
    title: 'Что нужно отправить производителю',
    w: 840, h: 260,
    boxes: [
      { id: 'kc', x: 20, y: 90, w: 130, h: 70, text: 'проект KiCad\nDRC без ошибок', tone: 'accent', size: 12 },
      { id: 'g', x: 190, y: 30, w: 150, h: 60, text: 'Gerber\nслои меди, маска,\nшелкография, контур', tone: 'ok', size: 11 },
      { id: 'd', x: 190, y: 110, w: 150, h: 50, text: 'файлы сверловки', tone: 'ok', size: 12 },
      { id: 'b', x: 190, y: 180, w: 150, h: 50, text: 'BOM (CSV)\nсписок деталей', tone: 'ok', size: 12 },
      { id: 'c', x: 380, y: 180, w: 160, h: 50, text: 'CPL (позиции)\nкоординаты деталей', tone: 'ok', size: 12 },
      { id: 'f', x: 620, y: 90, w: 200, h: 70, text: 'производитель\n(JLCPCB, PCBWay)\nпроверка и заказ', tone: 'warn', size: 12 },
    ],
    arrows: [['kc', 'g'], ['kc', 'd'], ['kc', 'b'], ['b', 'c'], ['g', 'f'], ['d', 'f'], ['c', 'f']],
  }).save(out('dfm-bom-order', 'files'));

  tableFig({
    title: 'Типичные возможности недорогого производства (ориентиры, проверяй актуальные)',
    cols: ['Параметр', 'Типичное значение'],
    rows: [
      ['Слои', '2 (дёшево), 4 и более (дороже)'],
      ['Толщина платы', '1,6 мм'],
      ['Мин. ширина дорожки / зазор', '0,127–0,15 мм (безопасно 0,2 мм)'],
      ['Мин. сверло переходного', '0,3 мм (безопасно 0,4 мм)'],
      ['Мин. кольцо площадки', '0,13 мм'],
      ['Расстояние до края', '0,3 мм и больше'],
    ],
    widths: [2, 3], w: 800,
  }).save(out('dfm-bom-order', 'capabilities'));
}
