/* VYRON FIT v16 — exercise history series, templates / repeat-last, supersets & circuits (pure, no DOM/storage). */
import {EXM,allowed,iso} from "vy/smart-engine";
import {workSets,epley} from "vy/smart-v15";
/* ---------- 1. Exercise history (only stored records; sessions without known reps are skipped) ---------- */
export function exerciseSeries(workouts,exId){
  const out=[];
  for(const w of workouts||[]) for(const ex of w.exercises||[]){ if(ex.exId!==exId) continue;
    const s=workSets(ex).filter(x=>x.r!=null); if(!s.length) continue;
    const top=Math.max(...s.map(x=>x.w)),vol=s.reduce((a,x)=>a+x.w*x.r,0),e1=Math.max(0,...s.map(x=>epley(x.w,x.r)||0));
    out.push({date:w.date,t:w.t||Date.parse(w.date+"T12:00:00"),top,e1:e1||null,vol:Math.round(vol),sets:s.length,reps:s.reduce((a,x)=>a+x.r,0),bestReps:Math.max(...s.map(x=>x.r))});
  }
  return out.sort((a,b)=>a.t-b.t);
}
export function bests(series){ const b=(k)=>series.reduce((m,x)=>x[k]!=null&&x[k]>(m?m.v:0)?{v:x[k],date:x.date}:m,null); return {top:b("top"),e1:b("e1"),vol:b("vol"),bestReps:b("bestReps")}; }
/** chartModel(series,key,W,H) -> {ok,pts,min,max,d}; needs ≥2 positive points. Spacing is proportional to time. */
export function chartModel(series,key,W=320,H=150,pad={l:36,r:10,t:10,b:22}){
  const p=series.filter(x=>x[key]>0); if(p.length<2) return {ok:false,n:p.length};
  let lo=Math.min(...p.map(x=>x[key])),hi=Math.max(...p.map(x=>x[key])); if(lo===hi){lo=lo*.9;hi=hi*1.1||1}
  const t0=p[0].t,t1=p.at(-1).t||t0+1,iw=W-pad.l-pad.r,ih=H-pad.t-pad.b;
  const pts=p.map((x,i)=>({x:Math.round((pad.l+(t1===t0?i/(p.length-1):(x.t-t0)/(t1-t0))*iw)*10)/10,y:Math.round((pad.t+(1-(x[key]-lo)/(hi-lo))*ih)*10)/10,v:x[key],date:x.date}));
  return {ok:true,pts,min:lo,max:hi,d:pts.map((q,i)=>(i?"L":"M")+q.x+" "+q.y).join(" ")};
}
/* ---------- 3. Supersets / circuits: ex.ss===true links an exercise to the NEXT one ---------- */
export function groupsOf(exs){ const g=[],sz={};let id=0;
  exs.forEach((x,i)=>{ if(i>0&&!exs[i-1].ss) id++; g.push(id); sz[id]=(sz[id]||0)+1; });
  return exs.map((x,i)=>({g:g[i],size:sz[g[i]],pos:g.slice(0,i).filter(v=>v===g[i]).length+1,kind:sz[g[i]]>=3?"circuit":sz[g[i]]===2?"superset":"single"}));
}
/** seconds of rest to start after finishing a set of exercise i: 0 while more exercises of its group remain, otherwise the group's longest rest. */
export function restFor(exs,i){ if(exs[i].ss&&i<exs.length-1) return 0; const gs=groupsOf(exs),g=gs[i].g; return Math.max(0,...exs.filter((_,k)=>gs[k].g===g).map(x=>+x.rest||0)); }
/* ---------- 2. Templates / repeat last ---------- */
const est=x=>Math.max(1,Math.round(x.sets*((x.u==="m"?x.reps*60:x.u==="s"?x.reps:x.reps*3.5)+x.rest)/60));
export const cleanName=n=>String(n||"").replace(/[<>]/g,"").trim().slice(0,40);
export function templateFromAct(act,name,now=Date.now()){
  const ex=(act.ex||[]).filter(x=>EXM[x.id]).map(x=>({id:x.id,sets:Math.max(1,(x.sl&&x.sl.length)||x.sets||1),reps:x.reps,u:x.u||"",rest:x.rest||0,...(x.ss?{ss:true}:{})}));
  return {id:"tpl_"+now.toString(36),name:cleanName(name)||"Template",t:now,ex};
}
/** buildAct(items,{p,lv,date,focus,name}) -> {act,skipped}. Every exercise is re-checked against the CURRENT profile (equipment/limits/age); unsafe or unknown ones are skipped, never silently kept. */
export function buildAct(items,{p,lv,date,focus="custom",name="",now=Date.now()}){
  const keep=[],skipped=[];
  for(const it of items||[]){ const m=EXM[it.id]; if(!m||!allowed(m,p,lv)){skipped.push(it.id);continue} keep.push(it); }
  const ex=keep.map((it,i)=>{ const ok=it.ss&&items[items.indexOf(it)+1]===keep[i+1]&&keep[i+1];
    const x={id:it.id,sets:Math.max(1,it.sets|0||1),reps:it.reps,u:it.u||EXM[it.id].u||"",rest:it.rest||0,...(ok?{ss:true}:{})};x.est=est(x);
    return {...x,done:Array(x.sets).fill(0),w:"",sl:Array.from({length:x.sets},()=>({t:"work",w:it.w||"",r:"",rpe:"",done:0}))}; });
  return {act:{date:date||iso(new Date()),focus,t:now,mods:[],...(name?{name:cleanName(name)}:{}),ex},skipped};
}
/** items from a finished workout (repeat last session): same exercises/sets, last working weight pre-filled (the user's own value); reps left empty. */
export function itemsFromWorkout(w){
  return (w.exercises||[]).filter(e=>e.exId&&EXM[e.exId]).map(e=>({id:e.exId,sets:Math.max(1,workSets(e).length||+e.sets||1),reps:e.reps||EXM[e.exId].ra,u:e.unit||EXM[e.exId].u||"",rest:EXM[e.exId].rest||0,w:+e.weight>0?String(e.weight):"",...(e.ss?{ss:true}:{})}));
}
export const lastSmartWorkout=ws=>(ws||[]).filter(w=>w.smart&&(w.exercises||[]).some(e=>e.exId)).sort((a,b)=>(b.t||0)-(a.t||0)||(b.date>a.date?1:-1))[0]||null;
