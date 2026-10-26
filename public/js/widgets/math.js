export const e12=[1,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];
export function ceilE12(value){
 if(value<=0)return 0;const p=10**Math.floor(Math.log10(value));
 return (e12.find(n=>n*p>=value-1e-9)??10)*p;
}
export const calculations={
 'ohm-slider':({u,r})=>({i:1000*u/r,p:u*u/r}),
 'series-parallel':({r1,r2,parallel})=>({r:parallel?r1*r2/(r1+r2):r1+r2}),
 divider:({u,r1,r2})=>({v:u*r2/(r1+r2)}),
 'led-resistor':({u,vf,i})=>{const r=(u-vf)/(i/1000),chosen=ceilE12(r);return {r:Math.max(0,r),chosen,current:chosen?1000*(u-vf)/chosen:0,p:chosen?(u-vf)**2/chosen:0};},
 'rc-charge':({r,c})=>({tau:r*c/1000}),
 'pwm-duty':({u,d})=>({v:u*d/100}),
 'rc-filter':({r,c})=>({fc:1/(2*Math.PI*r*c*1e-6)}),
 'bridge-rectifier':({u,vf})=>({peak:Math.max(0,u*Math.SQRT2-2*vf)}),
 ripple:({i,f,c})=>({ripple:i/(f*c*1e-6)}),
 lm317:({r1,r2})=>({v:1.25*(1+r2/r1)}),
 'buck-converter':({u,d,l,f})=>({v:u*d/100,delta:(u-u*d/100)*d/100/(l*1e-6*f*1000)}),
 'opamp-gain':({rf,rg,u,supply})=>({gain:1+rf/rg,v:Math.min(supply,(1+rf/rg)*u),raw:(1+rf/rg)*u}),
 'adc-quantizer':({n,ref,u})=>{const lsb=ref/2**n,code=Math.max(0,Math.min(2**n-1,Math.floor(u/lsb)));return {lsb,code,v:code*lsb,error:u-code*lsb};},
 'timer-555':({r1,r2,c})=>({f:1/Math.log(2)/((r1+2*r2)*1000*c*1e-6),d:(r1+r2)/(r1+2*r2)*100})
};
export function bridgeState(a,b,c,d){return (a&&c)||(b&&d)?'short':a&&d?'forward':b&&c?'reverse':(a&&b)||(c&&d)?'brake':'coast';}
export function gate(a,b,name){return name==='AND'?a&&b:name==='OR'?a||b:name==='NOT'?!a:!!a!==!!b;}

