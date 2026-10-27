import { diagram, barsFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('uart');

  diagram({
    title: 'Соединение UART: TX одного устройства к RX другого',
    w: 760, h: 280,
    boxes: [
      { id: 'a', x: 30, y: 60, w: 200, h: 160, text: 'Устройство A\nTX\nRX\nGND', tone: 'accent' },
      { id: 'b', x: 530, y: 60, w: 200, h: 160, text: 'Устройство B\nRX\nTX\nGND', tone: 'ok' },
    ],
    lines: [
      [230, 100, 530, 140, { tone: 'accent', width: 2.6 }],
      [230, 140, 530, 100, { tone: 'ok', width: 2.6 }],
      [230, 190, 530, 190, { tone: 'muted', width: 2.6 }],
    ],
    notes: [
      { x: 330, y: 82, text: 'TX → RX', size: 13, tone: 'accent', weight: 700 },
      { x: 330, y: 172, text: 'RX ← TX', size: 13, tone: 'ok', weight: 700 },
      { x: 330, y: 212, text: 'GND — GND (общая земля)', size: 13, tone: 'muted', weight: 700 },
      { x: 30, y: 255, text: 'линии скрещивают: передатчик одного — к приёмнику другого; уровни 3,3 В и 5 В не смешивать', size: 12 },
    ],
  }).save(out('uart', 'crossover'));

  barsFig({
    title: 'Ошибка скорости UART на ATmega328P при 16 МГц (по модулю)',
    items: [
      { label: '9600 бод', value: 0.16, text: '+0,16 %', tone: 'ok' },
      { label: '57600 бод', value: 0.79, text: '−0,79 %', tone: 'ok' },
      { label: '115200 бод', value: 2.12, text: '+2,12 %', tone: 'warn' },
      { label: '230400 бод', value: 3.55, text: '−3,55 % (много)', tone: 'bad' },
    ],
    max: 4, w: 760, labelW: 160,
  }).save(out('uart', 'baud-error'));
}
