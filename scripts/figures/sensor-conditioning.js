import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('sensor-conditioning');

  // 1. Цепочка подготовки сигнала
  const f = new Fig(760, 250, 'Цепочка датчик — делитель — буфер — фильтр — АЦП');
  const names = [['датчик', 'NTC, LDR,\nтермопара'], ['делитель /\nсмещение', 'напряжение\nвместо\nсопротивления'], ['усилитель /\nбуфер', 'масштаб\nи низкий\nRвых'], ['RC-фильтр', 'убирает\nвысокочастотный\nшум'], ['АЦП', '0…3,3 В\nв код']];
  names.forEach(([t, s], i) => {
    const x = 20 + i * 148;
    sch.block(f, x, 60, 112, 64, t, { size: 14, fill: i === 4 ? C.surface : 'none' });
    f.text(x + 56, 150, s, { anchor: 'middle', size: 12, fill: C.muted });
    if (i < 4) f.arrow(x + 112, 92, x + 148, 92, { width: 2.2, head: 9 });
  });
  f.text(380, 30, 'каждый блок решает свою задачу, порядок важен', { anchor: 'middle', size: 13, weight: 600 });
  f.save(out('sensor-conditioning', 'chain'));

  // 2. Делитель с NTC 10 кОм (B = 3950) на 3,3 В
  const Rn = T => 10e3 * Math.exp(3950 * (1 / (T + 273.15) - 1 / 298.15));
  const V = T => 3.3 * 10e3 / (10e3 + Rn(T));
  const fmt = v => v.toFixed(2).replace('.', ',');
  const g = chart({
    title: 'Выход делителя с NTC 10 кОм (B = 3950)',
    xLabel: 'Температура, °C', yLabel: 'Напряжение на АЦП, В',
    xRange: [-10, 80], yRange: [0, 3.3],
    series: [{ fn: V, label: 'NTC сверху, 10 кОм снизу, питание 3,3 В', color: C.accent, width: 3 }],
    markers: [0, 25, 50].map(T => ({ x: T, y: V(T), label: `${T} °C: ${fmt(V(T))} В`, dx: 16, dy: 22, anchor: 'start' })),
    legendAt: { x: 90, y: 90, cols: 1 },
    xTicks: [-10, 10, 30, 50, 70], yTicks: [0, 1, 2, 3],
    samples: 200,
  });
  g.save(out('sensor-conditioning', 'ntc-curve'));
}
