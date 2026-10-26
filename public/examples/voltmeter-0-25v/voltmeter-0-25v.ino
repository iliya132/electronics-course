const float measuredReference=5.00f;
const float ratio=(33000.0f+6800.0f)/6800.0f;
void setup(){Serial.begin(9600);}
void loop(){
 long sum=0;for(byte i=0;i<16;i++)sum+=analogRead(A0);
 float code=sum/16.0f;
 float voltage=code*measuredReference/1024.0f*ratio;
 Serial.println(voltage,3);delay(250);
}
