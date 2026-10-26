#include <WiFi.h>
#include <PubSubClient.h>
#include <esp_sleep.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
const char* ssid="YOUR_WIFI";const char* password="YOUR_PASSWORD";
WiFiClient transport;PubSubClient mqtt(transport);
void setup(){
 Serial.begin(115200);bool ok=beginSensor();
 WiFi.begin(ssid,password);unsigned long start=millis();
 while(WiFi.status()!=WL_CONNECTED && millis()-start<12000)delay(100);
 if(ok && WiFi.status()==WL_CONNECTED){
  mqtt.setServer("192.168.1.10",1883);mqtt.setSocketTimeout(3);
  String id="weather-"+String((uint32_t)ESP.getEfuseMac(),HEX);
  if(mqtt.connect(id.c_str())){
   char json[96];snprintf(json,sizeof(json),"{\"t\":%.2f,\"h\":%.2f}",bme.readTemperature(),bme.readHumidity());
   bool sent=mqtt.publish("course/weather",json);Serial.println(sent?"sent":"failed");mqtt.loop();mqtt.disconnect();
  }
 }
 WiFi.disconnect(true);Serial.flush();
 esp_sleep_enable_timer_wakeup(600ULL*1000000ULL);esp_deep_sleep_start();
}
void loop(){}
