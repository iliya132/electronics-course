import { diagram, Fig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('servos-motors');

  // Импульсы сервопривода: 1,0 / 1,5 / 2,0 мс в кадре 20 мс
  const f = new Fig(760, 300, 'Управляющий импульс сервопривода: ширина задаёт угол');
  const x0 = 130, w = 560, frame = 20;
  const X = t => x0 + t / frame * w;
  [[1.0, '0°', C.accent, 50], [1.5, '90°', C.ok, 130], [2.0, '180°', C.warn, 210]].forEach(([p, lab, col, y]) => {
    f.poly([[X(0), y + 30], [X(0), y], [X(p), y], [X(p), y + 30], [X(frame), y + 30]], { stroke: col, width: 2.8 });
    f.text(x0 - 12, y + 22, `${lab}: ${String(p).replace('.', ',')} мс`, { anchor: 'end', size: 13, weight: 700, fill: col });
  });
  f.line(X(frame), 40, X(frame), 250, { stroke: C.grid, dash: '3 5', width: 1.4 });
  f.text(X(frame), 270, 'кадр 20 мс (50 Гц)', { anchor: 'end', size: 12, fill: C.muted });
  f.text(x0, 285, '0', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('servos-motors', 'pulses'));

  diagram({
    title: 'Серво и мотор: отдельное питание и общая земля',
    w: 780, h: 380,
    boxes: [
      { id: 'uno', x: 30, y: 120, w: 150, h: 110, text: 'Arduino\nD9 → серво\nD5 → затвор MOSFET', tone: 'accent', size: 13 },
      { id: 'servo', x: 330, y: 30, w: 150, h: 60, text: 'серво SG90\n3 провода', tone: 'ok', size: 13 },
      { id: 'mos', x: 330, y: 200, w: 150, h: 60, text: 'MOSFET IRLZ44N\n+ диод на мотор', tone: 'warn', size: 13 },
      { id: 'motor', x: 600, y: 200, w: 150, h: 60, text: 'мотор 6–12 В', tone: 'warn', size: 13 },
      { id: 'ps', x: 600, y: 30, w: 160, h: 80, text: 'внешний БП 5 В 2 А\n+ 470 мкФ\nпо питанию серво', tone: 'bad', size: 12 },
      { id: 'gnd', x: 330, y: 310, w: 150, h: 40, text: 'общая земля GND', tone: 'muted', size: 13 },
    ],
    arrows: [['uno', 'servo', 'сигнал'], ['uno', 'mos', 'ШИМ'], ['ps', 'servo', '+5 В'], ['mos', 'motor'], ['uno', 'gnd'], ['ps', 'gnd', '', { dash: '5 4' }]],
  }).save(out('servos-motors', 'wiring'));
}
