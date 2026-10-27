import { Fig, tableFig, wave } from '../lib/diag.js';
import { out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('logic-analyzer');

  tableFig({
    title: 'Что чем смотреть',
    cols: ['Сигнал', 'Инструмент', 'Что видно'],
    rows: [
      ['Цифровые шины (UART, I²C, SPI)', 'логический анализатор', 'биты, декодированные байты, адреса'],
      ['Форма импульсов, пульсации, звон', 'осциллограф', 'напряжение во времени, амплитуда'],
      ['Постоянное напряжение, ток', 'мультиметр', 'среднее значение'],
      ['Питание МК при сбросах', 'осциллограф', 'просадки и выбросы'],
    ],
    widths: [2.1, 1.5, 2], w: 820,
  }).save(out('logic-analyzer', 'tools'));

  // «Скриншот-подобная» расшифровка UART 9600: байты 'H','i'
  const f = new Fig(800, 300, 'Расшифровка UART 9600 бод: байты 0x48 (H) и 0x69 (i)');
  const frames = [0x48, 0x69];
  const bitT = 1; // один бит = 1 единица времени
  const steps = [[0, 1]]; let prev = 1, t = 1;
  const labelsAt = [];
  frames.forEach(b => {
    const bits = [0]; for (let k = 0; k < 8; k++) bits.push((b >> k) & 1); bits.push(1);
    labelsAt.push([t, b]);
    bits.forEach(v => { if (v !== prev) { steps.push([t, v]); prev = v; } t += bitT; });
    t += 1; // пауза между байтами (линия в 1)
  });
  const total = t + 1;
  wave(f, 70, 50, 700, 'TX', steps, total, C.accent, 40);
  labelsAt.forEach(([t0, b]) => {
    const x = 70 + (t0 + 5) / total * 700;
    f.rect(70 + t0 / total * 700, 110, 10 / total * 700, 30, { r: 4, stroke: C.ok, fill: C.ok, opacity: 0.25 });
    f.text(x, 130, `0x${b.toString(16).toUpperCase()}  '${String.fromCharCode(b)}'`, { anchor: 'middle', size: 14, weight: 700, fill: C.ok });
  });
  f.text(70, 190, 'ширина бита 104 мкс при 9600 бод; весь кадр 10 бит ≈ 1,04 мс', { size: 13, fill: C.muted });
  f.text(70, 215, 'декодер анализатора показывает байты и ошибки кадра (framing error) прямо над сигналом', { size: 13, fill: C.muted });
  f.save(out('logic-analyzer', 'decode'));
}
