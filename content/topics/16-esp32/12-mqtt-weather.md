---
id: mqtt-weather
title: Проект «Метеостанция на MQTT»
icon: cloud-sun
summary: "BME280 → ESP32 → MQTT → брокер Mosquitto → график в Node-RED или Home Assistant: публикация показаний и статус online/offline."
kind: project
optional: false
level: 3
minutes: 95
prerequisites: [mqtt, web-sensor-server, esp32-wifi]
objectives:
  - Публиковать показания BME280 в MQTT-топики с периодом 30 с и настроить LWT
  - Установить брокер и подписаться на топики программой mosquitto_sub
  - Оценить объём данных и выбрать способ отображения (Node-RED, Home Assistant)
glossary:
  - mqtt
  - i2c
  - mcu
flashcards:
  - q: Какие топики использует метеостанция?
    a: weather/temp, weather/hum, weather/press — показания; weather/status — online при подключении и offline по LWT.
  - q: Как проверить работу без браузера?
    a: "Командой mosquitto_sub -h адрес_брокера -t \"weather/#\" -v: видны все сообщения с топиками."
  - q: Как посчитать объём данных в сутки?
    a: "Размер сообщения × число сообщений: 3 топика по 25 байт раз в 30 с — 2880 циклов · 75 ≈ 216 КБ в сутки."
---

## Цель

Превратим ESP32 с BME280 в метеостанцию для умного дома: датчик публикует температуру, влажность и давление в MQTT, а программа (Node-RED, Home Assistant или простая страница) рисует график. Проект закрепляет MQTT на практике, показывает, чем «издатель-подписчик» удобнее прямых запросов.

## Что понадобится

- ESP32 DevKit и BME280 (подключение как в предыдущем проекте).
- Компьютер или мини-ПК (Raspberry Pi) с брокером **Mosquitto**.
- Библиотеки Adafruit BME280 и PubSubClient.
- Node-RED или Home Assistant (по желанию) для графика.

Цены условные, проверяй актуальные.

## Расчёт

- **Топики:** weather/temp, weather/hum, weather/press (QoS 0), weather/status (retained, LWT).
- **Размер сообщения:** топик 12–14 байт + значение 4 байта + служебные ≈ 25 байт.
- **Объём в сутки:** три топика · 2880 публикаций · 25 байт ≈ **216 КБ/сутки**.
- **Энергия:** ESP32 в Wi-Fi 100 мА: от USB — норма; от батареи нужен deep sleep (отдельный проект).
- **Задержка графика:** интервал 30 с; Node-RED обновит график сразу после публикации.

```figure
file: mqtt-weather/pipeline.svg
alt: "Схема цепочки. BME280 соединён с ESP32, который по Wi-Fi публикует показания раз в 30 секунд на брокер Mosquitto. Брокер раздаёт сообщения подписчикам: Node-RED с графиком и историей и Home Assistant или приложению на телефоне."
caption: "Метеостанция: датчик, ESP32, брокер и подписчики."
```

```figure
file: mqtt-weather/topics.svg
alt: "Таблица топиков метеостанции. weather/temp пример значения 23.4 период 30 секунд; weather/hum 48 период 30 секунд; weather/press 1012 период 30 секунд; weather/status online или offline по LWT при подключении."
caption: "Топики метеостанции."
```

```example
title: Проверка без графика
steps:
  - "На компьютере с брокером выполняем: mosquitto_sub -h 192.168.1.10 -t \"weather/#\" -v"
  - "Включаем ESP32: появляется weather/status online."
  - "Каждые 30 с в консоли строки weather/temp 23.4, weather/hum 48, weather/press 1012."
  - "Отключаем питание ESP32: через 15–30 с брокер публикует weather/status offline (LWT)."
result: видны показания и статус online/offline
```

```quiz
id: calc-1
type: numeric
question: Сам. Три топика по 25 байт публикуются раз в 60 с. Сколько килобайт в сутки?
answer: 108
unit: КБ
tolerance_percent: 3
hint: 3·25·1440.
explanation: 75 · 1440 = 108 000 байт = 108 КБ.
```

## Сборка по шагам

1. Установи Mosquitto на компьютер или Raspberry Pi (`sudo apt install mosquitto mosquitto-clients`), разреши подключения из сети (listener 1883, allow_anonymous для учебной сети).
2. Подключи BME280 к ESP32: SDA — GPIO21, SCL — GPIO22, 3,3 В, GND.
3. Загрузи скетч:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

const char* SSID = "имя_сети";
const char* PASS = "пароль_сети";
const char* BROKER = "192.168.1.10";

Adafruit_BME280 bme;
WiFiClient net;
PubSubClient mqtt(net);

void connectMqtt() {
  while (!mqtt.connected()) {
    // LWT: weather/status = offline, retained
    if (mqtt.connect("esp32-weather", nullptr, nullptr, "weather/status", 1, true, "offline")) {
      mqtt.publish("weather/status", "online", true);
    } else delay(2000);
  }
}

void publishValue(const char* topic, float value, int digits) {
  char buf[16];
  dtostrf(value, 0, digits, buf);
  mqtt.publish(topic, buf);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bme.begin(0x76);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  mqtt.setServer(BROKER, 1883);
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();
  static unsigned long last = 0;
  if (millis() - last > 30000UL) {
    last = millis();
    publishValue("weather/temp", bme.readTemperature(), 1);
    publishValue("weather/hum", bme.readHumidity(), 0);
    publishValue("weather/press", bme.readPressure() / 100.0F, 0);
  }
}
```

4. На компьютере выполни `mosquitto_sub -h <адрес> -t "weather/#" -v` и убедись, что показания приходят.
5. (По желанию) создай в Node-RED поток: узел mqtt in (weather/temp) → узел chart.
6. Через 10 минут запиши минимум и максимум температуры.

| Параметр | Значение |
|---|---|
| Топик weather/temp, последнее значение | |
| Период публикации, с | 30 |
| Статус при выключении ESP32 | offline |

## Проверка

Ожидай: в консоли подписчика каждые 30 с три строки; статус online при подключении и offline после отключения питания; график в Node-RED строится по точкам; объём данных мал (≈ 216 КБ в сутки).

```quiz
id: check-1
type: numeric
question: Публикация раз в 30 с. Сколько публикаций одного топика в сутки?
answer: 2880
unit: сообщений
tolerance_percent: 1
hint: 86 400/30.
explanation: 2880.
```

```quiz
id: check-2
type: single
question: ESP32 публикует, но подписчик ничего не получает. Что проверить в первую очередь?
options:
  - Адрес брокера и доступность порта 1883, топик подписки
  - Яркость экрана
  - Цвет проводов
answer: 0
hint: Связь с брокером.
explanation: Чаще всего неверный адрес брокера, брандмауэр на порту 1883 или опечатка в топике.
```

## Если не работает

- **Нет подключения к брокеру.** Проверь IP, порт 1883 и разрешение внешних подключений в конфигурации.
- **Сообщения «вылетают» у двух устройств.** Одинаковый client ID: у каждого устройства должен быть свой.
- **Топик не совпадает.** Проверь регистр букв и слэши.
- **Значения «nan».** BME280 не найден: адрес 0x76/0x77.
- **График пуст.** Подписка в Node-RED на другой топик или брокер.

```callout
kind: mistake
text: "Включают в брокере анонимный доступ и открывают порт 1883 в интернет: любой подключится и сможет читать и менять данные. Для домашней сети достаточно пароля, при выходе в интернет нужны TLS и авторизация."
```

## Безопасность

```callout
kind: safety
text: "Питай устройства от USB или заводского блока 5 В; не подключай их к сети 220 В. Не размещай брокер без защиты в интернете: используй пароль и ограничивай доступ локальной сетью."
```

## Идеи развития

- Подключи брокер к Home Assistant и покажи карточку погоды.
- Добавь отправку в формате JSON и подписку на «команды» (например, включение вентилятора).
- Переведи датчик на deep sleep (следующий проект) и сравни срок работы.
- Сохраняй историю в базу InfluxDB и строй графики Grafana.

```checkpoint
items:
  - Метеостанция публикует weather/temp, weather/hum, weather/press раз в 30 с; weather/status показывает online и по LWT offline.
  - Брокер Mosquitto рассылает сообщения подписчикам; проверка — mosquitto_sub с шаблоном weather/#.
  - Данных мало (≈ 216 КБ в сутки), у каждого клиента свой ID, доступ к брокеру защищают.
```
