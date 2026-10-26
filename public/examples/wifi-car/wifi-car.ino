#include <WiFi.h>
#include <WebServer.h>
WebServer server(80);
const int A1=26,A2=27,B1=32,B2=33,PA=25,PB=14,STBY=13;
unsigned long lastCommand=0;bool moving=false;
void stopMotors(){digitalWrite(STBY,LOW);ledcWrite(PA,0);ledcWrite(PB,0);moving=false;}
void drive(int left,int right){
 // Сначала отключить мост при изменении направления.
 stopMotors();
 digitalWrite(A1,left>0);digitalWrite(A2,left<0);digitalWrite(B1,right>0);digitalWrite(B2,right<0);
 ledcWrite(PA,abs(left));ledcWrite(PB,abs(right));
 digitalWrite(STBY,HIGH);lastCommand=millis();moving=true;
}
void setup(){
 pinMode(STBY,OUTPUT);digitalWrite(STBY,LOW);
 for(int p:{A1,A2,B1,B2})pinMode(p,OUTPUT);
 ledcAttach(PA,10000,8);ledcAttach(PB,10000,8);
 WiFi.mode(WIFI_AP);WiFi.softAP("CourseRobot","change-me-123");
 server.on("/",HTTP_GET,[](){
  server.send(200,"text/html; charset=utf-8",R"HTML(
<meta name="viewport" content="width=device-width">
<h1>Учебный робот</h1><p>Удерживай кнопку. Отпускание останавливает.</p>
<button data-c="f">Вперёд</button><button data-c="b">Назад</button>
<button data-c="l">Влево</button><button data-c="r">Вправо</button><button data-c="s">Стоп</button>
<script>
let timer;const send=c=>fetch('/cmd?c='+c,{method:'POST'});
function stop(){clearInterval(timer);send('s');}
document.querySelectorAll('button').forEach(b=>{
 b.onpointerdown=e=>{stop();b.setPointerCapture(e.pointerId);send(b.dataset.c);timer=setInterval(()=>send(b.dataset.c),150);};
 b.onpointerup=stop;b.onpointercancel=stop;
});document.onvisibilitychange=()=>{if(document.hidden)stop();};
</script>)HTML");
 });
 server.on("/cmd",HTTP_POST,[](){
  String c=server.arg("c");
  if(c=="f")drive(120,120);else if(c=="b")drive(-120,-120);
  else if(c=="l")drive(-100,100);else if(c=="r")drive(100,-100);
  else stopMotors();server.send(200,"text/plain","ok");
 });server.begin();
}
void loop(){server.handleClient();if(moving && (unsigned long)(millis()-lastCommand)>500)stopMotors();}
