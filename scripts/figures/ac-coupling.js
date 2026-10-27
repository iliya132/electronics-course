import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('ac-coupling');

  // 1. Сигнал до и после разделительного конденсатора
  const g = chart({
    title: 'Конденсатор убирает постоянную составляющую',
    xLabel: 'Время, мс', yLabel: 'Напряжение, В',
    xRange: [0, 10], yRange: [-1.5, 4], yTicks: [-1, 0, 1, 2.5, 3.5],
    series: [
      { fn: t => 2.5 + Math.sin(2 * Math.PI * 0.2 * t), label: 'до конденсатора: 2,5 В ± 1 В', color: C.bad, width: 2.5 },
      { fn: t => Math.sin(2 * Math.PI * 0.2 * t), label: 'после: ± 1 В вокруг нуля', color: C.accent, width: 2.5 },
    ],
    legendAt: { x: 190, y: 250, cols: 1 },
    hlines: [{ v: 0, label: '', color: C.muted }],
  });
  g.save(out('ac-coupling', 'waveforms'));

  // 2. Фильтр высоких частот: усиление в линейной шкале, fc = 15,9 Гц
  const fc = 1 / (2 * Math.PI * 1e4 * 1e-6);
  const h = chart({
    title: 'Разделительная цепь как фильтр высоких частот',
    xLabel: 'Частота сигнала, Гц (лог.)', yLabel: 'Доля сигнала на выходе',
    xRange: [1, 1000], yRange: [0, 1.1], log: true, xTicks: [1, 10, 100, 1000], yTicks: [0, 0.5, 0.707, 1],
    series: [{ fn: f => 1 / Math.sqrt(1 + (fc / f) ** 2), color: C.accent, width: 3 }],
    legend: false,
    vlines: [{ v: fc, label: 'fc ≈ 16 Гц', color: C.bad }],
    markers: [{ x: fc, y: 0.707, label: '0,707', dx: 8, dy: 24, color: C.bad }],
  });
  h.save(out('ac-coupling', 'highpass'));

  // 3. Схема связи по переменному току со смещением
  const f = new Fig(480, 280, 'Связь по переменному току и делитель смещения на входе');
  f.text(14, 92, 'сигнал', { size: 13, weight: 700, fill: C.warn });
  f.circle(70, 110, 5, { fill: 'none' });
  sch.wire(f, [[75, 110], [100, 110]]);
  sch.capacitor(f, 140, 110, { name: 'C', len: 80, off: 26 });
  sch.wire(f, [[180, 110], [280, 110]]);
  sch.wire(f, [[250, 96], [250, 124]]);
  sch.node(f, 250, 110);
  f.rect(280, 80, 110, 60, { r: 8, width: 2.5 });
  f.text(335, 116, 'вход АЦП', { anchor: 'middle', size: 14, weight: 700 });
  f.text(262, 14, '+3,3 В', { size: 13, weight: 700, fill: C.warn });
  sch.resistor(f, 250, 56, { rot: 90, name: 'R1 10к', off: 28, len: 80 });
  sch.resistor(f, 250, 164, { rot: 90, name: 'R2 10к', off: 28, len: 80 });
  sch.wire(f, [[250, 204], [250, 214]]);
  sch.gnd(f, 250, 214);
  f.text(24, 188, 'Делитель R1/R2 задаёт 1,65 В смещения', { size: 12, fill: C.muted });
  f.text(24, 206, '(середина диапазона АЦП), а C пропускает', { size: 12, fill: C.muted });
  f.text(24, 224, 'только переменную часть сигнала', { size: 12, fill: C.muted });
  f.save(out('ac-coupling', 'bias'));
}
