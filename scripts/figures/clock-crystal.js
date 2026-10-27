import { diagram, barsFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('clock-crystal');

  diagram({
    title: 'Кварцевый резонатор с нагрузочными конденсаторами',
    w: 740, h: 340,
    boxes: [
      { id: 'mcu', x: 30, y: 90, w: 170, h: 120, text: 'МК\nXTAL1 ... XTAL2\nгенератор внутри', tone: 'accent' },
      { id: 'q', x: 300, y: 120, w: 140, h: 60, text: 'кварц Y1\n16 МГц, CL = 12 пФ', tone: 'warn', size: 13 },
      { id: 'c1', x: 270, y: 240, w: 100, h: 44, text: 'C1 = 18 пФ', tone: 'ok', size: 13 },
      { id: 'c2', x: 380, y: 240, w: 100, h: 44, text: 'C2 = 18 пФ', tone: 'ok', size: 13 },
      { id: 'gnd', x: 290, y: 305, w: 170, h: 26, text: 'земля', tone: 'muted', size: 12 },
    ],
    arrows: [['mcu', 'q', '', { both: true }], ['q', 'c1'], ['q', 'c2'], ['c1', 'gnd'], ['c2', 'gnd']],
    notes: [{ x: 500, y: 130, text: 'CL = C1·C2/(C1 + C2) + Cпар\n= 18·18/36 + 3 = 12 пФ', size: 13, tone: 'ok', weight: 700 }, { x: 500, y: 190, text: 'Cпар — паразитная ёмкость\nдорожек и выводов, 2–5 пФ', size: 12 }],
  }).save(out('clock-crystal', 'crystal'));

  barsFig({
    title: 'Уход часов за сутки (по точности источника)',
    items: [
      { label: 'RC внутри МК ±2 %', value: 1728, text: '±1728 с', tone: 'bad' },
      { label: 'кварц ±50 ppm', value: 4.3, text: '±4,3 с', tone: 'warn' },
      { label: 'часовой кварц ±20 ppm', value: 1.7, text: '±1,7 с', tone: 'ok' },
      { label: 'TCXO ±2 ppm', value: 0.17, text: '±0,17 с', tone: 'ok' },
    ],
    w: 760, labelW: 230,
  }).save(out('clock-crystal', 'drift'));
}
