import { C, chart, out, fresh } from '../lib/fig.js';

const Vp = 12 * Math.SQRT2 - 1.4; // пик после моста, 12 В RMS
const rect = t => Math.max(0, Math.abs(Vp + 1.4 > 0 ? (Vp + 1.4) * Math.sin(2 * Math.PI * t / 20) : 0) - 1.4);

export function generate() {
  fresh('filter-capacitor');

  // модель: конденсатор разряжается током нагрузки (dV = I/C·dt) и подзаряжается выходом моста
  const run = (capUF, iA) => {
    const cap = capUF * 1e-6, pts = []; let v = Vp;
    for (let t = 0; t <= 60.001; t += 0.02) {
      v = Math.max(rect(t), v - iA / cap * 0.02e-3);
      pts.push([t, v]);
    }
    const late = pts.filter(p => p[0] > 30);
    const dU = Math.max(...late.map(p => p[1])) - Math.min(...late.map(p => p[1]));
    return { pts, dU };
  };
  const a = run(470, 0.2), b = run(2200, 0.2);
  console.log('ripple 470 мкФ:', a.dU.toFixed(2), 'формула', (0.2 / (100 * 470e-6)).toFixed(2));
  console.log('ripple 2200 мкФ:', b.dU.toFixed(2), 'формула', (0.2 / (100 * 2200e-6)).toFixed(2));

  const g = chart({
    title: 'Выход моста с конденсатором, I = 0,2 А (модель)',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 60], yRange: [8, 17],
    series: [
      { fn: t => rect(t), label: 'без конденсатора', color: C.muted, width: 1.8, dash: '6 5' },
      { points: a.pts, label: '470 мкФ: ΔU ≈ 3,3 В', color: C.bad, width: 2.6 },
      { points: b.pts, label: '2200 мкФ: ΔU ≈ 0,8 В', color: C.accent, width: 3 },
    ],
    legendAt: { x: 78, y: 70, cols: 1 },
    samples: 400,
  });
  g.save(out('filter-capacitor', 'ripple'));

  // Токи через диоды: полусинусные импульсы той же площади, что ток нагрузки (иллюстративно)
  const I = 0.2, Tm = 10, w = 3, peak = I * Tm * Math.PI / (2 * w);
  const pulse = t => {
    const ph = ((t % Tm) + Tm) % Tm;
    const c0 = 2.5; // заряд идёт около пика горба
    const x = ph - (c0 - w / 2);
    return x >= 0 && x <= w ? peak * Math.sin(Math.PI * x / w) : 0;
  };
  const h = chart({
    title: 'Ток через диоды моста (иллюстративно)',
    xLabel: 'Время, мс', yLabel: 'Ток, А',
    xRange: [0, 40], yRange: [0, 1.2],
    series: [{ fn: pulse, color: C.accent, width: 3, label: 'ток диодов' }],
    hlines: [{ v: I, label: 'ток нагрузки 0,2 А', color: C.ok }],
    legend: false,
    samples: 800,
    notes: [{ x: 14, y: 1.0, text: 'узкие импульсы ≈ 1 А:\nвсё, что нужно нагрузке за 10 мс,\nпоступает за ~3 мс', color: C.muted }],
  });
  h.save(out('filter-capacitor', 'diode-pulses'));
}
