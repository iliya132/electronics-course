const byte red=8,yellow=9,green=10,buttonPin=2;
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
}
