#include <esp_sleep.h>
const int PUMP=25,SOIL=34,FLOAT_SWITCH=27;
RTC_DATA_ATTR unsigned long cyclesSinceWater=24;
const unsigned long maxPumpMs=3000;
void setup(){
 pinMode(PUMP,OUTPUT);digitalWrite(PUMP,LOW);
 pinMode(FLOAT_SWITCH,INPUT_PULLUP);Serial.begin(115200);
 analogReadResolution(12);
 unsigned long sum=0;for(int i=0;i<16;i++){sum+=analogRead(SOIL);delay(10);}
 int raw=sum/16;cyclesSinceWater++;
 // Пример порога: заменить после своей калибровки; ADC 0/4095 — отказ.
 bool valid=raw>100 && raw<4000;
 // Поплавок замкнут на GND только при достаточном запасе воды.
 bool waterPresent=digitalRead(FLOAT_SWITCH)==LOW;
 if(valid && raw>2800 && waterPresent && cyclesSinceWater>=24){
  cyclesSinceWater=0;unsigned long start=millis();digitalWrite(PUMP,HIGH);
  while(millis()-start<maxPumpMs && digitalRead(FLOAT_SWITCH)==LOW)delay(10);
  digitalWrite(PUMP,LOW);
 }
 digitalWrite(PUMP,LOW);Serial.print("ADC=");Serial.println(raw);Serial.flush();
 esp_sleep_enable_timer_wakeup(900ULL*1000000ULL);esp_deep_sleep_start();
}
void loop(){}
