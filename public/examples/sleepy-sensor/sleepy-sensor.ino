#include <esp_sleep.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
RTC_DATA_ATTR uint32_t boots=0;
void setup(){
 Serial.begin(115200);boots++;
 if(beginSensor())Serial.printf("Boot %lu: %.2f C\n",(unsigned long)boots,bme.readTemperature());
 else Serial.println("Sensor error");
 Serial.flush();esp_sleep_enable_timer_wakeup(600ULL*1000000ULL);esp_deep_sleep_start();
}
void loop(){}
