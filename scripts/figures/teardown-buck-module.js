import { diagram, tableFig } from '../lib/diag.js';
import { out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('teardown-buck-module');

  diagram({
    title: 'Модуль LM2596: блоки и путь энергии',
    w: 900, h: 340,
    boxes: [
      { id: 'in', x: 20, y: 100, w: 110, h: 70, text: 'вход\n4–40 В', tone: 'warn', size: 12 },
      { id: 'ci', x: 160, y: 100, w: 110, h: 70, text: 'входной\nконденсатор\n470 мкФ', tone: 'ok', size: 11 },
      { id: 'ic', x: 300, y: 100, w: 140, h: 70, text: 'LM2596\nключ 150 кГц', tone: 'accent', size: 12 },
      { id: 'l', x: 470, y: 100, w: 100, h: 70, text: 'дроссель\n33 мкГн', tone: 'ok', size: 11 },
      { id: 'co', x: 600, y: 100, w: 110, h: 70, text: 'выходной\nконденсатор\n220 мкФ', tone: 'ok', size: 11 },
      { id: 'out', x: 740, y: 100, w: 110, h: 70, text: 'выход\nрегулируемый', tone: 'warn', size: 12 },
      { id: 'd', x: 340, y: 230, w: 130, h: 60, text: 'диод Шоттки\nSS34', tone: 'bad', size: 11 },
      { id: 'fb', x: 560, y: 230, w: 160, h: 60, text: 'FB: делитель\nR1 + подстроечник', tone: 'accent', size: 11 },
    ],
    arrows: [['in', 'ci'], ['ci', 'ic'], ['ic', 'l'], ['l', 'co'], ['co', 'out'], ['d', 'l', 'ток при выключенном ключе'], ['out', 'fb', 'обратная связь'], ['fb', 'ic']],
  }).save(out('teardown-buck-module', 'blocks'));

  tableFig({
    title: 'Расчёты для модуля: вход 12 В → выход 5 В, 1 А',
    cols: ['Величина', 'Формула', 'Значение'],
    rows: [
      ['Скважность', 'D = Uвых/Uвх', '0,417'],
      ['Пульсации тока дросселя', 'ΔI = (Uвх − Uвых)·D/(L·f)', '0,59 А'],
      ['Потери в диоде', 'P = Vf·I·(1 − D)', '0,26 Вт'],
      ['Сопротивление подстроечника', 'R2 = R1·(Uвых/1,23 − 1)', '3,07 кОм при R1 = 1 кОм'],
    ],
    widths: [1.8, 2.2, 1.6], w: 860,
  }).save(out('teardown-buck-module', 'numbers'));
}
