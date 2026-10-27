import { Fig, tableFig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('i2c');

  // Транзакция: START, адрес 0x3C (0111100), W (0), ACK, ... STOP
  const f = new Fig(800, 300, 'Транзакция I²C: адрес 0x3C и запись');
  const x0 = 90, w = 680, N = 14;
  const X = i => x0 + i / N * w;
  const bits = [0, 1, 1, 1, 1, 0, 0, 0, 0]; // 0111100 + W(0) + ACK(0)
  // SCL: пауза 1, затем 9 импульсов, затем 1
  const scl = [[0, 1], [1, 1]];
  for (let k = 0; k < 9; k++) { scl.push([2 + k, 0], [2 + k + 0.5, 1]); }
  const sclSteps = [[0, 1]];
  for (let k = 0; k < 9; k++) { sclSteps.push([2 + k, 0], [2 + k + 0.5, 1]); }
  wave(f, x0, 40, w, 'SCL', sclSteps, N, C.muted, 36);
  const sda = [[0, 1], [1.5, 0]];            // START: SDA падает при SCL = 1
  let prev = 0;
  bits.forEach((b, k) => { const t = 2 + k - 0.05; if (b !== prev) { sda.push([t, b]); prev = b; } });
  sda.push([11.2, 1]);                        // STOP: SDA растёт при SCL = 1
  wave(f, x0, 120, w, 'SDA', sda, N, C.accent, 36);
  const labels = ['A6', 'A5', 'A4', 'A3', 'A2', 'A1', 'A0', 'R/W', 'ACK'];
  labels.forEach((l, k) => f.text(X(2 + k + 0.25), 190, l, { anchor: 'middle', size: 11, fill: C.muted }));
  const vals = ['0', '1', '1', '1', '1', '0', '0', '0', '0'];
  vals.forEach((v, k) => f.text(X(2 + k + 0.25), 208, v, { anchor: 'middle', size: 13, weight: 700 }));
  f.text(X(1.5), 235, 'START', { anchor: 'middle', size: 12, weight: 700, fill: C.ok });
  f.text(X(11.4), 235, 'STOP', { anchor: 'middle', size: 12, weight: 700, fill: C.bad });
  f.text(X(7), 268, 'адрес 0111100₂ = 0x3C; бит R/W = 0 — запись; ACK = 0 — устройство ответило', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('i2c', 'transaction'));

  tableFig({
    title: 'Допустимое сопротивление подтяжки I²C при Vcc = 3,3 В',
    cols: ['Режим', 'Rmin (3 мА)', 'Rmax при 100 пФ', 'Rmax при 400 пФ'],
    rows: [
      ['100 кГц (tr ≤ 1000 нс)', '0,97 кОм', '11,8 кОм', '2,95 кОм'],
      ['400 кГц (tr ≤ 300 нс)', '0,97 кОм', '3,54 кОм', '0,89 кОм (не годится)'],
    ],
    widths: [1.6, 1.1, 1.4, 1.7], w: 820,
  }).save(out('i2c', 'pullup-range'));
}
