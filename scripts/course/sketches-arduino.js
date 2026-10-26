export const blink=`void setup(){ pinMode(LED_BUILTIN, OUTPUT); }
void loop(){
 digitalWrite(LED_BUILTIN,HIGH); delay(500);
 digitalWrite(LED_BUILTIN,LOW); delay(500);
}`;
export const button=`const byte buttonPin=2;
bool rawOld=HIGH, stable=HIGH;
unsigned long changed=0;
void setup(){ pinMode(buttonPin,INPUT_PULLUP); pinMode(13,OUTPUT); }
void loop(){
 bool raw=digitalRead(buttonPin);
 if(raw!=rawOld){ changed=millis(); rawOld=raw; }
 if((unsigned long)(millis()-changed)>=30) stable=raw;
 digitalWrite(13,stable==LOW);
}`;
export const fsm=`const byte red=8,yellow=9,green=10,buttonPin=2;
enum State { GREEN, YELLOW, RED }; State state=GREEN;
unsigned long entered=0,changed=0; bool oldRaw=HIGH,stable=HIGH,request=false;
void lights(){ digitalWrite(red,state==RED);digitalWrite(yellow,state==YELLOW);digitalWrite(green,state==GREEN); }
void setup(){ pinMode(red,OUTPUT);pinMode(yellow,OUTPUT);pinMode(green,OUTPUT);pinMode(buttonPin,INPUT_PULLUP); lights(); }
void loop(){
 unsigned long now=millis(); bool raw=digitalRead(buttonPin);
 if(raw!=oldRaw){oldRaw=raw;changed=now;}
 if((unsigned long)(now-changed)>=30 && stable!=raw){stable=raw;if(stable==LOW)request=true;}
 unsigned long elapsed=now-entered;
 if(state==GREEN && request && elapsed>=3000){state=YELLOW;entered=now;}
 else if(state==YELLOW && elapsed>=1000){state=RED;entered=now;}
 else if(state==RED && elapsed>=5000){state=GREEN;entered=now;request=false;}
 lights();
}`;
export const ntc=`#include <math.h>
float temperature(){
 int code=analogRead(A0);
 if(code<=0 || code>=1023) return NAN;
 float r=10000.0f*code/(1024.0f-code);
 return 1.0f/(1.0f/298.15f+log(r/10000.0f)/3950.0f)-273.15f;
}`;
export const thermometer=`#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
${ntc}
Adafruit_SSD1306 display(128,64,&Wire,-1);
float low=1000,high=-1000; unsigned long started=0,last=0;
void setup(){ Serial.begin(9600); if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C))while(true){} started=millis(); }
void loop(){
 unsigned long now=millis(); if((unsigned long)(now-last)<1000)return; last=now;
 if((unsigned long)(now-started)>=86400000UL){low=1000;high=-1000;started=now;}
 float t=temperature();display.clearDisplay();display.setTextColor(SSD1306_WHITE);display.setTextSize(1);display.setCursor(0,0);
 if(isnan(t))display.println("Sensor error");
 else {low=min(low,t);high=max(high,t);display.print("T: ");display.println(t);display.print("Min: ");display.println(low);display.print("Max: ");display.println(high);}
 display.display();Serial.println(t);
}`;
export const voltmeter=`const float measuredReference=5.00f;
const float ratio=(33000.0f+6800.0f)/6800.0f;
void setup(){Serial.begin(9600);}
void loop(){
 long sum=0;for(byte i=0;i<16;i++)sum+=analogRead(A0);
 float code=sum/16.0f;
 float voltage=code*measuredReference/1024.0f*ratio;
 Serial.println(voltage,3);delay(250);
}`;
export const fan=`${ntc}
void setup(){pinMode(9,OUTPUT);analogWrite(9,0);Serial.begin(9600);}
void loop(){
 float t=temperature();int duty;
 if(isnan(t))duty=255; // При неисправном датчике охлаждение включено.
 else if(t<25)duty=0;
 else duty=constrain((int)(100+(t-25)*10),100,255);
 analogWrite(9,duty);Serial.println(t);delay(100);
}`;
export const ina=`#include <Wire.h>
#include <Adafruit_INA219.h>
Adafruit_INA219 ina;unsigned long previous=0;double wattHours=0;
void setup(){Serial.begin(9600);if(!ina.begin())while(true){} previous=millis();Serial.println("ms,V,mA,Wh");}
void loop(){
 unsigned long now=millis(),dt=now-previous;if(dt<1000)return;previous=now;
 float v=ina.getBusVoltage_V()+ina.getShuntVoltage_mV()/1000.0f;
 float ma=ina.getCurrent_mA();wattHours+=v*(ma/1000.0f)*dt/3600000.0;
 Serial.print(now);Serial.print(',');Serial.print(v);Serial.print(',');Serial.print(ma);Serial.print(',');Serial.println(wattHours,6);
}`;
export const scanner=`#include <Wire.h>
void setup(){
 Serial.begin(9600);Wire.begin();
 for(byte address=1;address<127;address++){
  Wire.beginTransmission(address);
  if(Wire.endTransmission()==0){Serial.print("Found 0x");Serial.println(address,HEX);}
 }
}
void loop(){}`;
export const oled=`#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 display(128,64,&Wire,-1);
void setup(){
 if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C))while(true){}
 display.clearDisplay();display.setTextColor(SSD1306_WHITE);display.setTextSize(1);display.setCursor(0,0);
 display.println("Electronics course");display.display();
}
void loop(){}`;
export const sdLogger=`#include <SPI.h>
#include <SD.h>
${ntc}
unsigned long last=0;
void setup(){Serial.begin(9600);pinMode(10,OUTPUT);if(!SD.begin(10)){Serial.println("SD error");while(true){}}}
void loop(){
 unsigned long now=millis();if((unsigned long)(now-last)<1000)return;last=now;
 File file=SD.open("TEMP.CSV",FILE_WRITE);
 if(file){file.print(now);file.print(',');file.println(temperature(),2);file.close();}
 else Serial.println("Write error");
}`;

