const DB_NAME="vyron-fit-db", DB_VERSION=1;
const STORES=["workouts","exercises","measurements","schedule","notes","reminders","records"];
export function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;STORES.forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:"id"});});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function all(store){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
export async function put(store,value){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store,"readwrite").objectStore(store).put(value);r.onsuccess=()=>res(value);r.onerror=()=>rej(r.error);});}
export async function remove(store,id){const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(store,"readwrite").objectStore(store).delete(id);r.onsuccess=()=>res(true);r.onerror=()=>rej(r.error);});}
export async function exportAll(){const out={version:1,exportedAt:new Date().toISOString(),stores:{}};for(const s of STORES)out.stores[s]=await all(s);return out;}
export async function importAll(data){if(!data||!data.stores)throw new Error("ملف النسخة الاحتياطية غير صالح");for(const s of STORES){for(const item of (data.stores[s]||[]))await put(s,item);}return true;}
export {STORES};