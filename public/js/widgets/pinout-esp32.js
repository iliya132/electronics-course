import {el} from '../dom.js';

// ESP32-DevKitC V4, module ESP32-WROOM: J2/J3 from the Espressif user guide.
const headers = [
  [['3V3'], ['EN'], ['VP', 36], ['VN', 39], ['IO34', 34], ['IO35', 35], ['IO32', 32],
    ['IO33', 33], ['IO25', 25], ['IO26', 26], ['IO27', 27], ['IO14', 14], ['IO12', 12],
    ['GND'], ['IO13', 13], ['D2', 9], ['D3', 10], ['CMD', 11], ['5V']],
  [['GND'], ['IO23', 23], ['IO22', 22], ['TX', 1], ['RX', 3], ['IO21', 21], ['GND'],
    ['IO19', 19], ['IO18', 18], ['IO5', 5], ['IO17', 17], ['IO16', 16], ['IO4', 4],
    ['IO0', 0], ['IO2', 2], ['IO15', 15], ['D1', 8], ['D0', 7], ['CLK', 6]]
];

function description(name, pin) {
  if (pin === undefined) {
    return {
      '3V3': 'Питание 3,3 В. Не является GPIO.',
      '5V': 'Линия питания 5 В платы. Не является GPIO; логические входы ESP32 не допускают 5 В.',
      'GND': 'Общий провод (земля), опорный потенциал для сигналов.',
      'EN': 'Разрешение работы микроконтроллера. Низкий уровень вызывает сброс.'
    }[name];
  }
  const detail = pin >= 6 && pin <= 11 ? 'Подключён к flash: не использовать.' :
    pin >= 34 ? 'Только вход, внутренней подтяжки нет.' :
    [0, 2, 5, 12, 15].includes(pin) ? 'Strapping: состояние при сбросе влияет на загрузку.' :
    [1, 3].includes(pin) ? 'UART0: используется для загрузки и консоли.' :
    'Обычный GPIO; проверь функции периферии.';
  return detail + ' Уровни 3,3 В. 5 В подавать нельзя.';
}

export function mount(container) {
  container.append(el('p', {
    text: 'ESP32-DevKitC V4 с модулем ESP32-WROOM, вид сверху, USB снизу. ' +
      'Выбери вывод мышью, касанием или клавишей Enter / Пробел. У других плат распиновка отличается.'
  }));
  const drawing = el('div');
  const out = el('output', {'aria-live': 'polite'});
  const labels = headers.flatMap((pins, column) => pins.map(([name, pin], row) => {
    const x = column ? 172 : 6;
    const y = 40 + row * 50;
    const label = name + (pin !== undefined && !name.startsWith('IO') ? ' · GPIO' + pin : '');
    return '<g class="board-node" role="button" tabindex="0" aria-pressed="false" ' +
      'aria-label="J' + (column + 2) + ', вывод ' + (row + 1) + ': ' + label + '">' +
      '<rect x="' + x + '" y="' + y + '" width="142" height="44" rx="6" ' +
      'fill="var(--surface)" stroke="var(--border-strong)"/>' +
      '<text x="' + (x + 71) + '" y="' + (y + 28) + '" text-anchor="middle" ' +
      'font-size="15" fill="currentColor">' + label + '</text></g>';
  }));
  drawing.innerHTML = '<svg viewBox="0 0 320 1020" role="group" aria-label="Выводы ESP32-DevKitC V4">' +
    '<g fill="currentColor" font-size="18" text-anchor="middle">' +
    '<text x="77" y="24">J2</text><text x="243" y="24">J3</text>' +
    '<text x="160" y="1010">USB ↓</text></g>' + labels.join('') + '</svg>';
  const nodes = [...drawing.querySelectorAll('[role="button"]')];
  const pins = headers.flat();
  const show = index => {
    const [name, pin] = pins[index];
    out.textContent = name + (pin === undefined ? '' : ' / GPIO' + pin) + ': ' + description(name, pin);
    nodes.forEach((node, i) => {
      node.setAttribute('aria-pressed', String(i === index));
      node.querySelector('rect').setAttribute('stroke', i === index ? 'var(--accent)' : 'var(--border-strong)');
    });
  };
  nodes.forEach((node, index) => {
    node.onclick = () => show(index);
    node.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        show(index);
      }
    };
  });
  container.append(drawing, out);
  show(0);
}
