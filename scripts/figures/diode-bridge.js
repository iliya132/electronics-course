import { Fig, C, chart, out, fresh } from '../lib/fig.js';

// Диод вдоль отрезка: анод в (x1,y1), катод в (x2,y2)
function diodeSeg(f, [x1, y1], [x2, y2], on, label, lab) {
  const col = on ? C.accent : C.muted, w = on ? 3 : 1.6;
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, h = 11, a = 12;
  const p = (s, t) => [mx + ux * s + nx * t, my + uy * s + ny * t];
  f.line(x1, y1, ...p(-a, 0), { stroke: col, width: w });
  f.line(...p(a, 0), x2, y2, { stroke: col, width: w });
  f.poly([p(-a, -h), p(-a, h), p(a, 0)], { stroke: col, width: w, close: true, fill: on ? col : 'none' });
  f.line(...p(a, -h), ...p(a, h), { stroke: col, width: w });
  f.text(lab[0], lab[1], label, { anchor: 'middle', size: 13, weight: 700, fill: col });
}

export function generate() {
  fresh('diode-bridge');

  const f = new Fig(480, 330, 'Пути тока в диодном мосте');
  const panel = (x0, pos) => {
    const A = [x0 + 26, 170], P = [x0 + 120, 90], N = [x0 + 120, 250], B = [x0 + 214, 170];
    f.text(x0 + 120, 24, pos ? 'Полупериод 1: A плюс' : 'Полупериод 2: B плюс', { anchor: 'middle', size: 14, weight: 700 });
    // активные: pos -> D1 (A→P), D4 (N→B); иначе D2 (B→P), D3 (N→A)
    diodeSeg(f, A, P, pos, 'D1', [x0 + 52, 112]);
    diodeSeg(f, B, P, !pos, 'D2', [x0 + 188, 112]);
    diodeSeg(f, N, A, !pos, 'D3', [x0 + 52, 236]);
    diodeSeg(f, N, B, pos, 'D4', [x0 + 188, 236]);
    f.line(...P, P[0], 130, { width: 3, stroke: C.ok });
    f.rect(P[0] - 11, 130, 22, 80, { r: 3, width: 2.2 });
    f.line(P[0], 210, ...N, { width: 3, stroke: C.ok });
    f.text(P[0] + 18, 176, 'Rн', { size: 13, weight: 700 });
    f.text(P[0] + 8, 82, '+', { size: 18, weight: 700, fill: C.ok });
    f.text(P[0] + 8, 270, '−', { size: 20, weight: 700, fill: C.ok });
    f.dot(...A, 4.5); f.dot(...B, 4.5); f.dot(...P, 4.5); f.dot(...N, 4.5);
    f.text(A[0] - 6, 193, 'A', { anchor: 'middle', size: 14, weight: 700 });
    f.text(B[0] + 6, 193, 'B', { anchor: 'middle', size: 14, weight: 700 });
  };
  panel(0, true);
  panel(240, false);
  f.line(240, 44, 240, 296, { stroke: C.grid, width: 1.5 });
  f.text(240, 318, 'Проводят два диода по диагонали; через Rн ток всегда сверху вниз', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('diode-bridge', 'paths'));

  // Выход моста: 12 В RMS, два диода по 0,7 В
  const Um = 12 * Math.SQRT2, Vd = 1.4;
  const g = chart({
    title: 'Мост на входе 12 В RMS (Vf = 0,7 В)',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 40], yRange: [-20, 20],
    series: [
      { fn: t => Um * Math.sin(2 * Math.PI * t / 20), label: 'вход, пик 16,97 В', color: C.muted, width: 2, dash: '6 5' },
      { fn: t => Math.max(0, Math.abs(Um * Math.sin(2 * Math.PI * t / 20)) - Vd), label: 'выход моста, пик 15,6 В', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 92, cols: 1 },
    yTicks: [-20, -10, 0, 10, 20],
    notes: [{ x: 21, y: -14, text: 'около нуля диоды закрыты:\nвыход 0 при |вход| < 1,4 В', color: C.muted }],
  });
  g.save(out('diode-bridge', 'output'));
}
