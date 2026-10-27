import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('potentiometer');

  // 1. Устройство: дорожка и движок
  const f = new Fig(480, 280, 'Потенциометр: дорожка и подвижный контакт');
  const x0 = 60, w = 360, y0 = 90, h = 28, wx = x0 + 0.6 * w;
  f.rect(x0, y0, w, h, { fill: C.surface, stroke: C.ink, r: 6, width: 2.5 });
  f.line(x0, y0 + h, x0, 180, { width: 2.5 });
  f.line(x0 + w, y0 + h, x0 + w, 180, { width: 2.5 });
  f.arrow(wx, 44, wx, y0 - 2, { stroke: C.accent, width: 3, head: 12 });
  f.line(wx, 44, wx, 28, { stroke: C.accent, width: 3 });
  f.text(wx + 10, 36, 'движок (вывод 2)', { size: 14, fill: C.accent, weight: 700 });
  f.circle(x0, 186, 5, { fill: 'none' });
  f.circle(x0 + w, 186, 5, { fill: 'none' });
  f.text(x0, 210, 'вывод 1', { anchor: 'middle', size: 14, weight: 700 });
  f.text(x0 + w, 210, 'вывод 3', { anchor: 'middle', size: 14, weight: 700 });
  f.text(x0 + w / 2, 148, 'резистивная дорожка 10 кОм', { anchor: 'middle', size: 13, fill: C.muted });
  f.line(x0, 232, wx, 232, { stroke: C.ok, width: 2.5 });
  f.line(wx, 232, x0 + w, 232, { stroke: C.bad, width: 2.5 });
  f.text((x0 + wx) / 2, 254, 'Ra = 6 кОм', { anchor: 'middle', size: 14, weight: 700, fill: C.ok });
  f.text((wx + x0 + w) / 2, 254, 'Rb = 4 кОм', { anchor: 'middle', size: 14, weight: 700, fill: C.bad });
  f.text(240, 274, 'Ra + Rb = 10 кОм при любом положении движка', { anchor: 'middle', size: 13, fill: C.muted });
  f.save(out('potentiometer', 'structure'));

  // 2. Потенциометр как делитель
  const d = new Fig(480, 300, 'Потенциометр как делитель напряжения');
  d.circle(150, 40, 5, { fill: 'none' });
  d.text(138, 45, '+5 В', { anchor: 'end', size: 16, weight: 700, fill: C.warn });
  sch.wire(d, [[155, 40], [200, 40], [200, 70]]);
  sch.resistor(d, 200, 150, { rot: 90, name: 'P 10 кОм', off: -30 });
  sch.wire(d, [[200, 190], [200, 240]]);
  sch.gnd(d, 200, 240);
  d.arrow(310, 150, 222, 150, { stroke: C.accent, width: 3, head: 12 });
  d.circle(314, 150, 5, { fill: 'none' });
  d.text(326, 155, 'Uвых', { size: 16, weight: 700, fill: C.accent });
  d.text(240, 114, 'движок на 60 % пути\nот земли: Uвых = 3 В', { size: 14, fill: C.accent, weight: 600, anchor: 'start', dy: 0 });
  d.text(240, 290, 'Uвых = Uвх · (доля поворота), если нагрузка мала по току', { anchor: 'middle', size: 13, fill: C.muted });
  d.save(out('potentiometer', 'divider'));

  // 3. Линейная и логарифмическая характеристики
  const log = x => (10 ** (2 * x) - 1) / 99;
  const g = chart({
    title: 'Какая доля сопротивления при повороте',
    xLabel: 'Поворот ручки, % хода', yLabel: 'Сопротивление от начала, % полного',
    xRange: [0, 100], yRange: [0, 100],
    series: [
      { fn: x => x, label: 'B — линейный', color: C.accent },
      { fn: x => 100 * log(x / 100), label: 'A — логарифмический (модель)', color: C.bad },
    ],
    markers: [
      { x: 50, y: 50, label: '50 % → 50 %', dx: 10, dy: 22, color: C.accent },
      { x: 50, y: 100 * log(0.5), label: '50 % → ≈ 9 %', dx: 10, dy: 22, color: C.bad },
    ],
  });
  g.save(out('potentiometer', 'taper'));
}
