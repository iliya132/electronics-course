import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('kicad-start');

  diagram({
    title: 'Путь проекта в KiCad: от схемы к Gerber',
    w: 840, h: 240,
    boxes: [
      { id: 'a', x: 10, y: 80, w: 120, h: 70, text: 'схема\n(символы)', tone: 'accent', size: 12 },
      { id: 'b', x: 150, y: 80, w: 120, h: 70, text: 'ERC\nпроверка схемы', tone: 'warn', size: 12 },
      { id: 'c', x: 290, y: 80, w: 120, h: 70, text: 'футпринты\nнетлист', tone: 'accent', size: 12 },
      { id: 'd', x: 430, y: 80, w: 120, h: 70, text: 'плата\nразводка', tone: 'accent', size: 12 },
      { id: 'e', x: 570, y: 80, w: 120, h: 70, text: 'DRC\nпроверка платы', tone: 'warn', size: 12 },
      { id: 'f', x: 710, y: 80, w: 120, h: 70, text: 'Gerber\nBOM, CPL', tone: 'ok', size: 12 },
    ],
    arrows: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']],
  }).save(out('kicad-start', 'workflow'));

  tableFig({
    title: 'Файлы проекта KiCad',
    cols: ['Файл', 'Что хранит'],
    rows: [
      ['.kicad_pro', 'настройки проекта'],
      ['.kicad_sch', 'принципиальная схема'],
      ['.kicad_pcb', 'печатная плата'],
      ['*-gerber.zip', 'файлы для производства'],
      ['sym-lib-table, fp-lib-table', 'таблицы библиотек символов и футпринтов'],
    ],
    widths: [1.6, 2.4], w: 720,
  }).save(out('kicad-start', 'files'));
}
