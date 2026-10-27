import { Fig, C, sch, out, fresh } from '../lib/fig.js';

function meter() {
  const f = new Fig(480, 320, 'Мультиметр: гнёзда и режимы');
  f.rect(24, 14, 200, 296, { r: 18, width: 2.5, fill: C.surface });
  f.rect(44, 34, 160, 50, { r: 6, width: 2 });
  f.text(124, 70, '1.50', { anchor: 'middle', size: 30, weight: 700, fill: C.accent });
  f.circle(124, 160, 48, { width: 2.5 });
  f.circle(124, 160, 6, { fill: C.ink });
  f.line(124, 160, 124, 120, { width: 4 });
  const marks = [['V⎓', -60, C.accent], ['V~', 0, C.muted], ['Ω ·))', 55, C.ok], ['A', 120, C.bad], ['mA', 180, C.bad], ['OFF', -120, C.muted]];
  for (const [t, deg, col] of marks) {
    const a = (deg - 90) * Math.PI / 180;
    f.text(124 + Math.cos(a) * 68, 160 + Math.sin(a) * 68 + 5, t, { anchor: 'middle', size: 12, weight: 700, fill: col });
  }
  const jacks = [[58, '10A', C.bad], [96, 'mA', C.bad], [134, 'VΩ', C.accent], [172, 'COM', C.ink]];
  for (const [x, t, col] of jacks) {
    f.circle(x, 262, 12, { stroke: col, width: 3 });
    f.circle(x, 262, 4, { fill: col, stroke: 'none' });
    f.text(x, 292, t, { anchor: 'middle', size: 13, weight: 700, fill: col });
  }
  const notes = [
    [58, 'COM: всегда чёрный щуп', C.ink, 70],
    [58, 'VΩ: красный (U, R, прозвонка)', C.accent, 110],
    [58, 'mA: красный для малых токов', C.bad, 150],
    [58, '10A: красный для больших токов', C.bad, 190],
  ];
  f.text(240, 44, 'Куда вставлять красный щуп:', { size: 14, weight: 700 });
  notes.forEach(([, t, col], i) => f.text(244, 76 + i * 34, t, { size: 13, fill: col, weight: 600 }));
  f.text(240, 262, 'Токовые гнёзда (mA и 10A)\nзащищены предохранителем и\nимеют почти нулевое\nсопротивление.', { size: 13, fill: C.muted });
  return f;
}

function breadboard() {
  const f = new Fig(480, 350, 'Внутренние соединения макетной платы');
  const xs = Array.from({ length: 10 }, (_, i) => 50 + i * 28);
  const rowsTop = [92, 112, 132, 152, 172], rowsBot = [214, 234, 254, 274, 294];
  // шины питания
  const rail = (y, color, label) => {
    f.rect(36, y - 8, xs[9] - 36 + 14, 16, { r: 8, fill: color, stroke: 'none', opacity: 0.2 });
    xs.forEach(x => f.circle(x, y, 4, { width: 1.5 }));
    f.text(xs[9] + 24, y + 5, label, { size: 13, weight: 700, fill: color });
  };
  rail(26, C.bad, '+ шина');
  rail(50, C.accent, '− шина');
  rail(322, C.accent, '− шина');
  rail(338, C.bad, '+ шина');
  // колонки: выделим две как пример
  xs.forEach(x => {
    f.rect(x - 8, 84, 16, 98, { r: 8, fill: C.ok, stroke: 'none', opacity: x === xs[3] ? 0.35 : 0.1 });
    f.rect(x - 8, 206, 16, 98, { r: 8, fill: C.warn, stroke: 'none', opacity: x === xs[3] ? 0.35 : 0.1 });
    rowsTop.forEach(y => f.circle(x, y, 4, { width: 1.5 }));
    rowsBot.forEach(y => f.circle(x, y, 4, { width: 1.5 }));
  });
  f.line(36, 194, xs[9] + 14, 194, { stroke: C.muted, width: 2, dash: '2 5' });
  f.text(xs[9] + 24, 198, 'канавка', { size: 13, fill: C.muted, weight: 700 });
  f.text(xs[9] + 24, 132, 'a–e: пять\nконтактов\nсоединены\nвертикально', { size: 12, fill: C.ok, weight: 600 });
  f.text(xs[9] + 24, 254, 'f–j: другая\nпятёрка,\nс верхней\nне связана', { size: 12, fill: C.warn, weight: 600 });
  return f;
}

function currentMeasure() {
  const f = new Fig(480, 300, 'Правильное и неправильное подключение амперметра');
  const panel = (x0, good) => {
    const L = x0 + 34, R = x0 + 190, T = 90, B = 230, mid = 160;
    f.text(x0 + 6, 28, good ? 'Правильно: в разрыв' : 'Неправильно: параллельно', { size: 15, weight: 700, fill: good ? C.ok : C.bad });
    sch.battery(f, L, mid, { rot: 90 });
    sch.lamp(f, R, mid, { rot: 90 });
    sch.wire(f, [[R, mid + 40], [R, B], [L, B], [L, mid + 40]]);
    if (good) {
      sch.wire(f, [[L, mid - 40], [L, T], [x0 + 74, T]]);
      sch.meter(f, x0 + 112, T, { sym: 'A', len: 76, color: C.accent });
      sch.wire(f, [[x0 + 150, T], [R, T], [R, mid - 40]]);
      f.text(x0 + 112, 262, 'ток идёт через прибор', { anchor: 'middle', size: 13, fill: C.ok, weight: 600 });
    } else {
      sch.wire(f, [[L, mid - 40], [L, T], [R, T], [R, mid - 40]]);
      const m = x0 + 112;
      sch.meter(f, m, 160, { rot: 90, sym: 'A', color: C.bad });
      sch.wire(f, [[m, T], [m, 120]]);
      sch.wire(f, [[m, 200], [m, B]]);
      sch.node(f, m, T); sch.node(f, m, B);
      f.text(x0 + 112, 270, 'КЗ через прибор:\nсгорит предохранитель', { anchor: 'middle', size: 13, fill: C.bad, weight: 700 });
    }
  };
  panel(0, true);
  panel(240, false);
  f.line(240, 40, 240, 290, { stroke: C.grid, width: 1.5 });
  return f;
}

export function generate() {
  fresh('multimeter-breadboard');
  meter().save(out('multimeter-breadboard', 'meter'));
  breadboard().save(out('multimeter-breadboard', 'breadboard'));
  currentMeasure().save(out('multimeter-breadboard', 'current-measure'));
}
