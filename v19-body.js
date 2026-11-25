/* VYRON FIT v19 — Nutrition & body metrics (pure). ALL numbers are ESTIMATES, not medical measurements. No food database is bundled: foods are entered manually. */
const r0=Math.round;
export const ACTIVITY={sedentary:1.2,light:1.375,moderate:1.55,active:1.725};
/** Mifflin–St Jeor BMR; sex "m"|"f" (other/unknown -> mean of both). Returns null when inputs are invalid. */
export function bmr({kg,cm,age,sex}){ if(!(kg>=30&&kg<=300&&cm>=120&&cm<=250&&age>=14&&age<=100)) return null;
  const base=10*kg+6.25*cm-5*age;return r0(sex==="m"?base+5:sex==="f"?base-161:base-78); }
export const maintenance=(prof)=>{const b=bmr(prof),f=ACTIVITY[prof.activity];return b&&f?r0(b*f):null};
/** targets(prof, goal): gradual adjustments, floor at max(BMR, 1200 f / 1500 m) — never a crash diet. */
export function targets(prof,goal="maintain"){
  const m=maintenance(prof);if(!m) return null;const adj={maintain:0,gain:+.10,loss:-.15,recomp:-.05}[goal];if(adj==null) return null;
  const floor=Math.max(bmr(prof),prof.sex==="m"?1500:1200);let kcal=Math.max(floor,r0(m*(1+adj)));
  const protein=r0(prof.kg*(goal==="loss"||goal==="recomp"?2.0:1.8)),fat=r0(prof.kg*0.8);
  const carb=Math.max(0,r0((kcal-protein*4-fat*9)/4));
  return {maintenance:m,kcal,protein,fat,carb,flooredAtMinimum:kcal===floor&&m*(1+adj)<floor,estimate:true};
}
export function sumDay(entries){const t={kcal:0,p:0,c:0,f:0,n:0};for(const e of entries||[]){const q=+e.qty>0?+e.qty:1;for(const [k,s] of [["kcal","kcal"],["p","p"],["c","c"],["f","f"]]){const v=+e[s];if(Number.isFinite(v)&&v>=0)t[k]+=v*q}t.n++}
  for(const k of["kcal","p","c","f"])t[k]=Math.round(t[k]*10)/10;return t}
export const remaining=(tg,tot)=>tg?{kcal:r0(tg.kcal-tot.kcal),protein:r0(tg.protein-tot.p),carb:r0(tg.carb-tot.c),fat:r0(tg.fat-tot.f)}:null;
export function validFood(e){return !!e&&typeof e.name==="string"&&e.name.trim().length>0&&["breakfast","lunch","dinner","snack"].includes(e.meal)&&[e.kcal,e.p,e.c,e.f].every(v=>Number.isFinite(+v)&&+v>=0&&+v<=5000)}
/** Body measurements: kept as entered; trend needs ≥2 entries of the same field. */
export const MEASURES=["weight","waist","chest","arms","thighs","hips","neck","bodyFat"];
export function validMeasure(m){return !!m&&/^\d{4}-\d{2}-\d{2}$/.test(m.date||"")&&MEASURES.some(k=>+m[k]>0)&&MEASURES.every(k=>m[k]==null||m[k]===""||(+m[k]>0&&+m[k]<500))}
export function trend(list,key){const s=(list||[]).filter(x=>+x[key]>0).sort((a,b)=>a.date<b.date?-1:1);if(s.length<2) return {ok:false,n:s.length};
  const a=+s[0][key],b=+s.at(-1)[key];return {ok:true,n:s.length,from:s[0].date,to:s.at(-1).date,first:a,last:b,delta:Math.round((b-a)*10)/10}}
/** US Navy body-fat estimate (cm); rough estimate only. */
export function navyBF({sex,cm,waist,neck,hips}){if(!(cm>0&&waist>0&&neck>0)) return null;
  const v=sex==="m"?(waist>neck?86.010*Math.log10(waist-neck)-70.041*Math.log10(cm)+36.76:null):(hips>0&&waist+hips>neck?163.205*Math.log10(waist+hips-neck)-97.684*Math.log10(cm)-78.387:null);
  return v!=null&&v>2&&v<60?Math.round(v*10)/10:null}
