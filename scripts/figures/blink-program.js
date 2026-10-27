import { diagram, tableFig, Fig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('blink-program');

  diagram({
    title: 'Структура программы Arduino',
    w: 700, h: 300,
    boxes: [
      { id: 'start', x: 30, y: 120, w: 130, h: 56, text: 'включение\nили сброс', tone: 'muted' },
      { id: 'setup', x: 220, y: 120, w: 150, h: 56, text: 'setup()\nвыполняется один раз', tone: 'accent' },
      { id: 'loop', x: 430, y: 120, w: 180, h: 56, text: 'loop()\nповторяется бесконечно', tone: 'ok' },
    ],
    arrows: [['start', 'setup'], ['setup', 'loop']],
    lines: [[520, 120, 520, 80, { tone: 'ok' }], [520, 80, 600, 80, { tone: 'ok' }], [600, 80, 600, 120, { tone: 'ok' }]],
    notes: [{ x: 440, y: 70, text: 'снова и снова', size: 12, tone: 'ok', weight: 700 }, { x: 30, y: 240, text: 'в setup() настраивают выводы; в loop() — основная работа', size: 13 }],
  }).save(out('blink-program', 'structure'));

  // осциллограмма: delay(250) HIGH / delay(750) LOW
  const f = new Fig(720, 220, 'Выход D13 при delay(250) и delay(750)');
  const tMax = 3000, steps = [[0, 1]];
  for (let t = 0; t < tMax; t += 1000) { if (t) steps.push([t, 1]); steps.push([t + 250, 0]); }
  wave(f, 120, 70, 560, 'D13', steps, tMax, C.accent, 40);
  [0, 1000, 2000, 3000].forEach(t => { f.line(120 + t / tMax * 560, 50, 120 + t / tMax * 560, 130, { stroke: C.grid, width: 1.4 }); f.text(120 + t / tMax * 560, 150, `${t} мс`, { anchor: 'middle', size: 12, fill: C.muted }); });
  f.text(360, 195, 'период 1000 мс, частота 1 Гц, скважность 25 %', { anchor: 'middle', size: 13, weight: 700 });
  f.save(out('blink-program', 'timing'));

  tableFig({
    title: 'Типичные ошибки компиляции',
    cols: ['Сообщение', 'Причина', 'Что сделать'],
    rows: [
      ["expected ';' before '}'", 'нет точки с запятой', 'поставить ; в конце команды'],
      ["'Led' was not declared", 'ошибка в имени или регистре', 'проверить написание'],
      ["expected '}' at end of input", 'не хватает закрывающей скобки', 'сверить { и }'],
      ['no matching function for call', 'неверные аргументы функции', 'сверить аргументы с документацией'],
    ],
    widths: [2, 1.6, 2.2], w: 800,
  }).save(out('blink-program', 'errors'));
}
