import { Fig, tableFig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('serial-debug');

  // Кадр UART для символа 'A' (0x41), 8N1
  const f = new Fig(760, 240, 'Кадр UART 8N1 для символа A (0x41)');
  const bits = [0, 1, 0, 0, 0, 0, 0, 1, 0, 1]; // старт, D0..D7 (LSB первым: 0x41 = 01000001 -> 1,0,0,0,0,0,1,0), стоп
  const frame = [0, 1, 0, 0, 0, 0, 0, 1, 0, 1];
  const steps = [[0, 1]];
  let prev = 1;
  frame.forEach((b, i) => { if (b !== prev) { steps.push([i + 1, b]); prev = b; } });
  wave(f, 70, 60, 640, 'TX', [[0, 1], ...steps.slice(1)], 12, C.accent, 40);
  const labels = ['покой', 'старт', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'стоп', 'покой'];
  const vals = ['1', '0', '1', '0', '0', '0', '0', '0', '1', '0', '1', '1'];
  labels.forEach((l, i) => {
    const x = 70 + (i + 0.5) / 12 * 640;
    f.text(x, 130, l, { anchor: 'middle', size: 11, fill: C.muted });
    f.text(x, 150, vals[i], { anchor: 'middle', size: 13, weight: 700, fill: C.ink });
    f.line(70 + i / 12 * 640, 50, 70 + i / 12 * 640, 110, { stroke: C.grid, width: 1.2 });
  });
  f.text(380, 200, '0x41 = 01000001₂; младший бит D0 передаётся первым; 10 бит на байт', { anchor: 'middle', size: 13, weight: 700 });
  f.save(out('serial-debug', 'frame'));

  tableFig({
    title: 'Скорость обмена и время передачи (10 бит на байт)',
    cols: ['Скорость, бод', 'Байт/с', '1 байт', '100 байт'],
    rows: [
      ['9600', '960', '1,04 мс', '104 мс'],
      ['57600', '5760', '174 мкс', '17,4 мс'],
      ['115200', '11520', '86,8 мкс', '8,7 мс'],
    ],
    widths: [1.3, 1, 1, 1], w: 720,
  }).save(out('serial-debug', 'baud'));
}
