// Библиотека рисунков для авторских уроков: схемы, графики, диаграммы.
// Все цвета через CSS-переменные сайта, поэтому рисунки работают в светлой и тёмной теме.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const C = {
  ink: 'currentColor',
  accent: 'var(--accent, #2457d6)',
  ok: 'var(--ok, #1a7f4b)',
  bad: 'var(--bad, #b3261e)',
  warn: 'var(--warn, #9a6700)',
  muted: 'var(--muted, #5b6573)',
  grid: 'var(--border, #e3e6ea)',
  surface: 'var(--surface, #f6f7f9)',
};

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n = v => Math.round(v * 100) / 100;

/** Холст: накапливает SVG-фрагменты. */
export class Fig {
  constructor(width, height, title) {
    this.w = width; this.h = height; this.title = title; this.parts = []; this.boxes = [];
  }
  add(s) { this.parts.push(s); return this; }
  text(x, y, s, { anchor = 'start', size = 16, fill = C.ink, weight = 400, italic = false, dy = 0 } = {}) {
    const lines = String(s).split('\n');
    const wide = Math.max(...lines.map(t => t.length)) * size * (weight >= 600 ? 0.6 : 0.55);
    const x0 = anchor === 'middle' ? x - wide / 2 : anchor === 'end' ? x - wide : x;
    this.boxes.push({ x0, x1: x0 + wide, y0: y + dy - size * 0.8, y1: y + dy + size * 0.25 + (lines.length - 1) * size * 1.2, t: lines[0] });
    const tspans = lines.map((t, i) => `<tspan x="${n(x)}" dy="${i === 0 ? 0 : size * 1.2}">${esc(t)}</tspan>`).join('');
    return this.add(`<text x="${n(x)}" y="${n(y + dy)}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}"${italic ? ' font-style="italic"' : ''} fill="${fill}">${tspans}</text>`);
  }
  line(x1, y1, x2, y2, { stroke = C.ink, width = 2, dash = '', opacity = 1, cap = 'round' } = {}) {
    return this.add(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
  }
  poly(points, { stroke = C.ink, width = 2, dash = '', fill = 'none', close = false, opacity = 1 } = {}) {
    const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join('') + (close ? 'Z' : '');
    return this.add(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
  }
  path(d, { stroke = C.ink, width = 2, fill = 'none', dash = '' } = {}) {
    return this.add(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
  }
  rect(x, y, w, h, { stroke = C.ink, width = 2, fill = 'none', r = 6, dash = '', opacity = 1 } = {}) {
    return this.add(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
  }
  circle(x, y, r, { stroke = C.ink, width = 2, fill = 'none', opacity = 1 } = {}) {
    return this.add(`<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`);
  }
  dot(x, y, r = 4, fill = C.ink) { return this.circle(x, y, r, { stroke: 'none', fill }); }
  /** Стрелка с наконечником в конце. */
  arrow(x1, y1, x2, y2, { stroke = C.ink, width = 2, head = 9, dash = '' } = {}) {
    const a = Math.atan2(y2 - y1, x2 - x1), hx = head, hy = head * 0.55;
    const bx = x2 - Math.cos(a) * hx, by = y2 - Math.sin(a) * hx;
    const p1 = [bx + Math.sin(a) * hy, by - Math.cos(a) * hy], p2 = [bx - Math.sin(a) * hy, by + Math.cos(a) * hy];
    this.line(x1, y1, bx, by, { stroke, width, dash });
    return this.add(`<path d="M${n(x2)} ${n(y2)}L${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}Z" fill="${stroke}" stroke="none"/>`);
  }
  group(transform, inner) { return this.add(`<g transform="${transform}">${inner}</g>`); }
  /** Грубая проверка: подписи не выходят за рисунок и не налезают друг на друга. */
  check() {
    const bad = [];
    for (const b of this.boxes) {
      if (b.x0 < -2 || b.x1 > this.w + 2 || b.y0 < -2 || b.y1 > this.h + 2) bad.push(`за границей: «${b.t}»`);
    }
    for (let i = 0; i < this.boxes.length; i++) {
      for (let j = i + 1; j < this.boxes.length; j++) {
        const a = this.boxes[i], b = this.boxes[j];
        const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (w > 4 && h > 4) bad.push(`наложение: «${a.t}» и «${b.t}»`);
      }
    }
    if (bad.length) console.warn(`[рисунок «${this.title}»]\n  ` + bad.join('\n  '));
  }
  toString() {
    this.check();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img">
<title>${esc(this.title)}</title>
<g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="currentColor">
${this.parts.join('\n')}
</g></svg>
`;
  }
  save(file) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, this.toString());
  }
}

/** Записать рисунок public/figures/<lesson>/<name>.svg */
export const out = (lesson, name) => `public/figures/${lesson}/${name}.svg`;
/** Очистить каталог рисунков урока (убрать рисунки старого шаблонного генератора). */
export const fresh = lesson => rmSync(`public/figures/${lesson}`, { recursive: true, force: true });

/** Точка на периметре прямоугольника (по часовой, от левого верхнего угла), s — длина пути. */
export function perimeter(x, y, w, h) {
  const total = 2 * (w + h);
  return s => {
    s = ((s % total) + total) % total;
    if (s < w) return [x + s, y];
    if (s < w + h) return [x + w, y + s - w];
    if (s < 2 * w + h) return [x + w - (s - w - h), y + h];
    return [x, y + h - (s - 2 * w - h)];
  };
}

/** Красивые деления оси. */
export function ticks(min, max, count = 5) {
  const span = max - min, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag, step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
  const res = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) res.push(Math.round(v / step) * step);
  return res;
}
const fmt = v => String(Number(v.toPrecision(6))).replace('.', ',');

/**
 * График. series: [{fn|points, label, color, dash, width, area}],
 * markers: [{x,y,label,dx,dy,anchor,color}], vlines/hlines: [{v,label,color,dash}].
 */
export function chart({
  title, xLabel, yLabel, xRange, yRange, series, markers = [], vlines = [], hlines = [],
  width = 480, height = 340, xTicks, yTicks, log = false, legend = true, legendAt = null, samples = 240, xFormat = fmt, yFormat = fmt, notes = [],
}) {
  const f = new Fig(width, height, title);
  const left = 66, right = 18, top = title ? 62 : 30, bottom = 58;
  const pw = width - left - right, ph = height - top - bottom;
  const lx = v => Math.log10(v);
  const X = x => left + (log ? (lx(x) - lx(xRange[0])) / (lx(xRange[1]) - lx(xRange[0])) : (x - xRange[0]) / (xRange[1] - xRange[0])) * pw;
  const Y = y => top + ph - (y - yRange[0]) / (yRange[1] - yRange[0]) * ph;
  if (title) f.text(width / 2, 26, title, { anchor: 'middle', size: 17, weight: 600 });
  const xt = xTicks || (log ? decades(xRange) : ticks(xRange[0], xRange[1], 5));
  const yt = yTicks || ticks(yRange[0], yRange[1], 5);
  for (const v of xt) {
    f.line(X(v), top, X(v), top + ph, { stroke: C.grid, width: 1 });
    f.text(X(v), top + ph + 20, xFormat(v), { anchor: 'middle', size: 14, fill: C.muted });
  }
  for (const v of yt) {
    f.line(left, Y(v), left + pw, Y(v), { stroke: C.grid, width: 1 });
    f.text(left - 8, Y(v) + 5, yFormat(v), { anchor: 'end', size: 14, fill: C.muted });
  }
  f.line(left, top, left, top + ph, { width: 1.5 });
  f.line(left, top + ph, left + pw, top + ph, { width: 1.5 });
  f.text(left + pw / 2, height - 12, xLabel, { anchor: 'middle', size: 15 });
  f.text(left, top - 12, yLabel, { size: 15 });
  for (const h of hlines) {
    f.line(left, Y(h.v), left + pw, Y(h.v), { stroke: h.color || C.muted, width: 1.5, dash: h.dash ?? '6 5' });
    if (h.label) f.text(left + pw - 4, Y(h.v) - 6, h.label, { anchor: 'end', size: 14, fill: h.color || C.muted });
  }
  for (const v of vlines) {
    f.line(X(v.v), top, X(v.v), top + ph, { stroke: v.color || C.muted, width: 1.5, dash: v.dash ?? '6 5' });
    if (v.label) f.text(X(v.v) + 5, top + 16, v.label, { size: 14, fill: v.color || C.muted });
  }
  const palette = [C.accent, C.bad, C.ok, C.warn, C.muted];
  series.forEach((s, i) => {
    const color = s.color || palette[i % palette.length];
    let pts = s.points;
    if (!pts) {
      pts = [];
      for (let j = 0; j <= samples; j++) {
        const x = log ? 10 ** (lx(xRange[0]) + (lx(xRange[1]) - lx(xRange[0])) * j / samples) : xRange[0] + (xRange[1] - xRange[0]) * j / samples;
        pts.push([x, s.fn(x)]);
      }
    }
    const clamp = y => Math.max(yRange[0] - (yRange[1] - yRange[0]) * 0.02, Math.min(yRange[1] + (yRange[1] - yRange[0]) * 0.02, y));
    const screen = pts.filter(p => Number.isFinite(p[1])).map(([x, y]) => [X(x), Y(clamp(y))]);
    if (s.area) f.poly([[screen[0][0], Y(Math.max(0, yRange[0]))], ...screen, [screen[screen.length - 1][0], Y(Math.max(0, yRange[0]))]], { fill: color, stroke: 'none', close: true, opacity: 0.12 });
    if (s.steps) {
      const st = [];
      pts.forEach(([x, y], k) => { if (k) st.push([X(x), Y(pts[k - 1][1])]); st.push([X(x), Y(y)]); });
      f.poly(st, { stroke: color, width: s.width || 2.5, dash: s.dash || '' });
    } else f.poly(screen, { stroke: color, width: s.width || 2.5, dash: s.dash || '' });
  });
  if (legend) {
    const named = series.filter(s => s.label);
    named.forEach((s, i) => {
      const color = s.color || palette[series.indexOf(s) % palette.length];
      const cols = legendAt?.cols || 1;
      const y = legendAt ? legendAt.y + Math.floor(i / cols) * 20 : top + 14 + i * 20;
      const x = legendAt ? legendAt.x + (i % cols) * (legendAt.dx || 140) : (s.legendX ?? left + 12);
      f.line(x, y - 5, x + 22, y - 5, { stroke: color, width: 3, dash: s.dash || '' });
      f.text(x + 28, y, s.label, { size: 14 });
    });
  }
  for (const m of markers) {
    f.dot(X(m.x), Y(m.y), 5, m.color || C.ink);
    if (m.label) f.text(X(m.x) + (m.dx ?? 8), Y(m.y) + (m.dy ?? -10), m.label, { anchor: m.anchor || 'start', size: 14, weight: 600, fill: m.color || C.ink });
  }
  for (const t of notes) f.text(X(t.x), Y(t.y), t.text, { size: 14, fill: t.color || C.muted, anchor: t.anchor || 'start' });
  f.X = X; f.Y = Y;
  return f;
}
function decades(range) {
  const out = [];
  for (let e = Math.ceil(Math.log10(range[0]) - 1e-9); e <= Math.floor(Math.log10(range[1]) + 1e-9); e++) out.push(10 ** e);
  return out;
}

// ───────────── схемы ─────────────
// Элементы рисуются вокруг точки (x,y); rot = 0 (горизонтально, выводы на x±L/2) или 90 (вертикально).
// Размер всех двухполюсников по умолчанию 80 px между выводами.

const S = { stroke: C.ink, width: 2 };
function two(f, x, y, rot, len, body) {
  f.add(`<g transform="translate(${n(x)} ${n(y)}) rotate(${rot})" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body(len / 2)}</g>`);
}
function label(f, x, y, rot, text, value, opts = {}) {
  const off = opts.off ?? 30;
  if (rot === 0) {
    if (text) f.text(x, y - off, text, { anchor: 'middle', size: 16, weight: 600, fill: opts.color || C.ink });
    if (value) f.text(x, y + off - 2 + 12, value, { anchor: 'middle', size: 14, fill: C.muted });
  } else {
    const left = off < 0, tx = x + (left ? off + 4 : off - 4), anchor = left ? 'end' : 'start';
    if (text) f.text(tx, y - 2, text, { anchor, size: 16, weight: 600, fill: opts.color || C.ink });
    if (value) f.text(tx, y + 16, value, { anchor, size: 14, fill: C.muted });
  }
}
export const sch = {
  wire(f, pts, o = {}) { f.poly(pts, { stroke: o.color || C.ink, width: o.width || 2, dash: o.dash || '' }); },
  node(f, x, y) { f.dot(x, y, 4.5); },
  resistor(f, x, y, { rot = 0, len = 80, name, value, off, color } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-24M24 0H${h}"/><rect x="-24" y="-9" width="48" height="18" rx="2"/>`);
    label(f, x, y, rot, name, value, { off, color });
  },
  battery(f, x, y, { rot = 0, len = 80, name, value, off } = {}) {
    // длинная пластина «+» слева (при rot=0), короткая «−» справа
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-6M-6 -18V18M6 -9V9M6 0H${h}"/><path d="M-20 -22h8M-16 -26v8" stroke-width="1.5"/>`);
    label(f, x, y, rot, name, value, { off: off ?? 34 });
  },
  cell(f, x, y, opt) { sch.battery(f, x, y, opt); },
  capacitor(f, x, y, { rot = 0, len = 80, name, value, off, polar = false } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-5M-5 -18V18M5 -18V18M5 0H${h}"/>${polar ? '<path d="M-20 -22h8M-16 -26v8" stroke-width="1.5"/>' : ''}`);
    label(f, x, y, rot, name, value, { off });
  },
  inductor(f, x, y, { rot = 0, len = 80, name, value, off } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-24c0 -16 12 -16 12 0c0 -16 12 -16 12 0c0 -16 12 -16 12 0c0 -16 12 -16 12 0H${h}"/>`);
    label(f, x, y, rot, name, value, { off });
  },
  diode(f, x, y, { rot = 0, len = 80, name, value, off, led = false, zener = false } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-10M10 0H${h}M10 -14V14"/><path d="M-10 -14L10 0L-10 14Z"/>${zener ? '<path d="M10 -14h-5M10 14h5"/>' : ''}${led ? '<path d="M-4 -20L6 -32M4 -18L14 -30" /><path d="M2.5 -32h3.5v3.5" stroke-width="1.5"/>' : ''}`);
    label(f, x, y, rot, name, value, { off: off ?? (led ? 36 : 30) });
  },
  fuse(f, x, y, { rot = 0, len = 80, name, value, off, ptc = false } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-22M22 0H${h}"/><rect x="-22" y="-8" width="44" height="16" rx="2"/>${ptc ? '<path d="M-16 14L16 -14"/>' : '<path d="M-22 0H22"/>'}`);
    label(f, x, y, rot, name, value, { off });
  },
  lamp(f, x, y, { rot = 0, len = 80, name, value, off } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-16M16 0H${h}"/><circle r="16"/><path d="M-11 -11L11 11M-11 11L11 -11"/>`);
    label(f, x, y, rot, name, value, { off: off ?? 34 });
  },
  switch(f, x, y, { rot = 0, len = 80, name, value, closed = false, off } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-22M22 0H${h}"/>${closed ? '<path d="M-22 0L22 0"/>' : '<path d="M-22 0L18 -20"/>'}<circle cx="-22" r="3" fill="${C.ink}"/><circle cx="22" r="3" fill="${C.ink}"/>`);
    label(f, x, y, rot, name, value, { off });
  },
  meter(f, x, y, { rot = 0, len = 80, sym = 'V', name, off, color } = {}) {
    two(f, x, y, rot, len, h => `<path d="M${-h} 0H-18M18 0H${h}"/><circle r="18" ${color ? `stroke="${color}"` : ''}/>`);
    f.text(x, y + 6, sym, { anchor: 'middle', size: 18, weight: 700, fill: color || C.ink });
    if (name) f.text(x, y - 28, name, { anchor: 'middle', size: 14, fill: C.muted });
  },
  gnd(f, x, y) {
    f.add(`<g transform="translate(${n(x)} ${n(y)})" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"><path d="M0 0V10M-16 10H16M-10 17H10M-4 24H4"/></g>`);
  },
  /** Стрелка тока вдоль провода. */
  current(f, x, y, dir = 'right', text = 'I', { color = C.accent, off = -16, len = 34 } = {}) {
    const d = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] }[dir];
    const x1 = x - d[0] * len / 2, y1 = y - d[1] * len / 2, x2 = x + d[0] * len / 2, y2 = y + d[1] * len / 2;
    f.arrow(x1, y1, x2, y2, { stroke: color, width: 2.5, head: 10 });
    if (text) {
      if (d[1] === 0) f.text(x, y + off, text, { anchor: 'middle', size: 16, weight: 700, fill: color });
      else f.text(x + (off > 0 ? off : 12), y + 5, text, { anchor: 'start', size: 16, weight: 700, fill: color });
    }
  },
  /** Дуга-«напряжение» между двумя точками (плюс сверху/слева). */
  voltage(f, x1, y1, x2, y2, text, { color = C.warn, bend = 22, side = 1 } = {}) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * bend * side, ny = dx / len * bend * side;
    const cx = mx + nx, cy = my + ny;
    f.add(`<path d="M${n(x1)} ${n(y1)}Q${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`);
    const a = Math.atan2(y2 - cy, x2 - cx), hx = 9;
    const p1 = [x2 - Math.cos(a) * hx + Math.sin(a) * 5, y2 - Math.sin(a) * hx - Math.cos(a) * 5];
    const p2 = [x2 - Math.cos(a) * hx - Math.sin(a) * 5, y2 - Math.sin(a) * hx + Math.cos(a) * 5];
    f.add(`<path d="M${n(x2)} ${n(y2)}L${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}Z" fill="${color}" stroke="none"/>`);
    if (text) f.text(cx + nx * 0.45, cy + ny * 0.45 + 5, text, { anchor: 'middle', size: 16, weight: 700, fill: color });
  },
  /**
   * Операционный усилитель (треугольник вправо). (x, y) — середина левой стороны.
   * Выводы: инвертирующий вход слева-вверху, неинвертирующий слева-внизу, выход справа, питание сверху и снизу.
   * swap = true меняет входы местами (+ сверху, − снизу).
   */
  opamp(f, x, y, { swap = false, supply = true } = {}) {
    f.poly([[x, y - 45], [x, y + 45], [x + 80, y]], { close: true, width: 2.4 });
    const top = [x - 40, y - 22], bot = [x - 40, y + 22];
    f.line(top[0], top[1], x, top[1]);
    f.line(bot[0], bot[1], x, bot[1]);
    f.line(x + 80, y, x + 120, y);
    f.text(x + 8, y - 17, swap ? '+' : '−', { size: 18, weight: 700 });
    f.text(x + 8, y + 27, swap ? '−' : '+', { size: 18, weight: 700 });
    if (supply) {
      f.line(x + 36, y - 25, x + 36, y - 60);
      f.line(x + 36, y + 25, x + 36, y + 60);
    }
    return { inv: swap ? bot : top, non: swap ? top : bot, out: [x + 120, y], vp: [x + 36, y - 60], vn: [x + 36, y + 60] };
  },
  /**
   * Биполярный транзистор. (x, y) — середина базовой чёрточки.
   * Выводы: база слева (x-40, y), коллектор и эмиттер справа на x+30, y∓50. Возвращает координаты выводов.
   */
  bjt(f, x, y, { pnp = false, circle = true } = {}) {
    const col = [x + 30, y - 50], em = [x + 30, y + 50], base = [x - 40, y];
    if (circle) f.circle(x + 8, y, 40, { width: 1.6, opacity: 0.55 });
    f.line(base[0], y, x, y);
    f.line(x, y - 20, x, y + 20, { width: 3.4 });
    f.poly([[x, y - 9], [x + 30, y - 30], col]);
    f.poly([[x, y + 9], [x + 30, y + 30], em]);
    // стрелка эмиттера: NPN — от базы наружу, PNP — к базе
    if (pnp) f.arrow(x + 22, y + 24.4, x + 4, y + 11.8, { width: 2, head: 9 });
    else f.arrow(x + 10, y + 16, x + 28, y + 28.6, { width: 2, head: 9 });
    return { b: base, c: col, e: em };
  },
  /**
   * МОП-транзистор с индуцированным каналом. (x, y) — середина линии затвора.
   * Выводы: затвор слева (x-34, y), сток сверху и исток снизу на x+30, y∓50.
   */
  mosfet(f, x, y, { p = false, bodyDiode = false, flip = false } = {}) {
    // flip: рисунок отражён по вертикали (исток сверху — для P-канала у плюса питания)
    const g = [x - 34, y], d = [x + 30, flip ? y + 50 : y - 50], s = [x + 30, flip ? y - 50 : y + 50];
    if (flip) f.add(`<g transform="translate(0 ${2 * y}) scale(1 -1)">`);
    f.line(g[0], y, x, y);
    f.line(x, y - 20, x, y + 20, { width: 3.2 });
    for (const [a, b] of [[-21, -11], [-6, 6], [11, 21]]) f.line(x + 9, y + a, x + 9, y + b, { width: 3.2 });
    f.poly([[x + 9, y - 16], [x + 30, y - 16], d]);
    f.poly([[x + 9, y + 16], [x + 30, y + 16], s]);
    f.line(x + 9, y, x + 30, y);
    f.line(x + 30, y, x + 30, y + 16);
    f.dot(x + 30, y, 3.5);
    // стрелка подложки: N-канал — к каналу, P-канал — от канала
    if (p) f.arrow(x + 15, y, x + 29, y, { width: 1.8, head: 8 }); else f.arrow(x + 29, y, x + 15, y, { width: 1.8, head: 8 });
    if (bodyDiode) {
      // встроенный диод: N-канал — анод у истока, P-канал — анод у стока
      const bx = x + 62, up = !p, t = y - 9, u = y + 9;
      f.poly([[x + 30, y - 40], [bx, y - 40], [bx, t]]);
      f.poly([[bx, u], [bx, y + 40], [x + 30, y + 40]]);
      const tri = up ? `M${bx - 12} ${u}L${bx + 12} ${u}L${bx} ${t}Z M${bx - 12} ${t}H${bx + 12}` : `M${bx - 12} ${t}L${bx + 12} ${t}L${bx} ${u}Z M${bx - 12} ${u}H${bx + 12}`;
      f.path(tri, { width: 2 });
      f.dot(x + 30, y - 40, 3.5); f.dot(x + 30, y + 40, 3.5);
    }
    if (flip) f.add('</g>');
    return { g, d, s };
  },
  /** Прямоугольный блок с подписью (для блок-схем). */
  block(f, x, y, w, h, text, { fill = 'none', stroke = C.ink, size = 15, dash = '', color } = {}) {
    f.rect(x, y, w, h, { fill, stroke, r: 8, dash });
    f.text(x + w / 2, y + h / 2 + 5 - (String(text).split('\n').length - 1) * 8, text, { anchor: 'middle', size, fill: color || C.ink });
  },
};

export const rgb = { // служебное: цвета для рисунков про электроны / воду
  water: 'var(--accent, #2457d6)',
};
