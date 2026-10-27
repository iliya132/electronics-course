import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('non-inverting-inverting');

  // 1. Две схемы
  const f = new Fig(780, 340, 'Неинвертирующий и инвертирующий усилители на ОУ');
  // а) неинвертирующий
  f.text(20, 24, 'Неинвертирующий: K = 1 + Rf/Rg', { size: 15, weight: 700 });
  sch.wire(f, [[40, 128], [110, 128]]);
  f.circle(40, 128, 4.5, { fill: 'none' });
  f.text(30, 112, 'Vвх', { size: 13, weight: 700 });
  sch.opamp(f, 150, 150, { swap: true, supply: false });
  sch.node(f, 290, 150);
  sch.wire(f, [[270, 150], [330, 150]]);
  f.circle(330, 150, 4.5, { fill: 'none' });
  f.text(330, 134, 'Vвых', { anchor: 'middle', size: 13, weight: 700 });
  sch.wire(f, [[290, 150], [290, 235], [250, 235]]);
  sch.resistor(f, 210, 235, { len: 80, name: 'Rf', off: 28 });
  sch.wire(f, [[170, 235], [110, 235], [110, 172]]);
  sch.node(f, 110, 235);
  sch.wire(f, [[110, 235], [110, 250]]);
  sch.resistor(f, 110, 280, { rot: 90, len: 60, name: 'Rg', off: -30 });
  sch.gnd(f, 110, 310);
  // б) инвертирующий
  const ox = 410;
  f.text(ox, 24, 'Инвертирующий: K = −Rf/Rin', { size: 15, weight: 700 });
  sch.wire(f, [[ox + 10, 128], [ox + 30, 128]]);
  f.circle(ox + 10, 128, 4.5, { fill: 'none' });
  f.text(ox, 112, 'Vвх', { size: 13, weight: 700 });
  sch.resistor(f, ox + 60, 128, { len: 60, name: 'Rin', off: 26 });
  sch.wire(f, [[ox + 90, 128], [ox + 110, 128]]);
  sch.opamp(f, ox + 150, 150, { supply: false });
  sch.wire(f, [[ox + 110, 172], [ox + 90, 172], [ox + 90, 190]]);
  sch.gnd(f, ox + 90, 190);
  sch.node(f, ox + 100, 128);
  sch.wire(f, [[ox + 100, 128], [ox + 100, 70], [ox + 150, 70]]);
  sch.resistor(f, ox + 190, 70, { len: 80, name: 'Rf', off: 28 });
  sch.wire(f, [[ox + 230, 70], [ox + 290, 70], [ox + 290, 150]]);
  sch.node(f, ox + 290, 150);
  sch.wire(f, [[ox + 270, 150], [ox + 330, 150]]);
  f.circle(ox + 330, 150, 4.5, { fill: 'none' });
  f.text(ox + 330, 134, 'Vвых', { anchor: 'middle', size: 13, weight: 700 });
  f.text(ox, 250, 'Rin = 10 кОм, Rf = 22 кОм:\nK = −2,2; вход «+» на землю —\nсигнал инвертируется', { size: 12, fill: C.muted });
  f.save(out('non-inverting-inverting', 'two-amps'));

  // 2. Выход неинвертирующего усилителя K = 31 при питании 3,3 В
  const K = 31;
  const g = chart({
    title: 'Усилитель K = 31 при питании 3,3 В (модель)',
    xLabel: 'Входное напряжение, мВ', yLabel: 'Выход, В',
    xRange: [0, 150], yRange: [0, 4],
    series: [
      { fn: v => Math.min(3.3, K * v / 1000), label: 'Vвых = 31·Vвх, предел 3,3 В', color: C.accent, width: 3 },
    ],
    hlines: [{ v: 3.3, label: 'питание 3,3 В', color: C.warn }],
    vlines: [{ v: 100, label: '100 мВ → 3,1 В', color: C.ok }],
    legendAt: { x: 90, y: 150, cols: 1 },
    xTicks: [0, 25, 50, 75, 100, 125, 150], yTicks: [0, 1, 2, 3],
    samples: 150,
  });
  g.save(out('non-inverting-inverting', 'clip'));
}
