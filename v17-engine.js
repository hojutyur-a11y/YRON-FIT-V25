/* VYRON FIT v17 — Unified Training Intelligence Engine. Pure JS (no DOM / storage). Deterministic rules, NOT machine learning.
   One decision point: safety rules run FIRST and can veto any progression decision. Every decision carries its data and a reason key. */
import {EXM} from "vy/smart-engine";
import {sessionsFor,progression,plateau as plateauV15,workSets,epley} from "vy/smart-v15";
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,r1=x=>Math.round(x*10)/10;
/* ---------- RPE <-> RIR (same scale: RIR ≈ 10 − RPE; an estimate, not two independent measures) ---------- */
export const rirFromRpe=rpe=>rpe>=6&&rpe<=10?Math.round((10-rpe)*2)/2:null;
export const rpeFromRir=rir=>rir>=0&&rir<=4?10-rir:null;
/** planned vs executed per set: sets=[{r,rpe,rir}], target {rpe?|rir?} -> {n,avgRpe,avgRir,gap,verdict} (verdict: easier|onTarget|harder|unknown) */
export function compareEffort(sets,target={}){
  const v=(sets||[]).map(s=>s.rpe!=null?+s.rpe:s.rir!=null?rpeFromRir(+s.rir):null).filter(x=>x!=null);
  const tr=target.rpe!=null?+target.rpe:target.rir!=null?rpeFromRir(+target.rir):null;
  if(!v.length||tr==null) return {n:v.length,avgRpe:v.length?r1(avg(v)):null,avgRir:v.length?r1(10-avg(v)):null,gap:null,verdict:"unknown"};
  const a=avg(v),gap=r1(a-tr);return {n:v.length,avgRpe:r1(a),avgRir:r1(10-a),gap,verdict:gap<=-1?"easier":gap>=1?"harder":"onTarget"};
}
/* ---------- Readiness: self-reported inputs only. Missing data never gives a high score; confidence reflects coverage. NOT a medical measure. ---------- */
export const READINESS_FIELDS=["sleepQ","sleepH","fatigue","soreness","pain","restDays"];
export function readiness(e={}){
  const parts=[],miss=[];const add=(k,w,score)=>{score==null?miss.push(k):parts.push({k,w,s:Math.max(0,Math.min(100,score))})};
  const num=x=>x===""||x==null||isNaN(+x)?null:+x;
  const sq=num(e.sleepQ);add("sleepQ",20,sq==null?null:(sq-1)/4*100);          // 1..5
  const sh=num(e.sleepH);add("sleepH",15,sh==null?null:sh>=7&&sh<=9?100:sh>=6?70:sh>=5?40:15); // hours
  const fa=num(e.fatigue);add("fatigue",25,fa==null?null:(5-fa)/4*100);          // 1 none..5 extreme
  const so=num(e.soreness);add("soreness",15,so==null?null:(5-so)/4*100);        // normal soreness 1..5
  const pa=num(e.pain);add("pain",15,pa==null?null:pa>0?0:100);                  // any pain => 0 here and flagged separately
  const rd=num(e.restDays);add("restDays",10,rd==null?null:rd>=2?100:rd===1?70:35);
  const W=parts.reduce((a,x)=>a+x.w,0),tot=READINESS_FIELDS.length;
  const coverage=parts.length/tot,raw=W?parts.reduce((a,x)=>a+x.s*x.w,0)/W:null;
  // shrink toward a neutral 50 when data is sparse, so little data can never yield an "excellent" score
  const score=raw==null?null:Math.round(raw*coverage+50*(1-coverage));
  const conf=coverage>=.8?"high":coverage>=.5?"medium":"low";
  const flags=[];if(num(e.pain)>0)flags.push("pain");if(fa>=4)flags.push("systemic");if(so>=4)flags.push("local");
  return {score:parts.length<2?null:score,confidence:conf,missing:miss,used:parts.map(x=>x.k),flags,band:parts.length<2?"insufficient":score>=75?"good":score>=50?"moderate":"low",note:"estimate"};
}
/* ---------- Safety gate: always first. pain => no load increase, warning shown ---------- */
export function safetyGate({pain=[],readiness:rd=null,exId=null,tgt=null}={}){
  const ex=pain.some(p=>p.exId&&p.exId===exId),mu=tgt&&pain.some(p=>p.muscle===tgt);
  const blockInc=ex||mu||(rd&&rd.flags&&rd.flags.includes("pain"));
  const warn=pain.length>0||(rd&&rd.flags&&rd.flags.includes("pain"));
  return {blockIncrease:!!blockInc,warn:!!warn,reason:ex?"pain_exercise":mu?"pain_muscle":blockInc?"pain_reported":null,seeProfessional:pain.some(p=>p.severity>=4)};
}
/* ---------- Plateau 2.0: needs ≥5 sessions with data AND ≥3 weeks span; separates "no data" from "stalled" and "regressing" ---------- */
export function plateau2(ss){
  const e=ss.filter(x=>x.e1);if(e.length<5) return {state:"insufficient",n:e.length};
  const span=(e.at(-1).t-e[0].t)/864e5;if(span<21) return {state:"insufficient",n:e.length,spanDays:Math.round(span)};
  const rec=Math.max(...e.slice(-4).map(x=>x.e1)),old=Math.max(...e.slice(0,-4).map(x=>x.e1));
  const state=rec<old*.95?"regressing":rec<old*1.01?"stalled":"progressing";
  const reps=ss.slice(-4).map(x=>x.minReps),repsFlat=Math.max(...reps)-Math.min(...reps)<=1;
  return {state,n:e.length,spanDays:Math.round(span),recent:rec,best:old,repsFlat};
}
/* ---------- Deload: suggestion (never mandatory, not on a fixed schedule) from performance drop + hard efforts + load build-up ---------- */
export function deloadAdvice({workouts=[],today,fatigueSelf=null}={}){
  const d=n=>{const x=new Date(today+"T00:00:00");x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};
  const wk=(from,to)=>workouts.filter(w=>w.date>=from&&w.date<=to&&(w.exercises||[]).length);
  const recent=wk(d(27),today);if(recent.length<6) return {suggest:false,confidence:"low",reason:"insufficient",n:recent.length};
  const rpes=[];recent.forEach(w=>w.exercises.forEach(x=>workSets(x).forEach(s=>s.rpe!=null&&rpes.push({date:w.date,v:s.rpe}))));
  const late=rpes.filter(x=>x.date>=d(13)).map(x=>x.v),early=rpes.filter(x=>x.date<d(13)).map(x=>x.v);
  const rpeRise=late.length>=5&&early.length>=5?avg(late)-avg(early):null;
  const ids=[...new Set(recent.flatMap(w=>w.exercises.map(x=>x.exId)).filter(Boolean))];
  let down=0,tracked=0;ids.forEach(id=>{const ss=sessionsFor(workouts,id).filter(x=>x.date>=d(27)&&x.e1);if(ss.length>=3){tracked++;if(ss.at(-1).e1<Math.max(...ss.slice(0,-1).map(x=>x.e1))*.97)down++}});
  const signals=[];if(rpeRise!=null&&rpeRise>=0.7)signals.push("rpe_up");if(tracked>=2&&down/tracked>=.5)signals.push("perf_down");if(fatigueSelf!=null&&fatigueSelf>=4)signals.push("fatigue_high");
  const suggest=signals.length>=2;
  return {suggest,signals,confidence:signals.length>=3?"high":signals.length===2?"medium":"low",plan:suggest?{volume:-40,intensity:-10,weeks:1}:null,n:recent.length,rpeRise:rpeRise==null?null:r1(rpeRise)};
}
/* ---------- THE single decision point ---------- */
export function decideExercise({workouts=[],exId,p={},today,pain=[],rd=null,deload=null}){
  const m=EXM[exId],ss=sessionsFor(workouts,exId);
  if(!m||!ss.length) return {exId,action:"none",conf:"low",why:[{k:"no_data"}],data:{n:0},vetoes:[]};
  const g=progression(ss,exId,p),gate=safetyGate({pain,readiness:rd,exId,tgt:m.tgt}),vetoes=[];
  let action=g.action,w=g.w,r=g.r,why=[...g.why];
  if(["increase","harder"].includes(action)){
    if(gate.blockIncrease){vetoes.push(gate.reason);action="hold";r=undefined;why=[{k:"veto_pain"}]}
    else if(rd&&rd.band==="low"){vetoes.push("readiness_low");action="hold";why=[{k:"veto_readiness"}]}
    else if(deload&&deload.suggest){vetoes.push("deload");action="hold";why=[{k:"veto_deload"}]}
  }
  const pl=plateau2(ss),last=ss.at(-1);
  return {exId,action,w,r,conf:vetoes.length?"high":g.conf,why,vetoes,warn:gate.warn,seeProfessional:gate.seeProfessional,plateau:pl.state,
    data:{n:ss.length,last:`${last.top} × ${last.allReps.join("/")}`,rpe:last.rpe,date:last.date},reversible:true};
}
/* ---------- Adaptive generator: applies decisions to a planned session (a list of {exId,sets,reps,weight}) and explains every change ---------- */
export function adaptSession({plan=[],workouts=[],p={},today,pain=[],rd=null,deload=null}){
  const out=[],changes=[];
  for(const it of plan){
    const d=decideExercise({workouts,exId:it.exId,p,today,pain,rd,deload});let x={...it};
    const painHit=pain.some(q=>q.exId===it.exId||q.muscle===(EXM[it.exId]||{}).tgt);
    if(painHit){const alt=[...(EXM[it.exId]?.alt||[])].find(a=>EXM[a]&&!pain.some(q=>q.exId===a||q.muscle===EXM[a].tgt));
      changes.push({exId:it.exId,type:alt?"substitute":"skip",to:alt||null,why:"pain"});if(alt)out.push({...it,exId:alt,weight:0,swappedFrom:it.exId});continue}
    if(deload&&deload.suggest&&deload.plan){x.sets=Math.max(1,Math.round((x.sets||3)*(1+deload.plan.volume/100)));if(x.weight)x.weight=Math.round(x.weight*(1+deload.plan.intensity/100)*2)/2;changes.push({exId:it.exId,type:"deload",why:"deload"})}
    else if(rd&&rd.band==="low"&&rd.confidence!=="low"){x.sets=Math.max(1,(x.sets||3)-1);changes.push({exId:it.exId,type:"fewer_sets",why:"readiness_low"})}
    else if(d.action==="increase"){x.weight=d.w;x.reps=d.r;changes.push({exId:it.exId,type:"increase",from:it.weight,to:d.w,why:"progression",data:d.data})}
    else if(d.action==="reduce"){x.weight=d.w;changes.push({exId:it.exId,type:"reduce",from:it.weight,to:d.w,why:"progression",data:d.data})}
    out.push(x);
  }
  return {plan:out,changes};
}
export {epley,plateauV15};
