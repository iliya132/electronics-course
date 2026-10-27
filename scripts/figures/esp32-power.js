import { Fig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('esp32-power');

  // Профиль тока: подключение Wi-Fi и передача (иллюстрация)
  const f = new Fig(780, 320, 'Профиль тока ESP32 при подключении к Wi-Fi и передаче (иллюстрация)');
  const x0 = 80, w = 660, y0 = 260, ymax = 400;
  const X = t => x0 + t / 3 * w, Y = i => y0 - i / ymax * 200;
  const pts = [[0, 30], [0.2, 30], [0.2, 120], [0.8, 120], [0.8, 150], [1.1, 150], [1.1, 320], [1.15, 320], [1.15, 90], [1.45, 90], [1.45, 340], [1.5, 340], [1.5, 90], [1.9, 90], [1.9, 250], [1.97, 250], [1.97, 60], [2.5, 60], [2.5, 30], [3, 30]];
  f.poly(pts.map(([t, i]) => [X(t), Y(i)]), { stroke: C.accent, width: 2.6 });
  f.line(x0, y0, x0 + w, y0, { width: 1.6 });
  f.line(x0, Y(0), x0, Y(400), { width: 1.6 });
  [0, 100, 200, 300, 400].forEach(v => { f.line(x0 - 4, Y(v), x0, Y(v), { width: 1.6 }); f.text(x0 - 8, Y(v) + 4, String(v), { anchor: 'end', size: 11, fill: C.muted }); });
  f.line(x0, Y(400), x0 + w, Y(400), { stroke: C.grid, width: 1.2 });
  f.text(x0 + 4, 40, 'ток, мА', { size: 12, fill: C.muted });
  f.text(X(1.12), Y(340) - 6, 'пик передачи ≈ 320–340 мА', { size: 12, weight: 700, fill: C.bad, anchor: 'middle' });
  f.text(X(0.5), Y(120) - 8, 'запуск радио', { size: 11, fill: C.muted, anchor: 'middle' });
  f.text(X(2.6), Y(30) - 8, 'простой', { size: 11, fill: C.muted, anchor: 'middle' });
  f.text(x0 + w / 2, 295, 'время, с (0–3 с): источник питания должен отдавать пики до 500 мА без просадки', { size: 12, anchor: 'middle', fill: C.muted });
  f.save(out('esp32-power', 'current-profile'));

  // Выход AMS1117-3.3 при разряде Li-ion (dropout 1,1 В): регулятор не держит 3,3 В
  chart({
    title: 'Li-ion + AMS1117-3.3: выход при разряде',
    xLabel: 'Напряжение аккумулятора, В', yLabel: 'Выход регулятора, В',
    xRange: [3.0, 4.3], yRange: [1.5, 4],
    series: [{ fn: v => Math.min(3.3, v - 1.1), label: 'Uвых = min(3,3; Uвх − 1,1)', color: C.accent, width: 3 }],
    hlines: [{ v: 2.43, label: 'порог BOD ESP32 ≈ 2,43 В', color: C.bad }],
    markers: [{ x: 4.4 > 4.3 ? 4.3 : 4.4, y: 3.2, label: 'стабилизация только выше 4,4 В', dx: -8, dy: -12, anchor: 'end', color: C.warn }],
    xTicks: [3.0, 3.3, 3.6, 3.9, 4.2], yTicks: [1.5, 2, 2.43, 3, 3.3],
    legendAt: { x: 90, y: 100, cols: 1 },
    samples: 100,
  }).save(out('esp32-power', 'ldo-liion'));
}
