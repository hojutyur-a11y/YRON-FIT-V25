/* VYRON FIT v14 — SMART engine (pure, no DOM): exercise metadata, assessment, matching, generation. Extracted unchanged from v13 smart.js, plus optional fatigue filter. */
import {EXT_RAW} from "vy/exdb-ext";
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,cl=(x,a,b)=>Math.max(a,Math.min(b,x));
/* ---------- ExerciseMetadata: id|ar|en|category|target|secondary|type|difficulty|equipment|pattern|sets|reps|rest|restrictions|alternatives|goals ---------- */
const RAW=`bwsquat|سكوات بوزن الجسم|Bodyweight squat|strength|quads|glutes|compound|1||squat|3|10-15|45|knee|chairsq,wallsit|general,strength,endurance,conditioning
chairsq|قرفصاء على كرسي|Chair squat|strength|quads|glutes|compound|1|step|squat|3|8-12|45|knee|glbridge|general,strength,mobility
wallsit|جلوس على الحائط|Wall sit|strength|quads|glutes|isometric|1||squat|3|20-40s|45|knee|glbridge|general,endurance,conditioning
goblet|سكوات جوبلت|Goblet squat|strength|quads|glutes,core|compound|1|dumbbell|squat|3|8-12|60|knee|bwsquat|strength,general,athletic
legpress|ضغط الأرجل|Leg press|strength|quads|glutes|compound|1|machine|squat|3|8-12|75|knee|goblet|strength,general
bbsquat|سكوات بالبار|Barbell squat|strength|quads|glutes,back|compound|3|barbell|squat|4|5-8|120|knee,back,heavy|goblet,legpress|strength,athletic
revlunge|اندفاع خلفي|Reverse lunge|strength|quads|glutes|compound|2||lunge|3|8-12|60|knee,hip|stepup|general,strength,athletic
stepup|صعود على درجة|Step-up|strength|quads|glutes|compound|2|step|lunge|3|8-12|60|knee|bwsquat|general,endurance,athletic
glbridge|جسر الأرداف|Glute bridge|strength|glutes|hamstrings|compound|1||hinge|3|10-15|45|floor|rdl|general,strength,mobility
rdl|رفعة رومانية بالدمبل|Dumbbell RDL|strength|hamstrings|glutes,back|compound|2|dumbbell|hinge|3|8-12|75|back|glbridge|strength,general,athletic
deadlift|رفعة ميتة بالبار|Barbell deadlift|strength|hamstrings|glutes,back|compound|3|barbell|hinge|3|4-6|150|back,hip,heavy|rdl|strength
wallpush|ضغط على الحائط|Wall push-up|strength|chest|triceps,shoulders|compound|1||push|3|10-15|45||inclpush|general,mobility
inclpush|ضغط مائل|Incline push-up|strength|chest|triceps,shoulders|compound|1|step|push|3|8-12|60|wrist|wallpush|general,strength,endurance
pushup|ضغط|Push-up|strength|chest|triceps,shoulders|compound|2||push|3|8-15|60|wrist,shoulder,floor|inclpush|strength,general,conditioning,athletic
dbpress|ضغط بالدمبل|Dumbbell bench press|strength|chest|triceps,shoulders|compound|2|dumbbell,bench|push|3|8-12|75|shoulder|pushup,chestpress|strength,general
chestpress|ضغط الصدر بالآلة|Machine chest press|strength|chest|triceps|compound|1|machine|push|3|8-12|75|shoulder|inclpush|strength,general
ohpress|ضغط الكتف بالدمبل|Dumbbell shoulder press|strength|shoulders|triceps|compound|2|dumbbell|vpush|3|8-12|75|shoulder,back|latraise|strength,general
dbrow|تجديف بالدمبل|One-arm dumbbell row|strength|back|biceps|compound|1|dumbbell|pull|3|8-12|60||bandrow|strength,general
bandrow|تجديف بالمطاط|Band row|strength|back|biceps|compound|1|band|pull|3|12-15|45||dbrow|general,endurance,mobility
cablerow|تجديف جالس بالآلة|Seated machine row|strength|back|biceps|compound|1|machine|pull|3|8-12|60||bandrow|strength,general
pulldown|سحب أمامي|Lat pulldown|strength|back|biceps|compound|1|machine|vpull|3|8-12|60|shoulder|cablerow|strength,general
pullup|عقلة|Pull-up|strength|back|biceps|compound|3|bar|vpull|3|3-8|120|shoulder,wrist|pulldown|strength,athletic
latraise|رفرفة جانبية|Lateral raise|strength|shoulders||isolation|1|dumbbell|iso|2|10-15|45|shoulder|ohpress|general,strength
curl|بايسبس بالدمبل|Dumbbell curl|strength|biceps||isolation|1|dumbbell|iso|2|10-12|45||bandrow|strength,general
plank|بلانك|Plank|core|core|shoulders|isometric|1||core|3|20-40s|45|floor,shoulder|pallof|general,strength,conditioning
deadbug|ديد باغ|Dead bug|core|core||stability|1||core|3|8-12|45|floor|pallof|general,mobility
pallof|ضغط بالوف بالمطاط|Band Pallof press|core|core|shoulders|stability|1|band|core|3|10-12|45||plank|general,athletic
walk|مشي سريع|Brisk walk|cardio|fullbody||cardio|1||cardio|1|10-20m|0||march|endurance,general,conditioning,mobility
march|مشي في المكان|March in place|cardio|fullbody||cardio|1||cardio|1|3-8m|0|balance|walk|endurance,general
jog|جري خفيف|Easy jog|cardio|fullbody||cardio|2||cardio|1|10-20m|0|knee,ankle,impact|walk,bike|endurance,conditioning,athletic
bike|دراجة ثابتة|Stationary bike|cardio|quads|calves|cardio|1|machine|cardio|1|10-20m|0||walk|endurance,conditioning,general
jacks|قفز بالتناوب|Jumping jacks|conditioning|fullbody||cardio|1||cardio|3|30s|30|impact,shoulder|march|conditioning,endurance
mclimb|متسلق الجبل|Mountain climber|conditioning|core|shoulders|cardio|2||cardio|3|20-30s|40|floor,wrist,shoulder,impact|jacks,march|conditioning,endurance,athletic
catcow|قط-بقرة|Cat-cow|mobility|spine||mobility|1||mobility|2|8-10|20|floor,wrist,knee|thoracic|mobility,general
thoracic|دوران الصدر|Thoracic rotation|mobility|spine|shoulders|mobility|1||mobility|2|8-10|20||catcow|mobility,general
hipopen|دوائر الورك واقفاً|Standing hip circles|mobility|hips||mobility|1||mobility|2|8-10|20|balance,hip|thoracic|mobility,athletic
hamstr|إطالة الفخذ الخلفي|Standing hamstring stretch|mobility|hamstrings||mobility|1||mobility|2|30s|15|back|thoracic|mobility,general
shouldcirc|دوائر الكتف|Shoulder circles|mobility|shoulders||mobility|1||mobility|2|10-12|15|shoulder|thoracic|mobility,general
${EXT_RAW}`.split("\n").map(r=>{const f=r.split("|"),sp=x=>x?x.split(","):[],m=/^(\d+)(?:-(\d+))?([sm])?$/.exec(f[11]);const e={id:f[0],n:[f[1],f[2]],cat:f[3],tgt:f[4],sec:sp(f[5]),type:f[6],diff:+f[7],cx:+f[7],eq:sp(f[8]),pat:f[9],sets:+f[10],reps:f[11],ra:+m[1],rb:+(m[2]||m[1]),u:m[3]||"",rest:+f[12],rs:sp(f[13]),alt:sp(f[14]),goals:sp(f[15])};e.est=Math.max(1,Math.round(e.sets*((e.u==="m"?e.ra*60:e.u==="s"?e.ra:e.ra*3.5)+e.rest)/60));return e});
const EXM=Object.fromEntries(RAW.map(e=>[e.id,e]));
/* ---------- UserFitnessProfile helpers + FitnessAssessmentEngine ---------- */
const GOALS=["general","strength","endurance","mobility","athletic","conditioning"],EXP=["beginner","intermediate","advanced"],CONS=["inactive","occasional","d12","d34","d5"],ENV=["home","gym","outdoor","body"],EQ=["dumbbell","bench","barbell","machine","bar","band","step"],LIM=["knee","back","shoulder","wrist","hip","ankle","impact","floor"],DUR=[15,30,45,60];
const ENVEQ={home:["step"],gym:["dumbbell","bench","barbell","machine","bar","band","step"],outdoor:["step","bar"],body:[]};
const AGEC={youth:{d:1,ban:["heavy","impact"],v:.8,r:0},teen:{d:2,ban:["heavy"],v:.9,r:0},adult:{d:3,ban:[],v:1,r:0},mid:{d:3,ban:[],v:.95,r:10},senior:{d:2,ban:["heavy","impact"],v:.85,r:15}};
const ageNum=d=>{if(d.dob){const b=new Date(d.dob),n=new Date();if(isNaN(b))return NaN;let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return a}return+d.age};
const band=a=>a<16?"youth":a<18?"teen":a<40?"adult":a<60?"mid":"senior";
const VOL={inactive:.7,occasional:.8,d12:.9,d34:1,d5:1},MAXD={inactive:2,occasional:2,d12:3,d34:4,d5:5};
export function assess(p){const e=EXP.indexOf(p.exp)+1||1,c=p.cap||{},v=[c.push,c.plank,c.squat].filter(x=>x>0),ev=v.length?v.reduce((a,b)=>a+b)/v.length:Math.min(e,2);return{level:Math.max(1,Math.min(e,Math.round(ev))),age:band(ageNum(p))}}
/* ---------- ExerciseMatchingEngine ---------- */
const allowed=(e,p,lv)=>{const ab=AGEC[band(ageNum(p))],eq=p.eq||[];return e.eq.every(x=>eq.includes(x))&&!e.rs.some(r=>(p.lim||[]).includes(r)||ab.ban.includes(r))&&!(p.avoid||[]).includes(e.id)&&e.diff<=Math.min(lv,ab.d)};
function pick(slot,p,lv,used,seed,fat){const g=p.goals||[],sc=e=>e.goals.filter(x=>g.includes(x)).length*2+((p.pref||[]).some(x=>x===e.cat||(x==="body"&&!e.eq.length))?1:0);const c=RAW.filter(e=>e.pat===slot&&!used.has(e.id)&&allowed(e,p,lv)&&!(fat&&fat.has(e.tgt))).sort((a,b)=>sc(b)-sc(a)||a.id.localeCompare(b.id));if(!c.length)return null;const top=c.filter(e=>sc(e)===sc(c[0]));return top[seed%top.length]}
/* ---------- WorkoutGenerationEngine ---------- */
function presc(e,p,w,eased){const ab=AGEC[band(ageNum(p))],lv=assess(p).level,vol=ab.v*VOL[p.cons||"inactive"]*(1+.12*w),g=p.goals||[],t=g.includes("strength")?0:g.includes("endurance")||g.includes("conditioning")?1:.5;let sets=e.sets,reps;if(e.u==="m"){reps=Math.max(e.ra,Math.round((e.ra+(e.rb-e.ra)*(lv-1)/2)*Math.min(1,vol)))}else{sets=cl(Math.round(e.sets*vol),1,5);if(eased&&sets>1)sets--;reps=Math.round(e.ra+(e.rb-e.ra)*t)}const rest=e.rest?e.rest+ab.r+(eased?15:0):0,work=e.u==="m"?reps*60:e.u==="s"?reps:reps*3.5;return{id:e.id,o:e.id,sets,reps,u:e.u,rest,est:Math.max(1,Math.round(sets*(work+rest)/60))}}
const SLOTS={full:["squat","push","pull","hinge","core","cardio"],upper:["push","pull","vpush","vpull","iso","core"],lower:["squat","hinge","lunge","core","cardio"],cond:["cardio","squat","push","cardio","core"],rec:["mobility","mobility","mobility","cardio","mobility"]};
const EXTRA={full:["push","pull","lunge","iso"],upper:["pull","push","iso","core"],lower:["lunge","squat","core","hinge"],cond:["push","pull","iso"],rec:[]},RK={mobility:0,squat:1,hinge:1,lunge:1,push:1,pull:1,vpush:1,vpull:1,iso:2,core:3,cardio:4};
function gen(p,s,focus,date,eased,fat){const lv=assess(p).level,w=s.w||0,dur=p.dur||30,dt=new Date(date+"T00:00:00"),wk=Math.floor(dt.getTime()/6048e5),bd=band(ageNum(p)),mob=bd==="mid"||bd==="senior"||(p.goals||[]).includes("mobility")?2:1,seq=focus==="rec"?SLOTS.rec:[...Array(mob).fill("mobility"),...SLOTS[focus]],used=new Set(),out=[],cap=[7,9,10][lv-1];let tot=0,i=0;
 const add=slot=>{const e0=pick(slot,p,lv,used,wk+(i++)+dt.getDay(),fat);if(!e0)return;used.add(e0.id);const o=(s.sw||{})[date+":"+e0.id],e=o&&EXM[o]&&allowed(EXM[o],p,lv)&&!(fat&&fat.has(EXM[o].tgt))?EXM[o]:e0,x=presc(e,p,w,eased);x.o=e0.id;x.r=RK[e0.pat];if(tot+x.est>dur){if(x.u==="m"&&dur-tot>=3){x.reps=Math.floor(dur-tot);x.est=x.reps}else return}tot+=x.est;out.push(x)};
 seq.forEach(add);for(const sl of EXTRA[focus]||[]){if(dur-tot<5||out.length>=cap)break;add(sl)}return out.sort((a,b)=>a.r-b.r)}
const swapNext=(p,s,date,x,sess)=>{const lv=assess(p).level,o=EXM[x.o],ids=new Set(sess.map(y=>y.id));const c=[...o.alt,...RAW.filter(e=>e.pat===o.pat).map(e=>e.id)].filter((id,i,a)=>a.indexOf(id)===i&&id!==x.o&&EXM[id]&&allowed(EXM[id],p,lv)&&(!ids.has(id)||id===x.id));const full=[x.o,...c];return full[(full.indexOf(x.id)+1)%full.length]};

/* ---------- AdaptiveTrainingPlanner ---------- */
const PAT={1:[3],2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,5,6]},FOC={1:["full"],2:["full","full"],3:["full","full","full"],4:["upper","lower","upper","lower"],5:["upper","lower","cond","upper","lower"]};
const best=(a,k)=>{if(a.length<=k)return a.slice();let b=null,bs=-1;(function r(i,c){if(c.length===k){const m=Math.min(...c.map((x,j)=>((c[(j+1)%k]-x+7)%7)||7));if(m>bs){bs=m;b=c.slice()}return}if(i>=a.length)return;r(i+1,[...c,a[i]]);r(i+1,c)})(0,[]);return b};
function weekDays(p,s,wk,now=new Date()){const s0=new Date(now);s0.setHours(0,0,0,0);s0.setDate(s0.getDate()-s0.getDay());const cap=MAXD[p.cons]||2,pf=(p.days||[]).slice().sort((a,b)=>a-b),n=pf.length?Math.min(cap,pf.length):cap,tr=pf.length?best(pf,n):PAT[n],foc=FOC[n].slice();if(n<=3&&(p.goals||[]).some(g=>g==="endurance"||g==="conditioning"))foc[n-1]="cond";const dd=new Set(wk.map(x=>x.date)),t0=iso(now);
 const ds=Array.from({length:7},(_,i)=>{const d=new Date(s0);d.setDate(s0.getDate()+i);const k=tr.indexOf(i),date=iso(d);return{i,date,kind:k>=0?"train":"rest",focus:k>=0?foc[k]:null,done:dd.has(date),today:date===t0}});
 ds.forEach((d,i)=>{if(d.kind==="rest"&&n>=4&&i>0&&ds[i-1].kind==="train")d.kind="rec"});
 Object.entries(s.mv||{}).forEach(([f,t])=>{const a=ds.find(x=>x.date===f),b=ds.find(x=>x.date===t);if(a&&b&&a.kind==="train"&&!a.done&&b.kind!=="train"){b.kind="train";b.focus=a.focus;a.kind="rest"}});
 ds.forEach(d=>{d.st=d.done?"done":d.kind!=="train"?d.kind:d.date<t0?(d.date>=(p.created||"0")?"missed":"past"):d.today?"today":"planned"});ds.cap=cap;ds.n=n;return ds}
const run3=k=>{let m=0,c=0;k.forEach(x=>{c=x==="train"?c+1:0;m=Math.max(m,c)});return m};
const moveCands=(ds,f)=>ds.filter(x=>x.date>f.date&&x.date>=iso(new Date())&&x.kind!=="train"&&!x.done&&run3(ds.map(y=>y===x?"train":y===f?"rest":y.kind))<3);

export {weekDays,moveCands,PAT,FOC,iso,cl,GOALS,EXP,CONS,ENV,EQ,LIM,DUR,ENVEQ,AGEC,ageNum,band,VOL,MAXD,RAW,EXM,allowed,pick,presc,gen,swapNext,SLOTS,EXTRA,RK};
