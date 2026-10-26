import test from 'node:test';
import assert from 'node:assert/strict';
import {calculations as c,ceilE12,bridgeState,gate} from '../public/js/widgets/math.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<Math.max(1,Math.abs(expected))*1e-6,actual+' != '+expected);
test('Основные модели: три контрольных набора каждой формулы',()=>{
 for(const [u,r,i]of [[5,100,50],[9,1000,9],[0,100,0]])close(c['ohm-slider']({u,r}).i,i);
 for(const [r1,r2,parallel,r]of [[100,200,0,300],[100,100,1,50],[100,300,1,75]])close(c['series-parallel']({r1,r2,parallel}).r,r);
 for(const [u,r1,r2,v]of [[5,10,10,2.5],[12,10,5,4],[3.3,20,10,1.1]])close(c.divider({u,r1,r2}).v,v);
 for(const [u,vf,i,r]of [[5,2,10,300],[9,3,20,300],[3.3,2.1,10,120]])close(c['led-resistor']({u,vf,i}).r,r);
 for(const [r,cap,tau]of [[10,100,1],[1,1,.001],[100,1000,100]])close(c['rc-charge']({r,c:cap}).tau,tau);
 for(const [u,d,v]of [[5,50,2.5],[3.3,100,3.3],[5,0,0]])close(c['pwm-duty']({u,d}).v,v);
});
test('Дополнительные аналоговые модели: контрольные значения',()=>{
 for(const [r,cap,fc]of [[1,100,1591.549430919],[10,100,159.154943092],[1,1000,159.154943092]])close(c['rc-filter']({r,c:cap}).fc,fc);
 for(const [u,vf,peak]of [[12,.7,15.570562748],[5,.5,6.071067812],[1,1,0]])close(c['bridge-rectifier']({u,vf}).peak,peak);
 for(const [i,f,cap,ripple]of [[.1,100,1000,1],[.5,100,10000,.5],[.1,50,1000,2]])close(c.ripple({i,f,c:cap}).ripple,ripple);
 for(const [r1,r2,v]of [[240,720,5],[240,0,1.25],[120,120,2.5]])close(c.lm317({r1,r2}).v,v);
 for(const [u,d,l,f,v,delta]of [[12,50,100,100,6,.3],[10,50,100,100,5,.25],[12,25,100,100,3,.225]]){
 const o=c['buck-converter']({u,d,l,f});close(o.v,v);close(o.delta,delta);}
 for(const [rf,rg,u,supply,gain,v]of [[10,10,.1,3.3,2,.2],[32,1,.1,3.3,33,3.3],[100,1,1,5,101,5]]){
 const o=c['opamp-gain']({rf,rg,u,supply});close(o.gain,gain);close(o.v,v);}
 for(const [n,ref,u,code]of [[10,5,2.5,512],[12,3.3,3.3,4095],[8,5,0,0]])close(c['adc-quantizer']({n,ref,u}).code,code);
 for(const [r1,r2,cap,f,d]of [[10,10,1,48.089834696,66.666666667],[10,10,10,4.808983470,66.666666667],[10,20,1,28.853900818,60]]){
 const o=c['timer-555']({r1,r2,c:cap});close(o.f,f);close(o.d,d);}
});
test('E12, H-мост и логика: границы и опасные комбинации',()=>{
 assert.equal(ceilE12(300),330);assert.equal(ceilE12(330),330);assert.equal(ceilE12(8201),10000);
 assert.equal(bridgeState(true,false,false,true),'forward');assert.equal(bridgeState(false,true,true,false),'reverse');
 assert.equal(bridgeState(true,false,true,false),'short');assert.equal(bridgeState(false,true,false,true),'short');
 assert.equal(bridgeState(false,false,true,true),'brake');
 assert.equal(gate(true,true,'XOR'),false);assert.equal(gate(true,false,'XOR'),true);assert.equal(gate(false,false,'OR'),false);
});

