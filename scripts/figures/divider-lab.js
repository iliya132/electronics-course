import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('divider-lab');

  // 1. Схема опыта: делитель, вольтметр и пробная нагрузка
  const f = new Fig(480, 320, 'Схема опыта: делитель 9 В, вольтметр и пробная нагрузка');
  sch.battery(f, 60, 160, { rot: 90, name: '9 В', off: -28 });
  sch.wire(f, [[60, 120], [60, 50], [200, 50], [200, 70]]);
  sch.resistor(f, 200, 110, { rot: 90, name: 'R1', off: 28 });
  sch.wire(f, [[200, 150], [200, 190]]);
  sch.node(f, 200, 170);
  sch.resistor(f, 200, 230, { rot: 90, name: 'R2', off: 28 });
  sch.wire(f, [[200, 270], [200, 296], [60, 296], [60, 200]]);
  sch.node(f, 200, 296);
  sch.wire(f, [[200, 170], [310, 170]], { color: C.accent });
  sch.wire(f, [[310, 170], [310, 200]]);
  sch.meter(f, 310, 220, { rot: 90, sym: 'V', color: C.accent, len: 40 });
  sch.wire(f, [[310, 240], [310, 296]]);
  sch.node(f, 310, 296);
  sch.wire(f, [[310, 170], [400, 170], [400, 200]], { color: C.bad, dash: '6 5' });
  sch.resistor(f, 400, 240, { rot: 90, name: 'Rн', off: 28, len: 80 });
  sch.wire(f, [[400, 280], [400, 296], [310, 296]], { color: C.bad, dash: '6 5' });
  f.text(24, 22, 'R1 = 10 кОм, Rн = 10 кОм', { size: 13, fill: C.muted });
  f.text(24, 38, 'R2 = 10 кОм (опыт A) или 4,7 кОм (опыт B)', { size: 13, fill: C.muted });
  f.text(290, 80, 'пунктир: нагрузка\nво втором опыте', { size: 13, fill: C.bad, weight: 600 });
  f.save(out('divider-lab', 'circuit'));

  // 2. Расчётные напряжения: без нагрузки и с нагрузкой
  const bars = [
    { name: 'A: 10к/10к\nбез нагрузки', v: 4.5, color: C.accent },
    { name: 'A: 10к/10к\nнагрузка 10к', v: 3.0, color: C.bad },
    { name: 'B: 10к/4,7к\nбез нагрузки', v: 2.878, color: C.accent },
    { name: 'B: 10к/4,7к\nнагрузка 10к', v: 2.180, color: C.bad },
  ];
  const g = new Fig(480, 300, 'Расчётное напряжение на выходе обоих делителей');
  g.text(240, 24, 'Ожидаемое Uвых при питании 9 В', { anchor: 'middle', size: 16, weight: 700 });
  const base = 232, scale = 36;
  g.line(30, base, 460, base, { width: 1.5 });
  bars.forEach((b, i) => {
    const x = 50 + i * 104, h = b.v * scale;
    g.rect(x, base - h, 70, h, { fill: b.color, stroke: 'none', r: 4, opacity: 0.85 });
    g.text(x + 35, base - h - 8, String(b.v).replace('.', ',') + ' В', { anchor: 'middle', size: 15, weight: 700, fill: b.color });
    g.text(x + 35, base + 20, b.name, { anchor: 'middle', size: 12, fill: C.muted });
  });
  g.save(out('divider-lab', 'expected'));
}
