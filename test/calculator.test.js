import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate, makeContext, formatNumber, engineering, CalcError} from '../public/js/calculator/engine.js';

const calc = (src, angle = 'rad') => evaluate(src, makeContext(angle)).value;
const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), actual + ' != ' + expected);
const fails = (src, pattern, ctx = makeContext('rad')) =>
  assert.throws(() => evaluate(src, ctx), error => error instanceof CalcError && pattern.test(error.message), src);

test('Арифметика и приоритеты операций', () => {
  assert.equal(calc('2+3*4'), 14);
  assert.equal(calc('(2+3)*4'), 20);
  assert.equal(calc('2^3^2'), 512);
  assert.equal(calc('-2^2'), -4);
  assert.equal(calc('2^-1'), 0.5);
  assert.equal(calc('2**3'), 8);
  assert.equal(calc('10 ÷ 4 × 2 − 1'), 4);
  assert.equal(calc('50%'), 0.5);
  assert.equal(calc('3²+4²'), 25);
  assert.equal(calc('√(9+16)'), 5);
});

test('Приставки СИ после числа, десятичная запятая и запись 4к7', () => {
  assert.equal(calc('4,7к'), 4700);
  assert.equal(calc('4.7k'), 4700);
  assert.equal(calc('4к7'), 4700);
  assert.equal(calc('2М2'), 2.2e6);
  assert.equal(calc('100н'), 1e-7);
  assert.equal(calc('10мк'), 1e-5);
  assert.equal(calc('22п'), 2.2e-11);
  assert.equal(calc('5м'), 0.005);
  assert.equal(calc('1,5e3'), 1500);
  assert.equal(calc('5/(4,7к+10к)'), 5 / 14700);
});

test('Параллельное соединение и неявное умножение', () => {
  assert.equal(calc('10к||10к'), 5000);
  assert.equal(calc('10к ∥ 10к'), 5000);
  near(calc('par(10к;10к;10к)'), 10000 / 3);
  assert.equal(calc('0||5'), 0);
  near(calc('2pi'), 2 * Math.PI);
  near(calc('2π'), 2 * Math.PI);
  assert.equal(calc('2(3+4)'), 14);
  assert.equal(calc('(1+1)(2+2)'), 8);
});

test('Функции и режим углов', () => {
  assert.equal(calc('sqrt(16)'), 4);
  assert.equal(calc('sin(pi)'), 0);
  near(calc('sin(30)', 'deg'), 0.5);
  near(calc('atan(1)', 'deg'), 45);
  near(calc('atan2(1;1)', 'deg'), 45);
  assert.equal(calc('cos(90)', 'deg'), 0);
  assert.equal(calc('log(1000)'), 3);
  near(calc('ln(e)'), 1);
  near(calc('db(10)'), 20);
  assert.equal(calc('max(1;5;3)'), 5);
  near(calc('tg(45)', 'deg'), 1);
  fails('tan(90)', /Тангенс/, makeContext('deg'));
});

test('Переменные и ans работают по строкам сверху вниз', () => {
  const ctx = makeContext('rad');
  assert.deepEqual(evaluate('R1 = 4,7к', ctx), {kind: 'assign', name: 'R1', value: 4700});
  assert.equal(evaluate('R1*2', ctx).value, 9400);
  assert.equal(evaluate('ans/2', ctx).value, 4700);
  evaluate('R1 = R1 + 300', ctx);
  assert.equal(ctx.vars.get('R1'), 5000);
  assert.equal(evaluate('q_e', ctx).value, 1.602176634e-19);
  assert.deepEqual(evaluate('   ', ctx), {kind: 'empty'});
});

test('Ошибки понятны, а недописанное выражение помечено как незавершённое', () => {
  fails('1/0', /Деление на ноль/);
  fails('0^-1', /Деление на ноль/);
  fails('sqrt(-1)', /отрицательного/);
  fails('ln(0)', /Логарифм/);
  fails('foo+1', /Неизвестное имя: foo/);
  fails('1 2', /Лишний символ/);
  fails('2 $ 3', /Неожиданный символ/);
  fails('sin 30', /нужны скобки/);
  fails('max(1,2)', /Аргументы разделяй/);
  fails('sin = 3', /занято/);
  fails('ans', /Нет предыдущего/);
  fails('10^400', /Слишком большое/);
  for (const partial of ['2+', '(2+3', 'sin(', 'x =', '2*']) {
    assert.throws(() => evaluate(partial, makeContext('rad')), error => error.incomplete === true, partial);
  }
});

test('Код из выражения не выполняется', () => {
  fails('process.exit()', /Неожиданный символ|Неизвестное имя/);
  fails('constructor', /Неизвестное имя/);
  fails('__proto__', /Неизвестное имя/);
});

test('Форматирование результата', () => {
  assert.equal(formatNumber(0.1 + 0.2), '0.3');
  assert.equal(formatNumber(1 / 3), '0.3333333333');
  assert.equal(formatNumber(4700), '4700');
  assert.equal(formatNumber(4.7e-6), '4.7e-6');
  assert.equal(formatNumber(1e-7), '1e-7');
  assert.equal(formatNumber(2.2e12), '2.2e12');
  assert.equal(formatNumber(-0), '0');
  assert.equal(engineering(4700), '4.7 к');
  assert.equal(engineering(2.2e-6), '2.2 мк');
  assert.equal(engineering(0.5), '500 м');
  assert.equal(engineering(1e9), '1 Г');
  assert.equal(engineering(5), '');
  assert.equal(engineering(0), '');
});
