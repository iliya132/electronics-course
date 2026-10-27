import { Fig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('deep-sleep');

  // Профиль мощности: сон 10 мин, работа 3 с
  const f = new Fig(780, 300, 'Профиль тока датчика с deep sleep: 10 мкА сон и 80 мА × 3 с каждые 10 минут');
  const x0 = 90, w = 640, y0 = 220;
  const X = t => x0 + t / 1200 * w, H = 150;
  const pts = [[0, 0]];
  [0, 600].forEach(t0 => { pts.push([t0 + 597, 0], [t0 + 597, 80], [t0 + 600, 80], [t0 + 600, 0]); });
  const path = [[x0, y0]];
  [0, 600].forEach(t0 => { path.push([X(t0 + 597), y0], [X(t0 + 597), y0 - H], [X(t0 + 600), y0 - H], [X(t0 + 600), y0]); });
  path.push([X(1200), y0]);
  f.poly(path, { stroke: C.accent, width: 2.6 });
  f.line(x0, y0, x0 + w, y0, { width: 1.6 });
  [0, 600, 1200].forEach(t => { f.line(X(t), y0, X(t), y0 + 6, { width: 1.6 }); f.text(X(t), y0 + 22, `${t} с`, { anchor: 'middle', size: 12, fill: C.muted }); });
  f.text(x0 - 8, y0 - H + 4, '80 мА', { anchor: 'end', size: 12, fill: C.muted });
  f.text(x0 - 8, y0 + 4, '0,01 мА', { anchor: 'end', size: 12, fill: C.muted });
  f.text(X(300), y0 - 12, 'deep sleep: 10 мкА, 597 с', { anchor: 'middle', size: 12, fill: C.ok, weight: 700 });
  f.text(X(600) - 4, y0 - H - 10, 'работа 3 с, 80 мА', { anchor: 'end', size: 12, fill: C.bad, weight: 700 });
  f.text(x0 + w / 2, 270, 'средний ток = (80·3 + 0,01·597)/600 ≈ 0,41 мА → 18650 на 2600 мА·ч ≈ 264 суток (идеально)', { anchor: 'middle', size: 12, weight: 600 });
  f.save(out('deep-sleep', 'profile'));

  // срок работы от активной фазы (цикл 600 с, 2600 мА·ч)
  const days = a => 2600 / ((80 * a + 0.01 * (600 - a)) / 600) / 24;
  chart({
    title: 'Срок работы от 18650 (2600 мА·ч): цикл 10 минут',
    xLabel: 'Время активной фазы за цикл, с', yLabel: 'Срок работы, суток',
    xRange: [0.5, 30], yRange: [0, 1500], log: false,
    series: [{ fn: days, label: 'Iакт 80 мА, Iсон 10 мкА', color: C.accent, width: 3 }],
    markers: [{ x: 3, y: days(3), label: '3 с: 264 суток', dx: 12, dy: -14, anchor: 'start' }, { x: 1, y: days(1), label: '1 с: 756 суток', dx: 12, dy: -12, anchor: 'start', color: C.ok }],
    xTicks: [0.5, 5, 10, 20, 30], yTicks: [0, 500, 1000, 1500],
    legendAt: { x: 240, y: 90, cols: 1 },
    samples: 150,
  }).save(out('deep-sleep', 'lifetime'));
}
