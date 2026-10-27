import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

// Одна контурная схема «батарейка + нагрузка» для сравнения выбора нуля.
function panel(f, x0, title, gndAt, pa, pb) {
  const L = x0 + 64, R = x0 + 170, T = 74, B = 190, mid = 132;
  f.text(x0 + 4, 24, title, { size: 16, weight: 700 });
  sch.battery(f, L, mid, { rot: 90, name: '9 В', off: -30 });
  sch.lamp(f, R, mid, { rot: 90, name: 'лампа', off: 28 });
  sch.wire(f, [[L, mid - 40], [L, T], [R, T], [R, mid - 40]]);
  sch.wire(f, [[L, mid + 40], [L, B], [R, B], [R, mid + 40]]);
  sch.node(f, L, T); sch.node(f, L, B);
  if (gndAt === 'bottom') { sch.node(f, (L + R) / 2, B); sch.gnd(f, (L + R) / 2, B); }
  else { sch.node(f, (L + R) / 2, T); sch.gnd(f, (L + R) / 2, T); }
  f.text(L + 6, T - 12, 'A', { size: 16, weight: 700 });
  f.text(L + 6, B + 22, 'B', { size: 16, weight: 700 });
  f.text(x0 + 4, 244, `потенциал A: ${pa}\nпотенциал B: ${pb}`, { size: 15, fill: C.accent, weight: 600 });
}

export function generate() {
  fresh('voltage');

  // 1. «Горка» потенциалов вдоль замкнутой цепи
  const g = chart({
    title: 'Потенциал вдоль цепи',
    xLabel: 'путь заряда по цепи →', yLabel: 'потенциал, В',
    xRange: [0, 4], yRange: [0, 10.5], xTicks: [], yTicks: [0, 3, 6, 9],
    series: [{ points: [[0, 0], [1, 9], [1.5, 9], [3.5, 0], [4, 0]], color: C.accent, width: 3.5 }],
    legend: false,
    notes: [
      { x: 0.1, y: 5.2, text: 'батарейка:\n«подъём» на 9 В', color: C.ok },
      { x: 1.62, y: 8.4, text: 'провод: потенциал не меняется', color: C.muted },
      { x: 2.55, y: 4.4, text: 'нагрузка:\n«спуск» на 9 В', color: C.bad },
      { x: 3.55, y: 1.1, text: 'провод', color: C.muted },
    ],
  });
  g.save(out('voltage', 'potential-hill'));

  // 2. Выбор нуля: напряжение не меняется, потенциалы — меняются
  const z = new Fig(480, 300, 'Одна и та же батарейка при двух выборах земли');
  panel(z, 0, 'Земля у «−»', 'bottom', '+9 В', '0 В');
  panel(z, 240, 'Земля у «+»', 'top', '0 В', '−9 В');
  z.line(240, 40, 240, 270, { stroke: C.grid, width: 1.5 });
  z.text(240, 288, 'Напряжение между A и B в обоих случаях 9 В', { anchor: 'middle', size: 15, weight: 600 });
  z.save(out('voltage', 'ground-choice'));

  // 3. Подключение вольтметра
  const v = new Fig(480, 280, 'Вольтметр подключён параллельно лампе');
  const L = 120, R = 270, T = 60, B = 220, mid = 140, M = 360;
  sch.battery(v, L, mid, { rot: 90, name: 'батарейка', off: -32 });
  sch.lamp(v, R, mid, { rot: 90, name: 'лампа', off: -34 });
  sch.wire(v, [[L, mid - 40], [L, T], [R, T], [R, mid - 40]]);
  sch.wire(v, [[L, mid + 40], [L, B], [R, B], [R, mid + 40]]);
  sch.wire(v, [[R, mid - 40], [M, mid - 40]], { color: C.accent });
  sch.wire(v, [[R, mid + 40], [M, mid + 40]], { color: C.accent });
  sch.meter(v, M, mid, { rot: 90, sym: 'V', color: C.accent });
  sch.node(v, R, mid - 40); sch.node(v, R, mid + 40);
  v.text(M + 28, mid - 40, 'красный\nщуп (+)', { size: 14, fill: C.bad, weight: 600 });
  v.text(M + 28, mid + 44, 'чёрный\nщуп (COM)', { size: 14, weight: 600 });
  v.text(240, 262, 'Вольтметр «в параллель»: щупы на двух точках, цепь не рвём', { anchor: 'middle', size: 14, fill: C.muted });
  v.save(out('voltage', 'voltmeter'));
}
