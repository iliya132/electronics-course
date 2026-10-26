---
id: ble-beacon
title: BLE-датчик температуры
icon: bluetooth
summary: Подписка на уведомления отличается от разового чтения характеристики.
kind: project
optional: false
level: 3
minutes: 60
prerequisites:
  - mqtt-weather
objectives:
  - 'Собрать и проверить: BLE-датчик температуры'
  - Сопоставить расчёт с измерениями и найти причину отклонения
glossary:
  - ble
flashcards:
  - q: Что проверяем в проекте «BLE-датчик температуры»?
    a: Подписка на уведомления отличается от разового чтения характеристики.
  - q: Как найти ошибку?
    a: >-
      Неверное питание или адрес BME280. Выбран другой ESP32-вариант или неподходящая версия
      библиотеки. Связь отсутствует или источник питания проседает.
---

## Цель

Создадим BLE-датчик температуры с собственной характеристикой. Телефон найдёт рекламу и прочитает значение GATT.

## Что понадобится

- Классический ESP32 DevKit, USB-кабель
- BME280 с питанием и подтяжками 3,3 В
- Библиотека Adafruit BME280 с зависимостями

Бюджет: сначала используй детали своего набора. Для планирования можно заложить 1500–5000 ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.

## Расчёт

V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного места.
```figure
file: ble-beacon/concept.svg
alt: BME280 → BLE-сервис → Телефон
caption: BME280 → BLE-сервис → Телефон
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
file: ble-beacon/model.svg
alt: Зависимость в расчётной модели проекта
caption: Модель и условия обозначены на осях.
```

## Сборка по шагам

1. Подключи BME280 к 21/22 и 3,3 В.
2. Загрузи скетч на классический ESP32 с поддержкой BLE.
3. Найди CourseSensor в приложении просмотра GATT.
4. Открой сервис с UUID 8ab70001…, прочитай характеристику 8ab70002… и включи уведомления.

[Скачать скетч .ino](/examples/ble-beacon/ble-beacon.ino)

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
BLECharacteristic* characteristic;bool sensorOK=false;unsigned long last=0;
void setup(){
 Serial.begin(115200);sensorOK=beginSensor();
 BLEDevice::init("CourseSensor");
 BLEServer* server=BLEDevice::createServer();
 BLEService* service=server->createService("8ab70001-11aa-44bb-8899-aabbccddeeff");
 characteristic=service->createCharacteristic("8ab70002-11aa-44bb-8899-aabbccddeeff",BLECharacteristic::PROPERTY_READ|BLECharacteristic::PROPERTY_NOTIFY);
 characteristic->addDescriptor(new BLE2902());service->start();
 BLEAdvertising* advertising=BLEDevice::getAdvertising();advertising->addServiceUUID(service->getUUID());advertising->start();
}
void loop(){
 if((unsigned long)(millis()-last)<2000)return;last=millis();
 String value=sensorOK?String(bme.readTemperature(),2):"sensor error";
 characteristic->setValue(value.c_str());characteristic->notify();
}
```

## Проверка

Строка температуры обновляется раз в 2 с. После отключения телефона повторная реклама может требовать обработки disconnect-события; это отдельное улучшение проекта.

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
  Чтение автоматически включает уведомления навсегда. Подписка на уведомления отличается от разового
  чтения характеристики.
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
  - Подписка на уведомления отличается от разового чтения характеристики.
  - >-
    Для первого опыта передавай простой текст температуры и проверяй UUID, а не сложный бинарный
    формат.
  - >-
    V = N·B; N — число записей, B — байтов на запись. Файловая система требует дополнительного
    места.
```
