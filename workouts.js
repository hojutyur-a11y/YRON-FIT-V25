import {all,put,remove} from "vy/database";
import {uid,toast,modal,closeModal,escapeHTML} from "vy/ui";
export async function showWorkoutForm(){
 const ex=await all("exercises");const list=[...((await import("vy/exercises")).BASE_EXERCISES),...ex];
 modal("تسجيل حصة تدريبية",`<form id="workoutForm"><div class="form-grid">
 <div class="field"><label>اسم الحصة</label><input name="name" required placeholder="مثلاً: تدريب الصدر"></div>
 <div class="field"><label>التاريخ</label><input name="date" type="date" required value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="field"><label>المدة بالدقائق</label><input name="duration" type="number" min="1" required placeholder="60"></div>
 <div class="field"><label>السعرات المسجلة (اختياري)</label><input name="calories" type="number" min="0" placeholder="0"></div>
 <div class="field full"><label>التمارين المنفذة</label><select name="exercise" id="workoutExercise">${list.map(e=>`<option>${escapeHTML(e.name)}</option>`).join("")}</select></div>
 <div class="field"><label>المجموعات</label><input name="sets" type="number" min="1" value="3"></div>
 <div class="field"><label>التكرارات</label><input name="reps" type="number" min="1" value="10"></div>
 <div class="field"><label>الوزن (كغ)</label><input name="weight" type="number" min="0" step=".5" value="0"></div>
 <div class="field"><label>ملاحظات</label><input name="notes" placeholder="اختياري"></div></div>
 <div class="action-row"><button class="primary-btn" type="submit">حفظ الحصة</button></div></form>`);
 document.getElementById("workoutForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const workout={id:uid(),name:f.get("name"),date:f.get("date"),duration:+f.get("duration"),calories:+f.get("calories")||0,exercises:[{name:f.get("exercise"),sets:+f.get("sets"),reps:+f.get("reps"),weight:+f.get("weight")}],notes:f.get("notes")};await put("workouts",workout);closeModal();toast("تم حفظ الحصة بنجاح");window.dispatchEvent(new Event("datachange"));};
}
export async function workoutList(){const rows=(await all("workouts")).sort((a,b)=>b.date.localeCompare(a.date));if(!rows.length)return `<div class="empty-state"><span class="empty-icon">╫</span><b>لا توجد تدريبات سابقة بعد</b><p>سجّل أول حصة تدريبية لتبدأ متابعة تقدمك.</p><button class="primary-btn" data-action="new-workout">＋ تسجيل أول حصة</button></div>`;return `<div class="item-list">${rows.map(w=>`<article class="list-card"><div><h3>${escapeHTML(w.name)}</h3><p>${w.date} • ${w.duration} دقيقة • ${w.exercises?.length||0} تمرين</p></div><div><span class="pill">${w.calories||0} سعرة</span><button class="small-btn" data-delete-workout="${w.id}">حذف</button></div></article>`).join("")}</div>`;}
export async function deleteWorkout(id){if(!confirm("هل تريد حذف هذه الحصة؟"))return;await remove("workouts",id);toast("تم حذف الحصة");window.dispatchEvent(new Event("datachange"));}