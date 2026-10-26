#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>
float temperature(){
 int code=analogRead(A0);
 if(code<=0 || code>=1023) return NAN;
 float r=10000.0f*code/(1024.0f-code);
 return 1.0f/(1.0f/298.15f+log(r/10000.0f)/3950.0f)-273.15f;
}
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
}
