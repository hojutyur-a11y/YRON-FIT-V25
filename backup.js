/* VYRON FIT v14 — backup/restore v2. Legacy v13/v1 files still import. Restore never deletes local data; conflicts follow the user's explicit choice. */
import {exportAll,STORES,all,put} from "vy/database";
import {toast,modal,closeModal} from "vy/ui";
import {importAthlete,loadAthlete} from "vy/profile";
import {S,smartSnapshot,smartRestore} from "vy/smart";
import {v21Snapshot,v21Restore} from "vy/v21-ui";
import {v23Snapshot,v23Restore} from "vy/v23-ui";
import {v24Snapshot,v24Restore} from "vy/v24-ui";
import {buildBackup,validateBackup} from "vy/smart-v14";
export async function downloadBackup(){
  const d=await exportAll();let athlete=null;try{athlete=loadAthlete()}catch{}
  const data=buildBackup({stores:d.stores,athlete,smart:smartSnapshot()});data.v21=v21Snapshot();data.v23=v23Snapshot();data.v24=v24Snapshot();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`vyron-fit-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
  try{localStorage.setItem("vyronLastBackup",new Date().toISOString())}catch{}
  toast(S("bkDone").length?"✓":"✓");
}
async function importStores(data,mode){let n=0;for(const s of STORES){const ex=new Set((await all(s)).map(x=>x.id));for(const it of (data.stores&&data.stores[s])||[]){if(!it||typeof it!=="object"||it.id==null)continue;if(ex.has(it.id)&&mode==="keep")continue;await put(s,it);n++}}return n}
export async function restoreBackup(file){
  if(!file)return;let data;
  try{data=JSON.parse(await file.text())}catch{return modal(S("bkT"),`<p>${S("bkBad")}</p>`)}
  const existing={};for(const s of STORES)existing[s]=(await all(s)).map(x=>x.id);
  const v=validateBackup(data,existing);
  if(!v.ok)return modal(S("bkT"),`<p>${S("bkBad")}</p><div class="action-row"><button class="secondary-btn" data-sc="x">${S("ok")}</button></div>`);
  const m=data.smartMeta||{},sm=data.smart?`<p class="sc-m">${S("bkSmart",{a:(data.smart.alog||[]).length,c:(data.smart.ach||[]).length})}</p>`:"";
  modal(S("bkT"),`<p>${S("bkSum",{n:v.sum.fresh,d:v.sum.dup})}</p>${v.warnings.includes("legacy-format")?`<p class="sc-m">${S("bkLeg")}</p>`:""}${v.warnings.includes("newer-version")?`<p class="sc-m">${S("bkNew")}</p>`:""}${sm}<div class="action-row"><button class="primary-btn" data-bk="keep">${S("bkKeep")}</button><button class="secondary-btn" data-bk="backup">${S("bkOver")}</button><button class="secondary-btn" data-bk="x">${S("cancel")}</button></div>`);
  const root=document.getElementById("modalRoot");
  root.addEventListener("click",async function h(e){const b=e.target.closest("[data-bk]");if(!b)return;root.removeEventListener("click",h);const mode=b.dataset.bk;if(mode==="x")return closeModal();
    try{await importStores(data,mode);if(data.athlete)try{importAthlete(data.athlete)}catch{}if(data.smart&&typeof data.smart==="object")smartRestore(data.smart,mode);if(data.v21)v21Restore(data.v21,mode);if(data.v23)v23Restore(data.v23,mode);if(data.v24)v24Restore(data.v24,mode);closeModal();toast(S("bkDone"));window.dispatchEvent(new Event("datachange"))}catch(err){closeModal();modal(S("bkT"),`<p>${S("bkBad")}</p>`)}});
}
