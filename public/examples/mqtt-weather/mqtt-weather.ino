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
