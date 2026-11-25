/* VYRON FIT v15 — training intelligence core (pure, no DOM/storage). Deterministic rules, NOT machine learning. Estimates are labelled as such. */
import {EXM,allowed,assess,cl} from "vy/smart-engine";
import {MUSCLES} from "vy/smart-v14";
/* ---------- set data model: ex.setLog=[{t:"work|warm|drop|fail",w,r,rpe}] (only COMPLETED sets are stored). Legacy records fall back to sets/weight/actualReps. ---------- */
export const SET_TYPES=["work","warm","drop","fail"];
export const workSets=ex=>Array.isArray(ex.setLog)?ex.setLog.filter(s=>s&&s.t!=="warm").map(s=>({t:s.t,w:+s.w||0,r:+s.r>0?+s.r:null,rpe:+s.rpe>0?+s.rpe:null})):Array.from({length:Math.max(0,+ex.sets||0)},()=>({t:"work",w:+ex.weight||0,r:+ex.actualReps>0?+ex.actualReps:null,rpe:null}));
/** summarize in-progress sets into the legacy-compatible fields (sets, weight, actualReps) + setLog. Warm-ups never count as working sets. */
export function summarizeSets(sl){
  const done=(sl||[]).filter(s=>s&&s.done), log=done.map(s=>({t:SET_TYPES.includes(s.t)?s.t:"work",w:+s.w||0,r:+s.r>0?+s.r:0,...(+s.rpe>0?{rpe:+s.rpe}:{})}));
  const ws=log.filter(s=>s.t!=="warm"), top=Math.max(0,...ws.map(s=>s.w)), at=ws.filter(s=>s.w===top&&s.r>0);
  return {setLog:log,sets:ws.length,weight:top,...(at.length?{actualReps:Math.max(...at.map(s=>s.r))}:{})};
}
/* ---------- 1RM estimate: Epley; only reps 1–10 with load; ALWAYS an estimate ---------- */
export const epley=(w,r)=>w>0&&r>=1&&r<=10?Math.round(w*(1+r/30)*10)/10:null;
export const brzycki=(w,r)=>w>0&&r>=1&&r<=10?Math.round(w*36/(37-r)*10)/10:null;
/* ---------- per-exercise history ---------- */
export function sessionsFor(workouts,exId){
  const out=[];
  for(const w of workouts||[]) for(const ex of w.exercises||[]){ if(ex.exId!==exId) continue;
    const s=workSets(ex).filter(x=>x.r!=null); if(!s.length) continue;
    const top=Math.max(...s.map(x=>x.w)),at=s.filter(x=>x.w===top),rp=s.filter(x=>x.rpe!=null);
    out.push({date:w.date,t:w.t||Date.parse(w.date+"T12:00:00"),disc:w.disc||null,n:s.length,top,repsTop:Math.max(...at.map(x=>x.r)),minReps:Math.min(...s.map(x=>x.r)),allReps:s.map(x=>x.r),rpe:rp.length?Math.round(rp.reduce((a,x)=>a+x.rpe,0)/rp.length*10)/10:null,e1:Math.max(0,...s.map(x=>epley(x.w,x.r)||0))||null,note:w.id});
  }
  return out.sort((a,b)=>a.t-b.t);
}
export const incrementFor=(m,o={})=>o.inc>0?o.inc:m.eq.includes("barbell")?2.5:m.eq.includes("dumbbell")?2:m.eq.includes("machine")?5:0;
const rnd=(x,inc)=>inc>0?Math.round(x/inc)*inc:Math.round(x*2)/2;
/** progression(sessions, exId, opt) -> {action, w, r, conf, why:[{k,v}], n}. Never recommends an increase after pain, a hard effort, or without confirmation. */
export function progression(ss,exId,opt={}){
  const m=EXM[exId]; if(!m) return {action:"none",why:[{k:"p_none"}],conf:"low",n:0};
  if(!ss.length) return {action:"none",why:[{k:"p_none"}],conf:"low",n:0};
  const last=ss.at(-1),prev=ss.at(-2),inc=incrementFor(m,opt),bw=last.top===0,rb=m.rb,ra=m.ra,n=ss.length;
  if(m.u) return {action:"hold",w:last.top,conf:"low",why:[{k:"p_timed"}],n};
  if(last.disc==="unusual") return {action:"hold_pain",w:last.top,conf:"high",why:[{k:"p_pain"}],n};
  if(n<2) return {action:"baseline",w:last.top,r:Math.min(rb,last.minReps+1),conf:"low",why:[{k:"p_base"}],n};
  const hit=x=>x.n>=2&&x.allReps.every(r=>r>=rb),rpeOk=last.rpe==null||last.rpe<=8.5;
  if(last.rpe!=null&&last.rpe>=9.5) return {action:"hold",w:last.top,r:last.minReps,conf:"medium",why:[{k:"p_hard",v:{e:last.rpe}}],n};
  if(hit(last)&&rpeOk&&(last.rpe!=null||(hit(prev)&&prev.top>=last.top-1e-9))){
    if(bw) return {action:"harder",w:0,r:rb,conf:last.rpe!=null?"high":"medium",why:[{k:"p_bw",v:{r:rb}}],n};
    if(inc>0){ const w=Math.max(last.top+inc,rnd(last.top*1.025,inc)); return {action:"increase",w,r:ra,conf:last.rpe!=null?"high":"medium",why:[{k:last.rpe!=null?"p_inc":"p_inc0",v:{r:rb,s:last.n,e:last.rpe}}],n}; } }
  if(!bw&&last.minReps<ra&&prev.minReps<ra&&prev.top>=last.top) return {action:"reduce",w:rnd(last.top*.925,inc||2.5),r:ra,conf:"medium",why:[{k:"p_red",v:{r:ra}}],n};
  return {action:"reps",w:last.top,r:Math.min(rb,last.minReps+1),conf:n>=3?"medium":"low",why:[{k:"p_reps",v:{r:Math.min(rb,last.minReps+1),w:last.top}}],n};
}
/** plateau: needs ≥5 sessions with an e1RM estimate; flags when the best of the last 4 is <1 % above the best before them. */
export function plateau(ss){ const e=ss.filter(x=>x.e1); if(e.length<5) return {plateau:false,n:e.length};
  const rec=Math.max(...e.slice(-4).map(x=>x.e1)),old=Math.max(...e.slice(0,-4).map(x=>x.e1));
  return {plateau:rec<old*1.01,n:e.length,recent:rec,best:old}; }
/* ---------- weekly volume / balance (training balance, NOT recovery) ---------- */
export const PUSH=["chest","shoulders","triceps"],PULL=["back","biceps"],LOWER=["quads","hamstrings","glutes","calves"],ANT=["chest","quads"],POST=["back","hamstrings","glutes"];
/** weeklyVolume(workouts, fromDate, toDate) — effective sets: working sets, primary muscle ×1.0, each secondary ×0.5 (documented heuristic). */
export function weeklyVolume(workouts,from,to){
  const vol={},days={};MUSCLES.forEach(m=>{vol[m]=0;days[m]=new Set()});let used=0,ignored=0;
  for(const w of workouts||[]){ if(!w.date||w.date<from||w.date>to) continue; let any=false;
    for(const ex of w.exercises||[]){ const m=EXM[ex.exId]; if(!m||m.type==="mobility"||m.cat==="cardio"){ if(!m) ignored++; continue; } const n=workSets(ex).length; if(!n) continue; any=true;
      if(vol[m.tgt]!=null){vol[m.tgt]+=n;days[m.tgt].add(w.date)} m.sec.forEach(g=>{if(vol[g]!=null){vol[g]+=n*.5;days[g].add(w.date)}}); }
    if(any) used++; }
  const out={};MUSCLES.forEach(m=>out[m]={sets:Math.round(vol[m]*10)/10,freq:days[m].size});return {muscles:out,used,ignored};
}
const sum=(v,l)=>l.reduce((a,m)=>a+v[m].sets,0);
export function balance(v){ const t=sum(v,MUSCLES); if(t<8) return {enough:false,total:t};
  const r=(a,b)=>b>0&&a>0?Math.round(a/b*100)/100:null;
  return {enough:true,total:t,pushPull:r(sum(v,PUSH),sum(v,PULL)),upperLower:r(sum(v,[...PUSH,...PULL]),sum(v,LOWER)),antPost:r(sum(v,ANT),sum(v,POST)),push:sum(v,PUSH),pull:sum(v,PULL)}; }
/* ---------- unified recommendations: one pass over the same signals, so systems cannot contradict each other ---------- */
const wkStart=d=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()-x.getDay());return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
const addDays=(d,n)=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
/** recommend({workouts,today,fat,p}) -> [{id,type,sev,conf,subject,why:{k,v},data:[[k,v]],benefit,act}] */
export function recommend({workouts,today,fat=new Set(),p={}}){
  const out=[],ids=[...new Set((workouts||[]).flatMap(w=>(w.exercises||[]).map(e=>e.exId).filter(Boolean)))];
  const wk=wkStart(today),cur=weeklyVolume(workouts,wk,today),pr=[1,2,3].map(i=>weeklyVolume(workouts,addDays(wk,-7*i),addDays(wk,-7*i+6))),prevAvg=pr.reduce((a,x)=>a+sum(x.muscles,MUSCLES),0)/3;
  const curTot=sum(cur.muscles,MUSCLES),spike=prevAvg>=6&&curTot>prevAvg*1.5;
  const lv=assess(p).level,painEx=new Set(),ex14=addDays(today,-14);
  for(const w of workouts||[]) if(w.disc==="unusual"&&w.date>=ex14) for(const e of w.exercises||[]) if(e.exId) painEx.add(e.exId);
  if(spike) out.push({id:`spike:${wk}`,type:"spike",sev:3,conf:"medium",subject:"",why:{k:"r_spike"},data:[["this",Math.round(curTot*10)/10],["avg",Math.round(prevAvg*10)/10]],benefit:"b_spike",act:"ack"});
  for(const id of ids){ const m=EXM[id],ss=sessionsFor(workouts,id); if(!m||!ss.length) continue; const last=ss.at(-1); if(last.date<addDays(today,-42)) continue;
    const g=progression(ss,id,p),tgtFat=fat.has(m.tgt),safe=!spike&&!painEx.has(id)&&!tgtFat;
    if(painEx.has(id)){ const alt=[...m.alt].filter(a=>EXM[a]&&allowed(EXM[a],p,lv)&&!painEx.has(a))[0]; out.push({id:`pain:${id}:${last.date}`,type:"pain",sev:3,conf:"high",subject:id,why:{k:"r_pain"},data:[["date",last.date]],benefit:"b_pain",act:alt?"sub":"ack",alt}); continue; }
    if(g.action==="increase"&&safe) out.push({id:`inc:${id}:${last.date}`,type:"increase",sev:1,conf:g.conf,subject:id,why:g.why[0],data:[["last",`${last.top} × ${last.allReps.join("/")}`],["next",`${g.w} × ${g.r}`],["n",g.n]],benefit:"b_inc",act:"target",w:g.w,r:g.r});
    else if(g.action==="reduce") out.push({id:`red:${id}:${last.date}`,type:"reduce",sev:2,conf:g.conf,subject:id,why:g.why[0],data:[["last",`${last.top} × ${last.allReps.join("/")}`],["next",`${g.w} × ${g.r}`]],benefit:"b_red",act:"target",w:g.w,r:g.r});
    else if(g.action==="increase"&&!safe) out.push({id:`hold:${id}:${last.date}`,type:"hold",sev:2,conf:"medium",subject:id,why:{k:"r_hold",v:{c:spike?"spike":tgtFat?"fat":"pain"}},data:[["last",`${last.top} × ${last.allReps.join("/")}`]],benefit:"b_hold",act:"ack"});
    const pl=plateau(ss); if(pl.plateau&&!painEx.has(id)) out.push({id:`plat:${id}:${last.date}`,type:"plateau",sev:2,conf:"medium",subject:id,why:{k:"r_plat"},data:[["best",pl.best],["recent",pl.recent],["n",pl.n]],benefit:"b_plat",act:"ack"});
  }
  const det=(workouts||[]).filter(w=>w.date>=addDays(today,-14)&&(w.exercises||[]).some(e=>EXM[e.exId])).length;
  if(det>=2){ const v14=weeklyVolume(workouts,addDays(today,-13),today).muscles;
    for(const m of MUSCLES) if(v14[m].sets===0&&!fat.has(m)) out.push({id:`neglect:${m}:${wk}`,type:"neglect",sev:1,conf:"medium",subject:m,why:{k:"r_neg"},data:[["d",14]],benefit:"b_neg",act:"ack"});
    const b=balance(v14); if(b.enough&&b.pushPull&&(b.pushPull>1.6||b.pushPull<.6)) out.push({id:`pp:${wk}`,type:"ratio",sev:2,conf:"low",subject:"pp",why:{k:"r_pp"},data:[["push",b.push],["pull",b.pull]],benefit:"b_pp",act:"ack"}); }
  return out.sort((a,b)=>b.sev-a.sev||a.id.localeCompare(b.id));
}
/** applyStates(recs, states, today) -> {active, history}; states[id]={st:"accepted|dismissed|snoozed",t,until?}. Snoozed items reappear after `until`. */
export function applyStates(recs,states,today){ const active=[],hist=[];
  for(const r of recs){ const s=states&&states[r.id]; if(!s){active.push(r);continue} if(s.st==="snoozed"&&s.until&&s.until<=today){active.push(r);continue} hist.push({...r,state:s.st}); }
  return {active,history:hist}; }
/* ---------- tools (all results are estimates / arithmetic) ---------- */
export function plateCalc(target,bar=20,plates=[25,20,15,10,5,2.5,1.25]){
  if(!(target>0)||!(bar>0)) return {ok:false,err:"bad"}; if(target<bar) return {ok:false,err:"low"};
  let side=Math.round((target-bar)/2*100),per=[];for(const p of [...plates].sort((a,b)=>b-a)){const c=Math.round(p*100);while(side>=c){per.push(p);side-=c}}
  const ach=Math.round((bar+2*per.reduce((a,x)=>a+x,0))*100)/100;return {ok:true,perSide:per,achieved:ach,diff:Math.round((target-ach)*100)/100};
}
export function warmup(work,inc=2.5){ if(!(work>0)) return []; return [[.4,8],[.6,5],[.75,3],[.9,1]].map(([f,r])=>({w:Math.max(inc,Math.round(work*f/inc)*inc),r})).filter((x,i,a)=>x.w<work&&(!i||x.w>a[i-1].w)); }
export const RPE_GUIDE=[[10,0],[9.5,0],[9,1],[8.5,1.5],[8,2],[7,3],[6,4]];
