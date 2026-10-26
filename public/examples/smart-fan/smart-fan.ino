#include <math.h>
float temperature(){
 int code=analogRead(A0);
 if(code<=0 || code>=1023) return NAN;
 float r=10000.0f*code/(1024.0f-code);
 return 1.0f/(1.0f/298.15f+log(r/10000.0f)/3950.0f)-273.15f;
}
void setup(){pinMode(9,OUTPUT);analogWrite(9,0);Serial.begin(9600);}
void loop(){
 float t=temperature();int duty;
 if(isnan(t))duty=255; // При неисправном датчике охлаждение включено.
 else if(t<25)duty=0;
 else duty=constrain((int)(100+(t-25)*10),100,255);
 analogWrite(9,duty);Serial.println(t);delay(100);
}
