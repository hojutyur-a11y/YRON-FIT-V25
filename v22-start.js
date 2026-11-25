/* VYRON FIT v22 — start a session in the existing set tracker (vyronSmart.act) from a list of items. Re-checks every exercise against the CURRENT profile. */
import {assess} from "vy/smart-engine";
import {buildAct} from "vy/smart-v16";
export function startItems(items,name=""){let s;try{s=JSON.parse(localStorage.getItem("vyronSmart"))||{}}catch{s={}}
  if(!s.profile)return{ok:false,err:"no_profile"};if(s.act)return{ok:false,err:"busy"};
  const r=buildAct(items,{p:s.profile,lv:assess(s.profile).level,date:new Date().toISOString().slice(0,10),focus:"custom",name});
  if(!r.act.ex.length)return{ok:false,err:"none"};s.act=r.act;try{localStorage.setItem("vyronSmart",JSON.stringify(s))}catch{return{ok:false,err:"quota"}}
  return{ok:true,skipped:r.skipped.length}}
export function fillNextSet(parsed){let s;try{s=JSON.parse(localStorage.getItem("vyronSmart"))||{}}catch{return false}
  if(!s.act)return false;for(const e of s.act.ex)for(const x of e.sl)if(!x.done){x.w=String(parsed.w);x.r=String(parsed.r);if(parsed.rpe)x.rpe=String(parsed.rpe);try{localStorage.setItem("vyronSmart",JSON.stringify(s))}catch{return false}return true}return false}
export const hasActive=()=>{try{return!!JSON.parse(localStorage.getItem("vyronSmart"))?.act}catch{return false}};
