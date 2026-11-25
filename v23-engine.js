/* VYRON FIT v23 — Smart Athletic Training Planner: pure engine (no DOM). Everything here is a training ESTIMATE, not a medical fact.
   Evidence rule (from the research brief): numbers appear only where a source gives them; speed/power dosing is left to the coach (no borrowed numbers). */
export const SRC={
 nasm:{n:"NASM OPT Model / Periodization Training Simplified",y:2024,note:"12–20 reps at ~50–70% 1RM for stabilization endurance; phases shift priority gradually"},
 rep:{n:"RepCount — Rest between sets",y:2024,note:"3–5 min heavy compounds (strength), 2–3 min compounds (size), 60–90 s isolation, 30–60 s muscular endurance; adjust to performance"},
 sing:{n:"Singer et al. — rest intervals & hypertrophy (Bayesian meta-analysis)",y:2024,note:"small benefit of >60 s rest for hypertrophy"},
 scho:{n:"Schoenfeld et al. — Loading recommendations for strength, hypertrophy and local endurance",y:2021,note:"the classic repetition continuum is not fully supported by current research"},
 lor:{n:"Lorenz & Morrison — Current Concepts in Periodization of Strength and Conditioning for the Sports Physical Therapist",y:2015,note:"macro/meso/micro structure; strength is the foundation for power, speed and agility"},
 wil:{n:"Wilson et al. — Concurrent training: meta-analysis of interference",y:2012,note:"endurance work can blunt strength/power gains; size depends on modality, frequency, duration"},
 wang:{n:"Wang et al. — Optimizing concurrent training programs (review)",y:2024,note:"two sequencing orders gave similar gains over a 9-week intervention"},
 iss:{n:"Issurin — Building the Modern Athlete / block periodization review",y:2015,note:"block periodization benefits and limits; residual training effects"},
 bompa:{n:"Bompa & Buzzichelli — Periodization: Theory and Methodology of Training",y:2019,note:"general reference"},
 haff:{n:"Haff & Triplett — Essentials of Strength Training and Conditioning",y:2016,note:"general reference"},
 zat:{n:"Zatsiorsky, Kraemer & Fry — Science and Practice of Strength Training",y:2021,note:"general reference"},
 grg:{n:"Grgic et al. — Effects of rest interval duration in resistance training on strength",y:2018,note:"general reference"},
 thu:{n:"Thurlow et al. — Acute demands of repeated-sprint training in team-sport athletes",y:2023,note:"general reference"},
 coach:{n:"Coach-defined",y:"",note:"No reliable numeric dosing in the available sources — the coach/athlete sets it and logs quality"}};
export const Q=["strength","endurance","speed"];
const T=(id,q,ar,en,goal,o={})=>({id,q,ar,en,goal,sets:o.sets||null,reps:o.reps||null,int:o.int||null,rest:o.rest||null,src:o.src||"coach",gate:!!o.gate,cat:o.cat||null,tgt:o.tgt||null,note:o.note||""});
export const TYPES=[
 T("maxStr","strength","القوة القصوى","Maximal strength","أعلى إنتاج للقوة بأحمال عالية",{reps:"قليلة (تحددها الشدة)",int:"شدة عالية",rest:[180,300],src:"rep",cat:"strength",tgt:"compound",note:"تكرارات أقل وراحة أطول (NASM, RepCount)"}),
 T("explosive","strength","القوة الانفجارية","Explosive strength","سرعة إنتاج القوة",{rest:null,gate:true,cat:"strength",note:"الراحة حتى استعادة جودة الأداء — يحدد المدرب الجرعة"}),
 T("fastStr","strength","القوة السريعة","Speed-strength","قوة بسرعة حركة عالية",{gate:true,cat:"strength",note:"جودة الحركة قبل الحجم"}),
 T("strEnd","strength","تحمل القوة","Strength endurance","تكرار جهد قوة دون هبوط",{reps:"12–20",int:"~50–70% 1RM",rest:[30,60],src:"nasm",cat:"strength",note:"نطاق مرحلة التثبيت والتحمل (NASM)؛ راحة 30–60 ث (RepCount)"}),
 T("relStr","strength","القوة النسبية","Relative strength","القوة مقابل وزن الجسم",{rest:[120,300],src:"rep",cat:"strength",note:"تمارين وزن الجسم والمركبة؛ راحة مرتبطة بالصعوبة"}),
 T("genStr","strength","القوة العضلية العامة","General muscular strength","قاعدة قوة عامة",{rest:[120,180],src:"rep",cat:"strength",tgt:"compound",note:"مركبة 2–3 د، عزل 60–90 ث (RepCount)"}),
 T("aerobic","endurance","التحمل الهوائي","Aerobic endurance","رفع القدرة الهوائية",{note:"مدة وشدة يحددها المستخدم/المدرب"}),
 T("anaerobic","endurance","التحمل اللاهوائي","Anaerobic endurance","تحمل الجهود عالية الشدة",{gate:true}),
 T("muscEnd","endurance","التحمل العضلي","Muscular endurance","تحمل موضعي",{reps:"12–20",int:"~50–70% 1RM",rest:[30,60],src:"nasm",cat:"strength",note:"30–60 ث (RepCount)"}),
 T("cardio","endurance","التحمل الدوري التنفسي","Cardiorespiratory endurance","كفاءة القلب والتنفس",{note:"RPE وضربات القلب عند توفرها"}),
 T("sportEnd","endurance","التحمل الخاص بالرياضة","Sport-specific endurance","نمط جهد الرياضة",{note:"يُشتق من متطلبات الرياضة"}),
 T("reaction","speed","سرعة رد الفعل","Reaction speed","زمن الاستجابة",{gate:true}),
 T("move","speed","سرعة الحركة","Movement speed","سرعة الحركة المفردة",{gate:true}),
 T("transit","speed","سرعة الانتقال","Transit speed","الانتقال بين نقطتين",{gate:true}),
 T("accel","speed","سرعة التسارع","Acceleration","الانطلاق والتسارع (10–30 م)",{gate:true,note:"مسافات الاختبار 10/20/30 م؛ الجرعة يحددها المدرب"}),
 T("maxSpeed","speed","السرعة القصوى","Maximal speed","أعلى سرعة ممكنة",{gate:true,note:"راحة طويلة كافية؛ لا تبدأ التكرار التالي قبل استعادة الجودة"}),
 T("speedEnd","speed","تحمل السرعة","Speed endurance","الحفاظ على السرعة عبر التكرارات",{gate:true}),
 T("sportSpeed","speed","السرعة الخاصة بالرياضة","Sport-specific speed","سرعة بنمط الرياضة",{gate:true})];
export const typeOf=id=>TYPES.find(t=>t.id===id);
export const QN={strength:["القوة","Strength"],endurance:["التحمل","Endurance"],speed:["السرعة","Speed"]};
/* ---- sports: weights = share of focus (strength,endurance,speed); not physiological constants ---- */
export const SPORTS={
 football:{ar:"كرة القدم",en:"Football",w:[30,35,35],t:{strength:["maxStr","explosive"],endurance:["aerobic","anaerobic"],speed:["accel","maxSpeed","speedEnd"]},note:"الراحة تختلف بين الجري والتمارين الفنية والبدنية"},
 basketball:{ar:"كرة السلة",en:"Basketball",w:[35,25,40],t:{strength:["explosive","relStr"],endurance:["anaerobic","sportEnd"],speed:["accel","move","reaction"]},note:"قفز وتغيير اتجاه متكرر"},
 handball:{ar:"كرة اليد",en:"Handball",w:[40,25,35],t:{strength:["fastStr","maxStr"],endurance:["anaerobic","sportEnd"],speed:["accel","reaction"]},note:"رمي وقفز واحتكاك"},
 athletics:{ar:"ألعاب القوى",en:"Athletics",w:[30,30,40],t:{strength:["maxStr","explosive"],endurance:["aerobic","speedEnd"],speed:["accel","maxSpeed"]},note:"يعتمد على التخصص (عدو/مسافات/وثب/رمي)"},
 swimming:{ar:"السباحة",en:"Swimming",w:[25,55,20],t:{strength:["relStr","strEnd"],endurance:["aerobic","anaerobic","cardio"],speed:["move","speedEnd"]},note:"قوة الجزء العلوي والجذع وتحمل خاص"},
 volleyball:{ar:"الكرة الطائرة",en:"Volleyball",w:[40,15,45],t:{strength:["explosive","fastStr"],endurance:["sportEnd"],speed:["reaction","move"]},note:"قفزات متكررة؛ انتبه لحمل الركبة"},
 weightlifting:{ar:"رفع الأثقال",en:"Weightlifting",w:[70,10,20],t:{strength:["maxStr","explosive","relStr"],endurance:["muscEnd"],speed:["move"]},note:"راحة كافية للحفاظ على جودة الرفعات"},
 bodybuilding:{ar:"كمال الأجسام",en:"Bodybuilding",w:[70,20,10],t:{strength:["genStr","strEnd"],endurance:["muscEnd","aerobic"],speed:["move"]},note:"مركبة 2–3 د، عزل 60–90 ث (RepCount)"},
 martial:{ar:"الفنون القتالية",en:"Martial arts",w:[30,35,35],t:{strength:["fastStr","relStr"],endurance:["anaerobic","sportEnd"],speed:["reaction","move","speedEnd"]},note:"جولات عالية الشدة وراحة بين الجولات"},
 general:{ar:"اللياقة العامة",en:"General fitness",w:[40,40,20],t:{strength:["genStr","strEnd"],endurance:["aerobic","muscEnd"],speed:["move"]},note:"تقدم تدريجي مع قاعدة استقرار وتحمل"},
 sprint:{ar:"العدو السريع",en:"Sprinting",w:[30,10,60],t:{strength:["maxStr","explosive"],endurance:["speedEnd"],speed:["accel","maxSpeed","speedEnd"]},note:"راحة طويلة بما يكفي للحفاظ على الجودة"}};
/* ---- tests (applicability by age/level; no classification norms) ---- */
export const TESTS=[
 {id:"push",ar:"تكرارات الضغط",en:"Push-ups (max reps)",q:"strength",u:"reps",hi:1,min:0},
 {id:"bwsq",ar:"سكوات وزن الجسم (تكرارات)",en:"Bodyweight squats (reps)",q:"strength",u:"reps",hi:1,min:0},
 {id:"vj",ar:"القفز العمودي",en:"Vertical jump",q:"strength",u:"cm",hi:1,min:0},
 {id:"e1rm",ar:"1RM تقديري (وزن × تكرارات)",en:"Estimated 1RM",q:"strength",u:"kg",hi:1,min:1,adv:true},
 {id:"run12",ar:"جري 12 دقيقة",en:"12-minute run",q:"endurance",u:"m",hi:1,min:0},
 {id:"run",ar:"جري مسافة محددة (زمن)",en:"Timed distance run",q:"endurance",u:"s",hi:0,min:0},
 {id:"musc",ar:"تحمل عضلي (تكرارات)",en:"Muscular endurance (reps)",q:"endurance",u:"reps",hi:1,min:0},
 {id:"s10",ar:"عدو 10 م",en:"10 m sprint",q:"speed",u:"s",hi:0,min:0},
 {id:"s20",ar:"عدو 20 م",en:"20 m sprint",q:"speed",u:"s",hi:0,min:0},
 {id:"s30",ar:"عدو 30 م",en:"30 m sprint",q:"speed",u:"s",hi:0,min:0}];
export const testOf=id=>TESTS.find(t=>t.id===id);
export const isMinor=a=>Number.isFinite(+a.age)&&+a.age>0&&+a.age<18;
export function testsFor(a){const lvl=a.level||"beginner",adv=lvl==="advanced"||lvl==="pro";return TESTS.filter(t=>!(t.adv&&(!adv||isMinor(a))))}
export const epley=(w,r)=>w>0&&r>=1&&r<=10?Math.round(w*(1+r/30)*10)/10:null;
export function validTest(t){return t&&testOf(t.test)&&Number.isFinite(+t.value)&&+t.value>=testOf(t.test).min&&+t.value<100000&&/^\d{4}-\d{2}-\d{2}$/.test(t.date||"")}
export function compare(tests,id){const l=tests.filter(x=>x.test===id).sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0));if(!l.length)return null;const c=l.at(-1),p=l.at(-2),d=testOf(id);const diff=p?Math.round((c.value-p.value)*100)/100:null;return{cur:c,prev:p||null,diff,better:p?(d.hi?diff>0:diff<0):null,n:l.length}}
/* ---- rest engine: starting range from type + adjustment from actual performance (never a fixed rule) ---- */
export function restFor({typeId,exType="compound",lvl="intermediate",lostReps=0,qualityDrop=false,rpe=null}){
 const t=typeOf(typeId)||{};let r=t.rest?[...t.rest]:null,basis=t.src,gate=!!t.gate;
 if(t.cat==="strength"&&typeId==="genStr"&&exType==="isolation"){r=[60,90];basis="rep"}
 if(!r)return{range:null,gate:true,basis:"coach",adj:0,why:"no_numeric"};
 let adj=0,why="start";
 if(lostReps>0||qualityDrop||(rpe!=null&&rpe>=9.5)){adj=Math.min(60,30*Math.max(1,lostReps||1));why="perf_drop"}
 if(lvl==="beginner"&&!adj){adj=0}
 return{range:[r[0]+adj,r[1]+adj],gate,basis,adj,why};}
export const fmtT=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
/* ---- periodization ---- */
export const PHASES={gen:["الإعداد العام","General preparation"],spec:["الإعداد الخاص","Specific preparation"],str:["تطوير القوة","Strength development"],pow:["السرعة والقدرة الانفجارية","Speed & power"],end:["التحمل الخاص","Specific endurance"],comp:["المنافسة","Competition"],rec:["الاستشفاء والانتقال","Recovery & transition"],acc:["كتلة التراكم","Accumulation block"],trn:["كتلة التحويل","Transmutation block"],rea:["كتلة الإنجاز","Realization block"],und:["تموّج أسبوعي","Weekly undulation"],con:["تدريب متزامن","Concurrent"]};
export const MODELS=["linear","undulating","block","concurrent"];
export const MN={linear:["خطي","Linear"],undulating:["متموج","Undulating"],block:["كتلي","Block"],concurrent:["متزامن","Concurrent"]};
const PH_DEF={linear:[["gen",3],["str",3],["pow",2],["comp",1],["rec",1]],block:[["acc",4],["trn",3],["rea",2]],undulating:[["und",1]],concurrent:[["con",1]]};
const FOCUS={gen:[30,50,20],spec:[40,30,30],str:[60,20,20],pow:[35,15,50],end:[20,60,20],comp:[30,25,45],rec:[20,60,20],acc:[45,35,20],trn:[40,25,35],rea:[35,15,50],und:null,con:null};
export function recommendModel({weeks,level,sport,comp}){if(level==="beginner")return{m:"linear",why:"lvl"};if(comp&&weeks>=12)return{m:"block",why:"comp"};if(weeks<=8)return{m:"undulating",why:"short"};return{m:sport==="general"?"concurrent":"linear",why:"def"}}
/* build(): phases are DEFAULT proportions and fully editable (no source gives universal phase lengths). */
export function build(o){
 const weeks=Math.max(4,Math.min(52,Math.round(+o.weeks||12))),m=MODELS.includes(o.model)?o.model:"linear",sp=SPORTS[o.sport]||SPORTS.general;
 const def=(o.order&&o.order.length?o.order.map(k=>[k,1]):PH_DEF[m]);const tot=def.reduce((a,x)=>a+x[1],0);let left=weeks;
 let ph=def.map((x,i)=>{const w=i===def.length-1?left:Math.max(1,Math.round(weeks*x[1]/tot));left-=w;return{k:x[0],w}});
 if(left!==0&&ph.length){let i=0;while(ph.reduce((a,x)=>a+x.w,0)!==weeks&&i<200){const d=weeks-ph.reduce((a,x)=>a+x.w,0);const j=i%ph.length;if(d>0)ph[j].w++;else if(ph[j].w>1)ph[j].w--;i++}}
 const prim=Q.includes(o.primary)?o.primary:Q[sp.w.indexOf(Math.max(...sp.w))],secs=(o.secondary||Q.filter(q=>q!==prim));
 const bias=(f)=>{const base=sp.w.slice();let v=f?f.slice():base.slice();const pi=Q.indexOf(prim);if(!f)v[pi]+=15;else v=v.map((x,i)=>Math.round(x*0.7+base[i]*0.3));const s=v.reduce((a,b)=>a+b,0),r=v.map(x=>Math.round(x*100/s));r[r.indexOf(Math.max(...r))]+=100-r.reduce((a,b)=>a+b,0);return r};
 let wk=1;ph=ph.map(p=>{const f=bias(FOCUS[p.k]);const r={...p,from:wk,to:wk+p.w-1,focus:f};wk+=p.w;return r});
 return{v:1,id:o.id||Date.now().toString(36),created:o.created||new Date().toISOString().slice(0,10),weeks,model:m,sport:o.sport in SPORTS?o.sport:"general",primary:prim,secondary:secs,days:Math.max(2,Math.min(6,+o.days||3)),minutes:Math.max(20,Math.min(150,+o.minutes||60)),level:o.level||"beginner",start:o.start||new Date().toISOString().slice(0,10),phases:ph,setDelta:0,deload:o.deload!==false};
}
export const phaseAt=(p,wk)=>p.phases.find(x=>wk>=x.from&&wk<=x.to)||p.phases.at(-1);
export const weekOf=(p,date)=>{const d=Math.floor((new Date(date+"T00:00:00")-new Date(p.start+"T00:00:00"))/864e5);return d<0?0:Math.min(p.weeks,Math.floor(d/7)+1)};
export const isDeloadWeek=(p,wk)=>p.deload&&wk>=4&&wk%4===0&&wk<p.weeks;
/* microcycle: sequence rules from the concurrent-training sources — separate hard endurance and hard strength, neural/speed work first after rest, then recovery */
export function micro(p,wk){
 const ph=phaseAt(p,wk),sp=SPORTS[p.sport],f=ph.focus,days=p.days,dl=isDeloadWeek(p,wk);
 const order=Q.map((q,i)=>({q,i,v:f[i]+(q===p.primary?8:0)})).sort((a,b)=>b.v-a.v);
 const slots=[];let k=0;while(slots.length<days){const q=order[k%3];slots.push(q.q);k++}
 const rank={speed:0,strength:1,endurance:2};slots.sort((a,b)=>rank[a]-rank[b]);
 const dn=[0,1,2,3,4,5,6];
 const used=Array.from({length:7},()=>null);
 const g=days===6?[0,1,2,3,4,5]:days===5?[0,1,3,4,5]:days===4?[0,1,3,4]:days===3?[0,2,4]:[0,3];
 g.forEach((d,i)=>{const q=slots[i],ts=sp.t[q],tid=ts[(wk+i)%ts.length];used[d]={q,type:tid,sets:null}});
 let und=ph.k==="und"||p.model==="undulating";
 return dn.map(d=>{const s=used[d];if(!s)return{d,rest:true,rec:"active"};const t=typeOf(s.type);let tp=s.type;if(und&&s.q==="strength"){tp=["maxStr","explosive","strEnd"][(d+wk)%3]}
  const T=typeOf(tp),r=restFor({typeId:tp});return{d,q:s.q,type:tp,min:Math.round(p.minutes*(dl?.8:1)),load:dl?"deload":(und&&s.q==="strength"?["heavy","power","light"][(d+wk)%3]:"normal"),rest:false,rr:r.range,gate:r.gate,setAdj:(dl?-1:0)+(p.setDelta||0),note:T.note}});
}
/* ---- interference & relationship analysis ---- */
export function interference(week){const w=week.filter(x=>!x.rest),f=[];
 for(let i=0;i<7;i++){const a=week[i],b=week[(i+1)%7];if(!a.rest&&!b.rest&&((a.q==="endurance"&&b.q==="strength")||(a.q==="strength"&&b.q==="endurance")))f.push({k:"adj",d:i})}
 for(let i=0;i<7;i++){const a=week[i],b=week[(i+1)%7];if(!a.rest&&!b.rest&&a.q==="endurance"&&b.q==="speed")f.push({k:"endSpeed",d:i})}
 return f;}
/* ---- adaptive engine: needs >=2 signals before "fatigue"; never raises load by itself; each rec has a reason ---- */
export function analyze({logs=[],tests=[],prog=null,today}){
 const out=[],L=logs.filter(x=>x.done).sort((a,b)=>a.date.localeCompare(b.date)),R=[];
 const recent=L.slice(-6),prior=L.slice(-12,-6);
 const avg=(a,f)=>a.length?a.reduce((s,x)=>s+(+f(x)||0),0)/a.length:null;
 if(L.some(x=>x.pain&&x.date>=addDays(today,-7)))out.push({k:"pain",tone:"stop",why:"pain"});
 if(prog){const wk=weekOf(prog,today),planned=Math.max(1,(wk-1)*prog.days),done=L.filter(x=>x.pi===prog.id).length,pc=Math.round(Math.min(100,done/planned*100));
  if(wk>2&&pc<60)out.push({k:"adherence",tone:"review",why:"adherence",v:pc})}
 if(recent.length>=3&&prior.length>=3){const a=avg(recent,x=>x.srpe),b=avg(prior,x=>x.srpe),fat=recent.filter(x=>x.fatigue>=4).length,slp=recent.filter(x=>x.sleep&&x.sleep<=2).length;
  const sig=[a-b>=1,fat>=2,slp>=2,L.slice(-3).every(x=>x.lost>0)].filter(Boolean).length;
  if(sig>=2)out.push({k:"deload",tone:"reduce",why:"fatigue",v:sig,delta:-1})}
 const ids=[...new Set(tests.map(t=>t.test))];
 for(const id of ids){const c=compare(tests,id);if(c&&c.prev&&c.n>=3){const l=tests.filter(x=>x.test===id).sort((a,b)=>a.date.localeCompare(b.date)).slice(-3),d=testOf(id);const imp=d.hi?(l[2].value>l[1].value&&l[1].value>=l[0].value):(l[2].value<l[1].value&&l[1].value<=l[0].value),flat=d.hi?(l[2].value<=l[0].value):(l[2].value>=l[0].value);
  const rp=avg(recent,x=>x.srpe);
  if(imp&&!out.some(o=>o.k==="pain"||o.k==="deload")&&(rp==null||rp<=8))out.push({k:"progress",tone:"increase",why:"improving",test:id,delta:1});
  else if(flat)out.push({k:"stall",tone:"review",why:"no_progress",test:id})}}
 return out.map((o,i)=>({id:"r"+today+"_"+o.k+(o.test||""),date:today,status:"pending",...o}));
}
export function addDays(d,n){const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`}
export function sessionLoad(l){return Math.round((+l.srpe||0)*(+l.min||0))}
/* ---- data layer helpers: schema, validation, dedupe, migration, merge ---- */
export const SCHEMA=1;
export const empty=()=>({schema:SCHEMA,athlete:null,tests:[],prog:null,logs:[],recs:[],rest:[],audit:[]});
export function validAthlete(a){return!!a&&Number.isFinite(+a.age)&&+a.age>=8&&+a.age<=90&&(a.days>=1&&a.days<=7)&&(a.minutes>=15&&a.minutes<=240)}
export function migrate(d){const e=empty();if(!d||typeof d!=="object")return e;const o={...e,...d,schema:SCHEMA};for(const k of["tests","logs","recs","rest","audit"])if(!Array.isArray(o[k]))o[k]=[];return o}
export function merge(a,b,keep=true){const o=migrate(a),n=migrate(b);for(const k of["tests","logs","recs","rest"]){const m=new Map(o[k].map(x=>[x.id,x]));for(const x of n[k])if(x&&x.id&&(!m.has(x.id)||!keep))m.set(x.id,x);o[k]=[...m.values()]}if(!o.athlete||!keep)o.athlete=n.athlete||o.athlete;if(!o.prog||!keep)o.prog=n.prog||o.prog;return o}
