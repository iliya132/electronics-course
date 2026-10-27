import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('led');

  // 1. Падение напряжения по цветам
  const f = new Fig(480, 300, 'Типичное падение напряжения светодиодов по цветам');
  const cols = [
    ['ИК', 1.3, '#9a3b3b'], ['красный', 2.0, '#d62d2d'], ['жёлтый', 2.1, '#e5c834'], ['зелёный', 2.2, '#2b8b45'],
    ['синий', 3.1, '#2b58ad'], ['белый', 3.2, '#d0d0d0'],
  ];
  f.text(240, 24, 'Vf при токе около 10–20 мА', { anchor: 'middle', size: 16, weight: 700 });
  const k = 96;
  cols.forEach(([name, v, col], i) => {
    const y = 44 + i * 42;
    f.text(14, y + 24, name, { size: 15, weight: 700 });
    f.rect(100, y, v * k, 30, { fill: col, stroke: C.muted, r: 4, width: 1.2 });
    f.text(100 + v * k + 8, y + 22, String(v).replace('.', ',') + ' В', { size: 15, weight: 700 });
  });
  f.save(out('led', 'vf-colors'));

  // 2. Параллельное и последовательное включение
  const g = new Fig(480, 330, 'Правильное и неправильное подключение нескольких светодиодов');
  g.text(120, 18, 'Неправильно', { anchor: 'middle', size: 15, weight: 700, fill: C.bad });
  g.text(360, 18, 'Правильно', { anchor: 'middle', size: 15, weight: 700, fill: C.ok });
  // слева: общий резистор на двух параллельных LED
  g.circle(20, 70, 4.5, { fill: 'none' });
  g.text(20, 54, '+5 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  sch.wire(g, [[24, 70], [40, 70]]);
  sch.resistor(g, 80, 70, { len: 80, name: 'R', off: 26 });
  sch.wire(g, [[120, 70], [200, 70]]);
  sch.node(g, 160, 70);
  [100, 200].forEach((x, i) => {
    const cx = i === 0 ? 150 : 200;
    sch.wire(g, [[cx, 70], [cx, 100]]);
    sch.diode(g, cx, 140, { rot: 90, len: 80, led: false });
    sch.wire(g, [[cx, 180], [cx, 220]]);
  });
  sch.wire(g, [[150, 220], [200, 220]]);
  sch.gnd(g, 175, 220);
  g.text(120, 270, 'разброс Vf: один LED возьмёт\nбольше тока и сгорит', { anchor: 'middle', size: 11, fill: C.bad, weight: 600 });
  // справа: свой резистор у каждого
  [300, 400].forEach(cx => {
    sch.wire(g, [[cx, 40], [cx, 54]]);
    sch.resistor(g, cx, 90, { rot: 90, len: 70, name: 'R', off: 22 });
    sch.wire(g, [[cx, 125], [cx, 150]]);
    sch.diode(g, cx, 185, { rot: 90, len: 70, led: false });
    sch.wire(g, [[cx, 220], [cx, 232]]);
    sch.gnd(g, cx, 232);
  });
  sch.wire(g, [[300, 40], [400, 40]]);
  g.text(350, 35, '+5 В', { anchor: 'middle', size: 12, weight: 700, fill: C.warn });
  g.text(350, 290, 'каждому светодиоду — свой резистор', { anchor: 'middle', size: 11, fill: C.ok, weight: 600 });
  g.line(240, 40, 240, 310, { stroke: C.grid, width: 1.5 });
  g.save(out('led', 'parallel'));

  // 3. ВАХ светодиодов разного цвета
  const iv = v10 => v => Math.min(60, 10 * Math.exp((v - v10) / (2.5 * 0.0259)));
  const h = chart({
    title: 'Светодиоды открываются при разном напряжении',
    xLabel: 'Напряжение на светодиоде, В', yLabel: 'Ток, мА',
    xRange: [1, 3.6], yRange: [0, 40],
    series: [
      { fn: iv(2.0), label: 'красный', color: C.bad },
      { fn: iv(2.15), label: 'зелёный', color: C.ok },
      { fn: iv(3.1), label: 'синий / белый', color: C.accent },
    ],
    legendAt: { x: 90, y: 100, cols: 1 },
    markers: [{ x: 2.0, y: 10, label: '10 мА: 2,0 В (красный)', dx: -10, dy: -12, anchor: 'end', color: C.bad }],
  });
  h.save(out('led', 'iv-colors'));
}
