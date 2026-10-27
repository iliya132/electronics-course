import { Fig, barsFig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('interrupts');

  // 1. Временная диаграмма: основная программа и обработчик прерывания
  const f = new Fig(760, 300, 'Прерывание: основная программа приостанавливается на время ISR');
  const y = 120, h = 50;
  f.text(20, 30, 'время →', { size: 13, fill: C.muted });
  f.rect(40, y, 230, h, { r: 6, stroke: C.accent, fill: C.accent, opacity: 0.2 });
  f.text(155, y + 31, 'main(): основная программа', { anchor: 'middle', size: 13, weight: 600 });
  f.rect(270, y, 90, h, { r: 6, stroke: C.bad, fill: C.bad, opacity: 0.3 });
  f.text(315, y + 31, 'ISR', { anchor: 'middle', size: 14, weight: 700, fill: C.bad });
  f.rect(360, y, 330, h, { r: 6, stroke: C.accent, fill: C.accent, opacity: 0.2 });
  f.text(525, y + 31, 'main() продолжается с того же места', { anchor: 'middle', size: 13, weight: 600 });
  f.arrow(270, 70, 270, y - 2, { stroke: C.warn, width: 2.6, head: 10 });
  f.text(270, 60, 'событие: фронт на выводе, таймер, UART', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  f.text(315, y + 80, 'вход в ISR: 4–10 тактов\n(0,3–0,6 мкс при 16 МГц)', { anchor: 'middle', size: 12, fill: C.muted });
  f.text(40, 250, 'правила ISR: короткая, без delay() и Serial.print(), общие переменные объявлять как volatile', { size: 13, weight: 600, fill: C.ok });
  f.save(out('interrupts', 'timeline'));

  // 2. Вероятность поймать короткий импульс 10 мкс
  barsFig({
    title: 'Поймает ли программа импульс длиной 10 мкс',
    items: [
      { label: 'опрос, цикл 1 мс', value: 1, text: '≈ 1 %', tone: 'bad' },
      { label: 'опрос, цикл 100 мкс', value: 10, text: '≈ 10 %', tone: 'warn' },
      { label: 'опрос, цикл 10 мкс', value: 100, text: '≈ 100 % (едва)', tone: 'warn' },
      { label: 'прерывание', value: 100, text: '100 %', tone: 'ok' },
    ],
    max: 100, w: 760, labelW: 190,
  }).save(out('interrupts', 'polling'));
}
