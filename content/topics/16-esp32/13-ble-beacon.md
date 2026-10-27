---
id: ble-beacon
title: Проект «BLE-датчик температуры»
icon: bluetooth
summary: "ESP32 с BME280 передаёт температуру и влажность по BLE: GATT-сервис, уведомления и чтение на телефоне в nRF Connect."
kind: project
optional: false
level: 3
minutes: 75
prerequisites: [ble, web-sensor-server]
objectives:
  - Создать BLE-сервис Environmental Sensing с температурой и влажностью и включить уведомления
  - Подключиться телефоном (nRF Connect) и разобрать значения характеристик
  - Оценить энергопотребление BLE и сравнить с Wi-Fi
glossary:
  - ble
  - mcu
  - i2c
flashcards:
  - q: Как закодирована температура в характеристике 0x2A6E?
    a: "Знаковое 16-битное целое в сотых долях градуса, байты little-endian: 23,45 °C → 2345 → 0x2909."
  - q: Что показывает nRF Connect?
    a: Рассылаемые устройства, их сервисы и характеристики; позволяет читать значения и подписываться на уведомления.
  - q: Почему BLE подходит для батарейных датчиков?
    a: Короткие пакеты и паузы дают средний ток в сотни микроампер — единицы миллиампер против 80–120 мА у Wi-Fi.
---

## Цель

Сделаем «термометр с Bluetooth»: ESP32 рассылается как BLE-устройство, телефон подключается, читает температуру и влажность и получает уведомления при изменении. Для проверки хватит приложения nRF Connect — писать приложение не нужно.

## Что понадобится

- ESP32 DevKit и BME280 (SDA — GPIO21, SCL — GPIO22).
- Смартфон с приложением **nRF Connect for Mobile** (бесплатно).
- Библиотеки: Adafruit BME280 и встроенная BLE для ESP32.

Цены условные, проверяй актуальные.

## Расчёт

- **Кодирование температуры:** значение × 100 → знаковое 16 бит. 23,45 °C → 2345 → 0x0929 → байты **0x29 0x09** (little-endian).
- **Влажность:** 48 % → 4800 (беззнаковое 16 бит, сотые доли процента) → 0x12C0.
- **Размер пакета:** значение 2 байта; уведомление ≈ 7 байт с заголовком.
- **Потребление (порядок):** BLE рассылка и редкие уведомления — в среднем 0,3–5 мА, Wi-Fi 80–120 мА.
- **Интервал уведомлений:** раз в 2 с; при 3000 мА·ч и среднем токе 2 мА — ≈ 1500 ч ≈ 62 суток (без deep sleep).

```figure
file: ble-beacon/link.svg
alt: "Схема. Слева ESP32-Temp с GATT: сервис 0x181A, характеристика 0x2A6E с чтением и уведомлением. Справа телефон с nRF Connect: сканирование, подключение, подписка на уведомления. Двусторонняя стрелка: рассылка и соединение."
caption: "BLE-датчик и телефон: рассылка, соединение, уведомления."
```

```figure
file: ble-beacon/values.svg
alt: "Таблица значений характеристики температуры. 18,00 °C: целое 1800, байты 0x0807 (little-endian 0x07 0x08). 23,45 °C: 2345, 0x2909. 26,00 °C: 2600, 0x280A."
caption: "Значения температуры и их байты в характеристике."
```

```example
title: Разбор байтов в nRF Connect
steps:
  - "Приложение показывает значение характеристики 0x2A6E: 29 09."
  - "Little-endian: младший байт 0x29 первым. Собираем 0x0929 = 2345."
  - "Делим на 100: 2345/100 = 23,45 °C."
  - "Для влажности: C0 12 → 0x12C0 = 4800 → 48,00 %."
result: 23,45 °C и 48 %
```

```quiz
id: calc-1
type: numeric
question: Сам. Температура 21,50 °C. Какое целое число (сотые доли градуса) записывается в характеристику?
answer: 2150
unit: ед.
tolerance_percent: 1
hint: 21,50·100.
explanation: 2150 = 0x0866.
```

## Сборка по шагам

1. Подключи BME280 к ESP32 (3,3 В, GND, SDA — GPIO21, SCL — GPIO22).
2. Загрузи скетч:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

#define SERVICE_UUID "181A"     // Environmental Sensing
#define TEMP_UUID    "2A6E"
#define HUM_UUID     "2A6F"

Adafruit_BME280 bme;
BLECharacteristic* tempChar;
BLECharacteristic* humChar;

void setup() {
  Wire.begin(21, 22);
  bme.begin(0x76);
  BLEDevice::init("ESP32-Temp");
  BLEServer* server = BLEDevice::createServer();
  BLEService* service = server->createService(SERVICE_UUID);
  tempChar = service->createCharacteristic(TEMP_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  humChar = service->createCharacteristic(HUM_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  tempChar->addDescriptor(new BLE2902());
  humChar->addDescriptor(new BLE2902());
  service->start();
  BLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  BLEDevice::startAdvertising();
}

void loop() {
  int16_t t = (int16_t)(bme.readTemperature() * 100);     // сотые доли °C
  uint16_t h = (uint16_t)(bme.readHumidity() * 100);      // сотые доли %
  tempChar->setValue((uint8_t*)&t, 2);
  humChar->setValue((uint8_t*)&h, 2);
  tempChar->notify();
  humChar->notify();
  delay(2000);
}
```

3. Установи на телефон nRF Connect, нажми SCAN и найди «ESP32-Temp».
4. Подключись (CONNECT), открой сервис Environmental Sensing, нажми кнопку чтения у 0x2A6E, затем включи уведомления (значок «три стрелки»).
5. Разбери байты вручную и сверь с эталонным термометром.
6. Отключи телефон и снова подключись: сервис должен снова рассылаться.

| Значение | Байты (nRF) | Расчёт |
|---|---|---|
| Температура | | |
| Влажность | | |

## Проверка

Ожидай: устройство видно в списке по имени; значения читаются; уведомления приходят раз в 2 с; температура близка к эталону (±1 °C). Расстояние связи 5–10 м в помещении.

```quiz
id: check-1
type: numeric
question: Байты характеристики температуры 0x10 0x0A (little-endian) — какое целое число? Ответ в десятичной записи.
answer: 2576
unit: ед.
tolerance_percent: 1
hint: 0x0A10 = 10·256 + 16.
explanation: 0x0A10 = 2576, температура 25,76 °C.
```

```quiz
id: check-2
type: single
question: Телефон не видит устройство в nRF Connect. Что проверить?
options:
  - Что скетч запущен и включена рассылка, Bluetooth на телефоне включён и устройство рядом
  - Пароль Wi-Fi
  - Размер Flash
answer: 0
hint: Рассылка (advertising).
explanation: Если рассылка не запущена, телефон ничего не увидит; проверьте скетч, питание и расстояние.
```

## Если не работает

- **Устройство не видно.** Нет рассылки (startAdvertising), далеко от телефона, нужно разрешить геолокацию на Android.
- **Значения не обновляются.** Не включены уведомления на телефоне или нет дескриптора BLE2902.
- **Значения странные.** Порядок байтов little-endian; проверь деление на 100.
- **Сбои при подключении.** Мало памяти из-за Wi-Fi: в этом проекте Wi-Fi не нужен.
- **Датчик показывает нули.** BME280 не найден: адрес и провода.

```callout
kind: mistake
text: "Забывают добавить дескриптор BLE2902: характеристика с notify без него не поддерживает подписку, и телефон не получает уведомления. Дескриптор добавляется для каждой характеристики с notify."
```

## Безопасность

```callout
kind: safety
text: "Питай схему от USB или заводского блока 5 В. Не оставляй открытую рассылку с важными данными: любой в радиусе 10 метров может прочитать значения. Для чувствительных данных включай сопряжение и шифрование. Не подключай схему к сети 220 В."
```

## Идеи развития

- Добавь характеристику давления (0x2A6D) и батареи (Battery Service 0x180F).
- Реализуй deep sleep с пробуждением и рассылкой раз в минуту.
- Напиши страницу на Web Bluetooth для Chrome и читай данные без приложения.
- Измерь среднее потребление и сравни с Wi-Fi-вариантом.

```checkpoint
items:
  - "BLE-датчик: сервис 0x181A, характеристики 0x2A6E (sint16, сотые доли °C) и 0x2A6F (uint16), права read и notify."
  - "Байты little-endian: 23,45 °C → 2345 → 0x29 0x09; для notify нужен дескриптор BLE2902."
  - nRF Connect показывает рассылку, сервисы и значения; BLE экономичнее Wi-Fi на два порядка.
```
