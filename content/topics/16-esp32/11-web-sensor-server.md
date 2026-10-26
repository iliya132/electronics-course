---
id: web-sensor-server
title: Веб-датчик на ESP32
icon: server
summary: Последовательная проверка датчика и сети упрощает поиск ошибки.
kind: project
optional: false
level: 3
minutes: 60
prerequisites:
  - deep-sleep
objectives:
  - 'Собрать и проверить: Веб-датчик на ESP32'
  - Сопоставить расчёт с измерениями и найти причину отклонения
glossary: []
flashcards:
  - q: Что проверяем в проекте «Веб-датчик на ESP32»?
    a: Последовательная проверка датчика и сети упрощает поиск ошибки.
  - q: Как найти ошибку?
    a: >-
      Неверное питание или адрес BME280. Выбран другой ESP32-вариант или неподходящая версия
      библиотеки. Связь отсутствует или источник питания проседает.
---

## Цель

Сделаем локальную страницу с температурой и влажностью BME280. Браузер периодически получает JSON, а ESP32 обслуживает запросы.

## Что понадобится

- Классический ESP32 DevKit, USB-кабель
- BME280 с питанием и подтяжками 3,3 В
- Библиотека Adafruit BME280 с зависимостями

Бюджет: сначала используй детали своего набора. Для планирования можно заложить 1500–5000 ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.

## Расчёт

Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые режимы.
```figure
file: web-sensor-server/concept.svg
alt: BME280 → ESP32 и HTTP → Браузер
caption: BME280 → ESP32 и HTTP → Браузер
```

```example
title: Контрольный расчёт
steps:
  - 'Дано: Сумма расчётных токов 160 мА. Найди ток источника с запасом 30 %.'
  - >-
    Выбираем модель: Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые
    режимы.
  - 'Подставляем согласованные единицы: 1,3 × 160.'
  - Получаем 208 мА. Проверяем обратной подстановкой.
result: 208 мА
```

```figure
file: web-sensor-server/model.svg
alt: Зависимость в расчётной модели проекта
caption: Модель и условия обозначены на осях.
```

## Сборка по шагам

1. Подключи BME280: 3V3, GND, SDA=21, SCL=22.
2. В коде введи SSID и пароль своей локальной сети; проверь адрес датчика 0x76/0x77.
3. Загрузи скетч с ядром Arduino-ESP32; прочитай IP в Serial 115200.
4. Открой IP с устройства той же сети и проверь обновление JSON.

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
WebServer server(80);
const char* ssid="YOUR_WIFI";
const char* password="YOUR_PASSWORD";
bool sensorOK=false;
void setup(){
 Serial.begin(115200);sensorOK=beginSensor();
 WiFi.mode(WIFI_STA);WiFi.begin(ssid,password);
 unsigned long start=millis();
 while(WiFi.status()!=WL_CONNECTED && millis()-start<15000)delay(100);
 if(WiFi.status()!=WL_CONNECTED){Serial.println("WiFi failed");return;}
 Serial.println(WiFi.localIP());
 server.on("/",HTTP_GET,[](){
  server.send(200,"text/html; charset=utf-8","<meta charset='utf-8'><h1>Датчик ESP32</h1><pre id='v'></pre><script>setInterval(()=>fetch('/data').then(r=>r.text()).then(t=>document.getElementById('v').textContent=t),2000)</script>");
 });
 server.on("/data",HTTP_GET,[](){
  if(!sensorOK){server.send(503,"application/json","{"error":"sensor"}");return;}
  String json="{"temperature":"+String(bme.readTemperature(),2)+","humidity":"+String(bme.readHumidity(),2)+"}";
  server.send(200,"application/json",json);
 });server.begin();
}
void loop(){server.handleClient();}
```

## Проверка

Страница обновляет данные каждые 2 с. Отключение датчика до запуска должно дать HTTP 503 вместо выдуманных измерений. Сравни температуру с отдельным прибором, учитывая нагрев платы.

```quiz
id: measurement
type: numeric
question: Сумма расчётных токов 180 мА. Найди ток источника с запасом 30 %.
answer: 234
unit: мА
tolerance_percent: 1
hint: Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые режимы.
explanation: 1,3 × 180 = 234 мА.
```

## Если не работает

- Неверное питание или адрес BME280.
- Выбран другой ESP32-вариант или неподходящая версия библиотеки.
- Связь отсутствует или источник питания проседает.
```callout
kind: mistake
text: Любой BMP280 выдаёт влажность. Последовательная проверка датчика и сети упрощает поиск ошибки.
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
question: Сумма расчётных токов 200 мА. Найди ток источника с запасом 30 %.
answer: 260
unit: мА
tolerance_percent: 1
hint: Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые режимы.
explanation: 1,3 × 200 = 260 мА.
```

```quiz
id: transfer
type: numeric
question: Сумма расчётных токов 220 мА. Найди ток источника с запасом 30 %.
answer: 286
unit: мА
tolerance_percent: 1
hint: Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые режимы.
explanation: 1,3 × 220 = 286 мА.
```

```checkpoint
items:
  - Последовательная проверка датчика и сети упрощает поиск ошибки.
  - >-
    Проверь BME280 сначала через Serial, затем сеть, затем веб-страницу. BMP280 не измеряет
    влажность.
  - Iист ≥ 1,3·ΣI; складывают токи на одной линии, отдельно проверяют пиковые режимы.
```
