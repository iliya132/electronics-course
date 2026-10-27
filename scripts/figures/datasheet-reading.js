import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('datasheet-reading');

  diagram({
    title: 'Анатомия даташита: где что искать',
    w: 820, h: 340,
    boxes: [
      { id: 'f', x: 20, y: 30, w: 180, h: 70, text: '1. Первая страница\nописание, основные\nпараметры, корпуса', tone: 'accent', size: 12 },
      { id: 'p', x: 220, y: 30, w: 180, h: 70, text: '2. Распиновка и\nназвания выводов', tone: 'ok', size: 12 },
      { id: 'a', x: 420, y: 30, w: 180, h: 70, text: '3. Absolute Maximum\nпредельные режимы', tone: 'bad', size: 12 },
      { id: 'r', x: 620, y: 30, w: 180, h: 70, text: '4. Recommended\nрабочие условия', tone: 'ok', size: 12 },
      { id: 'e', x: 20, y: 150, w: 240, h: 70, text: '5. Electrical Characteristics\nmin / typ / max при условиях', tone: 'accent', size: 12 },
      { id: 'g', x: 290, y: 150, w: 240, h: 70, text: '6. Графики\nзависимость от температуры,\nнапряжения, тока', tone: 'warn', size: 12 },
      { id: 't', x: 560, y: 150, w: 240, h: 70, text: '7. Типовая схема\nобвязка: конденсаторы,\nрезисторы', tone: 'ok', size: 12 },
      { id: 'k', x: 20, y: 250, w: 780, h: 56, text: '8. Корпус: размеры, посадочное место, тепловое сопротивление, маркировка', tone: 'muted', size: 13 },
    ],
  }).save(out('datasheet-reading', 'anatomy'));

  tableFig({
    title: 'Absolute Maximum и Recommended Operating — разные вещи',
    cols: ['', 'Absolute Maximum', 'Recommended Operating'],
    rows: [
      ['Что это', 'предел, за которым возможна поломка', 'условия, в которых гарантируются параметры'],
      ['Работать на пределе?', 'нельзя: только кратковременно и не гарантируется', 'это нормальный режим'],
      ['Пример (3,3 В МК)', 'вывод до 3,6 В, ток до 40 мА', 'питание 3,0–3,6 В, ток вывода до 12 мА'],
    ],
    widths: [1.2, 2.4, 2], w: 1000,
  }).save(out('datasheet-reading', 'abs-vs-rec'));
}
