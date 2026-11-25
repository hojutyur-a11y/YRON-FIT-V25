/* VYRON FIT v20 — Analytics & reports (pure). Only stored data; an empty period yields {empty:true}, never invented numbers. */
import {EXM} from "vy/smart-engine";
import {workSets,epley,weeklyVolume} from "vy/smart-v15";
const day=(d,n)=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
export function periodRange(kind,today){ const n={daily:0,weekly:6,monthly:29,quarterly:89,yearly:364}[kind];return n==null?null:{from:day(today,-n),to:today,kind} }
export function report(workouts,{from,to}){
  const ws=(workouts||[]).filter(w=>w.date>=from&&w.date<=to&&(w.exercises||[]).length);
  if(!ws.length) return {empty:true,from,to,workouts:0};
  let sets=0,reps=0,vol=0;const rp=[],ex={},pr={};
  for(const w of ws)for(const e of w.exercises){const s=workSets(e);sets+=s.length;
    for(const x of s){if(x.r){reps+=x.r;vol+=x.w*x.r;const one=epley(x.w,x.r);if(one&&(!pr[e.exId]||one>pr[e.exId].e1))pr[e.exId]={e1:one,date:w.date}}if(x.rpe!=null)rp.push(x.rpe)}
    ex[e.exId]=(ex[e.exId]||0)+1}
  const days=new Set(ws.map(w=>w.date)),span=Math.max(1,Math.round((Date.parse(to)-Date.parse(from))/864e5)+1);
  return {empty:false,from,to,workouts:ws.length,days:days.size,sets,reps,volume:Math.round(vol),avgRpe:rp.length?Math.round(rp.reduce((a,b)=>a+b,0)/rp.length*10)/10:null,rpeSamples:rp.length,
    avgRir:rp.length?Math.round((10-rp.reduce((a,b)=>a+b,0)/rp.length)*10)/10:null,consistency:Math.round(days.size/span*100),exerciseFreq:ex,prs:pr,muscles:weeklyVolume(ws,from,to).muscles};
}
const q=v=>{const s=String(v??"");return /^[=+\-@\t\r]/.test(s)?"'"+s:s}, cell=v=>{const s=q(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
export function toCSV(workouts){const rows=[["date","exercise","set","type","kg","reps","rpe"]];
  for(const w of workouts||[])for(const e of w.exercises||[]){workSets(e).forEach((s,i)=>rows.push([w.date,e.exId,i+1,s.t,s.w,s.r??"",s.rpe??""]))}
  return "\ufeff"+rows.map(r=>r.map(cell).join(",")).join("\r\n")}
/** Heatmap levels from effective weekly sets per muscle. Training volume only — NOT a recovery measure. */
export function heatLevels(muscles){const v=Object.entries(muscles||{});const mx=Math.max(0,...v.map(([,x])=>x.sets));
  return Object.fromEntries(v.map(([k,x])=>[k,{sets:x.sets,freq:x.freq,level:!x.sets?0:mx?Math.min(4,Math.max(1,Math.ceil(x.sets/mx*4))):0}]))}
