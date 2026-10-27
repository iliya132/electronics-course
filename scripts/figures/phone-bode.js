import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const fc = 1 / (2 * Math.PI * 10e3 * 100e-9);
const dB = fr => -10 * Math.log10(1 + (fr / fc) ** 2);

export function generate() {
  fresh('phone-bode');

  // 1. Схема измерений
  const f = new Fig(480, 300, 'Смартфон как генератор и RC-фильтр, два измерения напряжения');
  f.rect(16, 70, 112, 110, { r: 12, width: 2.5, fill: C.surface });
  f.text(72, 106, 'смартфон', { anchor: 'middle', size: 14, weight: 700 });
  f.text(72, 128, 'приложение-\nгенератор', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(72, 168, 'аудиовыход', { anchor: 'middle', size: 11, fill: C.warn });
  sch.wire(f, [[128, 100], [160, 100]]);
  sch.node(f, 160, 100);
  sch.wire(f, [[160, 100], [190, 100]]);
  sch.resistor(f, 230, 100, { name: 'R 10 кОм', len: 80, off: 28 });
  sch.wire(f, [[270, 100], [340, 100]]);
  sch.node(f, 310, 100);
  sch.wire(f, [[310, 100], [310, 120]]);
  sch.capacitor(f, 310, 148, { rot: 90, name: 'C 100 нФ', off: 28, len: 56 });
  sch.wire(f, [[310, 176], [310, 230], [128, 230], [128, 160]]);
  sch.wire(f, [[160, 100], [160, 125]], { color: C.accent });
  sch.meter(f, 160, 155, { rot: 90, sym: 'V~', color: C.accent, len: 60, name: '' });
  sch.wire(f, [[160, 185], [160, 230]], { color: C.accent });
  sch.node(f, 160, 230);
  f.text(160, 258, 'измеряем Uвх', { anchor: 'middle', size: 12, fill: C.accent, weight: 700 });
  f.text(340, 258, 'затем Uвых (на C)', { anchor: 'middle', size: 12, fill: C.ok, weight: 700 });
  f.text(240, 24, 'fc = 1 / (2π·10 кОм·100 нФ) = 159 Гц', { anchor: 'middle', size: 15, weight: 700, fill: C.accent });
  f.save(out('phone-bode', 'setup'));

  // 2. Расчётная АЧХ и опорные точки
  const pts = [20, 50, 100, 159, 300, 600, 1000, 2000];
  const g = chart({
    title: 'Расчётная АЧХ для R = 10 кОм, C = 100 нФ',
    xLabel: 'Частота, Гц (лог.)', yLabel: 'Усиление, дБ',
    xRange: [10, 5000], yRange: [-30, 2], log: true, xTicks: [10, 100, 1000], yTicks: [0, -3, -10, -20, -30],
    series: [{ fn: dB, color: C.accent, width: 3 }],
    legend: false,
    markers: pts.map((fr, i) => ({ x: fr, y: dB(fr), label: i === 3 ? 'fc: −3 дБ' : i === 6 ? '1 кГц: −16' : i === 7 ? '2 кГц: −22' : '', dx: i === 7 ? -8 : 8, dy: i === 7 ? -10 : i === 6 ? -10 : 20, anchor: i === 7 ? 'end' : 'start', color: C.bad })),
  });
  g.save(out('phone-bode', 'expected'));
}
