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
