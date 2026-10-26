export const sensorBase=String.raw`#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}`;
export const web=String.raw`#include <WiFi.h>
#include <WebServer.h>
${sensorBase}
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
  if(!sensorOK){server.send(503,"application/json","{\"error\":\"sensor\"}");return;}
  String json="{\"temperature\":"+String(bme.readTemperature(),2)+",\"humidity\":"+String(bme.readHumidity(),2)+"}";
  server.send(200,"application/json",json);
 });server.begin();
}
void loop(){server.handleClient();}`;
export const mqtt=String.raw`#include <WiFi.h>
#include <PubSubClient.h>
${sensorBase}
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
}`;
export const ble=String.raw`#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
${sensorBase}
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
}`;
export const sleep=String.raw`#include <esp_sleep.h>
${sensorBase}
RTC_DATA_ATTR uint32_t boots=0;
void setup(){
 Serial.begin(115200);boots++;
 if(beginSensor())Serial.printf("Boot %lu: %.2f C\n",(unsigned long)boots,bme.readTemperature());
 else Serial.println("Sensor error");
 Serial.flush();esp_sleep_enable_timer_wakeup(600ULL*1000000ULL);esp_deep_sleep_start();
}
void loop(){}`;
export const weather=String.raw`#include <WiFi.h>
#include <PubSubClient.h>
#include <esp_sleep.h>
${sensorBase}
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
void loop(){}`;

