/* VYRON FIT v22 — Exercise DB extension: standard, widely documented exercises in the SAME pipe format as smart-engine RAW
   (id|ar|en|cat|target|secondary|type|difficulty|equipment|pattern|sets|reps|rest|restrictions|alternatives|goals).
   Only common textbook movements; no media (no licensed images/videos are bundled). Source: "vyron-curated" (standard exercise science taxonomy). */
export const EXT_RAW=`tricdip|غطس الترايسبس على مقعد|Bench dip|strength|triceps|chest,shoulders|compound|2|bench|push|3|8-12|60|shoulder,wrist|pushup|strength,general
tripext|تمديد الترايسبس فوق الرأس بالدمبل|Overhead dumbbell triceps extension|strength|triceps||isolation|1|dumbbell|iso|3|10-15|60|shoulder|tricdip|strength,general
bandpd|دفع الترايسبس بالمطاط|Band triceps pushdown|strength|triceps||isolation|1|band|iso|3|12-15|45||tripext|general,endurance
diamond|ضغط الماس|Diamond push-up|strength|triceps|chest,shoulders|compound|2||push|3|6-12|60|wrist,shoulder,floor|pushup|strength,general
calfraise|رفع الساق واقفاً|Standing calf raise|strength|calves||isolation|1||iso|3|12-20|45|balance|calfdb|general,endurance
calfdb|رفع الساق بالدمبل|Dumbbell calf raise|strength|calves||isolation|1|dumbbell|iso|3|12-15|45|balance|calfraise|strength,general
machcalf|رفع الساق بالآلة|Machine calf raise|strength|calves||isolation|1|machine|iso|3|10-15|45||calfraise|strength,general
inclpress|ضغط مائل بالدمبل|Incline dumbbell press|strength|chest|shoulders,triceps|compound|2|dumbbell,bench|push|3|8-12|75|shoulder|dbpress,inclpush|strength,general
bbbench|ضغط الصدر بالبار|Barbell bench press|strength|chest|triceps,shoulders|compound|3|barbell,bench|push|4|5-8|120|shoulder,heavy|dbpress,chestpress|strength,athletic
dbfly|فتح الصدر بالدمبل|Dumbbell fly|strength|chest|shoulders|isolation|2|dumbbell,bench|iso|3|10-15|60|shoulder|dbpress|general
elevpush|ضغط بقدمين مرفوعتين|Feet-elevated push-up|strength|chest|shoulders,triceps|compound|3|step|push|3|6-12|60|wrist,shoulder,floor|pushup|strength,general
pecdeck|فتح الصدر بالآلة|Machine pec fly|strength|chest||isolation|1|machine|iso|3|10-15|60|shoulder|chestpress|general
bbrow|تجديف بالبار|Barbell bent-over row|strength|back|biceps|compound|3|barbell|pull|4|6-10|90|back,heavy|dbrow,cablerow|strength
invrow|تجديف مقلوب|Inverted row|strength|back|biceps|compound|2|bar|pull|3|6-12|60|shoulder|bandrow,dbrow|strength,general
bandpull|سحب علوي بالمطاط|Band lat pulldown|strength|back|biceps|compound|1|band|vpull|3|10-15|45||pulldown|general,endurance
chinup|عقلة بقبضة عكسية|Chin-up|strength|back|biceps|compound|3|bar|vpull|3|3-8|120|shoulder,wrist|pulldown|strength
superman|سوبرمان|Superman|strength|back|glutes|isometric|1||iso|3|20-30s|30|back,floor|glbridge|general,mobility
bandface|سحب الوجه بالمطاط|Band face pull|strength|shoulders|back|isolation|1|band|iso|3|12-15|45||bandrow|general,mobility
frraise|رفع أمامي بالدمبل|Dumbbell front raise|strength|shoulders||isolation|1|dumbbell|iso|3|10-12|45|shoulder|latraise|general
rearfly|رفرفة خلفية بالدمبل|Rear delt fly|strength|shoulders|back|isolation|1|dumbbell|iso|3|12-15|45||bandface|general
pikepush|ضغط على شكل V|Pike push-up|strength|shoulders|triceps|compound|3||vpush|3|5-10|60|wrist,shoulder,floor|ohpress|strength
machohp|ضغط الكتف بالآلة|Machine shoulder press|strength|shoulders|triceps|compound|1|machine|vpush|3|8-12|75|shoulder|ohpress|strength,general
bbohp|ضغط الكتف بالبار واقفاً|Standing barbell overhead press|strength|shoulders|triceps,core|compound|3|barbell|vpush|4|5-8|120|shoulder,back,heavy|ohpress|strength,athletic
dbshrug|رفع الكتفين بالدمبل|Dumbbell shrug|strength|traps||isolation|1|dumbbell|iso|3|10-15|45||dbrow|strength,general
hammer|مطرقة بالدمبل|Hammer curl|strength|biceps|forearms|isolation|1|dumbbell|iso|3|8-12|45||curl|general,strength
bandcurl|بايسبس بالمطاط|Band biceps curl|strength|biceps||isolation|1|band|iso|3|12-15|45||curl|general,endurance
fwdlunge|اندفاع أمامي|Forward lunge|strength|quads|glutes,hamstrings|compound|2||lunge|3|8-12|60|knee,hip,balance|revlunge|general,strength
bulgsplit|سكوات بلغاري|Bulgarian split squat|strength|quads|glutes|compound|3|dumbbell,bench|lunge|3|8-12|75|knee,balance|revlunge,stepup|strength,athletic
latlunge|اندفاع جانبي|Lateral lunge|strength|quads|glutes,adductors|compound|2||lunge|3|8-10|60|knee,hip,balance|revlunge|general,athletic
sumodb|سكوات سومو بالدمبل|Dumbbell sumo squat|strength|quads|glutes,adductors|compound|1|dumbbell|squat|3|8-12|60|knee,hip|goblet,bwsquat|general,strength
legext|تمديد الأرجل بالآلة|Leg extension|strength|quads||isolation|1|machine|iso|3|10-15|60|knee|legpress|general
legcurl|ثني الأرجل بالآلة|Machine leg curl|strength|hamstrings||isolation|1|machine|iso|3|10-15|60||rdl|general,strength
hipthrust|دفع الورك بالدمبل|Dumbbell hip thrust|strength|glutes|hamstrings|compound|1|dumbbell,bench|hinge|3|8-12|75||glbridge|strength,general
sglbridge|جسر الأرداف بساق واحدة|Single-leg glute bridge|strength|glutes|hamstrings|compound|2||hinge|3|8-12|45|balance|glbridge|general,strength
bandwalk|مشي جانبي بالمطاط|Banded lateral walk|strength|glutes|abductors|isolation|1|band|iso|3|10-12|45||glbridge|general
sideplank|بلانك جانبي|Side plank|core|core||isometric|1||core|3|20-40s|30|wrist,shoulder,floor|plank|general,strength
crunch|تمرين البطن (كرنش)|Crunch|core|core||isolation|1||core|3|12-20|30|back,floor|deadbug|general
legraise|رفع الأرجل مستلقياً|Lying leg raise|core|core|hips|isolation|2||core|3|8-15|45|back,hip,floor|deadbug|general,strength
birddog|الكلب والطائر|Bird dog|core|core|glutes,back|stability|1||core|3|8-10|30|wrist,floor|deadbug|general,mobility
rowerg|جهاز التجديف|Rowing machine|cardio|fullbody|back,quads|cardio|1|machine|cardio|1|10-20m|0|back|bike|endurance,general,conditioning
burpee|بيربي|Burpee|conditioning|fullbody|quads,chest|cardio|3||cardio|3|8-12|45|impact,knee,wrist,shoulder,floor|jacks|conditioning,athletic
hipflex|إطالة قابض الورك|Hip flexor stretch|mobility|hips||mobility|1||mobility|2|30s|15|knee|hipopen|mobility,general
quadstr|إطالة الفخذ الأمامي|Standing quad stretch|mobility|quads||mobility|1||mobility|2|30s|15|balance,knee|hamstr|mobility,general
chestdoor|إطالة الصدر عند الباب|Doorway chest stretch|mobility|chest||mobility|1||mobility|2|30s|15|shoulder|shouldcirc|mobility,general
calfstr|إطالة السمانة|Calf stretch|mobility|calves||mobility|1||mobility|2|30s|15||hamstr|mobility,general`;
/* French names for ALL exercises (existing + extension). Arabic/English come from the pipe lines. */
export const FR={bwsquat:"Squat au poids du corps",chairsq:"Squat sur chaise",wallsit:"Chaise murale",goblet:"Squat goblet",legpress:"Presse à cuisses",bbsquat:"Squat à la barre",revlunge:"Fente arrière",stepup:"Montée sur banc",glbridge:"Pont fessier",rdl:"Soulevé de terre roumain (haltères)",deadlift:"Soulevé de terre (barre)",wallpush:"Pompes au mur",inclpush:"Pompes inclinées",pushup:"Pompes",dbpress:"Développé couché (haltères)",chestpress:"Développé pectoraux (machine)",ohpress:"Développé épaules (haltères)",dbrow:"Rowing un bras (haltère)",bandrow:"Tirage horizontal (élastique)",cablerow:"Tirage horizontal (machine)",pulldown:"Tirage vertical",pullup:"Traction",latraise:"Élévation latérale",curl:"Curl biceps (haltères)",plank:"Gainage",deadbug:"Dead bug",pallof:"Pallof press (élastique)",walk:"Marche rapide",march:"Marche sur place",jog:"Jogging léger",bike:"Vélo stationnaire",jacks:"Jumping jacks",mclimb:"Mountain climbers",catcow:"Chat-vache",thoracic:"Rotation thoracique",hipopen:"Cercles de hanches debout",hamstr:"Étirement des ischio-jambiers",shouldcirc:"Cercles d'épaules",
tricdip:"Dips sur banc",tripext:"Extension triceps au-dessus de la tête (haltère)",bandpd:"Extension triceps (élastique)",diamond:"Pompes diamant",calfraise:"Mollets debout",calfdb:"Mollets avec haltère",machcalf:"Mollets (machine)",inclpress:"Développé incliné (haltères)",bbbench:"Développé couché (barre)",dbfly:"Écartés (haltères)",elevpush:"Pompes pieds surélevés",pecdeck:"Pec deck (machine)",bbrow:"Rowing barre buste penché",invrow:"Rowing inversé",bandpull:"Tirage vertical (élastique)",chinup:"Traction supination",superman:"Superman",bandface:"Face pull (élastique)",frraise:"Élévation frontale (haltères)",rearfly:"Oiseau (haltères)",pikepush:"Pompes en V (pike)",machohp:"Développé épaules (machine)",bbohp:"Développé militaire debout (barre)",dbshrug:"Shrugs (haltères)",hammer:"Curl marteau",bandcurl:"Curl biceps (élastique)",fwdlunge:"Fente avant",bulgsplit:"Squat bulgare",latlunge:"Fente latérale",sumodb:"Squat sumo (haltère)",legext:"Leg extension (machine)",legcurl:"Leg curl (machine)",hipthrust:"Hip thrust (haltère)",sglbridge:"Pont fessier unilatéral",bandwalk:"Marche latérale (élastique)",sideplank:"Gainage latéral",crunch:"Crunch",legraise:"Relevé de jambes allongé",birddog:"Bird dog",rowerg:"Rameur",burpee:"Burpee",hipflex:"Étirement des fléchisseurs de hanche",quadstr:"Étirement du quadriceps debout",chestdoor:"Étirement des pectoraux (encadrement de porte)",calfstr:"Étirement des mollets"};
