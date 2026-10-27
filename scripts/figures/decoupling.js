import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const lg = Math.log10;
const pow = v => String(Number((10 ** v).toPrecision(2))).replace('.', ',');

export function generate() {
  fresh('decoupling');

  // 1. Схема: источник, дорожка с индуктивностью, микросхема и развязка
  const f = new Fig(480, 300, 'Питание микросхемы через дорожку с индуктивностью и развязывающий конденсатор');
  sch.battery(f, 56, 150, { rot: 90 });
  sch.wire(f, [[56, 110], [56, 70], [100, 70]]);
  sch.inductor(f, 140, 70, { name: 'L дорожки', off: 28 });
  sch.wire(f, [[180, 70], [310, 70]]);
  sch.wire(f, [[56, 190], [56, 240], [420, 240]]);
  // развязывающий конденсатор у вывода микросхемы
  sch.node(f, 270, 70);
  sch.wire(f, [[270, 70], [270, 120]]);
  sch.capacitor(f, 270, 160, { rot: 90, name: 'C 100 нФ', off: -30 });
  sch.wire(f, [[270, 200], [270, 240]]);
  sch.node(f, 270, 240);
  // микросхема
  f.rect(330, 90, 100, 120, { r: 8, width: 2.5, fill: C.surface });
  f.text(380, 145, 'МК', { anchor: 'middle', size: 20, weight: 700 });
  f.text(380, 166, 'ключи\nпереключаются', { anchor: 'middle', size: 11, fill: C.muted });
  sch.wire(f, [[310, 70], [380, 70], [380, 90]]);
  sch.wire(f, [[380, 210], [380, 240]]);
  sch.node(f, 380, 240);
  f.text(240, 24, 'Конденсатор рядом с выводом отдаёт ток быстрее дорожки', { anchor: 'middle', size: 13, fill: C.muted });
  f.text(240, 274, 'Чем короче путь до вывода, тем меньше индуктивность', { anchor: 'middle', size: 13, fill: C.accent, weight: 600 });
  f.save(out('decoupling', 'circuit'));

  // 2. Шум питания: без и с развязкой (модель)
  const events = [40, 110, 160];
  const noise = (amp, tau, period) => t => {
    let v = 3.3;
    for (const e of events) if (t >= e) v += -amp * Math.exp(-(t - e) / tau) * Math.cos(2 * Math.PI * (t - e) / period);
    return v;
  };
  const g = chart({
    title: 'Питание микросхемы при переключениях (модель)',
    xLabel: 'Время, нс', yLabel: 'Напряжение, В',
    xRange: [0, 220], yRange: [2.6, 3.6], yTicks: [2.8, 3.0, 3.3, 3.6], samples: 900,
    series: [
      { fn: noise(0.5, 14, 30), label: 'без развязки', color: C.bad, width: 2 },
      { fn: noise(0.03, 14, 30), label: 'с конденсатором 100 нФ', color: C.ok, width: 2.5 },
    ],
    legendAt: { x: 90, y: 270, cols: 1 },
  });
  g.save(out('decoupling', 'noise'));

  // 3. Импеданс реальных конденсаторов
  const z = (c, esr, esl) => fr => {
    const w = 2 * Math.PI * fr;
    return lg(Math.hypot(esr, w * esl - 1 / (w * c)));
  };
  const h = chart({
    title: 'Сопротивление конденсатора на частоте',
    xLabel: 'Частота, Гц (лог.)', yLabel: '|Z|, Ом (лог.)',
    xRange: [1e4, 1e9], yRange: [-2, 2], log: true, yTicks: [-2, -1, 0, 1, 2], yFormat: pow, xTicks: [1e4, 1e5, 1e6, 1e7, 1e8, 1e9],
    xFormat: v => (v >= 1e9 ? v / 1e9 + ' ГГц' : v >= 1e6 ? v / 1e6 + ' МГц' : v / 1e3 + ' кГц'),
    series: [
      { fn: z(100e-9, 0.03, 2e-9), label: '100 нФ, ESL 2 нГн', color: C.accent, width: 2.5 },
      { fn: z(10e-6, 0.01, 3e-9), label: '10 мкФ, ESL 3 нГн', color: C.ok, width: 2.5 },
    ],
    legendAt: { x: 90, y: 100, cols: 1 },
    markers: [
      { x: 11.25e6, y: lg(0.03), label: 'резонанс 11 МГц', dx: 8, dy: 24, color: C.accent },
    ],
  });
  h.save(out('decoupling', 'impedance'));
}
