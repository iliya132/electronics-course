---
id: lcd-thermometer
title: Термометр с OLED и min/max
icon: thermometer
summary: Обрыв и короткое замыкание датчика нужно обрабатывать отдельно.
kind: project
optional: false
level: 3
minutes: 60
prerequisites:
  - traffic-light
objectives:
  - 'Собрать и проверить: Термометр с OLED и min/max'
  - Сопоставить расчёт с измерениями и найти причину отклонения
glossary:
  - ohm
  - ntc
  - adc
flashcards:
  - q: Что проверяем в проекте «Термометр с OLED и min/max»?
    a: Обрыв и короткое замыкание датчика нужно обрабатывать отдельно.
  - q: Как найти ошибку?
    a: >-
      Неправильно подключены выводы или общий GND. Не совпадает адрес, тип модуля или библиотека.
      Источник проседает под нагрузкой.
---

## Цель

Выведем температуру NTC на OLED и запомним минимум и максимум за суточное окно. Ошибочный код датчика должен отображаться как неисправность, а не как правдоподобная температура.

## Что понадобится

- Arduino Uno R3, USB-кабель данных
- Макетная плата и перемычки
- NTC 10 кОм β=3950 К, резистор 10 кОм
- Совместимый с Uno OLED SSD1306 128×64 I²C
- Библиотеки Adafruit SSD1306 и GFX

Бюджет: сначала используй детали своего набора. Для планирования можно заложить 1500–5000 ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.

## Расчёт

Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм = 1000 Ом.
```figure
file: lcd-thermometer/concept.svg
alt: NTC → Arduino и расчёт → OLED и min/max
caption: NTC → Arduino и расчёт → OLED и min/max
```

```example
title: Контрольный расчёт
steps:
  - >-
    Дано: Ненагруженный делитель: Uвх = 5 В, R1 сверху = 10 кОм, R2 снизу = 3 кОм. Найди Uвых
    относительно GND.
  - >-
    Выбираем модель: Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм =
    1000 Ом.
  - 'Подставляем согласованные единицы: 5 × 3/(10+3).'
  - Получаем 1,15385 В. Проверяем обратной подстановкой.
result: 1,15385 В
```

```figure
file: lcd-thermometer/model.svg
alt: Зависимость в расчётной модели проекта
caption: Модель и условия обозначены на осях.
```

## Сборка по шагам

1. Собери 5 В → 10 кОм → A0 → NTC → GND.
2. OLED подключи по спецификации модуля: SDA=A4, SCL=A5, питание и общий GND.
3. Проверь адрес 0x3C сканером; измени его при необходимости.
4. Загрузи код, сравни показание с термометром, согрей датчик.

[Скачать скетч .ino](/examples/lcd-thermometer/lcd-thermometer.ino)

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>
float temperature(){
 int code=analogRead(A0);
 if(code<=0 || code>=1023) return NAN;
 float r=10000.0f*code/(1024.0f-code);
 return 1.0f/(1.0f/298.15f+log(r/10000.0f)/3950.0f)-273.15f;
}
Adafruit_SSD1306 display(128,64,&Wire,-1);
float low=1000,high=-1000; unsigned long started=0,last=0;
void setup(){ Serial.begin(9600); if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C))while(true){} started=millis(); }
void loop(){
 unsigned long now=millis(); if((unsigned long)(now-last)<1000)return; last=now;
 if((unsigned long)(now-started)>=86400000UL){low=1000;high=-1000;started=now;}
 float t=temperature();display.clearDisplay();display.setTextColor(SSD1306_WHITE);display.setTextSize(1);display.setCursor(0,0);
 if(isnan(t))display.println("Sensor error");
 else {low=min(low,t);high=max(high,t);display.print("T: ");display.println(t);display.print("Min: ");display.println(low);display.print("Max: ");display.println(high);}
 display.display();Serial.println(t);
}
```

## Проверка

Для идеальных 10 кОм/10 кОм код около 512 и температура около 25 °C. Учебная цель после калибровки — расхождение не более нескольких градусов. Суточное окно сбрасывается каждые 86400000 мс от запуска.

```quiz
id: measurement
type: numeric
question: >-
  Ненагруженный делитель: Uвх = 5 В, R1 сверху = 10 кОм, R2 снизу = 4 кОм. Найди Uвых относительно
  GND.
answer: 1.4285714285714286
unit: В
tolerance_percent: 1
hint: Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм = 1000 Ом.
explanation: 5 × 4/(10+4) = 1,42857 В.
```

## Если не работает

- Неправильно подключены выводы или общий GND.
- Не совпадает адрес, тип модуля или библиотека.
- Источник проседает под нагрузкой.
```callout
kind: mistake
text: >-
  Код ноль всегда означает нормальную температуру. Обрыв и короткое замыкание датчика нужно
  обрабатывать отдельно.
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
question: >-
  Ненагруженный делитель: Uвх = 5 В, R1 сверху = 10 кОм, R2 снизу = 5 кОм. Найди Uвых относительно
  GND.
answer: 1.6666666666666667
unit: В
tolerance_percent: 1
hint: Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм = 1000 Ом.
explanation: 5 × 5/(10+5) = 1,66667 В.
```

```quiz
id: transfer
type: numeric
question: >-
  Ненагруженный делитель: Uвх = 5 В, R1 сверху = 10 кОм, R2 снизу = 6 кОм. Найди Uвых относительно
  GND.
answer: 1.875
unit: В
tolerance_percent: 1
hint: Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм = 1000 Ом.
explanation: 5 × 6/(10+6) = 1,875 В.
```

```checkpoint
items:
  - Обрыв и короткое замыкание датчика нужно обрабатывать отдельно.
  - Сверь NTC при комнатной температуре и проверь оба предельных кода АЦП.
  - Uвых = Uвх·R2/(R1+R2); одинаковые приставки сопротивлений сокращаются. 1 кОм = 1000 Ом.
```
