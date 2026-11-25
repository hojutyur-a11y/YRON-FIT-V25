/* VYRON FIT v24 — Body & heart-rate calculation engine (pure, no DOM). ALL results are ESTIMATES for general fitness, not medical diagnosis.
   Each formula names its source; invalid input returns null (never a guessed number). */
const r1=x=>Math.round(x*10)/10,r0=Math.round;
const num=(v,lo,hi)=>Number.isFinite(+v)&&v!==""&&v!=null&&+v>=lo&&+v<=hi;
export const okBody=p=>!!p&&num(p.kg,30,300)&&num(p.cm,120,250)&&num(p.age,14,100);
/** BMI = kg / m². WHO adult categories (not valid for under-18 interpretation). */
export function bmi({kg,cm}){if(!num(kg,30,300)||!num(cm,120,250))return null;return r1(kg/((cm/100)**2))}
export function bmiClass(v,age=30){if(v==null)return null;if(age<18)return"youth";return v<18.5?"under":v<25?"normal":v<30?"over":"obese"}
/** Deurenberg et al. 1991 (adults): BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4 (sex m=1, f=0). Population equation; error of several % points is normal. */
export function bfDeurenberg({kg,cm,age,sex}){if(!okBody({kg,cm,age})||(sex!=="m"&&sex!=="f")||age<18)return null;
  const v=1.2*bmi({kg,cm})+0.23*age-10.8*(sex==="m"?1:0)-5.4;return v>2&&v<60?r1(v):null}
export const leanMass=(kg,bf)=>num(kg,30,300)&&num(bf,2,60)?r1(kg*(1-bf/100)):null;
/** Devine formula: m 50 kg, f 45.5 kg, +2.3 kg per inch above 5 ft. A reference point only — not a target. */
export function idealDevine({cm,sex}){if(!num(cm,140,250)||(sex!=="m"&&sex!=="f"))return null;const inch=cm/2.54-60;return r1((sex==="m"?50:45.5)+2.3*Math.max(0,inch))}
/** Waist-to-height ratio; ≥0.5 is the commonly used "take a look at your waist" threshold (NICE). */
export function whtr({waist,cm}){if(!num(waist,30,250)||!num(cm,120,250))return null;const v=Math.round(waist/cm*100)/100;return{v,flag:v>=0.5}}
/** Tanaka et al. 2001: HRmax = 208 − 0.7·age. Individual variation is ±10 bpm or more. */
export const maxHR=age=>num(age,10,100)?r0(208-0.7*age):null;
/** Karvonen (heart-rate reserve) zones. rest = resting HR measured while calm. */
export function hrZones({age,rest}){const m=maxHR(age);if(m==null||!num(rest,30,120)||rest>=m)return null;const hrr=m-rest;
  return{max:m,rest:+rest,zones:[[50,60],[60,70],[70,80],[80,90],[90,100]].map(([a,b],i)=>({z:i+1,lo:r0(rest+hrr*a/100),hi:r0(rest+hrr*b/100),pct:[a,b]}))}}
/** Protein for people who resist-train: 1.4–2.0 g/kg/day (ISSN position stand 2017). Up to ~2.4 in a calorie deficit is discussed in the literature; we stay at the stated range. */
export function proteinRange(kg){if(!num(kg,30,300))return null;return{lo:r0(kg*1.4),hi:r0(kg*2.0)}}
/** Everything at once; each field is null when its inputs are missing/invalid. */
export function summary(p){const b=bmi(p||{}),bf=p?bfDeurenberg(p):null;
  return{bmi:b,bmiClass:bmiClass(b,p?.age),bf,lean:leanMass(p?.kg,bf),ideal:p?idealDevine(p):null,whtr:p?whtr(p):null,maxHR:p?maxHR(p.age):null,protein:p?proteinRange(p.kg):null,estimate:true}}
/* ---- BIA / InBody-style readings: kept exactly as entered; the app never recomputes the device's own numbers. ---- */
export const BIA_FIELDS=["weight","bodyFat","muscle","fatMass","water","visceral"];
export const validBia=m=>!!m&&typeof m.id==="string"&&m.id.length>0&&/^\d{4}-\d{2}-\d{2}$/.test(m.date||"")&&!Number.isNaN(Date.parse(m.date))
  &&BIA_FIELDS.some(k=>+m[k]>0)&&BIA_FIELDS.every(k=>m[k]==null||m[k]===""||(+m[k]>0&&+m[k]<(k==="visceral"?60:k==="bodyFat"?80:400)));
/** Change between first and last reading of one field; needs ≥2 readings. Conditions (fasted, same time, hydration) matter more than the number. */
export function biaTrend(list,key){const s=(list||[]).filter(x=>validBia(x)&&+x[key]>0).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  if(s.length<2)return{ok:false,n:s.length};const a=+s[0][key],b=+s.at(-1)[key];return{ok:true,n:s.length,from:s[0].date,to:s.at(-1).date,first:a,last:b,delta:r1(b-a)}}
export const biaEmpty=()=>({schema:1,list:[]});
export function biaMerge(mine,theirs,keepMine){const m=new Map();for(const x of(theirs?.list||[]))if(validBia(x))m.set(x.id,x);for(const x of(mine?.list||[]))if(validBia(x)&&(keepMine||!m.has(x.id)))m.set(x.id,x);
  return{schema:1,list:[...m.values()].sort((a,b)=>a.date<b.date?-1:1)}}
