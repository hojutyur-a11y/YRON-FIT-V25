/* VYRON FIT v14 — SMART COACH PRO core (pure functions, no DOM, no storage). Everything here is deterministic and testable in Node.
   Honest-data rules: nothing is invented; missing data => null / "unknown". */
import {EXM,allowed,assess,band,ageNum,MAXD,cl,RAW} from "vy/smart-engine";

/* ---------- 1. Muscle recovery estimate (from LOGGED sessions only) ---------- */
export const MUSCLES=["chest","back","shoulders","biceps","triceps","quads","hamstrings","glutes","core","calves"];
const CAP=6;                     // set-equivalents of residual fatigue that map to 0 % recovered
export const AVOID_BELOW=50;     // muscles under this % are avoided when generating the next session
const HRS=36e5;
const sessionTime=w=>{ if(w.t>0) return {t:w.t,approx:false}; const d=new Date((w.date||"")+"T12:00:00"); return isNaN(d)?null:{t:d.getTime(),approx:true}; };
const intensity=d=>d>=4?1.2:d<=2&&d>0?.7:1;   // from the user's own difficulty rating; 1.0 when unknown
export function exerciseLoad(ex,diff){          // -> {muscle:setEquivalents}; null when the exercise cannot be mapped
  const m=EXM[ex.exId]; if(!m||m.type==="mobility") return null;
  const sets=Math.max(0,+ex.sets||0); if(!sets) return null;
  const k=sets*intensity(diff)*(.9+.1*m.cx), f=m.cat==="cardio"?.25:1, out={};
  const add=(g,x)=>{ if(MUSCLES.includes(g)) out[g]=(out[g]||0)+x; };
  add(m.tgt,k*f); m.sec.forEach(g=>add(g,k*f*.5));
  if(m.tgt==="fullbody"){ add("quads",k*f); add("calves",k*f*.5); }
  return out;
}
/** muscleRecovery(workouts, now) -> {muscles:{m:{pct,status,hoursSince,sets,pain,approx}}, used, ignored, fatigued:Set, note}
 *  workouts: [{date,t?,exercises:[{exId,sets}],diff?,disc?}]. Legacy workouts without exId are ignored (counted in `ignored`). */
export function muscleRecovery(workouts,now=Date.now()){
  const res={}; MUSCLES.forEach(m=>res[m]={resid:0,last:0,sets:0,pain:false,approx:false});
  let used=0,ignored=0;
  for(const w of workouts||[]){
    const st=sessionTime(w); if(!st){ignored++;continue} if(st.t>now||now-st.t>120*HRS) continue;
    let any=false, tot={};
    for(const ex of w.exercises||[]){ const l=exerciseLoad(ex,+w.diff||0); if(!l) continue; any=true; for(const g in l) tot[g]=(tot[g]||0)+l[g]; }
    if(!any){ if((w.exercises||[]).length) ignored++; continue; }
    used++;
    for(const g in tot){ const win=cl(36+6*tot[g],36,96),h=(now-st.t)/HRS,r=res[g]; r.resid+=tot[g]*Math.max(0,1-h/win); r.sets+=tot[g]; if(st.t>r.last)r.last=st.t; if(st.approx)r.approx=true; if(w.disc==="unusual"&&h<=120)r.pain=true; }
  }
  const muscles={},fatigued=new Set();
  for(const g of MUSCLES){ const r=res[g]; if(!r.last){ muscles[g]={pct:null,status:"unknown",hoursSince:null,sets:0,pain:false,approx:false}; continue; }
    let pct=cl(Math.round(100-r.resid/CAP*100),0,100); if(r.pain) pct=Math.min(pct,30);
    const status=r.pain?"pain":pct>=75?"recovered":pct>=AVOID_BELOW?"partial":"rest";
    muscles[g]={pct,status,hoursSince:Math.round((now-r.last)/HRS),sets:Math.round(r.sets*10)/10,pain:r.pain,approx:r.approx};
    if(pct<AVOID_BELOW) fatigued.add(g); }
  return {muscles,used,ignored,fatigued,estimate:true};
}
/* ---------- 2. Quick modifiers (session-only; never touch the stored profile) ---------- */
const estOf=x=>Math.max(1,Math.round(x.sets*((x.u==="m"?x.reps*60:x.u==="s"?x.reps:x.reps*3.5)+x.rest)/60));
const timeOf=a=>a.reduce((n,x)=>n+x.est,0);
/** applyModifiers(sess, mods, p, lv) -> {sess, notes}. mods={short,noeq,sore}. Pure: input array is not mutated. */
export function applyModifiers(sess,mods,p,lv,fat){
  let out=sess.map(x=>({...x})),notes=[];
  if(mods.noeq){ const p0={...p,eq:[]},used=new Set(out.map(x=>x.id)); let changed=0;
    out=out.map(x=>{ const m=EXM[x.id]; if(!m.eq.length) return x;
      const c=[...m.alt,...RAW.filter(e=>e.pat===m.pat).map(e=>e.id)].filter((id,i,a)=>a.indexOf(id)===i&&EXM[id]&&!used.has(id)&&allowed(EXM[id],p0,lv)&&!(fat&&fat.has(EXM[id].tgt)));
      if(!c.length) return null; const n=EXM[c[0]]; used.add(n.id); changed++;
      const y={...x,id:n.id,o:x.o,sets:n.sets>=3?x.sets:Math.min(x.sets,n.sets+1),rest:n.rest?n.rest:0,u:n.u,reps:n.u===x.u?Math.min(n.rb,Math.max(n.ra,x.reps)):n.ra}; y.est=estOf(y); return y; }).filter(Boolean);
    notes.push("noeq"); }
  if(mods.sore){ out=out.map(x=>{ const y={...x}; if(x.u==="") {y.sets=Math.max(1,x.sets-1);} else if(x.u==="m"){y.reps=Math.max(3,Math.round(x.reps*.8));} if(x.rest) y.rest=x.rest+15; y.est=estOf(y); return y; }); notes.push("sore"); }
  if(mods.short){ const before=timeOf(out);
    out=out.map(x=>{ const y={...x}; if(x.u==="m") y.reps=Math.max(3,Math.round(x.reps*.7)); else y.sets=Math.max(1,Math.round(x.sets*.7)); y.est=estOf(y); return y; });
    // still above 70 %? drop the lowest-priority (last) accessory exercises, never the first two
    while(out.length>2&&timeOf(out)>Math.ceil(before*.7)) out.pop();
    notes.push("short"); }
  return {sess:out,notes};
}
/* ---------- 3. Explainable recommendation ---------- */
/** explainWhy -> ordered list of {k,v} reason fragments, all derived from stored data. Never returns a reason that is not supported. */
export function explainWhy({p,s,day,focus,mode,fatigued,mods,n}){
  const r=[]; if(!p) return r;
  if(day&&day.kind==="train") r.push({k:"w_cons",v:{n:n||0,f:focus}});
  if(day&&day.kind==="rec") r.push({k:"w_recday"});
  const bodyPref=(p.pref||[]).includes("body")||!(p.eq||[]).length; if(bodyPref) r.push({k:"w_body"});
  if(fatigued&&fatigued.size) r.push({k:"w_prot",v:{m:[...fatigued]}});
  if((s.w||0)<0) r.push({k:"w_fb"}); if(mode==="eased"||mode==="replaced") r.push({k:"w_rec"});
  if(mods&&(mods.short||mods.noeq||mods.sore)) r.push({k:"w_mod",v:{m:["short","noeq","sore"].filter(x=>mods[x])}});
  return r;
}
/* ---------- 4. PR + weekly streak (celebrations only when real, comparable data exist) ---------- */
const exKey=e=>e.exId||null;
/** detectPRs(history, workout) -> [{type:"weight"|"reps",exId,value,prev}]. A PR needs a prior baseline for the SAME exercise; the first log is a baseline, not a PR.
 *  Reps-PR requires the user to have typed actual reps (`actualReps`); planned reps are never counted. Suppressed when pain was reported. */
export function detectPRs(history,w){
  if(!w||w.disc==="unusual") return [];
  const out=[];
  for(const e of w.exercises||[]){ const k=exKey(e); if(!k) continue;
    const prior=[]; for(const h of history||[]){ if(h.id===w.id) continue; for(const x of h.exercises||[]) if(exKey(x)===k) prior.push(x); }
    if(!prior.length) continue;
    const wt=+e.weight||0,pw=Math.max(0,...prior.map(x=>+x.weight||0));
    if(wt>0&&pw>0&&wt>pw){ out.push({type:"weight",exId:k,value:wt,prev:pw}); continue; }
    const ar=+e.actualReps||0; if(ar>0){ const cmp=prior.filter(x=>(+x.weight||0)<=wt&&+x.actualReps>0); if(cmp.length){ const pr=Math.max(...cmp.map(x=>+x.actualReps)); if(ar>pr) out.push({type:"reps",exId:k,value:ar,prev:pr,weight:wt}); } }
  }
  return out;
}
const weekStart=d=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()-x.getDay());return iso2(x)};
const iso2=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
/** weekStreak(dates, target, cap, today) -> {streak, thisWeekMet, thisWeek}. A week counts only when target<=distinct training days<=cap (no reward for overtraining). */
export function weekStreak(dates,target,cap,today){
  const by={}; for(const d of new Set(dates)){ const w=weekStart(d); by[w]=(by[w]||0)+1; }
  const ok=w=>(by[w]||0)>=target&&(by[w]||0)<=cap;
  let w=weekStart(today),met=ok(w),streak=0; const cur=new Date(w+"T00:00:00");
  if(!met) cur.setDate(cur.getDate()-7);
  for(let i=0;i<260;i++){ const k=iso2(cur); if(ok(k)) streak++; else break; cur.setDate(cur.getDate()-7); }
  return {streak,thisWeekMet:met,thisWeek:w};
}
/** newAchievements -> list of achievement objects not already in `have` (idempotent by key). */
export function newAchievements({history,workout,target,cap,today,have}){
  const keys=new Set((have||[]).map(a=>a.key)),out=[];
  if(!workout||workout.disc==="unusual") return out;
  for(const pr of detectPRs(history,workout)){ const key=`pr:${pr.type}:${pr.exId}:${workout.date}:${pr.value}`; if(!keys.has(key)) out.push({key,type:"pr_"+pr.type,exId:pr.exId,value:pr.value,prev:pr.prev,date:workout.date}); }
  const dates=[...(history||[]).map(h=>h.date),workout.date],st=weekStreak(dates,Math.max(1,target||1),cap||7,workout.date);
  if(st.thisWeekMet){ const key=`wk:${st.thisWeek}`; if(!keys.has(key)) out.push({key,type:st.streak>=2?"streak":"weekgoal",value:st.streak,date:workout.date}); }
  return out;
}
/* ---------- 5. Backup v2: validation + safe merge (no deletions, no overwrites unless asked) ---------- */
export const BACKUP_FORMAT="vyron-fit-backup",BACKUP_VERSION=2;
const isObj=x=>x&&typeof x==="object"&&!Array.isArray(x);
export function validateBackup(d,existing={}){
  const errors=[],warnings=[],sum={stores:{},dup:0,fresh:0};
  if(!isObj(d)) return {ok:false,errors:["not-object"],warnings,sum};
  if(!isObj(d.stores)) errors.push("no-stores");
  else for(const [k,v] of Object.entries(d.stores)){ if(!Array.isArray(v)){errors.push("bad-store:"+k);continue}
    const ex=new Set(existing[k]||[]); let bad=0,dup=0;
    for(const it of v){ if(!isObj(it)||typeof it.id!=="string"&&typeof it.id!=="number"){bad++;continue} if(ex.has(it.id))dup++; }
    sum.stores[k]=v.length-bad; sum.dup+=dup; sum.fresh+=v.length-bad-dup; if(bad) warnings.push(`skipped:${k}:${bad}`); }
  if(d.smart!=null&&!isObj(d.smart)) errors.push("bad-smart");
  const v=d.backupVersion||1; if(v>BACKUP_VERSION) warnings.push("newer-version");
  if(!d.backupVersion) warnings.push("legacy-format");
  return {ok:!errors.length,errors,warnings,sum};
}
const byKey=(a,b,k)=>{const s=new Set((a||[]).map(x=>x[k]));return [...(a||[]),...(b||[]).filter(x=>!s.has(x[k]))]};
/** mergeSmart(local, incoming, mode) — mode "keep" (local wins on conflicts, default) | "backup" (incoming profile wins). Lists are unioned. Transient `act` is never imported. */
export function mergeSmart(local,inc,mode="keep"){
  local=isObj(local)?local:{}; if(!isObj(inc)) return {...local};
  const o={...inc,...local}; if(mode==="backup") Object.assign(o,inc);
  if(!local.profile&&inc.profile) o.profile=inc.profile;
  o.fb=byKey(local.fb,inc.fb,"t").sort((a,b)=>a.t-b.t).slice(-60);
  o.alog=byKey(local.alog,inc.alog,"t").sort((a,b)=>a.t-b.t);
  o.ach=byKey(local.ach,inc.ach,"key");
  o.dis=byKey(local.dis,inc.dis,"key");
  if(local.act) o.act=local.act; else delete o.act;
  return o;
}
/** migrateSmart(s) — idempotent, non-destructive v13 -> v14: only ADDS fields. */
export function migrateSmart(s){
  const o=JSON.parse(JSON.stringify(isObj(s)?s:{})); if(o.ver>=14) return o;
  o.ach=o.ach||[]; o.alog=o.alog||[];
  if(o.profile&&!o.alog.length){ const a=assess(o.profile); o.alog.push({t:Date.parse((o.profile.created||"")+"T00:00:00")||0,level:a.level,age:a.age,rev:o.profile.rev||1,source:"migrated-from-v13",answers:JSON.parse(JSON.stringify(o.profile))}); }
  o.ver=14; return o;
}
export function buildBackup({stores,athlete,smart,now=new Date()}){
  const counts={}; for(const k in stores) counts[k]=(stores[k]||[]).length;
  return {format:BACKUP_FORMAT,backupVersion:BACKUP_VERSION,version:1,app:"VYRON FIT v14",exportedAt:now.toISOString(),stores,athlete:athlete||null,smart:smart||null,
    smartMeta:{ver:(smart||{}).ver||null,hasProfile:!!(smart||{}).profile,assessments:((smart||{}).alog||[]).length,achievements:((smart||{}).ach||[]).length,feedbacks:((smart||{}).fb||[]).length,onboarding:(smart||{}).ob||null},counts};
}
