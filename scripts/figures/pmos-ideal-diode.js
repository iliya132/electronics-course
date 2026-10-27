import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('pmos-ideal-diode');

  // 1. Защита от переполюсовки на P-MOSFET в плюсовом проводе
  const f = new Fig(660, 380, 'Защита от переполюсовки P-MOSFET в плюсовом проводе');
  sch.wire(f, [[100, 160], [100, 60], [330, 60], [330, 120]]);
  sch.battery(f, 100, 200, { rot: 90, len: 80, name: 'акб', value: '12 В', off: -34 });
  sch.wire(f, [[100, 240], [100, 330], [330, 330]]);
  sch.mosfet(f, 300, 170, { p: true, bodyDiode: true });
  sch.wire(f, [[330, 220], [330, 220]]);
  sch.resistor(f, 330, 270, { rot: 90, len: 100, name: 'нагрузка', off: -30 });
  sch.wire(f, [[330, 320], [330, 330]]);
  sch.wire(f, [[266, 170], [200, 170], [200, 330]]);
  sch.node(f, 200, 330);
  f.text(240, 156, 'затвор\nна земле', { size: 12, fill: C.muted, anchor: 'end' });
  f.text(402, 128, 'сток к батарее', { size: 12, fill: C.muted });
  f.text(402, 216, 'исток к нагрузке', { size: 12, fill: C.muted });
  f.text(430, 262, 'Верно: диод открывается,\nUзи = −Uбат, канал открыт', { size: 12, fill: C.ok, weight: 600 });
  f.text(430, 316, 'Перевёрнуто: Uзи = 0,\nМОП и диод закрыты', { size: 12, fill: C.bad, weight: 600 });
  f.save(out('pmos-ideal-diode', 'reverse-protect'));

  // 2. Падение напряжения: диоды и P-MOSFET
  const g = chart({
    title: 'Падение напряжения на защите (модель)',
    xLabel: 'Ток нагрузки, А', yLabel: 'Падение, В',
    xRange: [0, 3], yRange: [0, 0.9],
    series: [
      { fn: i => i === 0 ? 0 : 0.7 + 0.05 * i, label: 'кремниевый диод', color: C.bad, width: 3 },
      { fn: i => i === 0 ? 0 : 0.25 + 0.08 * i, label: 'диод Шоттки', color: C.warn, width: 3 },
      { fn: i => 0.03 * i, label: 'P-MOSFET 30 мОм', color: C.ok, width: 3 },
    ],
    legendAt: { x: 110, y: 90, cols: 1 },
    xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], yTicks: [0, 0.2, 0.4, 0.6, 0.8],
    samples: 150,
  });
  g.save(out('pmos-ideal-diode', 'drop'));

  // 3. Выбор источника: два P-MOSFET встречно (power path)
  const h = new Fig(660, 300, 'Выбор источника питания USB или батарея');
  sch.wire(h, [[60, 100], [180, 100]]);
  sch.block(h, 180, 70, 120, 60, 'идеальный\nдиод', { size: 14 });
  sch.wire(h, [[300, 100], [440, 100]]);
  sch.wire(h, [[60, 210], [180, 210]]);
  sch.block(h, 180, 180, 120, 60, 'идеальный\nдиод', { size: 14 });
  sch.wire(h, [[300, 210], [440, 210]]);
  sch.wire(h, [[440, 100], [440, 210]]);
  sch.node(h, 440, 155);
  sch.wire(h, [[440, 155], [520, 155]]);
  sch.block(h, 520, 125, 100, 60, 'нагрузка', { size: 14 });
  h.text(60, 84, 'USB 5 В', { size: 13, weight: 700 });
  h.text(60, 194, 'батарея 3,7 В', { size: 13, weight: 700 });
  h.text(440, 262, 'питает источник с большим напряжением,\nобратного тока нет', { anchor: 'middle', size: 12, fill: C.muted });
  h.save(out('pmos-ideal-diode', 'power-path'));
}
