# Первичные источники для проверки компонентов

Материал и рисунки курса написаны самостоятельно. Ниже документация для уточнения выводов, рабочих условий и API. Дата сверки: 26 октября 2026. Сайт не загружает эти страницы при работе; ссылки предназначены для самостоятельной проверки.

- [Arduino Uno R3: описание](https://docs.arduino.cc/hardware/uno-rev3/), [схема оригинальной платы](https://docs.arduino.cc/resources/schematics/A000066-schematics.pdf) — питание, оба МК, сброс, тактирование. Ревизии и клоны могут отличаться.
- [ATmega328P datasheet, Microchip](https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf) — пределы, GPIO и периферия; проверяй актуальный документ своего варианта.
- [ESP32 datasheet, Espressif](https://documentation.espressif.com/esp32_datasheet_en.html) — классический ESP32, питание, ограничения выводов.
- [ESP32 GPIO, ESP-IDF](https://documentation.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html) — входные выводы, подтяжки, ограничения.
- [Arduino-ESP32 LEDC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html) — ledcAttach/ledcWrite в используемом API.
- [LM317 datasheet, Texas Instruments](https://www.ti.com/lit/ds/symlink/lm317.pdf) — регулировка выхода и условия применения.
- [LM2596 datasheet, Texas Instruments](https://www.ti.com/lit/ds/symlink/lm2596.pdf) — дроссель, диод, конденсаторы и обратная связь несинхронного buck.
- [Adafruit BME280: официальный пример библиотеки](https://github.com/adafruit/Adafruit_BME280_Library/blob/master/examples/bme280test/bme280test.ino) — инициализация и чтение датчика.
- [PubSubClient API](https://pubsubclient.knolleary.net/api) — подключение, публикация и обработка MQTT.

Учебный код не подменяет проверку даташита точного заказного кода, корпуса и ревизии платы. В частности, для TP4056/DW01, USB-UART, LDO и готовых модулей надо установить конкретного изготовителя перед сборкой.

