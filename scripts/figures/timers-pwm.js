import { Fig, tableFig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('timers-pwm');

  // 1. Счётчик, сравнение и выход ШИМ (8 бит, OCR = 64)
  const f = new Fig(720, 360, 'Таймер: счётчик, регистр сравнения OCR и выход ШИМ');
  const x0 = 90, w = 580, periods = 3, ocr = 64;
  const X = t => x0 + t / periods * w, Y = v => 150 - v / 255 * 110;
  // пила
  const pts = [];
  for (let p = 0; p < periods; p++) pts.push([X(p), Y(0)], [X(p + 1) - 0.2, Y(255)], [X(p + 1), Y(0)]);
  f.poly(pts, { stroke: C.accent, width: 2.6 });
  f.line(x0, Y(ocr), x0 + w, Y(ocr), { stroke: C.bad, dash: '6 4', width: 2 });
  f.text(x0 - 10, Y(ocr) + 5, 'OCR = 64', { anchor: 'end', size: 12, weight: 700, fill: C.bad });
  f.text(x0 - 10, Y(255) + 5, '255', { anchor: 'end', size: 12, fill: C.muted });
  f.text(x0 - 10, Y(0) + 5, '0', { anchor: 'end', size: 12, fill: C.muted });
  f.text(x0 + 6, 24, 'счётчик TCNT0 растёт до 255 и обнуляется', { size: 13, weight: 600, fill: C.accent });
  // выход: 1 пока счётчик < OCR
  const steps = [[0, 1]];
  for (let p = 0; p < periods; p++) { if (p) steps.push([p, 1]); steps.push([p + ocr / 256, 0]); }
  wave(f, x0, 220, w, 'Выход', steps, periods, C.ok, 40);
  for (let p = 0; p <= periods; p++) f.line(X(p), 40, X(p), 262, { stroke: C.grid, width: 1.4 });
  f.text(x0 + w / 2, 300, 'D = OCR/256 = 64/256 = 25 %; период = 256 тактов таймера', { anchor: 'middle', size: 13, weight: 700 });
  f.text(x0 + w / 2, 322, 'выход 1 до момента совпадения TCNT0 = OCR, затем 0 до переполнения', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('timers-pwm', 'counter'));

  // 2. Предделитель и частота
  tableFig({
    title: 'Предделитель таймера при 16 МГц (8 бит, быстрый ШИМ)',
    cols: ['Предделитель', 'Такт таймера', 'Частота ШИМ f/256'],
    rows: [
      ['1', '16 МГц', '62,5 кГц'],
      ['8', '2 МГц', '7812 Гц'],
      ['64', '250 кГц', '976,6 Гц'],
      ['256', '62,5 кГц', '244 Гц'],
      ['1024', '15,625 кГц', '61 Гц'],
    ],
    widths: [1, 1.2, 1.5], w: 720,
  }).save(out('timers-pwm', 'prescaler'));
}
