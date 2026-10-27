import { diagram, Fig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('traffic-light');

  diagram({
    title: 'Схема светофора с кнопкой пешехода',
    w: 780, h: 360,
    boxes: [
      { id: 'uno', x: 300, y: 90, w: 170, h: 180, text: 'Arduino Uno\nD10 → красный\nD9 → жёлтый\nD8 → зелёный\nD2 ← кнопка', tone: 'accent', size: 13 },
      { id: 'r', x: 30, y: 40, w: 190, h: 50, text: 'LED красный + 330 Ом → GND', tone: 'bad', size: 12 },
      { id: 'y', x: 30, y: 130, w: 190, h: 50, text: 'LED жёлтый + 330 Ом → GND', tone: 'warn', size: 12 },
      { id: 'g', x: 30, y: 220, w: 190, h: 50, text: 'LED зелёный + 330 Ом → GND', tone: 'ok', size: 12 },
      { id: 'btn', x: 570, y: 140, w: 190, h: 60, text: 'кнопка пешехода\nD2 — GND, INPUT_PULLUP', tone: 'muted', size: 12 },
    ],
    arrows: [['uno', 'r'], ['uno', 'y'], ['uno', 'g'], ['btn', 'uno']],
    notes: [{ x: 30, y: 320, text: 'ток каждого светодиода ≈ (5 − 2)/330 ≈ 9 мА; горит один из трёх одновременно', size: 12 }],
  }).save(out('traffic-light', 'wiring'));

  // Временная диаграмма: красный 5 с, зелёный 4 с, жёлтый 1,5 с
  const f = new Fig(780, 270, 'Цикл светофора: красный 5 с, зелёный 4 с, жёлтый 1,5 с');
  const T = 10.5;
  const seg = (a, b) => [[0, 0], [a, 1], [b, 0]];
  wave(f, 120, 40, 620, 'красный', seg(0, 5), T, C.bad, 30);
  wave(f, 120, 100, 620, 'зелёный', seg(5, 9), T, C.ok, 30);
  wave(f, 120, 160, 620, 'жёлтый', seg(9, 10.5), T, C.warn, 30);
  [0, 5, 9, 10.5].forEach(t => { f.line(120 + t / T * 620, 30, 120 + t / T * 620, 200, { stroke: C.grid, width: 1.2 }); f.text(120 + t / T * 620, 222, `${String(t).replace('.', ',')} с`, { anchor: 'middle', size: 12, fill: C.muted }); });
  f.save(out('traffic-light', 'timing'));
}
