#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
bool beginSensor(){Wire.begin(21,22);return bme.begin(0x76)||bme.begin(0x77);}
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
void loop(){server.handleClient();}
