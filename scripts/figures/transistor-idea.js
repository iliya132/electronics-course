import { Fig, C, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('transistor-idea');

  // 1. Кран-аналогия
  const f = new Fig(520, 340, 'Транзистор как кран, которым управляет слабый сигнал');
  f.text(260, 28, 'источник энергии (шина питания)', { anchor: 'middle', size: 14, weight: 600, fill: C.muted });
  f.rect(235, 40, 50, 80, { fill: C.accent, stroke: 'none', r: 4, opacity: 0.35 });
  f.arrow(260, 48, 260, 112, { stroke: C.accent, width: 3, head: 10 });
  // клапан
  f.rect(225, 120, 70, 60, { r: 8, width: 2.6 });
  f.text(260, 156, 'клапан', { anchor: 'middle', size: 14, weight: 600 });
  f.rect(235, 180, 50, 70, { fill: C.accent, stroke: 'none', r: 4, opacity: 0.35 });
  f.arrow(260, 184, 260, 244, { stroke: C.accent, width: 3, head: 10 });
  f.rect(205, 250, 110, 44, { r: 8, width: 2.4 });
  f.text(260, 278, 'нагрузка', { anchor: 'middle', size: 15, weight: 600 });
  // рычаг управления
  f.line(120, 150, 225, 150, { width: 2.6 });
  f.arrow(60, 150, 118, 150, { stroke: C.ok, width: 1.6, head: 8 });
  f.text(20, 128, 'слабое управление:', { size: 13, fill: C.ok, weight: 700 });
  f.text(20, 190, 'ток базы или\nнапряжение затвора', { size: 13, fill: C.ok, weight: 600 });
  f.text(330, 90, 'большой поток:\nколлектор → эмиттер\nсток → исток', { size: 13, fill: C.accent, weight: 600 });
  f.text(330, 215, 'вход можно держать\nслабым, выход — мощный', { size: 13, fill: C.muted });
  f.save(out('transistor-idea', 'valve'));

  // 2. Четыре обозначения
  const g = new Fig(700, 320, 'Условные обозначения NPN, PNP, N-MOSFET и P-MOSFET');
  const y = 150;
  const col = [[110, 'NPN'], [290, 'PNP'], [470, 'N-MOSFET'], [630, 'P-MOSFET']];
  sch.bjt(g, col[0][0], y);
  sch.bjt(g, col[1][0], y, { pnp: true });
  sch.mosfet(g, col[2][0], y);
  sch.mosfet(g, col[3][0], y, { p: true });
  const bjtLabels = x => {
    g.text(x - 40, y - 8, 'Б', { anchor: 'middle', size: 15, weight: 700, fill: C.ok });
    g.text(x + 46, y - 56, 'К', { size: 15, weight: 700, fill: C.accent });
    g.text(x + 46, y + 66, 'Э', { size: 15, weight: 700, fill: C.accent });
  };
  bjtLabels(col[0][0]); bjtLabels(col[1][0]);
  const mosLabels = x => {
    g.text(x - 34, y - 8, 'З', { anchor: 'middle', size: 15, weight: 700, fill: C.ok });
    g.text(x + 38, y - 56, 'С', { size: 15, weight: 700, fill: C.accent });
    g.text(x + 38, y + 66, 'И', { size: 15, weight: 700, fill: C.accent });
  };
  mosLabels(col[2][0]); mosLabels(col[3][0]);
  for (const [x, t] of col) g.text(x + 4, 262, t, { anchor: 'middle', size: 16, weight: 700 });
  g.text(200, 292, 'управляет ток базы', { anchor: 'middle', size: 13, fill: C.muted });
  g.text(550, 292, 'управляет напряжение на затворе', { anchor: 'middle', size: 13, fill: C.muted });
  g.save(out('transistor-idea', 'symbols'));

  // 3. Корпуса
  const h = new Fig(700, 300, 'Корпуса TO-92, SOT-23 и TO-220 с типичной нумерацией выводов');
  // TO-92 (вид спереди, плоская сторона к нам)
  h.path('M 70 170 L 70 110 A 42 42 0 0 1 154 110 L 154 170 Z', { width: 2.4 });
  h.text(112, 140, 'TO-92', { anchor: 'middle', size: 14, weight: 700 });
  [[84, 'К'], [112, 'Б'], [140, 'Э']].forEach(([x, t]) => {
    h.line(x, 170, x, 215);
    h.text(x, 238, t, { anchor: 'middle', size: 15, weight: 700 });
  });
  h.text(112, 268, 'BC547: К-Б-Э\n2N3904: Э-Б-К', { anchor: 'middle', size: 12, fill: C.muted });
  // SOT-23
  h.rect(285, 120, 90, 46, { r: 4, width: 2.4 });
  h.text(330, 148, 'SOT-23', { anchor: 'middle', size: 14, weight: 700 });
  h.line(300, 166, 300, 196); h.line(360, 166, 360, 196); h.line(330, 120, 330, 92);
  h.text(300, 214, '1', { anchor: 'middle', size: 14, weight: 700 });
  h.text(360, 214, '2', { anchor: 'middle', size: 14, weight: 700 });
  h.text(330, 82, '3', { anchor: 'middle', size: 14, weight: 700 });
  h.text(330, 248, 'MOSFET: З(1) – И(2) – С(3)\nBJT: Б(1) – Э(2) – К(3)', { anchor: 'middle', size: 12, fill: C.muted });
  // TO-220
  h.rect(500, 70, 110, 28, { r: 3, width: 2.4, fill: C.surface });
  h.circle(555, 84, 7, { width: 2 });
  h.rect(500, 98, 110, 80, { r: 3, width: 2.4 });
  h.text(555, 143, 'TO-220', { anchor: 'middle', size: 14, weight: 700 });
  [[520, 'З'], [555, 'С'], [590, 'И']].forEach(([x, t]) => {
    h.line(x, 178, x, 220);
    h.text(x, 242, t, { anchor: 'middle', size: 15, weight: 700 });
  });
  h.text(555, 268, 'IRLZ44N: З-С-И\nрадиатор = сток', { anchor: 'middle', size: 12, fill: C.muted });
  h.save(out('transistor-idea', 'packages'));
}
