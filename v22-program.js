/* VYRON FIT v22 — Training Program Builder (pure). Rules-based; every exercise is re-checked against the profile (equipment, limits, age, level). */
import {EXM,allowed,assess} from "vy/smart-engine";
import {substitute} from "vy/v22-library";
export const GOALS=["hypertrophy","strength","general","fatloss","endurance","home","beginner","advanced"];
export const SPLITS=["fullbody","upperlower","ppl","bro","arnold","strength","custom"];
export const DURATIONS=[4,6,8,10,12];
const BIG=["chest","back","quads","hamstrings"];
const DAY={FULL:["quads","chest","back","hamstrings","shoulders","core"],UP:["chest","back","shoulders","biceps","triceps"],LOW:["quads","hamstrings","glutes","calves","core"],
PUSH:["chest","shoulders","triceps"],PULL:["back","biceps","traps"],LEGS:["quads","hamstrings","glutes","calves","core"],
CH:["chest","triceps"],BK:["back","biceps"],SH:["shoulders","traps","core"],ARM:["biceps","triceps"],CB:["chest","back"],SHA:["shoulders","biceps","triceps"]};
const CYCLE={fullbody:[["FULL","Full A"],["FULL","Full B"],["FULL","Full C"]],upperlower:[["UP","Upper"],["LOW","Lower"]],ppl:[["PUSH","Push"],["PULL","Pull"],["LEGS","Legs"]],
bro:[["CH","Chest"],["BK","Back"],["SH","Shoulders"],["ARM","Arms"],["LEGS","Legs"]],arnold:[["CB","Chest+Back"],["SHA","Shoulders+Arms"],["LEGS","Legs"]],strength:[["UP","Upper"],["LOW","Lower"]]};
const dayList=(split,n,custom)=>{if(split==="custom")return(custom||[]).slice(0,7).map((m,i)=>({label:"Day "+(i+1),muscles:m.filter(x=>typeof x==="string")})).filter(d=>d.muscles.length);
  const cy=CYCLE[split]||CYCLE.fullbody;return Array.from({length:n},(_,i)=>{const [k,l]=cy[i%cy.length];return{label:l,muscles:[...DAY[k]]}})};
export function phases(weeks,goal){const out=[],work=weeks-Math.floor(weeks/4)-(weeks%4===0?0:1),half=Math.ceil(work/2);let c=0;
  for(let w=1;w<=weeks;w++){const meso=Math.floor((w-1)/4)+1,deload=weeks>=4&&(w%4===0||w===weeks);let ph;
    if(deload)ph="deload";else{c++;ph=goal==="strength"?(c<=half?"hypertrophy":"strength"):goal==="hypertrophy"?"hypertrophy":"progression"}
    out.push({w,phase:ph,meso,block:ph==="strength"?"strength":ph==="deload"?"deload":"accumulation"})}return out}
const profFor=(p,o)=>{const eq=o.goal==="home"?(p.eq||[]).filter(x=>["dumbbell","band","step","bar","bench"].includes(x)):(o.eq||p.eq||[]);return{...p,eq}};
const levelFor=(p,goal)=>{const l=assess(p).level;return goal==="beginner"?1:l};
function pickDay(muscles,p,lv,goal,{strengthBias=false}={}){
  const items=[],used=new Set();
  const total=muscles.length,per=m=>total<=3&&m!=="core"?2:BIG.includes(m)&&total<=4?2:1;
  for(const m of muscles){
    let c=Object.values(EXM).filter(e=>(e.cat==="strength"||e.cat==="core")&&e.tgt===m&&allowed(e,p,lv)&&!used.has(e.id));
    const g=goal==="strength"?"strength":goal==="endurance"||goal==="fatloss"?"endurance":null;
    c.sort((a,b)=>((b.type==="compound")-(a.type==="compound"))*(m==="core"?0:1)||(g?(b.goals.includes(g)-a.goals.includes(g)):0)||(strengthBias?b.diff-a.diff:a.diff-b.diff)||a.id.localeCompare(b.id));
    for(const e of c.slice(0,per(m))){used.add(e.id);items.push({id:e.id,sets:goal==="beginner"?Math.min(3,e.sets):e.sets,reps:e.reps})}
  }
  items.sort((a,b)=>(EXM[b.id].type==="compound")-(EXM[a.id].type==="compound")||(EXM[b.id].diff-EXM[a.id].diff));
  if(goal==="fatloss"||goal==="endurance"){const cd=Object.values(EXM).filter(e=>e.cat==="cardio"&&allowed(e,p,lv)).sort((a,b)=>a.diff-b.diff||a.id.localeCompare(b.id))[0];if(cd)items.push({id:cd.id,sets:cd.sets,reps:cd.reps})}
  return items}
/** buildProgram({goal,split,weeks,days,p,eq,custom,start,name}) -> program or {error}. Training days are never forced: the user chooses split/days. */
export function buildProgram({goal="general",split="fullbody",weeks=8,days=3,p,eq,custom,start,name=""}){
  if(!p)return{error:"no_profile"};if(!GOALS.includes(goal))return{error:"bad_goal"};if(!SPLITS.includes(split))return{error:"bad_split"};if(!DURATIONS.includes(weeks))return{error:"bad_weeks"};
  days=Math.max(1,Math.min(7,days|0||3));const pp=profFor(p,{goal,eq}),lv=levelFor(p,goal);
  const tmpl=dayList(split,days,custom).map(d=>({label:d.label,muscles:d.muscles,items:pickDay(d.muscles,pp,lv,goal,{strengthBias:split==="strength"||goal==="strength"})})).filter(d=>d.items.length);
  if(!tmpl.length)return{error:"no_exercises"};
  return{id:"prg_"+Date.now().toString(36),v:1,name:name||`${goal} / ${split}`,goal,split,weeks,days:tmpl.length,start:start||new Date().toISOString().slice(0,10),eq:pp.eq,custom:custom||null,phases:phases(weeks,goal),tmpl,shift:0,rampUntil:null,events:[],created:Date.now()}}
const dd=(a,b)=>Math.round((Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/864e5);
export function position(pr,today){const raw=Math.floor(dd(pr.start,today)/7)-(pr.shift||0);if(dd(pr.start,today)<0)return{state:"notStarted",week:0};
  if(raw>=pr.weeks)return{state:"finished",week:pr.weeks,ph:pr.phases[pr.weeks-1]};const w=Math.max(1,raw+1),ph=pr.phases[w-1],ramp=pr.rampUntil&&today<pr.rampUntil;return{state:"active",week:w,ph,next:pr.phases[w]||null,ramp:!!ramp}}
/** sessionFor(pr,dayIdx,today): items with prescription for the current phase (deload / ramp-back = fewer sets & lighter intent). */
export function sessionFor(pr,dayIdx,today){const pos=position(pr,today),d=pr.tmpl[dayIdx];if(!d)return null;const low=pos.state==="active"&&(pos.ph.phase==="deload"||pos.ramp),str=pos.state==="active"&&pos.ph.phase==="strength";
  return{label:d.label,phase:pos.ph?.phase||null,items:d.items.map(i=>{const m=EXM[i.id];let sets=i.sets,reps=i.reps;if(low)sets=Math.max(1,Math.round(sets*.6));else if(str&&m.type==="compound"&&m.eq.length&&m.rb>=6){reps="4-6";sets=Math.min(5,sets+1)}return{id:i.id,sets,reps,rest:str&&!low?Math.max(m.rest,90):m.rest,u:m.u||""}})}}
/** adjust(pr,ev,{p,today}) — events: break{days} | goal{goal} | equipment{eq} | days{days} | pain{muscle?,exId?} | perfDrop. Never deletes progress (start/shift kept). */
export function adjust(pr,ev,{p,today}){const n={...pr,events:[...pr.events,{t:ev.type,date:today}]};
  const rebuild=o=>{const r=buildProgram({goal:o.goal||pr.goal,split:pr.split,weeks:pr.weeks,days:o.days||pr.days,p,eq:o.eq||pr.eq,custom:pr.custom,start:pr.start,name:pr.name});return r.error?{...n,error:r.error}:{...r,id:pr.id,shift:n.shift,rampUntil:n.rampUntil,events:n.events,created:pr.created}};
  if(ev.type==="break"){const w=Math.floor(ev.days/7);if(ev.days>=14)n.shift=(pr.shift||0)+Math.max(1,Math.floor(w/2));if(ev.days>=7){const x=new Date(today+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+7);n.rampUntil=x.toISOString().slice(0,10)}return n}
  if(ev.type==="perfDrop"){const x=new Date(today+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+7);n.rampUntil=x.toISOString().slice(0,10);return n}
  if(ev.type==="goal")return rebuild({goal:ev.goal});if(ev.type==="equipment")return rebuild({eq:ev.eq});if(ev.type==="days")return rebuild({days:ev.days});
  if(ev.type==="pain"){const lv=levelFor(p,pr.goal),pp=profFor(p,{goal:pr.goal,eq:pr.eq}),hit=id=>id===ev.exId||(ev.muscle&&EXM[id]?.tgt===ev.muscle);
    n.tmpl=pr.tmpl.map(d=>({...d,items:d.items.flatMap(i=>{if(!hit(i.id))return[i];const s=substitute(i.id,{p:pp,lv,painMuscles:ev.muscle?[ev.muscle]:[],goal:pr.goal==="strength"?"strength":null,limit:5}).find(x=>!hit(x.id)&&!d.items.some(j=>j.id===x.id));return s?[{...i,id:s.id,reps:EXM[s.id].reps}]:[]})})).filter(d=>d.items.length);return n}
  return n}
/** progress(pr,workouts,today) — from stored workouts only. Adherence = distinct smart-workout days since start / planned sessions elapsed (approximation). */
export function progress(pr,workouts,today){const pos=position(pr,today),ws=(workouts||[]).filter(w=>w.smart&&w.date>=pr.start&&w.date<=today&&(w.exercises||[]).length),days=new Set(ws.map(w=>w.date)).size;
  const weeksElapsed=pos.state==="active"?pos.week:pos.state==="finished"?pr.weeks:0,planned=Math.max(0,(pos.state==="active"?pos.week-1:weeksElapsed)*pr.days),totalPlanned=pr.weeks*pr.days;
  const wkStart=new Date(today+"T00:00:00Z");wkStart.setUTCDate(wkStart.getUTCDate()-wkStart.getUTCDay());const wk=wkStart.toISOString().slice(0,10),thisWk=new Set(ws.filter(w=>w.date>=wk).map(w=>w.date)).size;
  return{state:pos.state,week:pos.week,phase:pos.ph?.phase||null,block:pos.ph?.block||null,meso:pos.ph?.meso||null,nextPhase:pos.next?.phase||null,ramp:!!pos.ramp,done:days,remaining:Math.max(0,totalPlanned-days),weeklyTarget:pr.days,thisWeek:thisWk,adherence:planned>0?Math.min(100,Math.round(days/planned*100)):null}}
