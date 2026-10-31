import { C, chart, out, fresh } from '../lib/fig.js';
import { diagram } from '../lib/diag.js';

export function generate() {
  fresh('lab-bench');

  // 1. Стенд: кто с кем соединён
  const d = diagram({
    title: 'Лабораторный стенд: блок питания, плата и приборы',
    w: 720, h: 330,
    boxes: [
      { id: 'psu', x: 30, y: 120, w: 150, h: 90, text: 'Блок питания\nTPS3010\n0–30 В, 0–10 А', tone: 'warn' },
      { id: 'dut', x: 270, y: 120, w: 170, h: 90, text: 'Макетная плата\nс исследуемой\nсхемой', tone: 'plain' },
      { id: 'dmm', x: 540, y: 20, w: 150, h: 70, text: 'Мультиметр\nDM858E\nU, I, R', tone: 'accent' },
      { id: 'scope', x: 540, y: 125, w: 150, h: 70, text: 'Осциллограф\nDHO804\nu(t) на экране', tone: 'ok' },
      { id: 'awg', x: 270, y: 245, w: 170, h: 70, text: 'Генератор\nDGE2070\nсигнал на вход', tone: 'bad' },
      { id: 'lcr', x: 540, y: 235, w: 150, h: 70, text: 'Тестер LCR-P1\nR, C, L\nдеталь отдельно', tone: 'muted' },
    ],
    arrows: [
      ['psu', 'dut', 'питание'],
      ['dut', 'dmm', 'U и I', { dy: -4 }],
      ['dut', 'scope', 'форма сигнала'],
      ['awg', 'dut', 'вход'],
    ],
    notes: [
      { x: 30, y: 250, text: 'Общий «минус» (земля) у всех приборов\nсоединяется в одной точке платы.', size: 13 },
    ],
  });
  d.save(out('lab-bench', 'stand'));

  // 2. Выходная характеристика блока питания: режимы CV и CC
  const f = chart({
    title: 'Выход блока питания: режимы CV и CC',
    xLabel: 'Ток нагрузки, А', yLabel: 'Напряжение на выходе, В',
    xRange: [0, 0.5], yRange: [0, 6],
    series: [
      { points: [[0, 5], [0.3, 5]], color: C.ok, label: 'CV: держит 5 В' },
      { points: [[0.3, 5], [0.3, 0]], color: C.bad, label: 'CC: держит 0,3 А' },
    ],
    markers: [
      { x: 0.3, y: 5, label: 'предел 0,3 А', dx: 10, dy: -8, color: C.bad },
      { x: 0.0227, y: 5, label: '220 Ом: 22,7 мА', dx: 6, dy: 24, color: C.ok },
      { x: 0.3, y: 3, label: '10 Ом: 0,3 А, 3 В', dx: 10, dy: 5, color: C.bad },
    ],
    legendAt: { x: 100, y: 230 },
    width: 520, height: 340,
  });
  f.save(out('lab-bench', 'cv-cc'));

  // 3. Порядок первого включения
  const s = diagram({
    title: 'Порядок включения стенда',
    w: 720, h: 190,
    boxes: [
      { id: 'a', x: 15, y: 50, w: 120, h: 70, text: '1. Выход\nвыключен', tone: 'plain' },
      { id: 'b', x: 160, y: 50, w: 120, h: 70, text: '2. Задать\nнапряжение', tone: 'accent' },
      { id: 'c', x: 305, y: 50, w: 120, h: 70, text: '3. Задать\nпредел тока', tone: 'warn' },
      { id: 'd', x: 450, y: 50, w: 120, h: 70, text: '4. Собрать,\nпроверить', tone: 'plain' },
      { id: 'e', x: 595, y: 50, w: 110, h: 70, text: '5. Включить\nвыход', tone: 'ok' },
    ],
    arrows: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']],
    notes: [
      { x: 360, y: 160, text: 'Менять схему нужно только при выключенном выходе.', size: 14, anchor: 'middle' },
    ],
  });
  s.save(out('lab-bench', 'order'));
}
