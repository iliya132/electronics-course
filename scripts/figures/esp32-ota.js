import { diagram } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('esp32-ota');

  diagram({
    title: 'Разметка Flash для OTA (4 МБ)',
    w: 780, h: 240,
    boxes: [
      { id: 'boot', x: 20, y: 60, w: 100, h: 70, text: 'загрузчик\n+ таблица\nразделов', tone: 'muted', size: 11 },
      { id: 'nvs', x: 130, y: 60, w: 80, h: 70, text: 'nvs\n(настройки)', tone: 'muted', size: 11 },
      { id: 'otad', x: 220, y: 60, w: 100, h: 70, text: 'otadata\n(какой слот)', tone: 'warn', size: 11 },
      { id: 'a', x: 330, y: 60, w: 190, h: 70, text: 'ota_0\nприложение 1,6 МБ', tone: 'ok', size: 12 },
      { id: 'b', x: 530, y: 60, w: 190, h: 70, text: 'ota_1\nприложение 1,6 МБ', tone: 'accent', size: 12 },
    ],
    arrows: [['otad', 'a'], ['otad', 'b', '', { dash: '5 4' }]],
    notes: [{ x: 20, y: 190, text: 'работает один слот; обновление записывается во второй, затем otadata переключает загрузку', size: 12 }],
  }).save(out('esp32-ota', 'partitions'));

  diagram({
    title: 'Порядок обновления по воздуху',
    w: 780, h: 220,
    boxes: [
      { id: 'a', x: 20, y: 80, w: 130, h: 60, text: 'получить\nобразец .bin', tone: 'accent', size: 12 },
      { id: 'b', x: 190, y: 80, w: 130, h: 60, text: 'записать\nво второй слот', tone: 'accent', size: 12 },
      { id: 'c', x: 360, y: 80, w: 130, h: 60, text: 'проверить\nCRC / подпись', tone: 'warn', size: 12 },
      { id: 'd', x: 530, y: 80, w: 110, h: 60, text: 'переключить\nслот', tone: 'ok', size: 12 },
      { id: 'e', x: 670, y: 80, w: 100, h: 60, text: 'перезагрузка,\nоткат при сбое', tone: 'ok', size: 11 },
    ],
    arrows: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']],
  }).save(out('esp32-ota', 'flow'));
}
