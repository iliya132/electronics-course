#include <SPI.h>
#include <SD.h>
#include <math.h>
float temperature(){
 int code=analogRead(A0);
 if(code<=0 || code>=1023) return NAN;
 float r=10000.0f*code/(1024.0f-code);
 return 1.0f/(1.0f/298.15f+log(r/10000.0f)/3950.0f)-273.15f;
}
unsigned long last=0;
void setup(){Serial.begin(9600);pinMode(10,OUTPUT);if(!SD.begin(10)){Serial.println("SD error");while(true){}}}
void loop(){
 unsigned long now=millis();if((unsigned long)(now-last)<1000)return;last=now;
 File file=SD.open("TEMP.CSV",FILE_WRITE);
 if(file){file.print(now);file.print(',');file.println(temperature(),2);file.close();}
 else Serial.println("Write error");
}
