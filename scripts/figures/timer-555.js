import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('timer-555');

  // 1. Мультивибратор на 555
  const f = new Fig(700, 400, 'Мультивибратор на таймере 555');
  f.rect(250, 110, 150, 190, { r: 8, width: 2.6 });
  f.text(325, 205, 'NE555', { anchor: 'middle', size: 16, weight: 700 });
  const pins = [['TRIG 2', 250, 140, 'l'], ['THR 6', 250, 180, 'l'], ['DIS 7', 250, 220, 'l'], ['VCC 8', 400, 140, 'r'], ['OUT 3', 400, 220, 'r'], ['RST 4', 400, 180, 'r'], ['CV 5', 400, 270, 'r']];
  for (const [t, x, y, side] of pins) {
    f.line(side === 'l' ? x - 20 : x, y, side === 'l' ? x : x + 20, y);
    f.text(side === 'l' ? x + 8 : x - 8, y + 5, t, { anchor: side === 'l' ? 'start' : 'end', size: 11 });
  }
  // питание
  sch.wire(f, [[420, 140], [470, 140], [470, 40], [120, 40]]);
  f.circle(120, 40, 4.5, { fill: 'none' });
  f.text(120, 26, '+9 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[420, 180], [470, 180]]);
  sch.node(f, 470, 140);
  // R1, R2, C
  sch.node(f, 150, 40);
  sch.wire(f, [[150, 40], [150, 60]]);
  sch.resistor(f, 150, 100, { rot: 90, len: 80, name: 'R1', value: '10 кОм', off: -30 });
  sch.wire(f, [[150, 140], [150, 220], [230, 220]]);
  sch.node(f, 150, 220);
  sch.resistor(f, 150, 260, { rot: 90, len: 80, name: 'R2', value: '68 кОм', off: -30 });
  sch.wire(f, [[150, 300], [150, 320]]);
  sch.wire(f, [[150, 320], [200, 320], [200, 180], [230, 180]]);
  sch.wire(f, [[200, 180], [200, 140], [230, 140]]);
  sch.node(f, 200, 180);
  sch.node(f, 200, 320);
  sch.wire(f, [[200, 320], [200, 330]]);
  sch.capacitor(f, 200, 355, { rot: 90, len: 50, name: 'C', value: '10 мкФ', off: 30, polar: true });
  sch.wire(f, [[200, 380], [200, 390]]);
  sch.gnd(f, 200, 385);
  f.line(325, 300, 325, 330);
  f.text(325, 292, 'GND 1', { anchor: 'middle', size: 11 });
  sch.gnd(f, 325, 330);
  f.text(480, 224, 'выход: меандр\nf ≈ 0,99 Гц', { size: 13, fill: C.ok, weight: 700 });
  sch.wire(f, [[420, 220], [470, 220]]);
  f.save(out('timer-555', 'astable'));

  // 2. Напряжение на C и выход (расчёт)
  const R1 = 10e3, R2 = 68e3, Cc = 10e-6, Vcc = 9;
  const tH = Math.log(2) * (R1 + R2) * Cc, tL = Math.log(2) * R2 * Cc, T = tH + tL;
  const vcSafe = t => {
    const x = t % T;
    if (x < tH) return Vcc - (Vcc - Vcc / 3) * Math.exp(-x / ((R1 + R2) * Cc));
    return (2 * Vcc / 3) * Math.exp(-(x - tH) / (R2 * Cc));
  };
  const out_ = t => ((t % T) < tH ? Vcc : 0);
  const g = chart({
    title: `Мультивибратор: T = ${(T).toFixed(2).replace('.', ',')} с, импульс ${(tH).toFixed(2).replace('.', ',')} с`,
    xLabel: 'Время, с', yLabel: 'Напряжение, В',
    xRange: [0, 2.2 * T], yRange: [0, 10],
    series: [
      { fn: vcSafe, label: 'на конденсаторе (1/3…2/3 Vcc)', color: C.accent, width: 3 },
      { fn: out_, label: 'выход OUT', color: C.ok, width: 2.4, dash: '8 5' },
    ],
    legendAt: { x: 90, y: 100, cols: 1 },
    xTicks: [0, 1, 2], yTicks: [0, 3, 6, 9],
    samples: 800,
  });
  g.save(out('timer-555', 'waveform'));
}
