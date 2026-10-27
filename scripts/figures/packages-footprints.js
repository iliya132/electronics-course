import { Fig, tableFig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('packages-footprints');

  // Размеры в масштабе 36 пикселей на миллиметр (корпус без выводов)
  const k = 36;
  const f = new Fig(860, 300, 'Корпуса SMD в одном масштабе (36 пикселей на миллиметр)');
  const items = [
    ['0402', 1.0, 0.5, 'трудно'],
    ['0603', 1.6, 0.8, 'возможно'],
    ['0805', 2.0, 1.25, 'удобно'],
    ['1206', 3.2, 1.6, 'очень удобно'],
    ['SOT-23', 2.9, 1.3, '3 вывода'],
    ['SOIC-8', 4.9, 3.9, 'шаг 1,27 мм'],
  ];
  let x = 20;
  items.forEach(([name, w, h, note]) => {
    const pw = w * k, ph = h * k, y = 110 - ph / 2;
    f.rect(x, y, pw, ph, { r: 2, width: 2, fill: C.surface });
    f.text(x + pw / 2, 160, name, { anchor: 'middle', size: 12, weight: 700 });
    f.text(x + pw / 2, 178, `${String(w).replace('.', ',')}×${String(h).replace('.', ',')} мм`, { anchor: 'middle', size: 10, fill: C.muted });
    f.text(x + pw / 2, 194, note, { anchor: 'middle', size: 10, fill: C.muted });
    x += Math.max(pw, 90) + 18;
  });
  f.line(20, 250, 20 + 5 * k, 250, { width: 3 });
  f.text(20 + 2.5 * k, 272, '5 мм', { anchor: 'middle', size: 12, weight: 700 });
  f.save(out('packages-footprints', 'scale'));

  tableFig({
    title: 'Как выбирать корпус для ручной пайки',
    cols: ['Корпус', 'Шаг выводов', 'Ручная пайка', 'Комментарий'],
    rows: [
      ['DIP (THT)', '2,54 мм', 'очень просто', 'для макеток и учебных плат'],
      ['SOIC-8', '1,27 мм', 'просто', 'микросхемы общего назначения'],
      ['TSSOP-16', '0,65 мм', 'средне', 'нужны тонкое жало и флюс'],
      ['QFN-32', '0,5 мм', 'трудно', 'нужен фен и паста'],
      ['BGA', '0,5–1,0 мм', 'невозможно вручную', 'нужна печь и рентген'],
    ],
    widths: [1.2, 1.2, 1.4, 2.4], w: 840,
  }).save(out('packages-footprints', 'hand'));
}
