/* VYRON FIT — Athlete Profile 2.0
   Identity, goals, privacy -> localStorage "vyronAthlete" (separate from workout data).
   Workouts / records / schedule are READ from the existing IndexedDB stores; nothing is duplicated. */
import {all} from "vy/database";
import {toast,modal,closeModal,escapeHTML as E,uid} from "vy/ui";
import {getLang,setLang} from "vy/i18n";

const KEY="vyronAthlete",LEGACY="vyronProfile";
export const PROFILE_PAGES=["profile","profile-activity","profile-stats","profile-ach","profile-goals","profile-edit","profile-privacy"];

/* ---------- i18n (ar / en / fr) ---------- */
const L={
ar:{athlete:"رياضي VYRON",addUser:"أضف اسم مستخدم",joined:"انضم في {0}",edit:"تعديل الملف الشخصي",share:"مشاركة الملف الشخصي",more:"المزيد",less:"أقل",
st_workouts:"تمرين",st_time:"وقت التدريب",st_ach:"إنجاز",
tab_overview:"نظرة عامة",tab_activity:"النشاط",tab_stats:"الإحصائيات",tab_ach:"الإنجازات",tabs:"أقسام الملف الشخصي",
row_stats:"الإحصائيات",row_stats_s:"عرض إحصائياتك وتطورك",row_goals:"أهدافي الرياضية",row_goals_s:"متابعة أهدافك وتحقيقها",row_ach:"إنجازاتي وشاراتي",row_ach_s:"{0} من {1} شارات مكتسبة",row_hist:"سجل التدريبات",row_hist_s:"جميع تمارينك السابقة",row_priv:"الحساب والخصوصية",row_priv_s:"تحكم فيما يظهر من ملفك",
identity:"الهوية الرياضية",sport:"الرياضة المفضلة",level:"مستوى الخبرة",goal:"الهدف التدريبي",program:"نوع البرنامج",notSet:"غير محدد",
sp_gym:"كمال أجسام / نادٍ",sp_running:"الجري",sp_football:"كرة القدم",sp_swimming:"السباحة",sp_cycling:"الدراجات",sp_martial:"الفنون القتالية",sp_calisthenics:"كاليستينكس",sp_crossfit:"كروس فِت",sp_other:"أخرى",
lv_beginner:"مبتدئ",lv_intermediate:"متوسط",lv_advanced:"متقدم",
tg_strength:"زيادة القوة",tg_muscle:"بناء العضلات",tg_fatloss:"خسارة الدهون",tg_endurance:"رفع التحمل",tg_general:"لياقة عامة",
pg_gym:"تمارين النادي",pg_home:"تمارين منزلية",pg_calisthenics:"وزن الجسم",pg_cardio:"كارديو",pg_mixed:"برنامج مختلط",
tools:"أدوات التطبيق",tl_notes:"دفتر الملاحظات",tl_rem:"التذكيرات",tl_set:"الإعدادات والنسخ الاحتياطي",
back:"رجوع",
e_title:"لا توجد تدريبات بعد",e_text:"سجّل أول حصة لتبدأ إحصائياتك وإنجازاتك بالظهور.",e_cta:"تسجيل أول حصة",
s_total:"إجمالي التمارين",s_time:"وقت التدريب",s_days:"أيام النشاط",s_weeks:"أسابيع نشطة",s_prs:"أرقام قياسية",s_cons:"الانتظام",s_weeks_h:"الأسبوع النشط = 3 أيام تدريب أو أكثر.",
s_weekly:"التطور الأسبوعي",s_weekly_s:"عدد التمارين في آخر 8 أسابيع",s_monthly:"التطور الشهري",s_monthly_s:"دقائق التدريب في آخر 6 أشهر",s_need:"سجّل تدريبات في أسبوعين على الأقل لتظهر الرسوم البيانية.",
c_high:"ممتاز",c_mid:"جيد",c_low:"في البداية",c_none:"—",c_h:"آخر {1} أسابيع مكتملة، والهدف {0} أيام تدريب أسبوعياً.",c_nodata:"يظهر بعد مرور أسبوع كامل على أول تمرين.",
pr_latest:"آخر الأرقام القياسية",
a_week:"هذا الأسبوع",a_month:"هذا الشهر",a_all:"الكل",a_filter:"فلتر الفترة",a_count:"{0} حصة • {1}",a_ex:"{0} تمارين",a_cal:"{0} سعرة",a_notes:"ملاحظات",a_open:"فتح سجل التدريبات الكامل",a_more:"عرض المزيد",a_none:"لا توجد حصص في هذه الفترة.",a_set:"مجموعات",a_rep:"تكرار",kg:"كغ",min:"د",hr:"س",
ac_title:"إنجازاتي وشاراتي",ac_sum:"{0} من {1} مكتسبة",ac_earned:"مكتسب",ac_locked:"غير مكتسب",ac_on:"حصلت عليها في {0}",ac_cond:"الشرط",ac_prog:"التقدم: {0} / {1}",
ac_first:"أول تمرين",ac_first_d:"سجّل أول حصة تدريبية.",ac_wk1:"أول أسبوع نشط",ac_wk1_d:"تدرّب في 3 أيام مختلفة خلال أسبوع واحد.",ac_w10:"10 تدريبات",ac_w10_d:"أكمل 10 حصص مسجلة.",ac_w25:"25 تدريباً",ac_w25_d:"أكمل 25 حصة مسجلة.",ac_w50:"50 تدريباً",ac_w50_d:"أكمل 50 حصة مسجلة.",ac_pr:"رقم قياسي",ac_pr_d:"سجّل أول رقم قياسي شخصي.",ac_reg:"الانتظام",ac_reg_d:"حافظ على 3 أسابيع نشطة متتالية (3 أيام تدريب أو أكثر في كل أسبوع).",ac_plan:"الالتزام بالجدول",ac_plan_d:"أنجز في أسبوع واحد كل أيام التدريب المخططة في جدولك الحالي (يومان على الأقل).",
g_title:"أهدافي الرياضية",g_cur:"الهدف الحالي",g_none:"لا يوجد هدف حالي",g_none_s:"حدّد هدفاً وسيحسب التطبيق تقدمك من تدريباتك الفعلية.",g_new:"هدف جديد",g_edit:"تعديل الهدف",g_created:"أُنشئ في {0}",g_done:"تحقق في {0}",g_hist:"سجل الأهداف",g_hist_e:"لا توجد أهداف سابقة.",g_replaced:"استُبدل",g_completed:"مكتمل",g_active:"قيد التنفيذ",g_type:"نوع الهدف",g_target:"القيمة المستهدفة",g_name:"اسم الهدف (اختياري)",g_note:"سيُنقل هدفك الحالي إلى السجل.",g_save:"حفظ الهدف",g_bad:"أدخل رقماً صحيحاً بين 1 و {0}",g_saved:"تم حفظ الهدف",g_win:"أحسنت! تحقق هدفك.",
gt_sessions_total:"عدد التمارين",gt_sessions_week:"تمارين في الأسبوع",gt_minutes_total:"دقائق التدريب",gt_records_total:"أرقام قياسية جديدة",
gh_sessions_total:"تُحسب الحصص المسجلة منذ يوم إنشاء الهدف.",gh_sessions_week:"تُحسب حصص الأسبوع الحالي (من الأحد).",gh_minutes_total:"تُجمع دقائق الحصص منذ يوم إنشاء الهدف.",gh_records_total:"تُحسب الأرقام القياسية المسجلة منذ يوم إنشاء الهدف.",
gu_sessions_total:"تمرين",gu_sessions_week:"تمارين",gu_minutes_total:"دقيقة",gu_records_total:"رقم قياسي",
ed_title:"تعديل الملف الشخصي",ed_photo:"تغيير الصورة",ed_remove:"إزالة الصورة",ed_name:"الاسم المعروض",ed_user:"اسم المستخدم",ed_user_h:"أحرف إنجليزية صغيرة وأرقام و _ و . (من 3 إلى 20). محفوظ على جهازك فقط.",ed_bio:"النبذة",ed_city:"المدينة (اختياري)",ed_lang:"اللغة",ed_save:"حفظ التغييرات",ed_cancel:"إلغاء",ed_saved:"تم حفظ الملف الشخصي",ed_fix:"راجع الحقول التي تحتوي على أخطاء",ed_discard:"تجاهل التعديلات غير المحفوظة؟",ed_priv:"بيانات خاصة (اختيارية)",ed_priv_s:"للاستخدام الشخصي فقط، لا تظهر ولا تُشارك.",ed_age:"العمر",ed_height:"الطول (سم)",ed_weight:"الوزن (كغ)",ed_choose:"— اختر —",
er_name:"الاسم من 2 إلى 30 حرفاً",er_user:"اسم المستخدم: أحرف إنجليزية صغيرة وأرقام و _ و . فقط، ويبدأ بحرف أو رقم ولا ينتهي بنقطة",er_user_l:"اسم المستخدم من 3 إلى 20 حرفاً",er_user_r:"اسم المستخدم محجوز",er_bio:"النبذة لا تتجاوز 140 حرفاً",er_city:"المدينة لا تتجاوز 40 حرفاً",er_email:"البريد الإلكتروني غير صالح",er_img:"اختر صورة JPG أو PNG أو WEBP صالحة",er_perm:"تعذر قراءة الملف. اسمح للتطبيق بالوصول إلى الصور ثم أعد المحاولة",ph_zoom:"تكبير",ph_drag:"اسحب الصورة لتحديد الموضع",ph_prev:"معاينة الصورة",ph_use:"اعتماد الصورة",ph_cancel:"إلغاء",ph_saved:"تم حفظ الصورة",ph_removed:"تمت إزالة الصورة",ph_rm_c:"هل تريد إزالة الصورة والعودة إلى الصورة الافتراضية؟",ph_none:"لا توجد صورة لإزالتها",ph_yes:"تأكيد",er_img_b:"الصورة كبيرة جداً (الحد 8 ميغابايت)",er_store:"تعذر الحفظ: مساحة التخزين ممتلئة أو غير متاحة",er_age:"العمر بين 10 و 100",er_num:"قيمة غير صالحة",
pv_title:"الحساب والخصوصية",pv_vis:"ظهور الملف",pv_private:"خاص",pv_public:"عام عند المشاركة",pv_vis_h:"الملف الخاص لا يمكن مشاركته. لا يغادر شيء جهازك إلا عندما تضغط على مشاركة.",pv_bio:"إظهار النبذة",pv_stats:"مشاركة الإحصائيات",pv_act:"مشاركة آخر نشاط",pv_ach:"مشاركة الإنجازات",pv_share:"ما يُضمَّن عند المشاركة",pv_acc:"الحساب",pv_email:"البريد الإلكتروني (خاص)",pv_email_h:"محفوظ على جهازك فقط ولا يظهر في الملف أبداً.",pv_email_save:"حفظ البريد",pv_saved:"تم الحفظ",pv_data:"إدارة البيانات",pv_export:"تصدير نسخة احتياطية",pv_reset:"حذف بيانات الملف الرياضي",pv_reset_c:"سيتم حذف الصورة والاسم والأهداف وإعدادات الخصوصية. تمارينك المسجلة لن تُحذف. هل أنت متأكد؟",pv_reset_d:"تم حذف بيانات الملف الرياضي",pv_local:"لا يوجد حساب سحابي. كل بياناتك محفوظة على هذا الجهاز فقط.",
sh_private:"ملفك خاص. غيّر الظهور إلى «عام عند المشاركة» لتتمكن من المشاركة.",sh_copied:"تم نسخ بطاقة الملف الشخصي",sh_fail:"تعذرت المشاركة",sh_line:"{0} تمرين • {1}"},
en:{athlete:"VYRON Athlete",addUser:"Add a username",joined:"Joined {0}",edit:"Edit profile",share:"Share profile",more:"More",less:"Less",
st_workouts:"Workouts",st_time:"Training time",st_ach:"Badges",
tab_overview:"Overview",tab_activity:"Activity",tab_stats:"Statistics",tab_ach:"Achievements",tabs:"Profile sections",
row_stats:"Statistics",row_stats_s:"See your stats and progress",row_goals:"My goals",row_goals_s:"Track and reach your goals",row_ach:"Achievements & badges",row_ach_s:"{0} of {1} badges earned",row_hist:"Workout history",row_hist_s:"All your past sessions",row_priv:"Account & privacy",row_priv_s:"Control what your profile shows",
identity:"Fitness identity",sport:"Favorite sport",level:"Experience level",goal:"Training goal",program:"Program type",notSet:"Not set",
sp_gym:"Gym / bodybuilding",sp_running:"Running",sp_football:"Football",sp_swimming:"Swimming",sp_cycling:"Cycling",sp_martial:"Martial arts",sp_calisthenics:"Calisthenics",sp_crossfit:"CrossFit",sp_other:"Other",
lv_beginner:"Beginner",lv_intermediate:"Intermediate",lv_advanced:"Advanced",
tg_strength:"Build strength",tg_muscle:"Build muscle",tg_fatloss:"Lose fat",tg_endurance:"Improve endurance",tg_general:"General fitness",
pg_gym:"Gym training",pg_home:"Home workouts",pg_calisthenics:"Bodyweight",pg_cardio:"Cardio",pg_mixed:"Mixed program",
tools:"App tools",tl_notes:"Notes",tl_rem:"Reminders",tl_set:"Settings & backup",
back:"Back",
e_title:"No workouts yet",e_text:"Log your first session and your stats and badges will start to appear.",e_cta:"Log first session",
s_total:"Total workouts",s_time:"Training time",s_days:"Active days",s_weeks:"Active weeks",s_prs:"Personal records",s_cons:"Consistency",s_weeks_h:"An active week = 3 or more training days.",
s_weekly:"Weekly trend",s_weekly_s:"Sessions in the last 8 weeks",s_monthly:"Monthly trend",s_monthly_s:"Training minutes in the last 6 months",s_need:"Log workouts in at least two weeks to see the charts.",
c_high:"Excellent",c_mid:"Good",c_low:"Getting started",c_none:"—",c_h:"Last {1} completed weeks, goal of {0} training days a week.",c_nodata:"Appears after one full week since your first workout.",
pr_latest:"Latest records",
a_week:"This week",a_month:"This month",a_all:"All",a_filter:"Period filter",a_count:"{0} sessions • {1}",a_ex:"{0} exercises",a_cal:"{0} kcal",a_notes:"Notes",a_open:"Open the full training log",a_more:"Show more",a_none:"No sessions in this period.",a_set:"sets",a_rep:"reps",kg:"kg",min:"m",hr:"h",
ac_title:"Achievements & badges",ac_sum:"{0} of {1} earned",ac_earned:"Earned",ac_locked:"Locked",ac_on:"Earned on {0}",ac_cond:"Requirement",ac_prog:"Progress: {0} / {1}",
ac_first:"First workout",ac_first_d:"Log your first training session.",ac_wk1:"First active week",ac_wk1_d:"Train on 3 different days within one week.",ac_w10:"10 workouts",ac_w10_d:"Complete 10 logged sessions.",ac_w25:"25 workouts",ac_w25_d:"Complete 25 logged sessions.",ac_w50:"50 workouts",ac_w50_d:"Complete 50 logged sessions.",ac_pr:"Personal record",ac_pr_d:"Log your first personal record.",ac_reg:"Consistency",ac_reg_d:"Stay active for 3 weeks in a row (3+ training days each week).",ac_plan:"Stick to the plan",ac_plan_d:"Complete every planned training day of your current schedule in one week (2 days minimum).",
g_title:"My goals",g_cur:"Current goal",g_none:"No current goal",g_none_s:"Set a goal and the app measures progress from your real workouts.",g_new:"New goal",g_edit:"Edit goal",g_created:"Created {0}",g_done:"Reached {0}",g_hist:"Goal history",g_hist_e:"No previous goals.",g_replaced:"Replaced",g_completed:"Completed",g_active:"In progress",g_type:"Goal type",g_target:"Target value",g_name:"Goal name (optional)",g_note:"Your current goal will move to history.",g_save:"Save goal",g_bad:"Enter a whole number from 1 to {0}",g_saved:"Goal saved",g_win:"Well done! You reached your goal.",
gt_sessions_total:"Number of workouts",gt_sessions_week:"Workouts per week",gt_minutes_total:"Training minutes",gt_records_total:"New personal records",
gh_sessions_total:"Counts sessions logged since the day the goal was created.",gh_sessions_week:"Counts sessions of the current week (from Sunday).",gh_minutes_total:"Adds up session minutes since the day the goal was created.",gh_records_total:"Counts records logged since the day the goal was created.",
gu_sessions_total:"workouts",gu_sessions_week:"workouts",gu_minutes_total:"min",gu_records_total:"records",
ed_title:"Edit profile",ed_photo:"Change photo",ed_remove:"Remove photo",ed_name:"Display name",ed_user:"Username",ed_user_h:"Lowercase letters, numbers, _ and . (3–20). Stored on your device only.",ed_bio:"Bio",ed_city:"City (optional)",ed_lang:"Language",ed_save:"Save changes",ed_cancel:"Cancel",ed_saved:"Profile saved",ed_fix:"Please fix the highlighted fields",ed_discard:"Discard unsaved changes?",ed_priv:"Private details (optional)",ed_priv_s:"For your own use only — never shown or shared.",ed_age:"Age",ed_height:"Height (cm)",ed_weight:"Weight (kg)",ed_choose:"— Select —",
er_name:"Name must be 2–30 characters",er_user:"Username: lowercase letters, numbers, _ and . only; start with a letter or number; no trailing dot",er_user_l:"Username must be 3–20 characters",er_user_r:"This username is reserved",er_bio:"Bio is limited to 140 characters",er_city:"City is limited to 40 characters",er_email:"Invalid email address",er_img:"Choose a valid JPG, PNG or WEBP image",er_perm:"Could not read the file. Allow photo access and try again",ph_zoom:"Zoom",ph_drag:"Drag the photo to position it",ph_prev:"Photo preview",ph_use:"Use this photo",ph_cancel:"Cancel",ph_saved:"Photo saved",ph_removed:"Photo removed",ph_rm_c:"Remove your photo and restore the default one?",ph_none:"No photo to remove",ph_yes:"Confirm",er_img_b:"Image is too large (8 MB max)",er_store:"Could not save: storage is full or unavailable",er_age:"Age must be 10–100",er_num:"Invalid value",
pv_title:"Account & privacy",pv_vis:"Profile visibility",pv_private:"Private",pv_public:"Public when shared",pv_vis_h:"A private profile cannot be shared. Nothing leaves your device unless you tap Share.",pv_bio:"Show bio",pv_stats:"Share statistics",pv_act:"Share latest activity",pv_ach:"Share achievements",pv_share:"Included when sharing",pv_acc:"Account",pv_email:"Email (private)",pv_email_h:"Stored on your device only and never shown on your profile.",pv_email_save:"Save email",pv_saved:"Saved",pv_data:"Manage data",pv_export:"Export a backup",pv_reset:"Delete athlete profile data",pv_reset_c:"This deletes your photo, name, goals and privacy settings. Your logged workouts are NOT deleted. Are you sure?",pv_reset_d:"Athlete profile data deleted",pv_local:"There is no cloud account. All your data stays on this device.",
sh_private:"Your profile is private. Switch visibility to “Public when shared” to share it.",sh_copied:"Profile card copied",sh_fail:"Sharing failed",sh_line:"{0} workouts • {1}"},
fr:{athlete:"Athlète VYRON",addUser:"Ajouter un pseudo",joined:"Membre depuis {0}",edit:"Modifier le profil",share:"Partager le profil",more:"Plus",less:"Moins",
st_workouts:"Séances",st_time:"Temps d'entraînement",st_ach:"Badges",
tab_overview:"Aperçu",tab_activity:"Activité",tab_stats:"Statistiques",tab_ach:"Succès",tabs:"Sections du profil",
row_stats:"Statistiques",row_stats_s:"Voir vos stats et progrès",row_goals:"Mes objectifs",row_goals_s:"Suivre et atteindre vos objectifs",row_ach:"Succès et badges",row_ach_s:"{0} sur {1} badges obtenus",row_hist:"Historique",row_hist_s:"Toutes vos séances passées",row_priv:"Compte et confidentialité",row_priv_s:"Contrôlez ce que montre votre profil",
identity:"Identité sportive",sport:"Sport favori",level:"Niveau d'expérience",goal:"Objectif d'entraînement",program:"Type de programme",notSet:"Non défini",
sp_gym:"Salle / musculation",sp_running:"Course",sp_football:"Football",sp_swimming:"Natation",sp_cycling:"Cyclisme",sp_martial:"Arts martiaux",sp_calisthenics:"Callisthénie",sp_crossfit:"CrossFit",sp_other:"Autre",
lv_beginner:"Débutant",lv_intermediate:"Intermédiaire",lv_advanced:"Avancé",
tg_strength:"Gagner en force",tg_muscle:"Prendre du muscle",tg_fatloss:"Perdre du gras",tg_endurance:"Améliorer l'endurance",tg_general:"Forme générale",
pg_gym:"Entraînement en salle",pg_home:"À la maison",pg_calisthenics:"Poids du corps",pg_cardio:"Cardio",pg_mixed:"Programme mixte",
tools:"Outils",tl_notes:"Notes",tl_rem:"Rappels",tl_set:"Réglages et sauvegarde",
back:"Retour",
e_title:"Aucune séance",e_text:"Enregistrez votre première séance pour voir apparaître vos stats et badges.",e_cta:"Enregistrer une séance",
s_total:"Séances totales",s_time:"Temps d'entraînement",s_days:"Jours actifs",s_weeks:"Semaines actives",s_prs:"Records perso",s_cons:"Régularité",s_weeks_h:"Semaine active = 3 jours d'entraînement ou plus.",
s_weekly:"Évolution hebdomadaire",s_weekly_s:"Séances sur les 8 dernières semaines",s_monthly:"Évolution mensuelle",s_monthly_s:"Minutes d'entraînement sur 6 mois",s_need:"Enregistrez des séances sur au moins deux semaines pour voir les graphiques.",
c_high:"Excellente",c_mid:"Bonne",c_low:"Au début",c_none:"—",c_h:"{1} dernières semaines complètes, objectif de {0} jours par semaine.",c_nodata:"Disponible après une semaine complète depuis votre première séance.",
pr_latest:"Derniers records",
a_week:"Cette semaine",a_month:"Ce mois",a_all:"Tout",a_filter:"Filtre de période",a_count:"{0} séances • {1}",a_ex:"{0} exercices",a_cal:"{0} kcal",a_notes:"Notes",a_open:"Ouvrir tout l'historique",a_more:"Afficher plus",a_none:"Aucune séance sur cette période.",a_set:"séries",a_rep:"reps",kg:"kg",min:"min",hr:"h",
ac_title:"Succès et badges",ac_sum:"{0} sur {1} obtenus",ac_earned:"Obtenu",ac_locked:"Verrouillé",ac_on:"Obtenu le {0}",ac_cond:"Condition",ac_prog:"Progression : {0} / {1}",
ac_first:"Première séance",ac_first_d:"Enregistrez votre première séance.",ac_wk1:"Première semaine active",ac_wk1_d:"Entraînez-vous 3 jours différents dans une même semaine.",ac_w10:"10 séances",ac_w10_d:"Terminez 10 séances enregistrées.",ac_w25:"25 séances",ac_w25_d:"Terminez 25 séances enregistrées.",ac_w50:"50 séances",ac_w50_d:"Terminez 50 séances enregistrées.",ac_pr:"Record personnel",ac_pr_d:"Enregistrez votre premier record personnel.",ac_reg:"Régularité",ac_reg_d:"Restez actif 3 semaines de suite (3 jours ou plus par semaine).",ac_plan:"Fidèle au planning",ac_plan_d:"Réalisez tous les jours prévus de votre planning actuel en une semaine (2 jours minimum).",
g_title:"Mes objectifs",g_cur:"Objectif actuel",g_none:"Aucun objectif actuel",g_none_s:"Définissez un objectif : la progression est calculée à partir de vos vraies séances.",g_new:"Nouvel objectif",g_edit:"Modifier l'objectif",g_created:"Créé le {0}",g_done:"Atteint le {0}",g_hist:"Historique des objectifs",g_hist_e:"Aucun objectif précédent.",g_replaced:"Remplacé",g_completed:"Terminé",g_active:"En cours",g_type:"Type d'objectif",g_target:"Valeur cible",g_name:"Nom de l'objectif (facultatif)",g_note:"Votre objectif actuel passera dans l'historique.",g_save:"Enregistrer",g_bad:"Entrez un entier de 1 à {0}",g_saved:"Objectif enregistré",g_win:"Bravo ! Objectif atteint.",
gt_sessions_total:"Nombre de séances",gt_sessions_week:"Séances par semaine",gt_minutes_total:"Minutes d'entraînement",gt_records_total:"Nouveaux records",
gh_sessions_total:"Compte les séances enregistrées depuis le jour de création de l'objectif.",gh_sessions_week:"Compte les séances de la semaine en cours (dès dimanche).",gh_minutes_total:"Additionne les minutes depuis le jour de création de l'objectif.",gh_records_total:"Compte les records enregistrés depuis le jour de création de l'objectif.",
gu_sessions_total:"séances",gu_sessions_week:"séances",gu_minutes_total:"min",gu_records_total:"records",
ed_title:"Modifier le profil",ed_photo:"Changer la photo",ed_remove:"Retirer la photo",ed_name:"Nom affiché",ed_user:"Pseudo",ed_user_h:"Minuscules, chiffres, _ et . (3 à 20). Stocké uniquement sur votre appareil.",ed_bio:"Bio",ed_city:"Ville (facultatif)",ed_lang:"Langue",ed_save:"Enregistrer",ed_cancel:"Annuler",ed_saved:"Profil enregistré",ed_fix:"Corrigez les champs signalés",ed_discard:"Abandonner les modifications ?",ed_priv:"Données privées (facultatif)",ed_priv_s:"Pour votre usage uniquement, jamais affichées ni partagées.",ed_age:"Âge",ed_height:"Taille (cm)",ed_weight:"Poids (kg)",ed_choose:"— Choisir —",
er_name:"Le nom doit faire 2 à 30 caractères",er_user:"Pseudo : minuscules, chiffres, _ et . ; commence par une lettre ou un chiffre ; pas de point final",er_user_l:"Le pseudo doit faire 3 à 20 caractères",er_user_r:"Ce pseudo est réservé",er_bio:"La bio est limitée à 140 caractères",er_city:"La ville est limitée à 40 caractères",er_email:"Adresse e-mail invalide",er_img:"Choisissez une image JPG, PNG ou WEBP valide",er_perm:"Lecture impossible. Autorisez l’accès aux photos puis réessayez",ph_zoom:"Zoom",ph_drag:"Faites glisser la photo pour la positionner",ph_prev:"Aperçu de la photo",ph_use:"Utiliser cette photo",ph_cancel:"Annuler",ph_saved:"Photo enregistrée",ph_removed:"Photo retirée",ph_rm_c:"Retirer la photo et restaurer celle par défaut ?",ph_none:"Aucune photo à retirer",ph_yes:"Confirmer",er_img_b:"Image trop volumineuse (8 Mo max)",er_store:"Échec : stockage plein ou indisponible",er_age:"L'âge doit être entre 10 et 100",er_num:"Valeur invalide",
pv_title:"Compte et confidentialité",pv_vis:"Visibilité du profil",pv_private:"Privé",pv_public:"Public au partage",pv_vis_h:"Un profil privé ne peut pas être partagé. Rien ne quitte votre appareil sans votre action.",pv_bio:"Afficher la bio",pv_stats:"Partager les statistiques",pv_act:"Partager la dernière activité",pv_ach:"Partager les succès",pv_share:"Inclus lors du partage",pv_acc:"Compte",pv_email:"E-mail (privé)",pv_email_h:"Stocké uniquement sur votre appareil, jamais affiché sur le profil.",pv_email_save:"Enregistrer l'e-mail",pv_saved:"Enregistré",pv_data:"Gérer les données",pv_export:"Exporter une sauvegarde",pv_reset:"Supprimer les données du profil",pv_reset_c:"Cela supprime votre photo, nom, objectifs et réglages de confidentialité. Vos séances ne sont PAS supprimées. Confirmer ?",pv_reset_d:"Données du profil supprimées",pv_local:"Aucun compte cloud. Toutes vos données restent sur cet appareil.",
sh_private:"Votre profil est privé. Passez la visibilité sur « Public au partage » pour le partager.",sh_copied:"Carte de profil copiée",sh_fail:"Échec du partage",sh_line:"{0} séances • {1}"}
};
const T=(k,...a)=>{let s=L[getLang()]?.[k]??L.ar[k]??k;a.forEach((v,i)=>{s=s.split("{"+i+"}").join(v)});return s};

/* ---------- icons ---------- */
const P={chart:'<path d="M5 20V10M12 20V4M19 20v-7"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M9.5 17h5"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',pen:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',chev:'<path d="M15 5l-7 7 7 7"/>',flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.2 1 2 2 2 0-3-1-5 1-8z"/>',bolt:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',chain:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',img:'<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'};
const svg=(n,c="")=>`<svg class="pf-i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||""}</svg>`;

/* ---------- date helpers (local, no timezone drift) ---------- */
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const okDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const weekStart=s=>addDays(s,-parse(s).getDay());
const LOC={ar:"ar-u-nu-latn",en:"en",fr:"fr"};
const fmtDate=s=>{try{return new Intl.DateTimeFormat(LOC[getLang()]||"en",{year:"numeric",month:"short",day:"numeric"}).format(new Date(s.length>10?s:parse(s)))}catch{return String(s).slice(0,10)}};
const fmtDur=(m,long)=>{m=Math.round(m||0);if(m<60)return `${m}${T("min")}`;const h=m/60;return long?`${Math.floor(m/60)}${T("hr")} ${m%60}${T("min")}`:`${Math.round(h*10)/10}${T("hr")}`};

/* ---------- store (versioned, validated, crash-safe) ---------- */
const SPORTS=["gym","running","football","swimming","cycling","martial","calisthenics","crossfit","other"],LEVELS=["beginner","intermediate","advanced"],TGOALS=["strength","muscle","fatloss","endurance","general"],PROGS=["gym","home","calisthenics","cardio","mixed"];
const GTYPES={sessions_total:{max:9999,unit:"gu_sessions_total"},sessions_week:{max:14},minutes_total:{max:99999},records_total:{max:999}};
const RESERVED=["admin","root","vyron","vyronfit","support","system","moderator","null","undefined","api"];
const str=(v,n)=>typeof v==="string"?v.replace(/[\u0000-\u001f\u007f]/g," ").slice(0,n):"";
const pick=(v,list)=>list.includes(v)?v:"";
const defaults=()=>({v:1,identity:{displayName:"",username:"",bio:"",avatar:"",city:"",joinedAt:new Date().toISOString()},fitness:{sport:"",level:"",goal:"",program:""},privacy:{visibility:"private",showBio:true,showStats:true,showActivity:false,showAchievements:true},account:{email:""},goals:[]});
export function normalize(o){const d=defaults();if(!o||typeof o!=="object")return d;const i=o.identity||{},f=o.fitness||{},p=o.privacy||{};
 d.identity={displayName:str(i.displayName,30),username:str(i.username,20),bio:str(i.bio,140),avatar:typeof i.avatar==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(i.avatar)&&i.avatar.length<400000?i.avatar:"",city:str(i.city,40),joinedAt:typeof i.joinedAt==="string"&&!isNaN(Date.parse(i.joinedAt))?i.joinedAt:d.identity.joinedAt};
 d.fitness={sport:pick(f.sport,SPORTS),level:pick(f.level,LEVELS),goal:pick(f.goal,TGOALS),program:pick(f.program,PROGS)};
 d.privacy={visibility:p.visibility==="public"?"public":"private",showBio:p.showBio!==false,showStats:p.showStats!==false,showActivity:p.showActivity===true,showAchievements:p.showAchievements!==false};
 d.account={email:str(o.account?.email,100)};
 d.goals=(Array.isArray(o.goals)?o.goals:[]).filter(g=>g&&GTYPES[g.type]&&Number.isInteger(g.target)&&g.target>0&&okDate(g.createdAt)).slice(-60).map(g=>({id:str(String(g.id||uid()),60),type:g.type,target:Math.min(g.target,GTYPES[g.type].max),title:str(g.title,60),createdAt:g.createdAt,completedAt:okDate(g.completedAt)?g.completedAt:null,status:["active","completed","replaced"].includes(g.status)?g.status:"active",final:Number.isFinite(g.final)?g.final:null}));
 return d}
/* ----- avatar storage: its own tiny IndexedDB ("vyron-fit-profile") so the workout DB is never touched ----- */
const PDB="vyron-fit-profile",AVRE=/^data:image\/(jpeg|png|webp);base64,/;
let avatarCache="",idbOk=true,booted=false;
const pdb=()=>new Promise((res,rej)=>{try{if(!window.indexedDB)return rej(new Error("noidb"));const r=indexedDB.open(PDB,1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();res(db)};r.onerror=()=>rej(r.error||new Error("idb"));r.onblocked=()=>rej(new Error("blocked"))}catch(e){rej(e)}});
async function kv(mode,key,val){const db=await pdb();try{return await new Promise((res,rej)=>{const tx=db.transaction("kv",mode==="get"?"readonly":"readwrite"),st=tx.objectStore("kv");let out;if(mode==="get"){const q=st.get(key);q.onsuccess=()=>{out=q.result}}else if(mode==="set")st.put(val,key);else st.delete(key);tx.oncomplete=()=>res(out);tx.onerror=tx.onabort=()=>rej(tx.error||new Error("idb"))})}finally{db.close()}}
const okAv=v=>typeof v==="string"&&AVRE.test(v)&&v.length<400000;
const lsRaw=()=>{try{return localStorage.getItem(KEY)}catch{return null}};
const lsAvatar=()=>{try{const v=JSON.parse(lsRaw()||"null")?.identity?.avatar;return okAv(v)?v:""}catch{return ""}};
/* the single profile store: text in localStorage "vyronAthlete", photo in IndexedDB; every screen reads through loadAthlete() */
export function loadAthlete(){const s=lsRaw();let raw=null,bad=false;if(s!==null){try{raw=JSON.parse(s)}catch{bad=true}}
 const a=normalize(raw);
 if(s===null){try{const lg=JSON.parse(localStorage.getItem(LEGACY)||"{}");if(lg&&typeof lg.name==="string")a.identity.displayName=str(lg.name,30)}catch{}saveAthlete(a)}
 else if(bad){try{localStorage.setItem(KEY+".bak",s)}catch{}}  /* corrupt JSON: keep a copy, never overwrite silently */
 if(avatarCache)a.identity.avatar=avatarCache;return a}
export function saveAthlete(a){try{const c=JSON.parse(JSON.stringify(a));if(booted&&idbOk&&c.identity)c.identity.avatar="";localStorage.setItem(KEY,JSON.stringify(c));return true}catch{return false}}
export async function initProfile(){if(booted)return;let rec=null;
 try{rec=await kv("get","avatar")}catch{idbOk=false}
 const ls=lsAvatar();
 if(idbOk){const d=rec&&okAv(rec.data)?rec.data:"";
  if(d)avatarCache=d;
  else if(ls){try{await kv("set","avatar",{data:ls,updatedAt:Date.now(),migrated:true});avatarCache=ls}catch{idbOk=false;avatarCache=ls}}}
 else avatarCache=ls;
 booted=true;if(idbOk&&ls)saveAthlete(loadAthlete())}
export async function setAvatar(data){if(!okAv(data))throw new Error("img");
 try{await kv("set","avatar",{data,updatedAt:Date.now()});idbOk=true;avatarCache=data;saveAthlete(loadAthlete())}
 catch(e){idbOk=false;avatarCache=data;const a=loadAthlete();a.identity.avatar=data;if(!saveAthlete(a)){avatarCache="";throw new Error("store")}}
 applyAvatar();window.dispatchEvent(new CustomEvent("vyron:profile"))}
export async function removeAvatar(){let ok=true;
 try{await kv("del","avatar")}catch{try{await kv("set","avatar",null)}catch{ok=idbOk===false}}
 if(!ok)throw new Error("store");
 avatarCache="";const a=loadAthlete();a.identity.avatar="";saveAthlete(a);applyAvatar();window.dispatchEvent(new CustomEvent("vyron:profile"))}
export function resetAthlete(){try{localStorage.removeItem(KEY)}catch{}avatarCache="";kv("del","avatar").catch(()=>{})}
export function importAthlete(obj){if(!obj)return false;const cur=loadAthlete(),c=cur.identity,pristine=!c.username&&!c.bio&&!c.avatar&&!cur.goals.length&&!cur.fitness.sport;if(!pristine)return false;const n=normalize(obj),ok=saveAthlete(n);if(ok&&n.identity.avatar)setAvatar(n.identity.avatar).catch(()=>{});return ok}
const legacy=()=>{try{const o=JSON.parse(localStorage.getItem(LEGACY)||"{}");return o&&typeof o==="object"?o:{}}catch{return {}}};

/* ---------- analysis (single source: existing IndexedDB stores) ---------- */
const safeAll=s=>all(s).catch(()=>[]);
async function loadData(){const[ws,rs,sc]=await Promise.all([safeAll("workouts"),safeAll("records"),safeAll("schedule")]);return analyze(ws,rs,sc)}
function analyze(ws,rs,sc){
 const W=ws.filter(w=>w&&okDate(w.date)).map(w=>({...w,dur:Math.max(0,Number(w.duration)||0)})).sort((a,b)=>a.date.localeCompare(b.date));
 const weeks=new Map();for(const w of W){const k=weekStart(w.date);let o=weeks.get(k);if(!o){o={key:k,days:[],sessions:0,minutes:0};weeks.set(k,o)}if(!o.days.includes(w.date))o.days.push(w.date);o.sessions++;o.minutes+=w.dur}
 const today=iso(new Date()),cur=weekStart(today),schedDays=new Set((sc||[]).map(x=>x.day)).size,goalPW=schedDays||3;
 const minutes=W.reduce((n,w)=>n+w.dur,0),activeDays=new Set(W.map(w=>w.date)).size,activeWeeks=[...weeks.values()].filter(x=>x.days.length>=3).length;
 let cons=null;if(W.length){const first=weekStart(W[0].date);let n=0,met=0;for(let i=1;i<=4;i++){const k=addDays(cur,-7*i);if(k>=first){n++;if((weeks.get(k)?.days.length||0)>=goalPW)met++}}if(n)cons={pct:Math.round(met/n*100),n,goalPW}}
 const weekly=Array.from({length:8},(_,i)=>{const k=addDays(cur,-7*(7-i));return{k,v:weeks.get(k)?.sessions||0}});
 const monthly=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-(5-i));const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;return{k,v:W.filter(w=>w.date.startsWith(k)).reduce((n,w)=>n+w.dur,0)}});
 const recs=(rs||[]).filter(r=>r&&okDate(r.date)).sort((a,b)=>a.date.localeCompare(b.date));
 return{W,weeks,today,cur,schedDays,goalPW,total:W.length,minutes,activeDays,activeWeeks,cons,weekly,monthly,recs,recDates:recs.map(r=>r.date),weeksSeen:weeks.size};
}
function achievements(A){
 const nth=n=>A.W[n-1]?.date||null,wk=[...A.weeks.values()].sort((a,b)=>a.key.localeCompare(b.key)),act=wk.filter(x=>x.days.length>=3);
 let best=0,run=0,prev=null,regDate=null;for(const x of act){run=prev&&addDays(prev,7)===x.key?run+1:1;prev=x.key;best=Math.max(best,run);if(run>=3&&!regDate)regDate=x.days[2]}
 const maxDays=wk.reduce((m,x)=>Math.max(m,x.days.length),0),sd=A.schedDays,pw=sd>=2?wk.find(x=>x.days.length>=sd):null;
 const defs=[["first","flag",1,A.total,nth(1)],["wk1","flame",3,Math.min(3,maxDays),act[0]?.days[2]||null],["w10","star",10,Math.min(10,A.total),nth(10)],["w25","star",25,Math.min(25,A.total),nth(25)],["w50","trophy",50,Math.min(50,A.total),nth(50)],["pr","bolt",1,Math.min(1,A.recs.length),A.recs[0]?.date||null],["reg","chain",3,Math.min(3,best),regDate],["plan","check",sd>=2?sd:2,sd>=2?Math.min(sd,maxDays):0,pw?pw.days[sd-1]:null]];
 return defs.map(([id,ic,target,cur,date])=>({id,ic,target,cur,date,earned:!!date&&cur>=target}));
}
/* ---------- goals ---------- */
function goalCur(g,A){if(g.type==="sessions_total")return A.W.filter(w=>w.date>=g.createdAt).length;if(g.type==="minutes_total")return A.W.filter(w=>w.date>=g.createdAt).reduce((n,w)=>n+w.dur,0);if(g.type==="records_total")return A.recDates.filter(d=>d>=g.createdAt).length;const e=addDays(A.cur,6);return A.W.filter(w=>w.date>=A.cur&&w.date<=e).length}
const goalName=g=>g.title||`${T("gt_"+g.type)}: ${g.target} ${T("gu_"+g.type)}`;
function evalGoals(a,A){let changed=false,win=false;for(const g of a.goals)if(g.status==="active"&&goalCur(g,A)>=g.target){g.status="completed";g.completedAt=A.today;g.final=goalCur(g,A);changed=true;win=true}if(changed)saveAthlete(a);return win}
const curGoal=a=>[...a.goals].reverse().find(g=>g.status!=="replaced")||null;
const gView=(g,A)=>{const cur=g.status==="active"?goalCur(g,A):(g.final??g.target);return{cur,pct:Math.min(100,Math.round(cur/g.target*100))}};

/* ---------- small UI pieces ---------- */
const ring=(pct,size=64)=>`<span class="pf-ringp" style="--s:${size}px" role="img" aria-label="${pct}%"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" pathLength="100" class="t"/><circle cx="18" cy="18" r="15.5" pathLength="100" class="v" stroke-dasharray="${pct} 100"/></svg><b>${pct}%</b></span>`;
const bar=pct=>`<span class="pf-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></span>`;
function chart(data,label,fmt){const max=Math.max(1,...data.map(d=>d.v)),W=300,H=96,bw=22,gap=(W-bw*data.length)/(data.length+1);
 const bars=data.map((d,i)=>{const h=Math.max(d.v?4:2,Math.round(d.v/max*70)),x=Math.round(gap+i*(bw+gap)),y=84-h;return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="5" class="${d.v?"on":"off"}"/>${d.v?`<text x="${x+bw/2}" y="${y-4}" text-anchor="middle">${fmt(d.v)}</text>`:""}`}).join("");
 return `<div class="pf-chart" dir="ltr"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(label)}"><defs><linearGradient id="pfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00ff83"/><stop offset="1" stop-color="#00a85a"/></linearGradient></defs><line x1="0" y1="85" x2="${W}" y2="85" class="ax"/>${bars}</svg></div>`}
const emptyBox=()=>`<div class="pf-card pf-empty"><span class="pf-emblem">${svg("chart")}</span><b>${T("e_title")}</b><p>${T("e_text")}</p><button class="primary-btn" data-action="new-workout">${T("e_cta")}</button></div>`;
const tabsNav=cur=>`<nav class="pf-tabs" aria-label="${T("tabs")}">${[["profile","tab_overview"],["profile-activity","tab_activity"],["profile-stats","tab_stats"],["profile-ach","tab_ach"]].map(([p,k])=>`<button type="button" data-page="${p}" ${p===cur?'aria-current="page" class="on"':""}>${T(k)}</button>`).join("")}</nav>`;
const subHead=(title,backAttr='data-page="profile"')=>`<header class="pf-sub"><button type="button" class="pf-back" ${backAttr} aria-label="${T("back")}">${svg("chev")}</button><h1>${title}</h1></header>`;
const avatarImg=a=>a.identity.avatar?`<img src="${a.identity.avatar}" alt="">`:svg("user","pf-ph");
const row=(page,ic,title,sub)=>`<button type="button" class="pf-row" data-page="${page}"><span class="pf-rico">${svg(ic)}</span><span class="pf-rtx"><b>${title}</b><small>${sub}</small></span><span class="pf-chev">${svg("chev")}</span></button>`;
const labelOf=(pre,v)=>v?T(pre+v):T("notSet");

/* ---------- pages ---------- */
let actRange="week",actLimit=20,draftAvatar,editSig="";
export async function profilePage(page){
 const a=loadAthlete(),A=await loadData(),win=evalGoals(a,A);if(win)setTimeout(()=>toast(T("g_win")),350);
 const body={profile:overview,"profile-activity":activity,"profile-stats":stats,"profile-ach":achPage,"profile-goals":goalsPage,"profile-edit":editPage,"profile-privacy":privacyPage}[page]||overview;
 return `<div class="pf" data-pf-page="${page}">${body(a,A)}</div>`;
}
function overview(a,A){const id=a.identity,ach=achievements(A),got=ach.filter(x=>x.earned).length,g=curGoal(a),bio=id.bio,long=bio.length>70;
 const chips=[a.fitness.sport&&T("sp_"+a.fitness.sport),a.fitness.level&&T("lv_"+a.fitness.level),T("joined",fmtDate(id.joinedAt))].filter(Boolean);
 const gv=g?gView(g,A):null;
 return `<section class="pf-card pf-head"><div class="pf-hd"><div class="pf-av"><span class="pf-ring">${avatarImg(a)}</span></div>
 <div class="pf-id"><h1 data-ut>${E(id.displayName||T("athlete"))}</h1>${id.username?`<p class="pf-user" dir="ltr" data-ut>@${E(id.username)}</p>`:`<button type="button" class="pf-add" data-page="profile-edit">${T("addUser")}</button>`}
 ${bio?`<p class="pf-bio" id="pfBio" data-ut>${E(bio)}</p>${long?`<button type="button" class="pf-more" data-pf="bio" aria-expanded="false" aria-controls="pfBio">${T("more")}</button>`:""}`:""}</div>
 <div class="pf-acts"><button type="button" class="pf-ib" data-page="profile-edit" aria-label="${T("edit")}">${svg("pen")}</button><button type="button" class="pf-ib" data-pf="share" aria-label="${T("share")}">${svg("share")}</button></div></div>
 <ul class="pf-chips">${chips.map(c=>`<li>${E(c)}</li>`).join("")}</ul>
 <div class="pf-strip"><div><b>${A.total}</b><span>${T("st_workouts")}</span></div><div><b dir="ltr">${fmtDur(A.minutes)}</b><span>${T("st_time")}</span></div><div><b>${got}</b><span>${T("st_ach")}</span></div></div></section>
 ${tabsNav("profile")}
 ${g?`<button type="button" class="pf-card pf-goalmini" data-page="profile-goals">${ring(gv.pct,58)}<span class="pf-rtx"><small>${T("g_cur")}</small><b data-ut>${E(goalName(g))}</b><small dir="auto">${gv.cur} / ${g.target} ${T("gu_"+g.type)}</small></span><span class="pf-chev">${svg("chev")}</span></button>`:""}
 <div class="pf-rows">${row("profile-stats","chart",T("row_stats"),T("row_stats_s"))}${row("profile-goals","target",T("row_goals"),g?`${gv.pct}% — ${E(goalName(g))}`:T("row_goals_s"))}${row("profile-ach","trophy",T("row_ach"),T("row_ach_s",got,ach.length))}${row("profile-activity","cal",T("row_hist"),T("row_hist_s"))}${row("profile-privacy","lock",T("row_priv"),T("row_priv_s"))}</div>
 <details class="pf-card pf-acc"><summary>${T("identity")}<span class="pf-chev">${svg("chev")}</span></summary><dl>${[["sport",labelOf("sp_",a.fitness.sport)],["level",labelOf("lv_",a.fitness.level)],["goal",labelOf("tg_",a.fitness.goal)],["program",labelOf("pg_",a.fitness.program)]].map(([k,v])=>`<div><dt>${T(k)}</dt><dd>${E(v)}</dd></div>`).join("")}</dl><button type="button" class="secondary-btn" data-page="profile-edit">${T("edit")}</button></details>
 <details class="pf-card pf-acc"><summary>${T("tools")}<span class="pf-chev">${svg("chev")}</span></summary><div class="pf-tools"><button type="button" class="secondary-btn" data-page="notes">${T("tl_notes")}</button><button type="button" class="secondary-btn" data-page="reminders">${T("tl_rem")}</button><button type="button" class="secondary-btn" data-page="settings">${T("tl_set")}</button></div></details>`}

function activity(a,A){let list=A.W.slice().reverse();if(actRange==="week")list=list.filter(w=>w.date>=A.cur);else if(actRange==="month")list=list.filter(w=>w.date.startsWith(A.today.slice(0,7)));
 const mins=list.reduce((n,w)=>n+w.dur,0),shown=list.slice(0,actLimit);
 const seg=`<div class="pf-seg" role="group" aria-label="${T("a_filter")}">${[["week","a_week"],["month","a_month"],["all","a_all"]].map(([k,t])=>`<button type="button" data-pf="range" data-v="${k}" aria-pressed="${actRange===k}">${T(t)}</button>`).join("")}</div>`;
 const items=shown.map(w=>{const ex=Array.isArray(w.exercises)?w.exercises:[];return `<details class="pf-card pf-wk"><summary><span class="pf-rtx"><b data-ut>${E(w.name||"—")}</b><small>${fmtDate(w.date)} • ${fmtDur(w.dur)}${ex.length?` • ${T("a_ex",ex.length)}`:""}</small></span><span class="pf-chev">${svg("chev")}</span></summary><div class="pf-wkd">${ex.map(e=>`<p data-ut><b>${E(e.name||"")}</b><span dir="auto">${[e.sets&&`${e.sets} ${T("a_set")}`,e.reps&&`${e.reps} ${T("a_rep")}`,e.weight&&`${e.weight} ${T("kg")}`].filter(Boolean).join(" • ")}</span></p>`).join("")}${w.calories?`<p><span>${T("a_cal",w.calories)}</span></p>`:""}${w.notes?`<p data-ut><b>${T("a_notes")}</b><span>${E(w.notes)}</span></p>`:""}</div></details>`}).join("");
 return `${tabsNav("profile-activity")}${seg}${A.total?`<p class="pf-sum">${T("a_count",list.length,fmtDur(mins,true))}</p>${list.length?`<div class="pf-list">${items}</div>${list.length>shown.length?`<button type="button" class="secondary-btn pf-wide" data-pf="more">${T("a_more")}</button>`:""}`:`<div class="pf-card pf-empty"><p>${T("a_none")}</p></div>`}<button type="button" class="secondary-btn pf-wide" data-page="history">${T("a_open")}</button>`:emptyBox()}`}

function stats(a,A){if(!A.total)return tabsNav("profile-stats")+emptyBox();
 const c=A.cons,lvl=c?(c.pct>=75?"c_high":c.pct>=50?"c_mid":"c_low"):"c_none",cards=[["s_total",A.total],["s_time",fmtDur(A.minutes,true)],["s_days",A.activeDays],["s_weeks",A.activeWeeks],["s_prs",A.recs.length],["s_cons",c?`${T(lvl)}`:T("c_none")]];
 const enough=A.weeksSeen>=2,last=A.recs.slice(-3).reverse();
 return `${tabsNav("profile-stats")}<div class="pf-grid">${cards.map(([k,v])=>`<div class="pf-card pf-stat"><b dir="auto">${v}</b><small>${T(k)}</small></div>`).join("")}</div><p class="pf-note">${T("s_weeks_h")} ${c?T("c_h",c.goalPW,c.n)+` (${c.pct}%)`:T("c_nodata")}</p>
 <section class="pf-card"><h2>${T("s_weekly")}</h2><p class="pf-note">${T("s_weekly_s")}</p>${enough?chart(A.weekly,T("s_weekly"),v=>v):`<p class="pf-note">${T("s_need")}</p>`}</section>
 <section class="pf-card"><h2>${T("s_monthly")}</h2><p class="pf-note">${T("s_monthly_s")}</p>${enough?chart(A.monthly,T("s_monthly"),v=>v):`<p class="pf-note">${T("s_need")}</p>`}</section>
 ${last.length?`<section class="pf-card"><h2>${T("pr_latest")}</h2>${last.map(r=>`<p class="pf-pr" data-ut><span>${E(r.exercise||"")}<small>${fmtDate(r.date)}</small></span><b dir="ltr">${E(r.weight)} ${T("kg")}</b></p>`).join("")}</section>`:""}`}

const badge=(x,big)=>`<span class="pf-badge ${x.earned?"on":"off"}">${svg(x.ic)}${["w10","w25","w50"].includes(x.id)?`<em>${x.id.slice(1)}</em>`:""}${x.earned?"":`<s>${svg("lock")}</s>`}</span>`;
function achPage(a,A){const list=achievements(A),got=list.filter(x=>x.earned).length;
 return `${tabsNav("profile-ach")}<section class="pf-card pf-achsum"><b>${T("ac_sum",got,list.length)}</b>${bar(Math.round(got/list.length*100))}</section><div class="pf-badges">${list.map(x=>`<button type="button" class="pf-card pf-bt ${x.earned?"on":""}" data-pf="badge" data-id="${x.id}">${badge(x)}<b>${T("ac_"+x.id)}</b><small>${x.earned?T("ac_on",fmtDate(x.date)):`${x.cur} / ${x.target}`}</small></button>`).join("")}</div>`}
function showBadge(id){loadData().then(A=>{const x=achievements(A).find(z=>z.id===id);if(!x)return;modal(T("ac_"+id),`<div class="pf-bd">${badge(x)}<p><b>${x.earned?T("ac_earned"):T("ac_locked")}</b></p><p>${T("ac_"+id+"_d")}</p>${x.earned?`<p class="green">${T("ac_on",fmtDate(x.date))}</p>`:`<p>${T("ac_prog",x.cur,x.target)}</p>${bar(Math.round(x.cur/x.target*100))}`}</div>`)})}

function goalsPage(a,A){const g=curGoal(a),hist=a.goals.filter(x=>x!==g).reverse(),gv=g?gView(g,A):null;
 const st=x=>x.status==="completed"?T("g_completed"):x.status==="replaced"?T("g_replaced"):T("g_active");
 return `${subHead(T("g_title"))}<section class="pf-card pf-goal">${g?`${ring(gv.pct,96)}<h2 data-ut>${E(goalName(g))}</h2><p class="pf-note">${gv.cur} / ${g.target} ${T("gu_"+g.type)} • ${st(g)}</p>${bar(gv.pct)}<p class="pf-note">${T("g_created",fmtDate(g.createdAt))}${g.completedAt?` • ${T("g_done",fmtDate(g.completedAt))}`:""}</p><div class="pf-btns">${g.status==="active"?`<button type="button" class="secondary-btn" data-pf="goal-edit">${T("g_edit")}</button>`:""}<button type="button" class="primary-btn" data-pf="goal-new">${svg("plus")} ${T("g_new")}</button></div>`:`<span class="pf-emblem">${svg("target")}</span><b>${T("g_none")}</b><p class="pf-note">${T("g_none_s")}</p><button type="button" class="primary-btn" data-pf="goal-new">${svg("plus")} ${T("g_new")}</button>`}</section>
 <section class="pf-card"><h2>${T("g_hist")}</h2>${hist.length?hist.map(x=>{const v=gView(x,A);return `<div class="pf-hrow"><span class="pf-rtx"><b data-ut>${E(goalName(x))}</b><small>${fmtDate(x.createdAt)}${x.completedAt?` → ${fmtDate(x.completedAt)}`:""} • ${st(x)}</small></span><span class="pf-pct">${v.pct}%</span></div>`}).join(""):`<p class="pf-note">${T("g_hist_e")}</p>`}</section>`}
function goalForm(edit){const a=loadAthlete(),g=edit?curGoal(a):null,sel=g?.type||"sessions_total",cur=curGoal(a);
 modal(T(edit?"g_edit":"g_new"),`<form id="pfGoalForm" class="form-grid" novalidate><div class="field full"><label for="gfT">${T("g_type")}</label><select id="gfT" name="type" ${edit?"disabled":""}>${Object.keys(GTYPES).map(k=>`<option value="${k}" ${k===sel?"selected":""}>${T("gt_"+k)}</option>`).join("")}</select><small class="pf-hint" id="gfH">${T("gh_"+sel)}</small></div><div class="field"><label for="gfN">${T("g_target")}</label><input id="gfN" name="target" type="number" inputmode="numeric" min="1" value="${g?g.target:""}" required></div><div class="field"><label for="gfM">${T("g_name")}</label><input id="gfM" name="title" maxlength="60" value="${E(g?.title||"")}"></div><small class="pf-err full" id="gfE" role="alert"></small>${!edit&&cur&&cur.status==="active"?`<p class="pf-note full">${T("g_note")}</p>`:""}<button class="primary-btn full">${T("g_save")}</button></form>`);
 const f=document.getElementById("pfGoalForm");f.type.onchange=()=>{document.getElementById("gfH").textContent=T("gh_"+f.type.value)};
 f.onsubmit=e=>{e.preventDefault();const type=edit?g.type:f.type.value,n=Number(f.target.value),max=GTYPES[type].max;if(!Number.isInteger(n)||n<1||n>max){document.getElementById("gfE").textContent=T("g_bad",max);f.target.focus();return}
  const a2=loadAthlete();if(edit){const x=curGoal(a2);if(x&&x.status==="active"){x.target=n;x.title=str(f.title.value.trim(),60)}}else{loadData().then(A=>{const o=curGoal(a2);if(o&&o.status==="active"){o.status="replaced";o.final=goalCur(o,A)}a2.goals.push({id:uid(),type,target:n,title:str(f.title.value.trim(),60),createdAt:iso(new Date()),completedAt:null,status:"active",final:null});finish(a2)});return}
  finish(a2)};
 function finish(a2){if(!saveAthlete(a2)){document.getElementById("gfE").textContent=T("er_store");return}closeModal();toast(T("g_saved"));window.dispatchEvent(new Event("datachange"))}}

/* ----- edit ----- */
const opts=(list,pre,v)=>`<option value="">${T("ed_choose")}</option>`+list.map(k=>`<option value="${k}" ${k===v?"selected":""}>${T(pre+k)}</option>`).join("");
function editPage(a){draftAvatar=undefined;const id=a.identity,lg=legacy(),L2=getLang();
 const html=`${subHead(T("ed_title"),'data-pf="cancel"')}<form id="pfEdit" class="pf-form" novalidate>
 <section class="pf-card pf-photo"><span class="pf-av"><span class="pf-ring" id="pfPrev">${avatarImg(a)}</span></span><div class="pf-btns"><button type="button" class="secondary-btn" data-pf="pickphoto">${svg("img")} ${T("ed_photo")}</button><input id="pfFile" class="pf-file" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" tabindex="-1" aria-hidden="true"><button type="button" class="secondary-btn" data-pf="rmphoto">${T("ed_remove")}</button></div><small class="pf-err" id="er_img" role="alert"></small></section>
 <section class="pf-card form-grid">
 <div class="field full"><label for="f_displayName">${T("ed_name")}</label><input id="f_displayName" name="displayName" maxlength="30" autocomplete="nickname" value="${E(id.displayName)}"><small class="pf-err" id="er_displayName" role="alert"></small></div>
 <div class="field full"><label for="f_username">${T("ed_user")}</label><input id="f_username" name="username" dir="ltr" maxlength="21" autocapitalize="none" autocomplete="off" spellcheck="false" value="${E(id.username)}" placeholder="username"><small class="pf-hint">${T("ed_user_h")}</small><small class="pf-err" id="er_username" role="alert"></small></div>
 <div class="field full"><label for="f_bio">${T("ed_bio")} <span class="pf-cnt" id="bioCnt">${id.bio.length}/140</span></label><textarea id="f_bio" name="bio" maxlength="140" rows="3">${E(id.bio)}</textarea><small class="pf-err" id="er_bio" role="alert"></small></div>
 <div class="field"><label for="f_sport">${T("sport")}</label><select id="f_sport" name="sport">${opts(SPORTS,"sp_",a.fitness.sport)}</select></div>
 <div class="field"><label for="f_level">${T("level")}</label><select id="f_level" name="level">${opts(LEVELS,"lv_",a.fitness.level)}</select></div>
 <div class="field"><label for="f_goal">${T("goal")}</label><select id="f_goal" name="goal">${opts(TGOALS,"tg_",a.fitness.goal)}</select></div>
 <div class="field"><label for="f_program">${T("program")}</label><select id="f_program" name="program">${opts(PROGS,"pg_",a.fitness.program)}</select></div>
 <div class="field"><label for="f_city">${T("ed_city")}</label><input id="f_city" name="city" maxlength="40" autocomplete="address-level2" value="${E(id.city)}"><small class="pf-err" id="er_city" role="alert"></small></div>
 <div class="field"><label for="f_lang">${T("ed_lang")}</label><select id="f_lang" name="lang">${[["ar","العربية"],["en","English"],["fr","Français"]].map(([c,n])=>`<option value="${c}" ${c===L2?"selected":""}>${n}</option>`).join("")}</select></div></section>
 <details class="pf-card pf-acc"><summary>${T("ed_priv")}<span class="pf-chev">${svg("chev")}</span></summary><p class="pf-note">${T("ed_priv_s")}</p><div class="form-grid"><div class="field"><label for="f_age">${T("ed_age")}</label><input id="f_age" name="age" type="number" inputmode="numeric" value="${E(lg.age||"")}"><small class="pf-err" id="er_age" role="alert"></small></div><div class="field"><label for="f_height">${T("ed_height")}</label><input id="f_height" name="height" type="number" inputmode="decimal" step=".1" value="${E(lg.height||"")}"><small class="pf-err" id="er_height" role="alert"></small></div><div class="field"><label for="f_weight">${T("ed_weight")}</label><input id="f_weight" name="weight" type="number" inputmode="decimal" step=".1" value="${E(lg.weight||"")}"><small class="pf-err" id="er_weight" role="alert"></small></div></div></details>
 <div class="pf-btns pf-sticky"><button class="primary-btn">${T("ed_save")}</button><button type="button" class="secondary-btn" data-pf="cancel">${T("ed_cancel")}</button></div></form>`;return html}
const normUser=v=>String(v||"").trim().replace(/^@+/,"").toLowerCase();
function validate(v){const e={};const n=v.displayName.trim();if(n&&(n.length<2||n.length>30))e.displayName=T("er_name");
 const u=normUser(v.username);if(u){if(u.length<3||u.length>20)e.username=T("er_user_l");else if(!/^[a-z0-9][a-z0-9_.]*$/.test(u)||/\.\./.test(u)||u.endsWith("."))e.username=T("er_user");else if(RESERVED.includes(u))e.username=T("er_user_r")}
 if(v.bio.length>140)e.bio=T("er_bio");if(v.city.trim().length>40)e.city=T("er_city");
 if(v.age!==""&&!(Number(v.age)>=10&&Number(v.age)<=100))e.age=T("er_age");
 for(const k of["height","weight"])if(v[k]!==""&&!(Number(v[k])>0&&Number(v[k])<=400))e[k]=T("er_num");return e}
const readForm=f=>Object.fromEntries(["displayName","username","bio","city","sport","level","goal","program","lang","age","height","weight"].map(k=>[k,f.elements[k]?.value??""]));
function showErrs(e){document.querySelectorAll("#pfEdit .pf-err").forEach(el=>{const k=el.id.replace("er_","");const m=e[k]||"";el.textContent=m;const inp=document.getElementById("f_"+k);if(inp)inp.setAttribute("aria-invalid",m?"true":"false")})}
function resizeImage(file){return new Promise((res,rej)=>{if(!file)return rej(new Error("type"));const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{const k=Math.min(1,1024/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*k)),h=Math.max(1,Math.round(img.height*k)),c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#050908";x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);res({url:c.toDataURL("image/jpeg",.88),w,h})}catch(e){rej(e)}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("type"))};img.src=url})} 
function bindEdit(render){const f=document.getElementById("pfEdit");if(!f)return;editSig=JSON.stringify(readForm(f));
 const live=()=>{showErrs(validate(readForm(f)));document.getElementById("bioCnt").textContent=`${f.bio.value.length}/140`};f.addEventListener("input",live);
 document.getElementById("pfFile").onchange=async ev=>{const er=document.getElementById("er_img");er.textContent="";const inp=ev.target,file=inp.files&&inp.files[0];if(!file)return;
  try{const okT=["image/jpeg","image/png","image/webp"].includes(file.type)||(!file.type&&/\.(jpe?g|png|webp)$/i.test(file.name||""));if(!okT||!file.size)throw new Error("type");if(file.size>8*1048576)throw new Error("big");
   const h=new Uint8Array(await file.slice(0,12).arrayBuffer()),asc=(i,n)=>String.fromCharCode(...h.slice(i,i+n));
   if(!((h[0]===255&&h[1]===216)||(h[0]===137&&asc(1,3)==="PNG")||(asc(0,4)==="RIFF"&&asc(8,4)==="WEBP")))throw new Error("type");
   previewAvatar(await resizeImage(file))}
  catch(x){const m=x&&x.message;er.textContent=m==="big"?T("er_img_b"):(x&&["NotAllowedError","NotReadableError","SecurityError"].includes(x.name))?T("er_perm"):T("er_img")}
  finally{inp.value=""}};
 const previewAvatar=src=>{const ST=240,{url,w,h}=src,base=Math.max(ST/w,ST/h);let z=1,ox=0,oy=0;
  modal(T("ph_prev"),`<div class="pf-prevbox"><div class="vx-crop" id="vxCrop" role="img" aria-label="${E(T("ph_drag"))}"><img id="vxCimg" src="${url}" alt="" draggable="false"></div></div><p class="vx-hint">${E(T("ph_drag"))}</p><label class="vx-zoom"><span>${E(T("ph_zoom"))}</span><input type="range" id="vxZ" min="1" max="3" step="0.01" value="1" aria-label="${E(T("ph_zoom"))}"></label><div class="pf-btns"><button type="button" class="primary-btn" id="phOk">${T("ph_use")}</button><button type="button" class="secondary-btn" id="phNo">${T("ph_cancel")}</button></div>`);
  const box=document.getElementById("vxCrop"),im=document.getElementById("vxCimg"),zs=document.getElementById("vxZ");
  const clamp=()=>{const mx=Math.max(0,(w*base*z-ST)/2),my=Math.max(0,(h*base*z-ST)/2);ox=Math.min(mx,Math.max(-mx,ox));oy=Math.min(my,Math.max(-my,oy))};
  const draw=()=>{clamp();const s=base*z;im.style.width=w*s+"px";im.style.height=h*s+"px";im.style.transform=`translate(${ox-w*s/2}px,${oy-h*s/2}px)`};
  draw();let drag=null;
  box.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,ox,oy};try{box.setPointerCapture(e.pointerId)}catch{}};
  box.onpointermove=e=>{if(!drag)return;ox=drag.ox+e.clientX-drag.x;oy=drag.oy+e.clientY-drag.y;draw()};
  const up=()=>{drag=null};box.onpointerup=up;box.onpointercancel=up;
  box.onwheel=e=>{e.preventDefault();z=Math.min(3,Math.max(1,z-e.deltaY*.002));zs.value=z;draw()};
  zs.oninput=()=>{z=+zs.value;draw()};
  const kb=e=>{const d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];if(d){e.preventDefault();ox+=d[0];oy+=d[1];draw()}};box.tabIndex=0;box.onkeydown=kb;
  document.getElementById("phNo").onclick=()=>{im.removeAttribute("src");closeModal()};
  document.getElementById("phOk").onclick=async e=>{const bt=e.currentTarget;bt.disabled=true;try{const s=base*z,cv=document.createElement("canvas");cv.width=cv.height=256;const x=cv.getContext("2d");x.fillStyle="#050908";x.fillRect(0,0,256,256);const sw=ST/s;x.drawImage(im,w/2-(ox+ST/2)/s,h/2-(oy+ST/2)/s,sw,sw,0,0,256,256);const data=cv.toDataURL("image/jpeg",.86);await setAvatar(data);im.removeAttribute("src");closeModal();toast(T("ph_saved"))}catch{bt.disabled=false;toast(T("er_store"))}}};  
  f.onsubmit=e=>{e.preventDefault();const v=readForm(f),errs=validate(v);showErrs(errs);if(Object.keys(errs).length){toast(T("ed_fix"));f.querySelector('[aria-invalid="true"]')?.focus();return}
  const a=loadAthlete(),id=a.identity;id.displayName=str(v.displayName.trim(),30);id.username=normUser(v.username);id.bio=str(v.bio.trim(),140);id.city=str(v.city.trim(),40);
  a.fitness={sport:pick(v.sport,SPORTS),level:pick(v.level,LEVELS),goal:pick(v.goal,TGOALS),program:pick(v.program,PROGS)};
  if(!saveAthlete(a)){toast(T("er_store"));return}
  {const ck=loadAthlete().identity;if(ck.username!==id.username||ck.displayName!==id.displayName){toast(T("er_store"));return}}
  try{const lg=legacy();lg.name=id.displayName;for(const k of["age","height","weight"]){if(v[k]==="")delete lg[k];else lg[k]=v[k]}localStorage.setItem(LEGACY,JSON.stringify(lg))}catch{}
  const lang=["ar","en","fr"].includes(v.lang)?v.lang:getLang();if(lang!==getLang())setLang(lang);
  draftAvatar=undefined;render("profile").then?.(()=>0);setTimeout(()=>toast(T("ed_saved")),60)};
}
async function cancelEdit(render){const f=document.getElementById("pfEdit");const dirty=f&&(JSON.stringify(readForm(f))!==editSig||draftAvatar!==undefined);if(dirty&&!await askOk(T("ed_discard")))return;draftAvatar=undefined;render("profile")}

/* ----- privacy ----- */
function privacyPage(a){const p=a.privacy,sw=(k,t)=>`<button type="button" class="pf-sw" role="switch" aria-checked="${p[k]}" data-pf="toggle" data-k="${k}"><span>${T(t)}</span><i></i></button>`;
 return `${subHead(T("pv_title"))}<section class="pf-card"><h2>${T("pv_vis")}</h2><div class="pf-seg" role="group" aria-label="${T("pv_vis")}">${[["private","pv_private"],["public","pv_public"]].map(([k,t])=>`<button type="button" data-pf="vis" data-v="${k}" aria-pressed="${p.visibility===k}">${T(t)}</button>`).join("")}</div><p class="pf-note">${T("pv_vis_h")}</p></section>
 <section class="pf-card"><h2>${T("pv_share")}</h2>${sw("showBio","pv_bio")}${sw("showStats","pv_stats")}${sw("showActivity","pv_act")}${sw("showAchievements","pv_ach")}</section>
 <section class="pf-card"><h2>${T("pv_acc")}</h2><form id="pfMail" class="field" novalidate><label for="f_email">${T("pv_email")}</label><input id="f_email" type="email" dir="ltr" autocomplete="email" maxlength="100" value="${E(a.account.email)}"><small class="pf-hint">${T("pv_email_h")}</small><small class="pf-err" id="er_email" role="alert"></small><button class="secondary-btn">${T("pv_email_save")}</button></form><p class="pf-note">${T("pv_local")}</p></section>
 <section class="pf-card"><h2>${T("pv_data")}</h2><div class="pf-btns"><button type="button" class="secondary-btn" data-action="backup">${T("pv_export")}</button><button type="button" class="danger-btn" data-pf="reset">${svg("trash")} ${T("pv_reset")}</button></div></section>`}

/* ---------- sharing (respects privacy) ---------- */
async function share(){const a=loadAthlete();if(a.privacy.visibility!=="public")return toast(T("sh_private"));const A=await loadData(),id=a.identity,p=a.privacy,ach=achievements(A).filter(x=>x.earned).length,lines=[`${id.displayName||T("athlete")}${id.username?` (@${id.username})`:""} — VYRON FIT`];
 if(p.showBio&&id.bio)lines.push(id.bio);if(p.showStats)lines.push(T("sh_line",A.total,fmtDur(A.minutes)));if(p.showAchievements)lines.push(`${T("st_ach")}: ${ach}`);
 if(p.showActivity&&A.W.length){const l=A.W[A.W.length-1];lines.push(`${l.name||""} • ${fmtDate(l.date)}`)}
 const text=lines.join("\n");try{if(navigator.share){await navigator.share({title:"VYRON FIT",text});return}await navigator.clipboard.writeText(text);toast(T("sh_copied"))}catch(e){if(e&&e.name==="AbortError")return;toast(T("sh_fail"))}}

/* ---------- avatar in global header ---------- */
export function applyAvatar(){const src=okAv(avatarCache)?avatarCache:"";window.__vxAv=src||"";const dflt=window.__A["hdr/logo"];  document.querySelectorAll(".vx-av").forEach(b=>{const im=b.querySelector(".vx-ic"),want=src||dflt;if(im){if(im.getAttribute("src")!==want)im.setAttribute("src",want);im.classList.toggle("vx-ph",!!src)}else b.innerHTML=`<img class="vx-ic${src?" vx-ph":""}" src="${want}" alt=""><u></u>`});
 document.querySelectorAll(".bottom-nav [data-page=profile] .ni").forEach(n=>{if(n.dataset.orig===undefined)n.dataset.orig=n.innerHTML;n.classList.toggle("has-av",!!src);if(n.dataset.avs!==src){n.dataset.avs=src;n.innerHTML=src?`<img class="nav-av" src="${src}" alt="">`:n.dataset.orig}});
 document.querySelectorAll(".pf-head .pf-ring,#pfPrev").forEach(r=>{r.innerHTML=src?`<img src="${src}" alt="">`:svg("user","pf-ph")})}

/* in-app confirm: native confirm() is blocked in sandboxed frames / some WebViews and silently returns false */
function askOk(msg){return new Promise(res=>{modal(T("ph_yes"),`<p class="pf-note">${E(msg)}</p><div class="pf-btns"><button type="button" class="danger-btn" id="aoY">${T("ph_yes")}</button><button type="button" class="secondary-btn" id="aoN">${T("ph_cancel")}</button></div>`);let done=false;const fin=v=>{if(done)return;done=true;closeModal();res(v)};
 document.getElementById("aoY").onclick=()=>fin(true);document.getElementById("aoN").onclick=()=>fin(false);document.getElementById("closeModal").onclick=()=>fin(false);document.getElementById("modalBackdrop").onclick=e=>{if(e.target.id==="modalBackdrop")fin(false)}})}

/* ---------- events ---------- */
let rerender=null;
export function bindProfile(page,render){rerender=render;if(page==="profile-edit")bindEdit(render);
 const m=document.getElementById("pfMail");if(m)m.onsubmit=e=>{e.preventDefault();const v=document.getElementById("f_email").value.trim(),er=document.getElementById("er_email");if(v&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){er.textContent=T("er_email");return}er.textContent="";const a=loadAthlete();a.account.email=str(v,100);toast(saveAthlete(a)?T("pv_saved"):T("er_store"))}}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-pf]");if(!b)return;const k=b.dataset.pf;
 if(k==="bio"){const el=document.getElementById("pfBio"),o=el.classList.toggle("open");b.setAttribute("aria-expanded",o);b.textContent=T(o?"less":"more")}
 else if(k==="share")share();
 else if(k==="cancel")cancelEdit(rerender||(()=>{}));
 else if(k==="pickphoto"){const i=document.getElementById("pfFile");try{if(!i)throw 0;if(typeof i.showPicker==="function")i.showPicker();else i.click()}catch{try{i?.click()}catch{toast(T("er_perm"))}}}
 else if(k==="rmphoto"){if(!avatarCache)return toast(T("ph_none"));if(!await askOk(T("ph_rm_c")))return;removeAvatar().then(()=>toast(T("ph_removed"))).catch(()=>toast(T("er_store")))}
 else if(k==="range"){actRange=b.dataset.v;actLimit=20;rerender?.("profile-activity")}
 else if(k==="more"){actLimit+=20;rerender?.("profile-activity")}
 else if(k==="badge")showBadge(b.dataset.id);
 else if(k==="goal-new")goalForm(false);
 else if(k==="goal-edit")goalForm(true);
 else if(k==="vis"||k==="toggle"){const a=loadAthlete();if(k==="vis")a.privacy.visibility=b.dataset.v==="public"?"public":"private";else a.privacy[b.dataset.k]=!a.privacy[b.dataset.k];if(!saveAthlete(a))return toast(T("er_store"));rerender?.("profile-privacy")}
 else if(k==="reset"){if(!await askOk(T("pv_reset_c")))return;resetAthlete();try{const lg=legacy();delete lg.name;localStorage.setItem(LEGACY,JSON.stringify(lg))}catch{}applyAvatar();toast(T("pv_reset_d"));rerender?.("profile")}
});
