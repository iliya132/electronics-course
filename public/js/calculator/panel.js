import {el} from '../dom.js';
import {CalcError, evaluate, makeContext, formatNumber, engineering} from './engine.js';

const KEY = 'calculator';
const MAX_ROWS = 100;
const PAD = [
  ['(', ')', '^', '√', '⌫'],
  ['7', '8', '9', '÷', 'C'],
  ['4', '5', '6', '×', '∥'],
  ['1', '2', '3', '−', 'π'],
  ['0', ',', 'EE', '+', '=']
];
const KEY_TEXT = {'√': '√(', EE: 'e'};
const KEY_LABEL = {
  '⌫': 'Стереть символ', C: 'Очистить строку', '=': 'Новая строка', '∥': 'Параллельно (||)', '√': 'Корень',
  EE: 'Степень десяти (e)', '^': 'Степень', '÷': 'Разделить', '×': 'Умножить', '−': 'Вычесть', '+': 'Сложить',
  ',': 'Десятичная запятая', π: 'Число пи', '(': 'Открыть скобку', ')': 'Закрыть скобку'
};
const FUNCTIONS = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'exp', 'abs', 'min', 'max'];
const PREFIXES = [
  ['п', 'пико, 10⁻¹²'], ['н', 'нано, 10⁻⁹'], ['мк', 'микро, 10⁻⁶'], ['м', 'милли, 10⁻³'],
  ['к', 'кило, 10³'], ['М', 'мега, 10⁶'], ['Г', 'гига, 10⁹']
];
const HELP = [
  'Приставки пишутся сразу после числа: <code>4,7к</code> = 4700, <code>100н</code> = 10⁻⁷, <code>4к7</code> = 4,7 к (как на резисторах).',
  'Параллельное соединение: <code>10к || 10к</code> или <code>par(10к; 10к; 22к)</code>.',
  'Переменные: <code>R1 = 4,7к</code>, дальше пиши <code>R1</code>. Результат прошлой строки — <code>ans</code>.',
  'Функции: sqrt, sin, cos, tan, asin, acos, atan, ln, log, exp, abs, min, max, pow, db. Аргументы разделяй точкой с запятой.',
  'Константы: π, e, q_e, eps_0, mu_0, c_0, k_B. Нажми на результат — число скопируется (с точкой, как принимает ответ).'
];

function loadState() {
  const state = {open: false, tab: 'calc', angle: 'rad', keys: true, rows: [''], notes: ''};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (typeof saved.open === 'boolean') state.open = saved.open;
    if (saved.tab === 'notes') state.tab = 'notes';
    if (saved.angle === 'deg') state.angle = 'deg';
    if (typeof saved.keys === 'boolean') state.keys = saved.keys;
    if (Array.isArray(saved.rows) && saved.rows.length && saved.rows.length <= MAX_ROWS &&
      saved.rows.every(row => typeof row === 'string' && row.length <= 500)) state.rows = saved.rows;
    if (typeof saved.notes === 'string' && saved.notes.length <= 50000) state.notes = saved.notes;
  } catch {}
  return state;
}

export function mountCalculator() {
  const toggle = document.getElementById('calc-toggle');
  if (!toggle) return;
  const state = loadState();
  let saveTimer;
  const flush = () => {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  };
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 250);
  };
  addEventListener('pagehide', flush);

  let inputs = [];
  let outputs = [];
  let active = 0;

  const rowsList = el('ol', {class: 'calc-rows', 'aria-label': 'Строки вычислений'});
  const angleButtons = [['rad', 'рад', 'Радианы'], ['deg', '°', 'Градусы']].map(([value, text, label]) =>
    el('button', {
      type: 'button', class: 'calc-seg', text, 'aria-label': label, title: label,
      onclick: () => {
        state.angle = value;
        syncAngle();
        recalc();
        save();
      }
    }));
  const syncAngle = () => angleButtons.forEach((button, i) =>
    button.setAttribute('aria-pressed', String(['rad', 'deg'][i] === state.angle)));

  const keypad = el('div', {class: 'calc-keys'});
  const keyButton = (label, onclick, className = '', title) => el('button', {
    type: 'button', class: 'calc-key ' + className, text: label, onclick,
    'aria-label': KEY_LABEL[label] || null, title: title || KEY_LABEL[label] || null,
    onmousedown: event => event.preventDefault() // не отбирать фокус у строки ввода
  });
  for (const line of PAD) {
    for (const label of line) {
      const kind = '÷×−+^∥'.includes(label) ? 'op' : label === '=' ? 'eq' : '⌫C'.includes(label) ? 'ctl' : '';
      keypad.append(keyButton(label, () => press(label), kind));
    }
  }
  const functionChips = el('div', {class: 'calc-chips', role: 'group', 'aria-label': 'Функции'},
    FUNCTIONS.map(name => keyButton(name, () => insert(name + '('), 'chip')));
  const prefixChips = el('div', {class: 'calc-chips', role: 'group', 'aria-label': 'Приставки'},
    PREFIXES.map(([name, hint]) => keyButton(name, () => insert(name), 'chip', hint)));
  const keysBox = el('div', {class: 'calc-keybox'}, [keypad, functionChips, prefixChips]);

  const keysToggle = el('button', {
    type: 'button', class: 'calc-seg wide', 'aria-controls': 'calc-keybox',
    onclick: () => {
      state.keys = !state.keys;
      syncKeys();
      save();
    }
  });
  keysBox.id = 'calc-keybox';
  const syncKeys = () => {
    keysBox.hidden = !state.keys;
    keysToggle.textContent = state.keys ? 'Скрыть кнопки' : 'Кнопки';
    keysToggle.setAttribute('aria-expanded', String(state.keys));
  };

  const clearRows = el('button', {
    type: 'button', class: 'calc-seg wide', text: 'Очистить всё',
    onclick: () => {
      if (state.rows.filter(row => row.trim()).length > 1 && !confirm('Удалить все строки калькулятора?')) return;
      state.rows = [''];
      active = 0;
      renderRows(0);
      save();
    }
  });
  const help = el('details', {class: 'calc-help'}, [
    el('summary', {text: 'Как вводить'}),
    el('ul', {html: HELP.map(item => '<li>' + item + '</li>').join('')})
  ]);
  const calcPane = el('div', {class: 'calc-pane', role: 'tabpanel', id: 'calc-pane-calc', 'aria-labelledby': 'calc-tab-calc'}, [
    el('div', {class: 'calc-toolbar'}, [
      el('div', {class: 'calc-segs', role: 'group', 'aria-label': 'Единицы угла'}, angleButtons),
      keysToggle, clearRows
    ]),
    rowsList, help, keysBox
  ]);

  const notes = el('textarea', {
    class: 'calc-notes', 'aria-label': 'Блокнот', spellcheck: 'false',
    placeholder: 'Черновик: данные задачи, промежуточные записи, формулы…'
  });
  notes.value = state.notes;
  notes.addEventListener('input', () => {
    state.notes = notes.value;
    save();
  });
  const notesPane = el('div', {class: 'calc-pane', role: 'tabpanel', id: 'calc-pane-notes', 'aria-labelledby': 'calc-tab-notes'}, [
    notes,
    el('div', {class: 'calc-toolbar'}, [
      el('span', {class: 'muted calc-saved', text: 'Сохраняется в этом браузере'}),
      el('button', {
        type: 'button', class: 'calc-seg wide', text: 'Очистить',
        onclick: () => {
          if (state.notes.trim() && !confirm('Очистить блокнот?')) return;
          notes.value = state.notes = '';
          notes.focus();
          save();
        }
      })
    ])
  ]);

  const tabs = [['calc', 'Калькулятор', calcPane], ['notes', 'Блокнот', notesPane]].map(([id, text, pane]) =>
    el('button', {
      type: 'button', role: 'tab', class: 'calc-tab', id: 'calc-tab-' + id, text, 'aria-controls': pane.id,
      onclick: () => showTab(id, true),
      onkeydown: event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          showTab(id === 'calc' ? 'notes' : 'calc', true);
        }
      }
    }));
  const close = el('button', {type: 'button', class: 'calc-close', text: '×', 'aria-label': 'Закрыть', title: 'Закрыть (Esc)', onclick: () => setOpen(false)});
  const head = el('div', {class: 'calc-head'}, [el('div', {class: 'calc-tabs', role: 'tablist', 'aria-label': 'Разделы'}, tabs), close]);
  const panel = el('section', {class: 'calc-panel', id: 'calc-panel', 'aria-label': 'Калькулятор и блокнот', hidden: true}, [head, calcPane, notesPane]);
  document.body.append(panel);

  function showTab(id, focus) {
    state.tab = id;
    tabs.forEach(tab => {
      const selected = tab.id === 'calc-tab-' + id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    calcPane.hidden = id !== 'calc';
    notesPane.hidden = id !== 'notes';
    save();
    if (focus) (id === 'calc' ? inputs[active] || inputs[0] : notes).focus();
  }

  function setOpen(open, focus = true) {
    state.open = open;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    save();
    if (!focus) return;
    if (open) (state.tab === 'calc' ? inputs[active] || inputs[0] : notes).focus();
    else toggle.focus();
  }

  function recalc() {
    const context = makeContext(state.angle);
    state.rows.forEach((text, i) => {
      const out = outputs[i];
      try {
        const result = evaluate(text, context);
        if (result.kind === 'empty') return out.replaceChildren();
        const raw = formatNumber(result.value);
        const copy = el('button', {
          type: 'button', class: 'calc-value', text: '= ' + raw.replace('.', ','), title: 'Скопировать число',
          onclick: async () => {
            try {
              await navigator.clipboard.writeText(raw);
              copy.textContent = '✓ скопировано';
            } catch {
              copy.textContent = 'не удалось скопировать';
            }
          }
        });
        const prefixed = engineering(result.value);
        out.replaceChildren(copy, ...(prefixed ? [el('span', {class: 'calc-eng', text: prefixed.replace('.', ',')})] : []));
      } catch (error) {
        if (!(error instanceof CalcError)) throw error;
        out.replaceChildren(error.incomplete ? el('span', {class: 'calc-pending', text: '…'}) : el('span', {class: 'calc-error', text: error.message}));
      }
    });
  }

  function focusRow(i) {
    const input = inputs[Math.max(0, Math.min(i, inputs.length - 1))];
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  function renderRows(focus) {
    inputs = [];
    outputs = [];
    rowsList.replaceChildren();
    state.rows.forEach((text, i) => {
      const input = el('input', {
        class: 'calc-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
        'aria-label': 'Выражение ' + (i + 1), 'aria-describedby': 'calc-out-' + i, value: text,
        placeholder: i === 0 ? '12 / (4,7к + 10к)' : null
      });
      const out = el('div', {class: 'calc-out', id: 'calc-out-' + i});
      const remove = el('button', {
        type: 'button', class: 'calc-del', text: '×', 'aria-label': 'Удалить строку ' + (i + 1), title: 'Удалить строку',
        onclick: () => removeRow(i)
      });
      input.addEventListener('focus', () => active = i);
      input.addEventListener('input', () => {
        state.rows[i] = input.value;
        recalc();
        save();
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit(i);
        } else if (event.key === 'Backspace' && !input.value && state.rows.length > 1) {
          event.preventDefault();
          removeRow(i);
        } else if (event.key === 'ArrowUp' && i > 0) {
          event.preventDefault();
          focusRow(i - 1);
        } else if (event.key === 'ArrowDown' && i < inputs.length - 1) {
          event.preventDefault();
          focusRow(i + 1);
        }
      });
      inputs.push(input);
      outputs.push(out);
      rowsList.append(el('li', {class: 'calc-row'}, [input, remove, out]));
    });
    recalc();
    if (focus != null) focusRow(focus);
  }

  function commit(i) {
    if (!state.rows[i].trim()) return i < state.rows.length - 1 ? focusRow(i + 1) : undefined;
    if (state.rows.length >= MAX_ROWS) return;
    state.rows.splice(i + 1, 0, '');
    renderRows(i + 1);
    save();
  }

  function removeRow(i) {
    if (state.rows.length === 1) state.rows[0] = '';
    else state.rows.splice(i, 1);
    active = Math.max(0, i - 1);
    renderRows(active);
    save();
  }

  function insert(text) {
    const input = inputs[active] || inputs[0];
    const start = input.selectionStart ?? input.value.length;
    input.setRangeText(text, start, input.selectionEnd ?? start, 'end');
    input.dispatchEvent(new Event('input'));
    input.focus();
  }

  function press(label) {
    const input = inputs[active] || inputs[0];
    if (label === '=') return commit(active);
    if (label === 'C') {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      return input.focus();
    }
    if (label === '⌫') {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      if (start === end && start > 0) input.setRangeText('', start - 1, end, 'end');
      else input.setRangeText('', start, end, 'end');
      input.dispatchEvent(new Event('input'));
      return input.focus();
    }
    insert(KEY_TEXT[label] || label);
  }

  // Перетаскивание за заголовок; на узких экранах панель закреплена снизу.
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  function place(x, y) {
    panel.classList.add('moved');
    panel.style.setProperty('--calc-x', clamp(x, 0, innerWidth - panel.offsetWidth) + 'px');
    panel.style.setProperty('--calc-y', clamp(y, 0, innerHeight - 120) + 'px');
  }
  head.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || matchMedia('(max-width: 600px)').matches) return;
    const rect = panel.getBoundingClientRect();
    const dx = event.clientX - rect.left;
    const dy = event.clientY - rect.top;
    const move = e => place(e.clientX - dx, e.clientY - dy);
    const stop = () => {
      head.removeEventListener('pointermove', move);
      head.removeEventListener('pointerup', stop);
      head.removeEventListener('pointercancel', stop);
    };
    head.setPointerCapture(event.pointerId);
    head.addEventListener('pointermove', move);
    head.addEventListener('pointerup', stop);
    head.addEventListener('pointercancel', stop);
  });
  addEventListener('resize', () => {
    if (!panel.classList.contains('moved')) return;
    const rect = panel.getBoundingClientRect();
    place(rect.left, rect.top);
  });

  toggle.addEventListener('click', () => setOpen(!state.open));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyC') {
      event.preventDefault();
      setOpen(!state.open);
    }
  });

  syncAngle();
  syncKeys();
  renderRows();
  showTab(state.tab, false);
  setOpen(state.open, false);
}
