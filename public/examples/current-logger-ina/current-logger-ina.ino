#include <Wire.h>
#include <Adafruit_INA219.h>
Adafruit_INA219 ina;unsigned long previous=0;double wattHours=0;
void setup(){Serial.begin(9600);if(!ina.begin())while(true){} previous=millis();Serial.println("ms,V,mA,Wh");}
void loop(){
 unsigned long now=millis(),dt=now-previous;if(dt<1000)return;previous=now;
 float v=ina.getBusVoltage_V()+ina.getShuntVoltage_mV()/1000.0f;
 float ma=ina.getCurrent_mA();wattHours+=v*(ma/1000.0f)*dt/3600000.0;
 Serial.print(now);Serial.print(',');Serial.print(v);Serial.print(',');Serial.print(ma);Serial.print(',');Serial.println(wattHours,6);
}
