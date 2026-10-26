---
id: traffic-light
title: Светофор на конечном автомате
icon: traffic-cone
summary: Состояния автомата позволяют обрабатывать кнопку во время ожидания.
kind: project
optional: false
level: 3
minutes: 60
prerequisites:
  - displays
objectives:
  - 'Собрать и проверить: Светофор на конечном автомате'
  - Сопоставить расчёт с измерениями и найти причину отклонения
glossary:
  - ohm
flashcards:
  - q: Что проверяем в проекте «Светофор на конечном автомате»?
    a: Состояния автомата позволяют обрабатывать кнопку во время ожидания.
  - q: Как найти ошибку?
    a: >-
      Неправильно подключены выводы или общий GND. Не совпадает адрес, тип модуля или библиотека.
      Источник проседает под нагрузкой.
---

## Цель

Сделаем светофор, который реагирует на кнопку без остановки программы. Автомат хранит цвет, время перехода и запрос пешехода.

## Что понадобится

- Arduino Uno R3, USB-кабель данных
- Макетная плата и перемычки
- Три LED с резисторами 1 кОм
- Кнопка к D2/GND

Бюджет: сначала используй детали своего набора. Для планирования можно заложить 1500–5000 ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.

## Расчёт

T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).
```figure
file: traffic-light/concept.svg
alt: Кнопка → Автомат состояний → Три индикатора
caption: Кнопка → Автомат состояний → Три индикатора
```

```example
title: Контрольный расчёт
steps:
  - 'Дано: LED включён 300 мс и выключен 200 мс в цикле. Найди частоту мигания.'
  - 'Выбираем модель: T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).'
  - 'Подставляем согласованные единицы: 1000/(300+200).'
  - Получаем 2 Гц. Проверяем обратной подстановкой.
result: 2 Гц
```

```figure
file: traffic-light/model.svg
alt: Зависимость в расчётной модели проекта
caption: Модель и условия обозначены на осях.
```

## Сборка по шагам

1. Подключи красный LED через 1 кОм к D8, жёлтый к D9, зелёный к D10; катоды к GND.
2. Кнопку подключи между D2 и GND, используется INPUT_PULLUP.
3. Загрузи код и нажимай кнопку в разных состояниях.

[Скачать скетч .ino](/examples/traffic-light/traffic-light.ino)

```cpp
const byte red=8,yellow=9,green=10,buttonPin=2;
enum State { GREEN, YELLOW, RED }; State state=GREEN;
unsigned long entered=0,changed=0; bool oldRaw=HIGH,stable=HIGH,request=false;
void lights(){ digitalWrite(red,state==RED);digitalWrite(yellow,state==YELLOW);digitalWrite(green,state==GREEN); }
void setup(){ pinMode(red,OUTPUT);pinMode(yellow,OUTPUT);pinMode(green,OUTPUT);pinMode(buttonPin,INPUT_PULLUP); lights(); }
void loop(){
 unsigned long now=millis(); bool raw=digitalRead(buttonPin);
 if(raw!=oldRaw){oldRaw=raw;changed=now;}
 if((unsigned long)(now-changed)>=30 && stable!=raw){stable=raw;if(stable==LOW)request=true;}
 unsigned long elapsed=now-entered;
 if(state==GREEN && request && elapsed>=3000){state=YELLOW;entered=now;}
 else if(state==YELLOW && elapsed>=1000){state=RED;entered=now;}
 else if(state==RED && elapsed>=5000){state=GREEN;entered=now;request=false;}
 lights();
}
```

## Проверка

Зелёный длится не меньше 3 с и ждёт запрос; затем жёлтый 1 с, красный 5 с. Измерь интервалы и убедись, что удержание кнопки не создаёт бесконечных новых событий.

```quiz
id: measurement
type: numeric
question: LED включён 400 мс и выключен 200 мс в цикле. Найди частоту мигания.
answer: 1.6666666666666667
unit: Гц
tolerance_percent: 1
hint: T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).
explanation: 1000/(400+200) = 1,66667 Гц.
```

## Если не работает

- Неправильно подключены выводы или общий GND.
- Не совпадает адрес, тип модуля или библиотека.
- Источник проседает под нагрузкой.
```callout
kind: mistake
text: >-
  Длинная задержка улучшает реакцию на кнопку. Состояния автомата позволяют обрабатывать кнопку во
  время ожидания.
```

## Безопасность

```callout
kind: safety
text: >-
  Собирай без питания. Работай только от защищённого низковольтного источника с ограничением тока.
  Не подключай сетевое напряжение.
```

## Идеи развития

Измени один параметр, повтори расчёт и измерение. Запиши причины расхождения, не меняя одновременно несколько деталей.
```quiz
id: design
type: numeric
question: LED включён 500 мс и выключен 200 мс в цикле. Найди частоту мигания.
answer: 1.4285714285714286
unit: Гц
tolerance_percent: 1
hint: T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).
explanation: 1000/(500+200) = 1,42857 Гц.
```

```quiz
id: transfer
type: numeric
question: LED включён 600 мс и выключен 200 мс в цикле. Найди частоту мигания.
answer: 1.25
unit: Гц
tolerance_percent: 1
hint: T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).
explanation: 1000/(600+200) = 1,25 Гц.
```

```checkpoint
items:
  - Состояния автомата позволяют обрабатывать кнопку во время ожидания.
  - Кнопка должна быть отфильтрована от дребезга, а времена проверены по millis.
  - T = tвкл+tвыкл; f=1/T. При длительностях в мс f=1000/(tвкл+tвыкл).
```
