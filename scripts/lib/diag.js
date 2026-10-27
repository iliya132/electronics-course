// Декларативные помощники для рисунков: блок-схемы, таблицы, столбцы и цифровые осциллограммы.
import { Fig, C } from './fig.js';

const TONE = { plain: C.ink, accent: C.accent, ok: C.ok, warn: C.warn, bad: C.bad, muted: C.muted };

/** Точка на границе прямоугольника b в направлении к (tx, ty) из его центра. */
function edge(b, tx, ty) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  const k = Math.min(Math.abs(dx) > 1e-9 ? (b.w / 2) / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-9 ? (b.h / 2) / Math.abs(dy) : Infinity);
  return [cx + dx * k, cy + dy * k];
}

/**
 * boxes: [{id,x,y,w,h,text,tone,size,dash,weight}], arrows: [[from,to,label,{both,dash,tone,dx,dy}]],
 * notes: [{x,y,text,size,anchor,tone,weight}], lines: [[x1,y1,x2,y2,{tone,dash}]]
 */
export function diagram({ title, w = 720, h = 360, boxes = [], arrows = [], notes = [], lines = [] }) {
  const f = new Fig(w, h, title);
  const byId = Object.fromEntries(boxes.map(b => [b.id, b]));
  for (const b of boxes) {
    const col = TONE[b.tone || 'plain'];
    if (b.tone && b.tone !== 'plain') f.rect(b.x, b.y, b.w, b.h, { r: 8, stroke: 'none', fill: col, opacity: 0.16 });
    f.rect(b.x, b.y, b.w, b.h, { r: 8, width: 2.2, stroke: col, dash: b.dash || '' });
    const size = b.size || 14, rows = String(b.text).split('\n');
    f.text(b.x + b.w / 2, b.y + b.h / 2 + 5 - (rows.length - 1) * size * 0.6, b.text, { anchor: 'middle', size, weight: b.weight || 600, fill: C.ink });
  }
  for (const [x1, y1, x2, y2, o = {}] of lines) f.line(x1, y1, x2, y2, { stroke: TONE[o.tone || 'plain'], dash: o.dash || '', width: o.width || 2 });
  for (const [a, b, label, o = {}] of arrows) {
    const A = byId[a], B = byId[b];
    const [x1, y1] = edge(A, B.x + B.w / 2, B.y + B.h / 2), [x2, y2] = edge(B, A.x + A.w / 2, A.y + A.h / 2);
    const col = TONE[o.tone || 'plain'];
    f.arrow(x1, y1, x2, y2, { stroke: col, width: 2.2, head: 9, dash: o.dash || '' });
    if (o.both) f.arrow(x2, y2, x1, y1, { stroke: col, width: 2.2, head: 9, dash: o.dash || '' });
    if (label) f.text((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 8 + (o.dy || 0), label, { anchor: 'middle', size: 12, fill: C.muted });
  }
  for (const n of notes) f.text(n.x, n.y, n.text, { size: n.size || 13, anchor: n.anchor || 'start', weight: n.weight || 400, fill: TONE[n.tone || 'muted'] });
  return f;
}

/** Таблица-рисунок: cols — заголовки, rows — массивы строк, widths — доли ширины. */
export function tableFig({ title, cols, rows, widths, w = 720, rowH = 34, size = 13, head = 'accent' }) {
  const h = 52 + (rows.length + 1) * rowH + 12;
  const f = new Fig(w, h, title);
  const sum = widths.reduce((a, b) => a + b, 0), xs = [20];
  widths.forEach(v => xs.push(xs[xs.length - 1] + v / sum * (w - 40)));
  f.text(w / 2, 28, title, { anchor: 'middle', size: 15, weight: 700 });
  f.rect(20, 42, w - 40, rowH, { r: 6, stroke: 'none', fill: TONE[head], opacity: 0.2 });
  cols.forEach((c, i) => f.text(xs[i] + 8, 42 + rowH / 2 + 5, c, { size, weight: 700 }));
  rows.forEach((r, j) => {
    const y = 42 + (j + 1) * rowH;
    f.line(20, y, w - 20, y, { stroke: C.grid, width: 1.4 });
    r.forEach((c, i) => f.text(xs[i] + 8, y + rowH / 2 + 5, String(c), { size, weight: i === 0 ? 700 : 400 }));
  });
  return f;
}

/** Горизонтальные столбцы: items [{label,value,text,tone}] */
export function barsFig({ title, items, max, w = 720, labelW = 170, barH = 24, gap = 16, unit = '' }) {
  const h = 56 + items.length * (barH + gap);
  const f = new Fig(w, h, title);
  f.text(w / 2, 26, title, { anchor: 'middle', size: 15, weight: 700 });
  const m = max || Math.max(...items.map(i => i.value)), span = w - labelW - 150;
  items.forEach((it, i) => {
    const y = 48 + i * (barH + gap);
    f.text(labelW - 10, y + barH / 2 + 5, it.label, { anchor: 'end', size: 13, weight: 600 });
    f.rect(labelW, y, Math.max(2, it.value / m * span), barH, { r: 4, stroke: 'none', fill: TONE[it.tone || 'accent'], opacity: 0.55 });
    f.text(labelW + it.value / m * span + 8, y + barH / 2 + 5, it.text ?? `${String(it.value).replace('.', ',')}${unit ? ' ' + unit : ''}`, { size: 13, weight: 700 });
  });
  return f;
}

/** Цифровая осциллограмма: steps [[t, level 0/1]] в моменты изменения. */
export function wave(f, x0, y0, w, label, steps, tMax, color = C.accent, h = 30) {
  const X = t => x0 + t / tMax * w, pts = [];
  steps.forEach(([t, v], i) => {
    if (i) pts.push([X(t), y0 + (steps[i - 1][1] ? 0 : h)]);
    pts.push([X(t), y0 + (v ? 0 : h)]);
  });
  pts.push([X(tMax), y0 + (steps[steps.length - 1][1] ? 0 : h)]);
  f.poly(pts, { stroke: color, width: 2.6 });
  f.text(x0 - 12, y0 + h * 0.7, label, { anchor: 'end', size: 14, weight: 700, fill: color });
}
export const clockSteps = (tMax, period) => {
  const s = [[0, 0]];
  for (let t = period / 2; t < tMax; t += period / 2) s.push([t, s[s.length - 1][1] ? 0 : 1]);
  return s;
};
export { Fig, C };
