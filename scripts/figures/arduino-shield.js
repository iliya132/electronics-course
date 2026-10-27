import { Fig, tableFig } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('arduino-shield');

  // План шилда 68,6 x 53,3 мм, масштаб 9 px/мм
  const k = 9, W = 68.6 * k, H = 53.3 * k;
  const f = new Fig(Math.round(W) + 120, Math.round(H) + 120, 'Шилд для Arduino Uno: контур 68,6 × 53,3 мм и расположение узлов');
  const x0 = 60, y0 = 50;
  f.rect(x0, y0, W, H, { r: 4, width: 2.6, fill: C.surface });
  const box = (x, y, w, h, t, col) => { f.rect(x0 + x * k, y0 + y * k, w * k, h * k, { r: 3, width: 2, stroke: col, fill: col, opacity: 0.18 }); f.rect(x0 + x * k, y0 + y * k, w * k, h * k, { r: 3, width: 2, stroke: col }); f.text(x0 + (x + w / 2) * k, y0 + (y + h / 2) * k + 5, t, { anchor: 'middle', size: 11, weight: 700 }); };
  box(4, 4, 60, 4, 'ряд гнёзд D0–D13 (шаг 2,54 мм)', C.muted);
  box(4, 45, 60, 4, 'ряд гнёзд питания и A0–A5', C.muted);
  box(8, 14, 14, 8, '3 светодиода', C.ok);
  box(26, 14, 10, 8, 'кнопка', C.warn);
  box(40, 14, 20, 8, 'разъём I²C-датчика', C.accent);
  box(8, 28, 52, 8, 'шины питания 5 В и земля, резисторы', C.muted);
  f.text(x0 + W / 2, y0 + H + 28, '68,6 мм', { anchor: 'middle', size: 12, fill: C.muted });
  f.save(out('arduino-shield', 'floorplan'));

  tableFig({
    title: 'Цепи шилда и их параметры',
    cols: ['Цепь', 'Вывод Uno', 'Параметры'],
    rows: [
      ['LED_R, LED_Y, LED_G', 'D10, D9, D8', 'резисторы 330 Ом, ток ≈ 9 мА, дорожка 0,25 мм'],
      ['BTN', 'D2 (INT0)', 'подтяжка INPUT_PULLUP, дорожка 0,25 мм'],
      ['SDA, SCL', 'A4, A5', 'подтяжки 4,7 кОм к 5 В, дорожка 0,25 мм'],
      ['+5V', 'гнездо 5V', 'дорожка 0,5 мм, развязка 100 нФ'],
      ['GND', 'гнёзда GND', 'сплошная заливка на обоих слоях'],
    ],
    widths: [1.7, 1.2, 3], w: 920,
  }).save(out('arduino-shield', 'nets'));
}
