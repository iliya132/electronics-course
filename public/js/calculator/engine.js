// Разбор и вычисление выражений для калькулятора. Без eval: CSP сайта его запрещает.
export class CalcError extends Error {
  constructor(message, incomplete = false) {
    super(message);
    this.incomplete = incomplete;
  }
}

// Приставки пишутся сразу после числа: 4,7к, 100н, 2М2. Порядок важен: «мк» раньше «м».
const PREFIXES = [
  ['мк', -6], ['µ', -6], ['μ', -6], ['u', -6],
  ['п', -12], ['p', -12], ['н', -9], ['n', -9], ['м', -3], ['m', -3],
  ['к', 3], ['k', 3], ['К', 3], ['K', 3],
  ['М', 6], ['M', 6], ['Г', 9], ['G', 9], ['Т', 12], ['T', 12]
];
const SI = { '-12': 'п', '-9': 'н', '-6': 'мк', '-3': 'м', 3: 'к', 6: 'М', 9: 'Г', 12: 'Т' };

const CONSTANTS = new Map([
  ['pi', Math.PI], ['π', Math.PI], ['e', Math.E],
  ['q_e', 1.602176634e-19], ['eps_0', 8.8541878128e-12], ['mu_0', 1.25663706212e-6],
  ['c_0', 299792458], ['k_B', 1.380649e-23]
]);
const ALIASES = { tg: 'tan', ctg: 'cot', arcsin: 'asin', arccos: 'acos', arctg: 'atan', arctan: 'atan', lg: 'log', 'корень': 'sqrt' };

const need = (ok, message) => {
  if (!ok) throw new CalcError(message);
};
const toRad = (x, ctx) => ctx.angle === 'deg' ? x * Math.PI / 180 : x;
const fromRad = (x, ctx) => ctx.angle === 'deg' ? x * 180 / Math.PI : x;
const snap = x => Math.abs(x) < 1e-15 ? 0 : x;
const fn = (min, max, f) => ({ min, max, f });
const parallel = (a, b) => {
  if (a === 0 || b === 0) return 0;
  need(a + b !== 0, 'Деление на ноль');
  return a * b / (a + b);
};
const FUNCS = {
  sqrt: fn(1, 1, ([x]) => (need(x >= 0, 'Корень из отрицательного числа'), Math.sqrt(x))),
  cbrt: fn(1, 1, ([x]) => Math.cbrt(x)),
  abs: fn(1, 1, ([x]) => Math.abs(x)),
  exp: fn(1, 1, ([x]) => Math.exp(x)),
  ln: fn(1, 1, ([x]) => (need(x > 0, 'Логарифм определён только для положительных чисел'), Math.log(x))),
  log: fn(1, 1, ([x]) => (need(x > 0, 'Логарифм определён только для положительных чисел'), Math.log10(x))),
  log2: fn(1, 1, ([x]) => (need(x > 0, 'Логарифм определён только для положительных чисел'), Math.log2(x))),
  db: fn(1, 1, ([x]) => (need(x > 0, 'Логарифм определён только для положительных чисел'), 20 * Math.log10(x))),
  sin: fn(1, 1, ([x], c) => snap(Math.sin(toRad(x, c)))),
  cos: fn(1, 1, ([x], c) => snap(Math.cos(toRad(x, c)))),
  tan: fn(1, 1, ([x], c) => {
    need(Math.abs(Math.cos(toRad(x, c))) > 1e-12, 'Тангенс не определён');
    return snap(Math.tan(toRad(x, c)));
  }),
  cot: fn(1, 1, ([x], c) => {
    need(Math.abs(Math.sin(toRad(x, c))) > 1e-12, 'Котангенс не определён');
    return snap(1 / Math.tan(toRad(x, c)));
  }),
  asin: fn(1, 1, ([x], c) => (need(Math.abs(x) <= 1, 'Арксинус определён на отрезке от −1 до 1'), fromRad(Math.asin(x), c))),
  acos: fn(1, 1, ([x], c) => (need(Math.abs(x) <= 1, 'Арккосинус определён на отрезке от −1 до 1'), fromRad(Math.acos(x), c))),
  atan: fn(1, 1, ([x], c) => fromRad(Math.atan(x), c)),
  atan2: fn(2, 2, ([y, x], c) => fromRad(Math.atan2(y, x), c)),
  sinh: fn(1, 1, ([x]) => Math.sinh(x)),
  cosh: fn(1, 1, ([x]) => Math.cosh(x)),
  tanh: fn(1, 1, ([x]) => Math.tanh(x)),
  floor: fn(1, 1, ([x]) => Math.floor(x)),
  ceil: fn(1, 1, ([x]) => Math.ceil(x)),
  round: fn(1, 1, ([x]) => Math.round(x)),
  min: fn(2, Infinity, args => Math.min(...args)),
  max: fn(2, Infinity, args => Math.max(...args)),
  pow: fn(2, 2, ([a, b]) => power(a, b)),
  par: fn(2, Infinity, args => args.reduce(parallel))
};
const funcName = name => Object.hasOwn(ALIASES, name) ? ALIASES[name] : name;
const isFunc = name => Object.hasOwn(FUNCS, funcName(name));

function power(a, b) {
  need(!(a === 0 && b < 0), 'Деление на ноль');
  return a ** b;
}

const ID_START = /[\p{L}_]/u;
const ID_PART = /[\p{L}_0-9]/u;
const OPS = new Map([
  ['+', '+'], ['-', '-'], ['−', '-'], ['–', '-'], ['*', '*'], ['×', '*'], ['·', '*'], ['⋅', '*'],
  ['/', '/'], ['÷', '/'], ['^', '^'], ['(', '('], [')', ')'], [';', ','], [',', ','], ['=', '='],
  ['%', '%'], ['√', '√'], ['∥', '||'], ['²', '²'], ['³', '³']
]);

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[\s   ]/.test(ch)) {
      i++;
      continue;
    }
    const start = i;
    const number = /^(?:\d+(?:\.\d*|,\d+)?|\.\d+)/.exec(src.slice(i));
    if (number) {
      let text = number[0];
      i += text.length;
      let integer = /^\d+$/.test(text);
      let exponent = 0;
      const sci = /^[eE][+-]?\d+/.exec(src.slice(i));
      if (sci) {
        text += sci[0];
        i += sci[0].length;
        integer = false;
      } else {
        for (const [symbol, power10] of PREFIXES) {
          if (!src.startsWith(symbol, i)) continue;
          const after = src[i + symbol.length];
          if (after === undefined || !ID_PART.test(after)) {
            exponent = power10;
            i += symbol.length;
            break;
          }
          if (integer && /\d/.test(after)) { // запись как на резисторах: 4к7 = 4,7 кОм
            const fraction = /^\d+/.exec(src.slice(i + symbol.length))[0];
            text += '.' + fraction;
            exponent = power10;
            i += symbol.length + fraction.length;
            break;
          }
        }
      }
      tokens.push({ t: 'num', v: Number(text.replace(',', '.') + (exponent ? 'e' + exponent : '')), raw: src.slice(start, i) });
      continue;
    }
    if (ID_START.test(ch)) {
      while (i < src.length && ID_PART.test(src[i])) i++;
      tokens.push({ t: 'id', v: src.slice(start, i), raw: src.slice(start, i) });
      continue;
    }
    if (src.startsWith('||', i) || src.startsWith('**', i)) {
      tokens.push({ t: 'op', v: src.startsWith('||', i) ? '||' : '^', raw: src.slice(i, i + 2) });
      i += 2;
      continue;
    }
    if (!OPS.has(ch)) throw new CalcError('Неожиданный символ «' + ch + '»');
    tokens.push({ t: 'op', v: OPS.get(ch), raw: ch });
    i++;
  }
  tokens.push({ t: 'end', raw: '' });
  return tokens;
}

/**
 * Вычисляет одну строку. ctx = { vars: Map, angle: 'rad' | 'deg', ans }.
 * При успехе обновляет ctx.ans, а для «имя = выражение» — и ctx.vars.
 * Возвращает { kind: 'empty' } | { kind: 'value' | 'assign', value, name? }.
 */
export function evaluate(src, ctx) {
  const tokens = tokenize(src);
  if (tokens.length === 1) return { kind: 'empty' };
  let at = 0;
  const peek = () => tokens[at];
  const isOp = (...values) => peek().t === 'op' && values.includes(peek().v);
  const incomplete = () => new CalcError('Выражение не закончено', true);

  let name = null;
  if (tokens[0].t === 'id' && tokens[1].t === 'op' && tokens[1].v === '=') {
    name = tokens[0].v;
    need(!isFunc(name) && name !== 'ans', 'Имя «' + name + '» занято');
    if (tokens[2].t === 'end') throw incomplete();
    at = 2;
  }

  function add() {
    let value = mul();
    while (isOp('+', '-')) value = tokens[at++].v === '+' ? value + mul() : value - mul();
    return value;
  }
  function mul() {
    let value = unary();
    for (;;) {
      const token = peek();
      if (isOp('*')) {
        at++;
        value *= unary();
      } else if (isOp('/')) {
        at++;
        const divisor = unary();
        need(divisor !== 0, 'Деление на ноль');
        value /= divisor;
      } else if (isOp('||')) {
        at++;
        value = parallel(value, unary());
      } else if (token.t === 'id' || isOp('(', '√')) { // неявное умножение: 2π, 4(3+1), R1(2+3)
        value *= unary();
      } else {
        return value;
      }
    }
  }
  function unary() {
    if (isOp('+', '-')) return tokens[at++].v === '-' ? -unary() : unary();
    return exponent();
  }
  function exponent() {
    const base = postfix();
    if (!isOp('^')) return base;
    at++;
    return power(base, unary());
  }
  function postfix() {
    let value = primary();
    for (;;) {
      if (isOp('%')) value /= 100;
      else if (isOp('²')) value **= 2;
      else if (isOp('³')) value **= 3;
      else return value;
      at++;
    }
  }
  function primary() {
    const token = tokens[at];
    if (token.t === 'end') throw incomplete();
    if (token.t === 'num') {
      at++;
      return token.v;
    }
    if (token.t === 'id') {
      at++;
      return identifier(token.v);
    }
    if (isOp('(')) {
      at++;
      const value = add();
      if (!isOp(')')) throw peek().t === 'end' ? new CalcError('Не хватает закрывающей скобки', true) : new CalcError('Лишний символ «' + peek().raw + '»');
      at++;
      return value;
    }
    if (isOp('√')) {
      at++;
      return FUNCS.sqrt.f([primary()], ctx);
    }
    throw new CalcError('Неожиданный символ «' + token.raw + '»');
  }
  function identifier(id) {
    if (isFunc(id)) {
      need(isOp('('), 'После «' + id + '» нужны скобки');
      at++;
      const args = [];
      if (!isOp(')')) {
        do {
          if (args.length) at++;
          args.push(add());
        } while (isOp(','));
      }
      if (!isOp(')')) throw peek().t === 'end' ? new CalcError('Не хватает закрывающей скобки', true) : new CalcError('Лишний символ «' + peek().raw + '»');
      at++;
      const spec = FUNCS[funcName(id)];
      if (args.length < spec.min || args.length > spec.max) {
        throw new CalcError('«' + id + '» ждёт ' + (spec.min === spec.max ? spec.min : 'не менее ' + spec.min) + ' арг., получено ' + args.length + '. Аргументы разделяй точкой с запятой');
      }
      return spec.f(args, ctx);
    }
    if (id === 'ans') {
      need(ctx.ans !== undefined, 'Нет предыдущего результата');
      return ctx.ans;
    }
    if (ctx.vars.has(id)) return ctx.vars.get(id);
    if (CONSTANTS.has(id)) return CONSTANTS.get(id);
    throw new CalcError('Неизвестное имя: ' + id);
  }

  const value = add();
  if (peek().t !== 'end') throw new CalcError('Лишний символ «' + peek().raw + '»');
  if (Number.isNaN(value)) throw new CalcError('Не определено');
  if (!Number.isFinite(value)) throw new CalcError('Слишком большое число');
  ctx.ans = value;
  if (name) {
    ctx.vars.set(name, value);
    return { kind: 'assign', name, value };
  }
  return { kind: 'value', value };
}

export const makeContext = angle => ({ vars: new Map(), angle, ans: undefined });

/** Число для показа и копирования: 10 значащих цифр, точка как разделитель. */
export function formatNumber(x) {
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-4 && a < 1e12) return String(+x.toPrecision(10));
  return x.toExponential(9).replace(/\.?0+e/, 'e').replace('e+', 'e');
}

/** Запись с приставкой: 4700 → «4.7 к», 0.0000022 → «2.2 мк». Пусто, если приставка не нужна. */
export function engineering(x) {
  const a = Math.abs(x);
  if (!(a >= 1e-12 && a < 1e15)) return '';
  const exponent = Math.max(-12, Math.min(12, Math.floor(Math.log10(a) / 3) * 3));
  const prefix = SI[exponent];
  if (!prefix) return '';
  return +(x / Number('1e' + exponent)).toPrecision(6) + ' ' + prefix;
}
