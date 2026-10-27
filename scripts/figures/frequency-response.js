import { Fig, C, chart, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('frequency-response');

  // 1. Четыре типа фильтров (усиление по вертикали, частота в логарифмическом масштабе)
  const f = new Fig(480, 330, 'Четыре типа АЧХ фильтров');
  const Q = 3;
  const s = x => Q * (x - 1 / x);
  const shapes = [
    ['Низких частот (ФНЧ)', x => 1 / Math.sqrt(1 + x * x), 'пропускает низкие'],
    ['Высоких частот (ФВЧ)', x => 1 / Math.sqrt(1 + 1 / (x * x)), 'пропускает высокие'],
    ['Полосовой', x => 1 / Math.sqrt(1 + s(x) ** 2), 'пропускает полосу'],
    ['Заграждающий (режектор)', x => Math.abs(s(x)) / Math.sqrt(1 + s(x) ** 2), 'вырезает полосу'],
  ];
  shapes.forEach(([name, fn, note], i) => {
    const x0 = 14 + (i % 2) * 236, y0 = 44 + Math.floor(i / 2) * 146, w = 200, h = 84;
    f.text(x0, y0 - 10, name, { size: 13, weight: 700 });
    f.line(x0, y0, x0, y0 + h, { width: 1.5 });
    f.line(x0, y0 + h, x0 + w, y0 + h, { width: 1.5 });
    const pts = [];
    for (let k = 0; k <= 200; k++) {
      const u = -1.6 + k * 3.2 / 200, x = 10 ** u;
      pts.push([x0 + k * w / 200, y0 + h - fn(x) * h]);
    }
    f.poly(pts, { stroke: C.accent, width: 3 });
    f.line(x0, y0 + h - 0.707 * h, x0 + w, y0 + h - 0.707 * h, { stroke: C.muted, width: 1, dash: '4 4' });
    f.text(x0 + w / 2, y0 + h + 16, note, { anchor: 'middle', size: 12, fill: C.muted });
  });
  f.text(240, 322, 'Пунктир на уровне 0,707 (−3 дБ): граница полосы пропускания', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('frequency-response', 'types'));

  // 2. Таблица «во сколько раз» ↔ децибелы
  const rows = [[100, '+40'], [10, '+20'], [2, '+6'], [1, '0'], [0.707, '−3'], [0.5, '−6'], [0.1, '−20'], [0.01, '−40']];
  const g = new Fig(480, 330, 'Соответствие отношения напряжений и децибел');
  g.text(240, 24, 'Усиление по напряжению: раз ↔ дБ', { anchor: 'middle', size: 16, weight: 700 });
  rows.forEach(([k, db], i) => {
    const y = 44 + i * 33, val = Number(db.replace('−', '-'));
    const col = val > 0 ? C.ok : val < 0 ? C.bad : C.ink;
    g.text(120, y + 20, '×' + String(k).replace('.', ','), { anchor: 'end', size: 17, weight: 700 });
    g.text(160, y + 20, '=', { size: 17 });
    g.text(190, y + 20, db + ' дБ', { size: 17, weight: 700, fill: col });
    const w = Math.abs(val) * 3.2;
    g.rect(260, y + 3, Math.max(w, 2), 20, { fill: col, stroke: 'none', r: 3, opacity: 0.6 });
  });
  g.save(out('frequency-response', 'db-table'));

  // 3. АЧХ ФНЧ в децибелах, fc = 1 кГц
  const h = chart({
    title: 'АЧХ фильтра низких частот, fc = 1 кГц',
    xLabel: 'Частота, Гц (лог.)', yLabel: 'Усиление, дБ',
    xRange: [10, 100000], yRange: [-50, 5], log: true, xTicks: [10, 100, 1000, 10000, 100000], yTicks: [0, -3, -20, -40], xFormat: v => (v >= 1000 ? v / 1000 + ' к' : String(v)),
    series: [{ fn: fr => -10 * Math.log10(1 + (fr / 1000) ** 2), color: C.accent, width: 3 }],
    legend: false,
    markers: [
      { x: 1000, y: -3.01, label: 'fc: −3 дБ', dx: 10, dy: -10, color: C.bad },
      { x: 10000, y: -20.04, label: '10·fc: −20 дБ', dx: -10, dy: 22, anchor: 'end' },
      { x: 100000, y: -40, label: '100·fc: −40 дБ', dx: -10, dy: -12, anchor: 'end' },
    ],
  });
  h.save(out('frequency-response', 'lowpass-db'));
}
