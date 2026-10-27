import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

// Схема 555 в режиме мультивибратора с нагрузкой на выходе
function circuit(title, file, { r1, r2, c, load, note }) {
  const f = new Fig(720, 420, title);
  f.rect(250, 110, 150, 190, { r: 8, width: 2.6 });
  f.text(325, 205, 'NE555', { anchor: 'middle', size: 16, weight: 700 });
  const pins = [['TRIG 2', 250, 140, 'l'], ['THR 6', 250, 180, 'l'], ['DIS 7', 250, 220, 'l'], ['VCC 8', 400, 140, 'r'], ['RST 4', 400, 180, 'r'], ['OUT 3', 400, 220, 'r']];
  for (const [t, x, y, side] of pins) {
    f.line(side === 'l' ? x - 20 : x, y, side === 'l' ? x : x + 20, y);
    f.text(side === 'l' ? x + 8 : x - 8, y + 5, t, { anchor: side === 'l' ? 'start' : 'end', size: 11 });
  }
  f.line(325, 300, 325, 330);
  f.text(325, 292, 'GND 1', { anchor: 'middle', size: 11 });
  sch.gnd(f, 325, 330);
  sch.wire(f, [[420, 140], [470, 140], [470, 40], [120, 40]]);
  f.circle(120, 40, 4.5, { fill: 'none' });
  f.text(120, 26, '+9 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[420, 180], [470, 180]]);
  sch.node(f, 470, 140);
  sch.node(f, 150, 40);
  sch.wire(f, [[150, 40], [150, 60]]);
  sch.resistor(f, 150, 100, { rot: 90, len: 80, name: 'R1', value: r1, off: -30 });
  sch.wire(f, [[150, 140], [150, 220], [230, 220]]);
  sch.node(f, 150, 220);
  sch.resistor(f, 150, 260, { rot: 90, len: 80, name: 'R2', value: r2, off: -30 });
  sch.wire(f, [[150, 300], [150, 320], [200, 320], [200, 140], [230, 140]]);
  sch.wire(f, [[200, 180], [230, 180]]);
  sch.node(f, 200, 180);
  sch.node(f, 200, 320);
  sch.wire(f, [[200, 320], [200, 330]]);
  sch.capacitor(f, 200, 355, { rot: 90, len: 50, name: 'C', value: c, off: 30, polar: load === 'led' });
  sch.wire(f, [[200, 380], [200, 392]]);
  sch.gnd(f, 200, 388);
  // нагрузка
  sch.wire(f, [[420, 220], [500, 220]]);
  if (load === 'led') {
    sch.resistor(f, 530, 220, { len: 60, name: 'Rс 470 Ом', off: 26 });
    sch.wire(f, [[560, 220], [600, 220]]);
    sch.diode(f, 640, 220, { len: 80, led: true, name: 'VD', off: 36 });
    sch.wire(f, [[680, 220], [700, 220], [700, 260]]);
    sch.gnd(f, 700, 260);
  } else {
    sch.resistor(f, 530, 220, { len: 60, name: 'R 100 Ом', off: 26 });
    sch.wire(f, [[560, 220], [610, 220], [610, 240]]);
    f.circle(610, 262, 22, { width: 2.4 });
    f.text(610, 267, 'BZ', { anchor: 'middle', size: 14, weight: 700 });
    sch.wire(f, [[610, 284], [610, 310]]);
    sch.gnd(f, 610, 310);
  }
  f.text(430, 380, note, { size: 13, fill: C.ok, weight: 700 });
  f.save(out('555-blinker-tone', file));
}

export function generate() {
  fresh('555-blinker-tone');
  circuit('Мигалка на 555: светодиод 1 Гц', 'blinker', { r1: '10 кОм', r2: '68 кОм', c: '10 мкФ', load: 'led', note: 'f ≈ 0,99 Гц' });
  circuit('Генератор тона на 555 с пассивным зуммером', 'tone', { r1: '1 кОм', r2: '68 кОм', c: '10 нФ', load: 'buzzer', note: 'f ≈ 1,05 кГц' });

  // Диапазон частоты с учётом допусков (расчёт)
  const nom = 1.44 / ((10e3 + 2 * 68e3) * 10e-6);
  const fmin = nom / (1.05 * 1.2), fmax = nom / (0.95 * 0.8);
  const fmt = v => v.toFixed(2).replace('.', ',');
  const g = new Fig(700, 240, 'Ожидаемый диапазон измеренной частоты мигалки');
  const X = v => 60 + (v - 0.6) / (1.5 - 0.6) * 580;
  g.line(X(0.6), 140, X(1.5), 140, { width: 2.4 });
  [0.6, 0.8, 1.0, 1.2, 1.4].forEach(v => {
    g.line(X(v), 134, X(v), 146, { width: 2 });
    g.text(X(v), 168, fmt(v), { anchor: 'middle', size: 13, fill: C.muted });
  });
  g.text(X(1.5), 168, 'Гц', { anchor: 'end', size: 13, fill: C.muted });
  g.rect(X(fmin), 112, X(fmax) - X(fmin), 28, { fill: C.accent, stroke: 'none', r: 4, opacity: 0.35 });
  g.line(X(nom), 100, X(nom), 150, { stroke: C.ok, width: 3 });
  g.text(X(nom), 90, `расчёт ${fmt(nom)} Гц`, { anchor: 'middle', size: 13, weight: 700, fill: C.ok });
  g.text(X(fmin) - 6, 200, `${fmt(fmin)} Гц: худший случай`, { anchor: 'start', size: 12, fill: C.muted });
  g.text(X(fmax) + 40, 125, `${fmt(fmax)} Гц`, { anchor: 'start', size: 12, fill: C.muted });
  g.text(350, 30, 'R ±5 %, C ±20 %: измеренная частота может оказаться в закрашенной зоне', { anchor: 'middle', size: 13, weight: 600 });
  g.save(out('555-blinker-tone', 'tolerance'));
}
