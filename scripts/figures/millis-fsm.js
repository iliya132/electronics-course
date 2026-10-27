import { diagram, Fig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('millis-fsm');

  diagram({
    title: 'Конечный автомат светофора',
    w: 760, h: 320,
    boxes: [
      { id: 'red', x: 30, y: 120, w: 150, h: 70, text: 'КРАСНЫЙ\n5 с', tone: 'bad' },
      { id: 'green', x: 300, y: 40, w: 150, h: 70, text: 'ЗЕЛЁНЫЙ\n4 с', tone: 'ok' },
      { id: 'yellow', x: 570, y: 120, w: 150, h: 70, text: 'ЖЁЛТЫЙ\n1,5 с', tone: 'warn' },
    ],
    arrows: [['red', 'green', 'время вышло'], ['green', 'yellow', 'время вышло'], ['yellow', 'red', 'время вышло']],
    notes: [{ x: 30, y: 250, text: 'в каждом состоянии программа запоминает момент входа и сравнивает millis() с длительностью', size: 13, tone: 'accent', weight: 700 }],
  }).save(out('millis-fsm', 'states'));

  // две задачи без delay(): A — каждые 500 мс, B — каждые 1300 мс
  const f = new Fig(760, 240, 'Две задачи одновременно без delay()');
  const T = 4000;
  const toggles = (p, off = 0) => { const s = [[0, 0]]; let v = 0; for (let t = off + p; t < T; t += p) { v = 1 - v; s.push([t, v]); } return s; };
  wave(f, 150, 40, 580, 'мигалка 500 мс', toggles(500), T, C.accent, 34);
  wave(f, 150, 110, 580, 'опрос 1300 мс', toggles(1300), T, C.ok, 34);
  [0, 1000, 2000, 3000, 4000].forEach(t => { f.line(150 + t / T * 580, 30, 150 + t / T * 580, 160, { stroke: C.grid, width: 1.2 }); f.text(150 + t / T * 580, 180, `${t / 1000} с`, { anchor: 'middle', size: 12, fill: C.muted }); });
  f.text(420, 215, 'обе задачи идут независимо, потому что каждая сверяет своё время по millis()', { anchor: 'middle', size: 12, weight: 600 });
  f.save(out('millis-fsm', 'tasks'));
}
