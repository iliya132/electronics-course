---
id: mqtt-weather
title: Метеостанция MQTT
icon: cloud-sun
summary: Сначала проверяют сообщение в топике, затем настройку графика.
kind: project
optional: false
level: 3
minutes: 60
prerequisites:
  - web-sensor-server
objectives:
  - 'Собрать и проверить: Метеостанция MQTT'
  - Сопоставить расчёт с измерениями и найти причину отклонения
glossary:
  - ohm
flashcards:
  - q: Что проверяем в проекте «Метеостанция MQTT»?
    a: Сначала проверяют сообщение в топике, затем настройку графика.
  - q: Как найти ошибку?
    a: >-
      Неверное питание или адрес BME280. Выбран другой ESP32-вариант или неподходящая версия
      библиотеки. Связь отсутствует или источник питания проседает.
---

## Цель

Отправим климатические данные локальному брокеру. Подписчик сможет строить график независимо от реализации датчика.

## Что понадобится

- Классический ESP32 DevKit, USB-кабель
- BME280 с питанием и подтяжками 3,3 В
- Библиотека Adafruit BME280 с зависимостями
- Локальный брокер MQTT; библиотека PubSubClient

Бюджет: сначала используй детали своего набора. Для планирования можно заложить 1500–5000 ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.

## Расчёт

V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного места.
```figure
file: mqtt-weather/concept.svg
alt: BME280 → MQTT-брокер → График подписчика
caption: BME280 → MQTT-брокер → График подписчика
```

```example
title: Контрольный расчёт
steps:
  - 'Дано: Запись занимает 16 байт. Каков объём 300 записей без файловых накладных расходов?'
  - >-
    Выбираем модель: V = N·B; N — число записей, B — байтов на запись. Файловая система требует
    дополнительного места.
  - 'Подставляем согласованные единицы: 300×16.'
  - "Получаем 4\_800 байт. Проверяем обратной подстановкой."
result: "4\_800 байт"
```

```figure
file: mqtt-weather/model.svg
alt: Зависимость в расчётной модели проекта
caption: Модель и условия обозначены на осях.
```

## Сборка по шагам

1. Подключи BME280 как в веб-датчике.
2. Укажи сеть и адрес собственного локального брокера; для учебной закрытой сети используется порт 1883.
3. Загрузи программу и подпишись на course/weather.
4. Настрой график температуры у подписчика и отключи сеть для проверки переподключения.

[Скачать скетч .ino](/examples/mqtt-weather/mqtt-weather.ino)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
WiFiClient transport;PubSubClient mqtt(transport);
const char* ssid="YOUR_WIFI";const char* password="YOUR_PASSWORD";
const char* broker="192.168.1.10"; // Локальный учебный брокер.
unsigned long lastConnect=0,lastPublish=0;bool sensorOK=false;
void setup(){Serial.begin(115200);sensorOK=beginSensor();WiFi.begin(ssid,password);mqtt.setServer(broker,1883);}
void loop(){
 unsigned long now=millis();
 if(WiFi.status()!=WL_CONNECTED){delay(10);return;}
 if(!mqtt.connected() && (unsigned long)(now-lastConnect)>=5000){
  lastConnect=now;String id="course-"+String((uint32_t)ESP.getEfuseMac(),HEX);mqtt.connect(id.c_str());
 }
 mqtt.loop();
 if(sensorOK && mqtt.connected() && (unsigned long)(now-lastPublish)>=10000){
  lastPublish=now;char payload[96];
  snprintf(payload,sizeof(payload),"{\"temperature\":%.2f,\"humidity\":%.2f}",bme.readTemperature(),bme.readHumidity());
  if(!mqtt.publish("course/weather",payload))Serial.println("Publish failed");
 }
}
```

## Проверка

Публикация выполняется примерно каждые 10 с при связи. Изолированная учебная сеть используется без внешнего доступа; для рабочей установки добавь TLS и учётные данные.

```quiz
id: measurement
type: numeric
question: Запись занимает 16 байт. Каков объём 400 записей без файловых накладных расходов?
answer: 6400
unit: байт
tolerance_percent: 1
hint: V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного места.
explanation: "400×16 = 6\_400 байт."
```

## Если не работает

- Неверное питание или адрес BME280.
- Выбран другой ESP32-вариант или неподходящая версия библиотеки.
- Связь отсутствует или источник питания проседает.
```callout
kind: mistake
text: >-
  Название топика не влияет на маршрутизацию. Сначала проверяют сообщение в топике, затем настройку
  графика.
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
question: Запись занимает 16 байт. Каков объём 500 записей без файловых накладных расходов?
answer: 8000
unit: байт
tolerance_percent: 1
hint: V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного места.
explanation: "500×16 = 8\_000 байт."
```

```quiz
id: transfer
type: numeric
question: Запись занимает 16 байт. Каков объём 600 записей без файловых накладных расходов?
answer: 9600
unit: байт
tolerance_percent: 1
hint: V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного места.
explanation: "600×16 = 9\_600 байт."
```

```checkpoint
items:
  - Сначала проверяют сообщение в топике, затем настройку графика.
  - Проверь топик командным клиентом или панелью брокера перед подключением автоматизации.
  - >-
    V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного
    места.
```
