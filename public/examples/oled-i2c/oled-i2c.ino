#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 display(128,64,&Wire,-1);
void setup(){
 if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C))while(true){}
 display.clearDisplay();display.setTextColor(SSD1306_WHITE);display.setTextSize(1);display.setCursor(0,0);
 display.println("Electronics course");display.display();
}
void loop(){}
