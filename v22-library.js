/* VYRON FIT v22 — Exercise library 2.0 (pure): localized names, filters, functional substitution, generic technique cues per movement pattern. */
import {EXM,allowed} from "vy/smart-engine";
import {FR} from "vy/exdb-ext";
export const exName=(id,lang="en")=>{const m=EXM[id];if(!m)return id;return lang==="ar"?m.n[0]:lang==="fr"?(FR[id]||m.n[1]):m.n[1]};
export const exData=id=>{const m=EXM[id];return m?{id,source:"vyron-curated",media:null,mediaAttribution:null,primary:m.tgt,secondary:m.sec,equipment:m.eq,pattern:m.pat,difficulty:m.diff,type:m.type,restrictions:m.rs,alternatives:m.alt}:null};
export const MUSCLE_LIST=()=>[...new Set(Object.values(EXM).map(e=>e.tgt))].sort();
export const EQUIP_LIST=()=>[...new Set(Object.values(EXM).flatMap(e=>e.eq))].sort();
/** filter({q,tgt,eq,pat,diff,fav:Set,onlyFav,noEquip}) — q matches ar/en/fr names. */
export function filterEx({q="",tgt="",eq="",pat="",diff=0,fav=null,onlyFav=false,noEquip=false}={}){
  const s=q.trim().toLowerCase();
  return Object.values(EXM).filter(e=>{
    if(tgt&&e.tgt!==tgt&&!e.sec.includes(tgt))return false;
    if(eq&&!e.eq.includes(eq))return false;
    if(noEquip&&e.eq.length)return false;
    if(pat&&e.pat!==pat)return false;
    if(diff&&e.diff!==diff)return false;
    if(onlyFav&&!(fav&&fav.has(e.id)))return false;
    if(s&&![e.n[0],e.n[1],FR[e.id]||"",e.id].some(x=>x.toLowerCase().includes(s)))return false;
    return true}).map(e=>e.id);
}
/** substitute(exId,{p,lv,unavailable,painMuscles,goal,limit}) -> [{id,score,reasons}]. Keeps target muscle, similar movement pattern/difficulty, available equipment, profile limits. */
export function substitute(exId,{p=null,lv=3,unavailable=[],painMuscles=[],goal=null,limit=3}={}){
  const o=EXM[exId];if(!o)return[];const out=[];
  for(const e of Object.values(EXM)){
    if(e.id===exId||e.cat!==o.cat||e.tgt!==o.tgt)continue;
    if(e.eq.some(x=>unavailable.includes(x)))continue;
    if(painMuscles.includes(e.tgt))continue;
    if(p&&!allowed(e,p,lv))continue;
    if(e.diff>o.diff+1)continue;
    let sc=2;const r=["same_target"];
    if(e.pat===o.pat){sc+=3;r.push("same_pattern")}
    if(e.type===o.type)sc+=1;
    if(Math.abs(e.diff-o.diff)<=1){sc+=2;r.push("similar_difficulty")}
    if(o.alt.includes(e.id)||e.alt.includes(o.id)){sc+=2;r.push("listed_alt")}
    sc+=Math.min(2,e.sec.filter(x=>o.sec.includes(x)).length);
    if(goal&&e.goals.includes(goal))sc+=1;
    out.push({id:e.id,score:sc,reasons:r});
  }
  return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
}
/* Generic technique cues per movement pattern (standard coaching points, not a diagnosis). k: start|steps|breath|mistakes */
export const CUES={
squat:{start:"قدمان بعرض الكتفين، صدر مرفوع.|Feet shoulder-width, chest up.|Pieds écartés largeur d'épaules, poitrine haute.",steps:"انزل بالورك والركبتين معاً مع بقاء الكعبين على الأرض ثم ادفع للأعلى.|Sit down and back, heels flat, then drive up.|Descendez hanches et genoux ensemble, talons au sol, puis poussez.",breath:"شهيق عند النزول، زفير عند الصعود.|Inhale down, exhale up.|Inspirez en descendant, expirez en montant.",mistakes:"انهيار الركبتين للداخل، رفع الكعبين، تقوّس الظهر.|Knees caving in, heels lifting, rounded back.|Genoux vers l'intérieur, talons décollés, dos arrondi."},
hinge:{start:"ظهر محايد وركبتان مرنتان.|Neutral spine, soft knees.|Dos neutre, genoux souples.",steps:"ادفع الورك للخلف مع بقاء الحمل قريباً من الجسم ثم ارجع بالورك للأمام.|Push hips back with the load close, then drive hips forward.|Hanches vers l'arrière, charge proche du corps, puis poussez les hanches.",breath:"شهيق قبل النزول وزفير عند القيام.|Inhale before lowering, exhale on the way up.|Inspirez avant, expirez en remontant.",mistakes:"تقوّس أسفل الظهر، ابتعاد الحمل عن الجسم.|Rounding the lower back, load drifting away.|Bas du dos arrondi, charge éloignée."},
lunge:{start:"وقفة ثابتة وجذع منتصب.|Stable stance, upright torso.|Position stable, buste droit.",steps:"خطوة محكومة وانزل حتى تقترب الركبة الخلفية من الأرض ثم ادفع بالقدم الأمامية.|Step, lower under control, push through the front foot.|Pas contrôlé, descendez, poussez avec le pied avant.",breath:"زفير عند الدفع.|Exhale as you push.|Expirez en poussant.",mistakes:"ركبة تنهار للداخل، خطوة قصيرة جداً.|Knee collapsing in, step too short.|Genou vers l'intérieur, pas trop court."},
push:{start:"كتفان بعيدان عن الأذنين وجسم مشدود.|Shoulders away from ears, body braced.|Épaules basses, corps gainé.",steps:"انزل بتحكم ثم ادفع حتى تمديد الذراعين دون قفل عنيف.|Lower under control, press until arms extend without harsh lock-out.|Descendez en contrôle, poussez sans verrouillage brutal.",breath:"شهيق عند النزول وزفير عند الدفع.|Inhale down, exhale pressing.|Inspirez en descendant, expirez en poussant.",mistakes:"ترهل الورك، توسيع المرفقين كثيراً.|Sagging hips, flaring elbows.|Hanches affaissées, coudes trop écartés."},
vpush:{start:"جذع مشدود وضلوع للأسفل.|Braced torso, ribs down.|Buste gainé, côtes basses.",steps:"ادفع الحمل فوق الرأس في خط مستقيم ثم انزل بتحكم.|Press overhead in a straight line, lower under control.|Poussez au-dessus de la tête en ligne droite, redescendez en contrôle.",breath:"زفير عند الدفع.|Exhale pressing.|Expirez en poussant.",mistakes:"تقوّس أسفل الظهر، رفع الكتفين.|Arching the lower back, shrugging.|Dos cambré, épaules haussées."},
pull:{start:"صدر مفتوح وكتفان للأسفل.|Chest open, shoulders down.|Poitrine ouverte, épaules basses.",steps:"اسحب المرفقين نحو الجسم مع ضم لوحي الكتف ثم أرجع ببطء.|Drive elbows back, squeeze shoulder blades, return slowly.|Tirez les coudes, serrez les omoplates, revenez lentement.",breath:"زفير عند السحب.|Exhale pulling.|Expirez en tirant.",mistakes:"استخدام الزخم، رفع الكتفين.|Using momentum, shrugging.|Élan, épaules haussées."},
vpull:{start:"قبضة ثابتة وجذع مشدود.|Firm grip, braced torso.|Prise ferme, buste gainé.",steps:"اسحب المرفقين نحو الأسفل حتى يقترب الصدر من القضيب ثم انزل ببطء.|Pull elbows down until chest nears the bar, lower slowly.|Tirez les coudes vers le bas, redescendez lentement.",breath:"زفير عند السحب.|Exhale pulling.|Expirez en tirant.",mistakes:"التأرجح، نزول سريع.|Swinging, dropping fast.|Balancement, descente rapide."},
iso:{start:"وضعية ثابتة وحمل خفيف يمكن التحكم به.|Stable position, a load you can control.|Position stable, charge contrôlable.",steps:"حرّك المفصل المستهدف فقط ببطء وتحكم.|Move only the target joint, slow and controlled.|Mobilisez seulement l'articulation visée, lentement.",breath:"زفير أثناء الجهد.|Exhale on effort.|Expirez à l'effort.",mistakes:"الزخم وحمل ثقيل جداً.|Momentum and too-heavy loads.|Élan et charge trop lourde."},
core:{start:"ضلوع للأسفل وحوض محايد.|Ribs down, neutral pelvis.|Côtes basses, bassin neutre.",steps:"ثبّت الجذع وتنفس بانتظام أثناء التمرين.|Brace the trunk and keep breathing steadily.|Gainez le tronc et respirez régulièrement.",breath:"تنفس طبيعي دون حبس.|Breathe normally, no breath-holding.|Respiration normale.",mistakes:"تقوّس الظهر وحبس النفس.|Arched back and breath-holding.|Dos cambré, apnée."},
cardio:{start:"ابدأ بوتيرة سهلة.|Start at an easy pace.|Commencez doucement.",steps:"ارفع الشدة تدريجياً وتحدث بجمل قصيرة إن أمكن.|Build intensity gradually; you should be able to speak short sentences.|Augmentez progressivement.",breath:"تنفس منتظم.|Steady breathing.|Respiration régulière.",mistakes:"البدء سريعاً جداً.|Starting too fast.|Partir trop vite."},
mobility:{start:"حركة بلا ألم ونطاق مريح.|Pain-free, comfortable range.|Sans douleur, amplitude confortable.",steps:"حرّك أو اثبت ببطء دون ارتداد.|Move or hold slowly, no bouncing.|Lentement, sans rebonds.",breath:"تنفس عميق وهادئ.|Slow, deep breathing.|Respiration lente.",mistakes:"الإجبار على نطاق مؤلم.|Forcing a painful range.|Forcer une amplitude douloureuse."}};
export const cueFor=(id,lang,k)=>{const m=EXM[id],c=m&&CUES[m.pat];if(!c)return"";const p=c[k].split("|");return p[lang==="ar"?0:lang==="fr"?2:1]};
export const SAFETY={knee:"الركبة|knee|genou",back:"الظهر|back|dos",shoulder:"الكتف|shoulder|épaule",wrist:"الرسغ|wrist|poignet",hip:"الورك|hip|hanche",ankle:"الكاحل|ankle|cheville",heavy:"أحمال ثقيلة|heavy loading|charges lourdes",impact:"ارتداد/قفز|impact|impact",balance:"توازن|balance|équilibre",floor:"عمل على الأرض|floor work|travail au sol"};
export const safetyLabel=(k,lang)=>{const p=(SAFETY[k]||k).split("|");return p[lang==="ar"?0:lang==="fr"?2:1]||k};
