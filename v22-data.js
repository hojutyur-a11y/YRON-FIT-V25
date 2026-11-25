/* VYRON FIT v22 — v21 data store: versioned migration, validation, duplicate-safe merge (pure). Original data is never dropped silently: invalid entries are counted. */
import {validFood,validMeasure} from "vy/v19-body";
export const SCHEMA=2;
const dedupe=a=>{const s=new Set(),o=[];for(const x of a||[]){if(!x||x.id==null||s.has(x.id))continue;s.add(x.id);o.push(x)}return o};
/** migrateV21(d): schema 1/absent -> 2. Ensures arrays/objects, de-duplicates ids, drops invalid rows (counted in .dropped). */
export function migrateV21(d){if(!d||typeof d!=="object"||Array.isArray(d))return{data:{schema:SCHEMA},dropped:0,from:null};
  const from=d.schema||1,out={...d},dropped={n:0};
  const keep=(a,f)=>{const src=Array.isArray(a)?a:[],r=dedupe(src).filter(f);dropped.n+=src.length-r.length;return r};
  out.food=keep(d.food,validFood);out.body=keep(d.body,validMeasure);
  out.prog=d.prog&&typeof d.prog==="object"&&Array.isArray(d.prog.tmpl)&&d.prog.start?d.prog:null;if(d.prog&&!out.prog)dropped.n++;
  for(const k of["dec","water","rd","prof","fav"])if(d[k]!=null&&typeof d[k]!=="object"){delete out[k];dropped.n++}
  out.schema=SCHEMA;return{data:out,dropped:dropped.n,from}}
/** mergeV21(cur,inc,mode): "keep" = existing wins on conflicts; "backup" = incoming wins. Duplicate ids never doubled. */
export function mergeV21(cur,inc,mode="keep"){const a=migrateV21(cur).data,b=migrateV21(inc).data,out={...a};
  const mrg=k=>{const first=mode==="keep"?a[k]:b[k],second=mode==="keep"?b[k]:a[k];out[k]=dedupe([...(first||[]),...(second||[])])};mrg("food");mrg("body");
  for(const k of["prog","prof","rd"])out[k]=mode==="keep"?(a[k]??b[k]):(b[k]??a[k]);
  for(const k of["dec","water"])out[k]=mode==="keep"?{...(b[k]||{}),...(a[k]||{})}:{...(a[k]||{}),...(b[k]||{})};
  out.fav=[...new Set([...(a.fav||[]),...(b.fav||[])])];out.schema=SCHEMA;return out}
/* ---------- voice command parser (digits only; speech engines usually return digits) ---------- */
const AR="٠١٢٣٤٥٦٧٨٩";
export function parseVoice(text){let t=String(text||"").toLowerCase().replace(/[٠-٩]/g,c=>AR.indexOf(c)).replace(/,/g,".");
  const rpe=/(?:rpe|ار بي اي|جهد|effort)\s*(\d+(?:\.\d)?)/.exec(t);if(rpe)t=t.replace(rpe[0]," ");
  let w=null,r=null,m;
  if((m=/(\d+(?:\.\d+)?)\s*(?:kg|كغ|كيلو|kilos?)?\s*(?:x|×|for|fois|مرات|ب)\s*(\d+)/.exec(t))){w=+m[1];r=+m[2]}
  else if((m=/(\d+)\s*(?:reps?|تكرار\w*|répétitions?|rép)/.exec(t))){r=+m[1];const k=/(\d+(?:\.\d+)?)\s*(?:kg|كغ|كيلو)/.exec(t);if(k)w=+k[1]}
  else if((m=/^\s*(\d+(?:\.\d+)?)\s+(\d+)\s*$/.exec(t))){w=+m[1];r=+m[2]}
  const ok=w!=null&&r!=null&&w>=0&&w<=1000&&r>=1&&r<=100;return ok?{w,r,...(rpe&&+rpe[1]>=1&&+rpe[1]<=10?{rpe:+rpe[1]}:{})}:null}
