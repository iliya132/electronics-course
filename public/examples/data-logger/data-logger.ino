#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <RTClib.h>
Adafruit_INA219 ina;
Adafruit_SSD1306 oled(128,64,&Wire,-1);
RTC_DS3231 rtc;
bool ready=false; unsigned long last=0;
const float currentScale=1.0; // После сравнения с эталоном.
void setup(){
 Serial.begin(115200);Wire.begin(21,22);SPI.begin(18,19,23,5);
 bool a=ina.begin(), b=rtc.begin(), c=SD.begin(5);
 bool d=oled.begin(SSD1306_SWITCHCAPVCC,0x3C);
 if(b && rtc.lostPower()){
  Serial.println("Set RTC time before recording");return;
 }
 ready=a&&b&&c&&d;
 Serial.println(ready?"ready":"check modules");
}
void loop(){
 if(!ready || (unsigned long)(millis()-last)<1000)return;last=millis();
 float volts=ina.getBusVoltage_V()+ina.getShuntVoltage_mV()/1000.0;
 float mA=ina.getCurrent_mA()*currentScale;DateTime now=rtc.now();
 File f=SD.open("/measure.csv",FILE_APPEND);
 if(!f){Serial.println("SD open failed");return;}
 f.print(now.timestamp());f.print(',');f.print(volts,3);f.print(',');f.println(mA,2);f.close();
 oled.clearDisplay();oled.setTextColor(SSD1306_WHITE);oled.setTextSize(1);
 oled.setCursor(0,0);oled.print(volts,3);oled.println(" V");oled.print(mA,2);oled.println(" mA");oled.display();
}
