import { Fig, tableFig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('ground-plane');

  const f = new Fig(820, 360, 'Возвратный ток течёт под дорожкой сигнала (вид сверху)');
  const panel = (ox, title, slot) => {
    f.text(ox + 190, 26, title, { anchor: 'middle', size: 14, weight: 700, fill: slot ? C.bad : C.ok });
    f.rect(ox, 44, 380, 240, { r: 6, width: 1.6, fill: C.surface });
    f.text(ox + 10, 62, 'земляная плоскость', { size: 11, fill: C.muted });
    f.line(ox + 30, 120, ox + 350, 120, { stroke: C.accent, width: 3 });
    f.text(ox + 30, 108, 'дорожка сигнала →', { size: 11, fill: C.accent, weight: 700 });
    if (!slot) {
      f.line(ox + 350, 132, ox + 30, 132, { stroke: C.ok, width: 2.4, dash: '6 4' });
      f.arrow(ox + 150, 132, ox + 120, 132, { stroke: C.ok, width: 2.4, head: 9 });
      f.text(ox + 190, 170, 'возврат идёт под дорожкой:\nмалая петля, низкая индуктивность', { anchor: 'middle', size: 12, fill: C.ok, weight: 600 });
    } else {
      f.rect(ox + 160, 90, 40, 140, { r: 2, width: 1.6, fill: 'none', stroke: C.bad, dash: '4 3' });
      f.text(ox + 180, 250, 'разрез в плоскости', { anchor: 'middle', size: 11, fill: C.bad });
      f.poly([[ox + 350, 132], [ox + 205, 132], [ox + 205, 236], [ox + 155, 236], [ox + 155, 132], [ox + 30, 132]], { stroke: C.bad, width: 2.2, dash: '6 4' });
      f.text(ox + 270, 190, 'обход разреза:\nбольшая петля, помехи', { anchor: 'middle', size: 12, fill: C.bad, weight: 600 });
    }
  };
  panel(20, 'Сплошная плоскость', false);
  panel(420, 'Плоскость с разрезом под дорожкой', true);
  f.text(410, 330, 'нельзя прокладывать быстрые сигналы над разрезами и щелями в земле', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('ground-plane', 'return-path'));

  tableFig({
    title: 'Звезда или плоскость?',
    cols: ['Подход', 'Плюсы', 'Минусы', 'Когда'],
    rows: [
      ['Земляная плоскость', 'низкая индуктивность, меньше помех', 'нужен второй слой или заливка', 'цифровые и смешанные платы'],
      ['«Звезда»', 'простая развязка токов', 'длинные проводники, больше индуктивность', 'низкочастотная аналоговая техника'],
      ['Разделение аналог/цифра', 'меньше шума в аналоге', 'нельзя разрывать возврат', 'АЦП, датчики, аудио'],
    ],
    widths: [1.5, 1.8, 2.2, 2.2], w: 1120,
  }).save(out('ground-plane', 'approaches'));
}
