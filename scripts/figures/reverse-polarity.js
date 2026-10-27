import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('reverse-polarity');

  // 1. Три способа защиты (положительная шина; минус общий)
  const f = new Fig(480, 360, 'Три способа защиты от переполюсовки');
  const load = (y, ytop = 24) => {
    f.rect(404, y - ytop, 60, ytop * 2, { r: 6, width: 2.2 });
    f.text(434, y + 5, 'нагр.', { anchor: 'middle', size: 13, weight: 700 });
  };
  const term = y => { f.circle(22, y, 4.5, { fill: 'none' }); f.text(22, y - 12, '+ вход', { anchor: 'start', size: 11, fill: C.muted }); };

  // Ряд 1: диод последовательно
  f.text(12, 20, '1. Диод последовательно', { size: 14, weight: 700, fill: C.accent });
  term(58);
  sch.wire(f, [[26, 58], [150, 58]]);
  sch.diode(f, 190, 58, { len: 80, name: 'VD', off: 22 });
  sch.wire(f, [[230, 58], [404, 58]]);
  load(58);
  f.text(240, 100, 'теряем Vf на каждом ампере: 0,7 В (кремний) или 0,3–0,45 В (Шоттки)', { anchor: 'middle', size: 12, fill: C.muted });

  // Ряд 2: диод параллельно + предохранитель
  f.text(12, 134, '2. Диод параллельно + предохранитель', { size: 14, weight: 700, fill: C.accent });
  term(172);
  sch.wire(f, [[26, 172], [66, 172]]);
  sch.fuse(f, 100, 172, { len: 68, name: 'F', off: 22 });
  sch.wire(f, [[134, 172], [404, 172]]);
  sch.node(f, 230, 172);
  sch.wire(f, [[230, 172], [230, 182]]);
  sch.diode(f, 230, 206, { rot: 270, len: 48, name: 'VD', off: 24 });
  sch.wire(f, [[230, 230], [230, 236]]);
  sch.gnd(f, 230, 236);
  load(172);
  f.text(300, 224, 'в норме потерь нет;\nпри переполюсовке диод\nзамыкает вход, F перегорает', { size: 12, fill: C.muted });

  // Ряд 3: P-MOSFET
  f.text(12, 268, '3. P-MOSFET в плюсовой шине', { size: 14, weight: 700, fill: C.accent });
  term(306);
  sch.wire(f, [[26, 306], [150, 306]]);
  f.rect(150, 286, 90, 40, { r: 6, width: 2.4 });
  f.text(195, 311, 'P-MOSFET', { anchor: 'middle', size: 13, weight: 700 });
  f.text(150, 282, 'D', { anchor: 'middle', size: 11, fill: C.muted });
  f.text(240, 282, 'S', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[240, 306], [404, 306]]);
  sch.wire(f, [[195, 326], [195, 338]]);
  sch.gnd(f, 195, 338);
  f.text(186, 342, 'затвор на землю', { anchor: 'end', size: 11, fill: C.muted });
  load(306);
  f.text(250, 346, 'потеря I²·Rds(on): десятки мВт', { size: 12, fill: C.muted });
  f.save(out('reverse-polarity', 'three-ways'));

  // 2. Потери мощности при 12 В: модель Vf = const, Rds(on) = 20 мОм
  const g = chart({
    title: 'Мощность потерь в защите от тока',
    xLabel: 'Ток нагрузки, А', yLabel: 'Потери, Вт',
    xRange: [0, 2], yRange: [0, 1.5],
    series: [
      { fn: i => 0.7 * i, label: 'кремниевый диод 0,7 В', color: C.bad, width: 3 },
      { fn: i => 0.4 * i, label: 'диод Шоттки 0,4 В', color: C.warn, width: 3 },
      { fn: i => 0.02 * i * i, label: 'P-MOSFET 20 мОм', color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 90, cols: 1 },
    markers: [
      { x: 1, y: 0.7, label: '0,7 Вт', dx: 8, dy: -8, anchor: 'start', color: C.bad },
      { x: 1, y: 0.4, label: '0,4 Вт', dx: 10, dy: 18, anchor: 'start', color: C.warn },
      { x: 1, y: 0.02, label: '0,02 Вт', dx: 0, dy: -10, anchor: 'middle', color: C.accent },
    ],
    notes: [{ x: 1.15, y: 1.35, text: 'модель: Vf постоянно,\nRds(on) = 20 мОм', color: C.muted }],
  });
  g.save(out('reverse-polarity', 'losses'));
}
