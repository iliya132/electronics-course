import { diagram, Fig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('digital-input-button');

  // Осциллограмма дребезга (иллюстрация)
  const f = new Fig(720, 260, 'Дребезг контактов при нажатии кнопки (иллюстрация)');
  const x0 = 90, w = 600, y1 = 60, y0 = 160;
  const T = 30; // мс
  const X = t => x0 + t / T * w;
  const pts = [[X(0), y1], [X(5), y1], [X(5), y0], [X(6.2), y0], [X(6.2), y1], [X(7.4), y1], [X(7.4), y0], [X(8.3), y0], [X(8.3), y1], [X(9.5), y1], [X(9.5), y0], [X(30), y0]];
  f.poly(pts, { stroke: C.bad, width: 2.8 });
  f.line(X(5), 40, X(5), 200, { stroke: C.muted, dash: '3 5', width: 1.4 });
  f.line(X(9.5), 40, X(9.5), 200, { stroke: C.muted, dash: '3 5', width: 1.4 });
  f.text(x0 - 10, y1 + 5, '1 (отпущена)', { anchor: 'end', size: 12, fill: C.muted });
  f.text(x0 - 10, y0 + 5, '0 (нажата)', { anchor: 'end', size: 12, fill: C.muted });
  f.text(X(5) + 4, 32, 'первое касание', { size: 12, fill: C.muted });
  f.text(X(9.5) + 4, 215, 'устойчивое 0 через ≈ 5 мс', { size: 12, fill: C.ok, weight: 700 });
  f.text(x0 + w / 2, 245, 'время, мс: отскоки дают несколько ложных нажатий', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('digital-input-button', 'bounce'));

  diagram({
    title: 'Алгоритм подавления дребезга без delay()',
    w: 760, h: 300,
    boxes: [
      { id: 'read', x: 20, y: 110, w: 150, h: 60, text: 'читаем кнопку\ndigitalRead', tone: 'accent' },
      { id: 'diff', x: 220, y: 110, w: 150, h: 60, text: 'значение\nизменилось?', tone: 'warn' },
      { id: 'time', x: 420, y: 110, w: 150, h: 60, text: 'запоминаем\nвремя millis()', tone: 'muted' },
      { id: 'ok', x: 610, y: 110, w: 130, h: 60, text: 'прошло ≥ 30 мс\n→ принять', tone: 'ok' },
    ],
    arrows: [['read', 'diff'], ['diff', 'time', 'да'], ['time', 'ok']],
    notes: [{ x: 20, y: 240, text: 'если значение не менялось дольше 30 мс — это устойчивое состояние кнопки', size: 13, tone: 'ok', weight: 700 }],
  }).save(out('digital-input-button', 'debounce-flow'));
}
