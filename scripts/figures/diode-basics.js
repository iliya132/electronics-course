import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

const Is = 4.1e-9, nVt = 0.049;
const iDiode = v => Is * (Math.exp(v / nVt) - 1) * 1000; // мА

export function generate() {
  fresh('diode-basics');

  // 1. Прямое и обратное включение
  const f = new Fig(480, 320, 'Диод в прямом и обратном включении');
  const panel = (x0, forward) => {
    const L = x0 + 36, R = x0 + 196, T = 90, B = 230, mid = 160;
    f.text(x0 + 6, 28, forward ? 'Прямое включение' : 'Обратное включение', { size: 15, weight: 700, fill: forward ? C.ok : C.bad });
    sch.battery(f, L, mid, { rot: 90 });
    sch.wire(f, [[L, mid - 40], [L, T], [x0 + 70, T]]);
    sch.diode(f, x0 + 110, T, { rot: forward ? 0 : 180, len: 80 });
    sch.wire(f, [[x0 + 150, T], [R, T], [R, mid - 40]]);
    sch.resistor(f, R, mid, { rot: 90, len: 80 });
    sch.wire(f, [[R, mid + 40], [R, B], [L, B], [L, mid + 40]]);
    if (forward) {
      sch.current(f, x0 + 60, B, 'left', '', { color: C.ok, len: 40 });
      f.text(x0 + 6, 268, 'анод к «+»: диод открыт,\nток идёт, на диоде ≈ 0,7 В', { size: 12, fill: C.ok, weight: 600 });
    } else {
      f.text(x0 + 6, 268, 'катод к «+»: диод закрыт,\nток почти нулевой', { size: 12, fill: C.bad, weight: 600 });
    }
  };
  panel(0, true);
  panel(240, false);
  f.line(240, 40, 240, 300, { stroke: C.grid, width: 1.5 });
  f.save(out('diode-basics', 'forward-reverse'));

  // 2. ВАХ диода (кремниевый малосигнальный, упрощённая модель Шокли)
  const g = chart({
    title: 'ВАХ кремниевого диода (модель)',
    xLabel: 'Напряжение на диоде, В', yLabel: 'Ток, мА',
    xRange: [0, 1], yRange: [0, 60],
    series: [{ fn: v => Math.min(iDiode(v), 200), color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 0.608, y: 1, label: '1 мА: 0,61 В', dx: -8, dy: -12, anchor: 'end' },
      { x: 0.72, y: 10, label: '10 мА: 0,72 В', dx: -8, dy: -12, anchor: 'end', color: C.bad },
      { x: 0.8, y: iDiode(0.8), label: '50 мА: 0,80 В', dx: -8, dy: 22, anchor: 'end' },
    ],
    notes: [{ x: 0.05, y: 54, text: 'ниже 0,5 В ток почти ноль', color: C.muted }],
  });
  g.save(out('diode-basics', 'iv'));
}
