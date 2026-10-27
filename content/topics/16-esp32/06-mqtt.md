---
id: mqtt
title: MQTT
icon: radio-tower
summary: "Лёгкий протокол «издатель — подписчик»: брокер, топики, publish и subscribe, QoS, retained и интеграция с Home Assistant."
kind: lesson
optional: false
level: 2
minutes: 25
prerequisites: [esp32-wifi, uart]
objectives:
  - Объяснять модель publish/subscribe и роль брокера и топиков
  - Выбирать уровень QoS и понимать retained-сообщения и LWT
  - Писать код отправки показаний на ESP32 и подписки на команды
glossary:
  - mqtt
  - mcu
  - frequency
flashcards:
  - q: Как устроен MQTT?
    a: Клиенты публикуют сообщения в топики на брокер, подписчики получают их; издатель и подписчик друг о друге не знают.
  - q: Что такое топик?
    a: "Иерархическая строка вроде home/livingroom/temp; подписка поддерживает шаблоны (+ для одного уровня, # для всех нижних)."
  - q: Какие бывают уровни QoS?
    a: 0 — не более одного раза; 1 — не менее одного раза (возможны дубли); 2 — ровно один раз.
  - q: Для чего retained и LWT?
    a: Retained хранит последнее значение топика для новых подписчиков; LWT («последняя воля») публикуется брокером, если клиент пропал.
---

Запрос «дай температуру» из браузера хорош для одного датчика. А если датчиков десять, а потребителей данных пять: телефон, база, график, умный дом? Каждый должен опрашивать каждого? Нет — проще, чтобы датчики «кричали» в общий канал, а потребители слушали. Так работает MQTT.

```predict
id: p1
question: Датчик публикует температуру в топик home/room/temp. Сколько потребителей может получить это сообщение?
options:
  - Только один
  - Все подписанные на этот топик
  - Никто, пока датчик не получит запрос
answer: 1
reveal: Брокер рассылает сообщение всем подписчикам топика. Датчику не нужно знать, кто его слушает.
```

## Модель publish/subscribe

В центре — **брокер** (например, Mosquitto на Raspberry Pi или ПК). Клиенты подключаются к нему по TCP (порт 1883). Клиент может **публиковать** сообщения в **топики** и **подписываться** на топики. Топики иерархичны: `home/room/temp`; подписка `home/+/temp` ловит все комнаты, `home/#` — всё под `home`.

```figure
file: mqtt/pubsub.svg
alt: "Схема MQTT. Слева два клиента: ESP32-датчик публикует в топик home/room/temp, ESP32-реле подписан на home/room/relay. В центре брокер mosquitto на порту 1883. Справа два подписчика: Home Assistant на home/# и телефон или Node-RED на home/room/temp. Стрелки от издателя к брокеру и от брокера ко всем подписчикам."
caption: "MQTT: издатели, брокер и подписчики; адресация по топикам."
```

```quiz
id: q1
type: single
question: Что означает подписка на топик home/#?
options:
  - Получать все сообщения во всех топиках под home
  - Получать только home
  - Публиковать в home
answer: 0
hint: Решётка — все нижние уровни.
explanation: "Символ # заменяет любое число уровней: home/#, home/room/temp, home/kitchen/humidity и так далее."
```

## QoS, retained, LWT

**QoS 0** — отправили и забыли (подходит для частых показаний), **QoS 1** — доставка не менее одного раза (подтверждение PUBACK), **QoS 2** — ровно один раз. **Retained**-сообщение хранится брокером и выдаётся новому подписчику сразу. **LWT** (last will) публикуется брокером при внезапном пропадании клиента: так узнают, что датчик «умер».

```figure
file: mqtt/qos.svg
alt: "Таблица QoS MQTT. QoS 0: не более одного раза, без подтверждения — частые показания. QoS 1: не менее одного раза, возможны дубли — команды и события. QoS 2: ровно один раз, четырёхшаговое подтверждение — критичные команды."
caption: "Уровни качества доставки MQTT."
```

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* SSID = "имя_сети";
const char* PASS = "пароль_сети";
const char* BROKER = "192.168.1.10";        // адрес брокера в сети

WiFiClient net;
PubSubClient mqtt(net);

void callback(char* topic, byte* payload, unsigned int len) {   // входящие команды
  String msg;
  for (unsigned int i = 0; i < len; i++) msg += (char)payload[i];
  Serial.println(String(topic) + ": " + msg);
}

void connectMqtt() {
  while (!mqtt.connected()) {
    if (mqtt.connect("esp32-sensor")) mqtt.subscribe("home/room/relay");
    else delay(2000);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  mqtt.setServer(BROKER, 1883);
  mqtt.setCallback(callback);
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();
  static unsigned long last = 0;
  if (millis() - last > 10000) {                   // раз в 10 секунд
    last = millis();
    mqtt.publish("home/room/temp", "23.4");        // температура строкой
  }
}
```

```example
title: Объём трафика метеостанции
steps:
  - "Сообщение: топик home/room/temp (14 байт) + значение «23.4» (4 байта) + служебные 4 байта ≈ 22 байта."
  - "Раз в 30 секунд: 2880 сообщений в сутки · 22 байта ≈ 63 КБ/сутки."
  - "Для HTTP-запроса с заголовками (≈ 300 байт) это было бы около 860 КБ/сутки — в 14 раз больше."
  - "MQTT экономит трафик и энергию — важно для батарейных датчиков."
result: около 63 КБ в сутки
```

```quiz
id: q2
type: numeric
question: Сообщение 22 байта отправляется раз в минуту. Сколько байт в сутки?
answer: 31680
unit: байт
tolerance_percent: 2
hint: 1440·22.
explanation: 1440 · 22 = 31 680 байт ≈ 31,7 КБ.
```

## Интеграция и безопасность

С брокером работают Home Assistant (интеграция MQTT), Node-RED и мобильные клиенты. Темы выбирают по схеме «домен/место/параметр»: `home/kitchen/temp`. Данные отправляют строками или JSON. Безопасность: логин и пароль на брокере, шифрование TLS при выходе в интернет.

```callout
kind: mistake
text: "Публикуют на всех клиентах с одинаковым ID: брокер отключает предыдущего при подключении следующего, и клиенты по очереди вылетают. У каждого устройства должен быть уникальный client ID (например, esp32-kitchen)."
```

```callout
kind: board
text: "ESP32 с датчиком, отправляющим данные в MQTT, обычно выглядит как маленькая плата с одним датчиком (BME280) на проводах. Брокер при этом работает на домашнем сервере или мини-ПК, а не на самом ESP32."
```

```quiz
id: q3
type: single
question: Какой QoS выбрать для частых показаний температуры?
options:
  - QoS 0
  - QoS 2
  - Любой, они одинаковы
answer: 0
hint: Потеря одного показания не критична.
explanation: "Для частых показаний хватает QoS 0: он самый лёгкий и экономичный."
```

## Практика

```quiz
id: practice-1
type: single
question: Как называется программа, принимающая и рассылающая сообщения MQTT?
options:
  - Брокер
  - Роутер
  - Прокси
answer: 0
hint: Mosquitto.
explanation: Брокер — центральный сервер MQTT.
```

```quiz
id: practice-2
type: numeric
question: Порт MQTT без шифрования? Ответ числом.
answer: 1883
unit: порт
tolerance_percent: 1
hint: Стандартный.
explanation: 1883 (8883 для TLS).
```

```quiz
id: practice-3
type: single
question: Что даёт retained-сообщение новому подписчику?
options:
  - Последнее значение топика сразу после подписки
  - Все предыдущие значения
  - Ничего
answer: 0
hint: Брокер хранит последнее значение.
explanation: Retained хранится брокером и выдаётся новым подписчикам немедленно.
```

```recall
id: r1
count: 2
```

```checkpoint
items:
  - "MQTT: брокер, топики, publish и subscribe; издатель и подписчики друг о друге не знают."
  - QoS 0/1/2 — гарантии доставки; retained хранит последнее значение, LWT сообщает о пропаже клиента.
  - Каждому клиенту нужен уникальный ID; для интеграции используют Home Assistant, Node-RED, Mosquitto.
```
