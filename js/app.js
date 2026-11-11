/* Ma3kom – clickable prototype. No backend: all data lives in localStorage. */
(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const KEY = 'hfc-proto-v3';
const MIN = 60e3, H = 60 * MIN, D = 24 * H;
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, cls = '') => `<i data-lucide="${n}" class="ico ${cls}" aria-hidden="true"></i>`;
const at = (dayOff, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOff); d.setHours(h, m, 0, 0); return d.getTime(); };
const ymd = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const locOf = l => l === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB';
const loc = () => locOf(S.lang);
const fDL = (t, l) => new Date(t).toLocaleDateString(locOf(l), { weekday: 'short', day: 'numeric', month: 'short' });
const sDL = (t, l) => new Date(t).toLocaleDateString(locOf(l));
const fD = t => fDL(t, S.lang);
const sD = t => sDL(t, S.lang);
const fT = t => new Date(t).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
const fDT = t => `${fD(t)}, ${fT(t)}`;
const bD = t => ({ en: fDL(t, 'en'), ar: fDL(t, 'ar') });
const bS = t => ({ en: sDL(t, 'en'), ar: sDL(t, 'ar') });
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

/* ---------- i18n: every visible string goes through tr() (UI) or tx() (bilingual data) ---------- */
/* tx: resolve a bilingual {en, ar} value (or pass a plain/user-typed string through). */
const txl = (v, l) => v && typeof v === 'object' && 'en' in v ? v[l] : v;
const tx = v => v && typeof v === 'object' && 'en' in v ? v[S.lang] : v;
const et = v => esc(tx(v));
const fill = (t, vars, l) => String(t).replace(/\{(\w+)\}/g, (m, k) => vars && k in vars ? String(txl(vars[k], l) ?? '') : m);
const tr = (s, vars) => fill((S.lang === 'ar' && AR[s]) || s, vars, S.lang);
/* bi: build a {en, ar} text for data stored in state (vars may be strings or {en, ar}). */
const bi = (s, vars) => ({ en: fill(s, vars, 'en'), ar: fill(AR[s] || s, vars, 'ar') });
const B = k => ({ en: k, ar: AR[k] || k });
const L = (en, ar) => ({ en, ar });
const jn = arr => ({ en: arr.map(x => txl(x, 'en')).join(', '), ar: arr.map(x => txl(x, 'ar')).join('، ') });
const ARW = () => S.lang === 'ar' ? '←' : '→';
const lt = (what, p, vars) => { const w = bi(what, vars); return { en: `${w.en} (${p.name})`, ar: `${w.ar} (${p.nameAr})` }; };
const rel = t => {
  const m = Math.round((now() - t) / MIN);
  if (m < 1) return tr('just now');
  if (m < 60) return tr('{n} min ago', { n: m });
  if (m < 60 * 24) return tr('{n} h ago', { n: Math.round(m / 60) });
  return fD(t);
};
const nDays = n => n === 1 ? tr('1 day') : tr('{n} days', { n });

const AR = {
  /* brand, shell, navigation */
  'Ma3kom': 'معكم', 'Prototype': 'نموذج أولي', 'Ma3kom': 'معكم',
  'Dashboard': 'لوحة المتابعة', 'Timeline': 'سجل التحديثات', 'Check-in & Vitals': 'المتابعة اليومية والمؤشرات', 'Helper Voice Notes': 'ملاحظات العاملة الصوتية',
  'Appointments': 'المواعيد', 'Medications': 'الأدوية', 'Elderly Mode': 'وضع كبار السن', 'Family Coordination': 'تنسيق العائلة',
  'Home-care Providers': 'مقدمو الرعاية المنزلية', 'Emergency QR': 'رمز الطوارئ', 'App Connections': 'ربط التطبيقات', 'Wearables': 'الساعات الذكية',
  'Privacy & Roles': 'الخصوصية والأدوار', 'Reset demo': 'إعادة ضبط العرض', 'Viewing as': 'العرض كـ', 'Main': 'الرئيسية', 'Menu': 'القائمة', 'Elderly profile': 'ملف كبير السن',
  'Caregiver': 'مقدم الرعاية', 'Family member': 'فرد من العائلة', 'Helper': 'العاملة المنزلية', 'Professional': 'مختص صحي', 'Public': 'عام',
  'Offline': 'غير متصل', 'Online': 'متصل', 'Notifications': 'الإشعارات', 'No pending notifications': 'لا توجد إشعارات معلقة', '({n} pending)': '({n} معلّقة)',
  'Prototype — demo data only. No real medical data is stored or sent.': 'نموذج أولي — بيانات تجريبية فقط. لا يتم حفظ أو إرسال أي بيانات طبية حقيقية.',
  'You are offline. Changes are saved on this device and will sync when you reconnect.': 'أنت غير متصل. يتم حفظ التغييرات على هذا الجهاز وستتم مزامنتها عند الاتصال.',
  'QR library could not load (offline?)': 'تعذّر تحميل مكتبة الرمز (هل أنت غير متصل؟)',
  'Reset all demo data?': 'هل تريد إعادة ضبط كل بيانات العرض؟', 'Demo data restored': 'تمت استعادة بيانات العرض',
  'Back online — {n} change(s) synced': 'عاد الاتصال — تمت مزامنة {n} تغيير', 'Back online': 'عاد الاتصال', 'Offline mode: changes will sync later': 'وضع عدم الاتصال: ستتم مزامنة التغييرات لاحقاً',
  'Close': 'إغلاق', 'Cancel': 'إلغاء', 'Save': 'حفظ', 'Confirm': 'تأكيد', 'Dismiss': 'رفض', 'Discard': 'تجاهل', 'Add': 'إضافة', 'Remove': 'إزالة', 'Print': 'طباعة', 'None': 'لا يوجد', 'Back': 'رجوع',
  ', ': '، ',
  /* time / units */
  'just now': 'الآن', '{n} min ago': 'قبل {n} دقيقة', '{n} h ago': 'قبل {n} ساعة', '1 day': 'يوم واحد', '{n} days': '{n} أيام', '{n} years': '{n} سنة',
  'mmHg': 'ملم زئبق', 'mg/dL': 'ملغ/دل', 'kg': 'كغ', 'JOD': 'دينار', 'bpm': 'نبضة/دقيقة', 'h': 'ساعة', 'hours': 'ساعات',
  /* statuses, categories, keys */
  'taken': 'مأخوذة', 'missed': 'فائتة', 'due': 'مستحقة', 'upcoming': 'قادمة', 'Confirmed': 'مؤكد', 'Requested': 'تم الطلب',
  'All': 'الكل', 'Family': 'العائلة', 'Alerts': 'تنبيهات',
  'General': 'عام', 'Meals': 'الوجبات', 'Medication': 'الدواء', 'Mood': 'المزاج', 'Sleep': 'النوم', 'Visit': 'زيارة', 'Health concern': 'قلق صحي', 'Household': 'شؤون المنزل',
  'Vitals': 'المؤشرات الحيوية', 'Visit report': 'تقرير زيارة', 'Appointment': 'موعد', 'Check-in': 'المتابعة اليومية', 'Help request': 'طلب مساعدة', 'Privacy': 'الخصوصية',
  'My Hakeem import': 'استيراد من حكيمي', 'Service request': 'طلب خدمة',
  'Breakfast': 'الفطور', 'Lunch': 'الغداء', 'Dinner': 'العشاء',
  'Nurse': 'تمريض', 'Physiotherapist': 'علاج طبيعي', 'Lab': 'مختبر',
  'Tagalog': 'تاغالوغ', 'Sinhala': 'سنهالية', 'Bengali': 'بنغالية', 'Amharic': 'أمهرية', 'Hindi': 'هندية', 'helper language': 'لغة العاملة',
  '1 hour before': 'قبل ساعة', '1 day before': 'قبل يوم', '2 days before': 'قبل يومين',
  'App': 'التطبيق', 'Voice call': 'اتصال صوتي', 'SMS': 'رسالة نصية',
  /* dashboard */
  'Daily check-in': 'المتابعة اليومية', 'Needs your acknowledgment': 'بحاجة إلى تأكيدك', 'Acknowledge': 'تأكيد الاطلاع', 'Acknowledged': 'تم الاطلاع', '+{n} more': '+{n} أخرى',
  'Wellbeing today': 'الحالة اليوم', '{h} h sleep · {n}/3 meals': 'نوم {h} ساعة · {n}/3 وجبات', 'Check-in pending': 'المتابعة معلّقة', 'Due {time} · {name}': 'الموعد {time} · {name}',
  'Medication today': 'أدوية اليوم', '{n} missed': '{n} فائتة', 'On track': 'منتظمة', 'Refill soon': 'إعادة الصرف قريباً',
  'Next appointment': 'الموعد القادم', 'Accompanied by': 'المرافق', 'None scheduled': 'لا توجد مواعيد', 'Sugar {v} {u}': 'السكر {v} {u}', 'Out of range': 'خارج النطاق', 'Normal': 'طبيعي',
  'Latest updates': 'آخر التحديثات', 'View all': 'عرض الكل', 'Blood pressure': 'ضغط الدم', 'Blood sugar': 'سكر الدم', 'Weight': 'الوزن', 'Add reading': 'إضافة قراءة',
  'Systolic': 'الانقباضي', 'Diastolic': 'الانبساطي', 'Target band': 'النطاق المستهدف', 'Trend chart': 'مخطط الاتجاه', 'Bar chart': 'مخطط أعمدة', 'No readings yet.': 'لا توجد قراءات بعد.',
  'Voice note': 'ملاحظة صوتية', 'Original ({lang})': 'النص الأصلي ({lang})', 'Important': 'مهم',
  'This app does not give diagnoses or dosing advice. Medication doses are entered exactly as prescribed, and every AI suggestion is confirmed by a person before it is saved. In an emergency call 911.': 'لا يقدّم هذا التطبيق تشخيصاً أو نصائح حول الجرعات. تُدخل جرعات الأدوية تماماً كما وُصفت، ويؤكد شخص كل اقتراح من الذكاء الاصطناعي قبل حفظه. في حالات الطوارئ اتصل بالرقم 911.',
  /* timeline */
  'Updates from family, helpers and professionals. Important updates need acknowledgment.': 'تحديثات من العائلة والعاملات والمختصين. التحديثات المهمة تحتاج إلى تأكيد الاطلاع.',
  'Nothing here yet.': 'لا يوجد شيء هنا بعد.', 'Post update': 'نشر تحديث', 'Update': 'التحديث', 'e.g. She had a good lunch and a short walk.': 'مثال: تناولت غداءً جيداً وخرجت في مشوار قصير.',
  'Category': 'التصنيف', 'Mark as important (family must acknowledge)': 'تحديد كمهم (يجب أن تؤكد العائلة الاطلاع)', 'Mark as important': 'تحديد كمهم', 'Update posted': 'تم نشر التحديث',
  /* check-in & vitals */
  'Done today': 'تمت اليوم', 'Pending': 'قيد الانتظار', 'Designated family member': 'فرد العائلة المسؤول', 'Daily reminder': 'التذكير اليومي',
  'Checked in by {name} at {time}: {mood}, {h} h sleep, {n}/3 meals.': 'سجّل {name} المتابعة الساعة {time}: {mood}، نوم {h} ساعة، {n}/3 وجبات.',
  'Sleep (hours)': 'النوم (ساعات)', 'Observations': 'ملاحظات', 'Anything unusual? Confusion, falls, pain, appetite…': 'أي شيء غير معتاد؟ ارتباك، سقوط، ألم، تغيّر في الشهية…',
  'Unusual observation — alert the family': 'ملاحظة غير معتادة — تنبيه العائلة', 'Save check-in': 'حفظ المتابعة', 'Escalation rules': 'قواعد التصعيد',
  'No check-in 30 min after {time} → reminder to {name}': 'إذا لم تتم المتابعة بعد 30 دقيقة من {time} ← تذكير إلى {name}',
  'Still missing after 1 h → {chain}': 'إذا بقيت ناقصة بعد ساعة ← {chain}',
  'Vital out of range → immediate alert to whole family': 'قراءة حيوية خارج النطاق ← تنبيه فوري لكل العائلة',
  'Simulate missed check-in': 'محاكاة متابعة فائتة', 'Alert thresholds: {range}': 'حدود التنبيه: {range}', 'Edit thresholds': 'تعديل الحدود',
  'Date': 'التاريخ', 'Reading': 'القراءة', 'Status': 'الحالة', 'Mood': 'المزاج', 'Meals': 'الوجبات',
  'Alert thresholds': 'حدود التنبيه', 'Set by the family with the doctor. The app only alerts; it does not give advice.': 'يحددها أفراد العائلة بالتشاور مع الطبيب. التطبيق يُنبّه فقط ولا يقدّم نصائح.',
  'Systolic min': 'الانقباضي — الحد الأدنى', 'Systolic max': 'الانقباضي — الحد الأعلى', 'Diastolic min': 'الانبساطي — الحد الأدنى', 'Diastolic max': 'الانبساطي — الحد الأعلى', 'Sugar min': 'السكر — الحد الأدنى', 'Sugar max': 'السكر — الحد الأعلى',
  'Daily check-in: mood {mood}, {h} h sleep, {n}/3 meals.{obs}': 'المتابعة اليومية: المزاج {mood}، نوم {h} ساعة، {n}/3 وجبات.{obs}',
  'Check-in saved — family alerted': 'تم حفظ المتابعة — وتم تنبيه العائلة', 'Check-in saved': 'تم حفظ المتابعة',
  'Blood pressure {v} is outside the alert range. {names} notified.': 'ضغط الدم {v} خارج نطاق التنبيه. تم إبلاغ {names}.',
  'Blood sugar {v} {u} is outside the alert range. {names} notified.': 'سكر الدم {v} {u} خارج نطاق التنبيه. تم إبلاغ {names}.',
  'Out of range — family alerted': 'خارج النطاق — تم تنبيه العائلة', 'Reading saved': 'تم حفظ القراءة', 'Thresholds updated': 'تم تحديث الحدود',
  'Escalation sent to family': 'تم إرسال التصعيد إلى العائلة',
  'Simulated: no check-in by {time}. Reminder sent to {a} by app and SMS; after 1 hour escalated to {b}.': 'محاكاة: لا توجد متابعة حتى الساعة {time}. تم إرسال تذكير إلى {a} عبر التطبيق والرسائل النصية؛ وبعد ساعة يتم التصعيد إلى {b}.',
  'Missed dose: {med} ({time}). {a} and {b} were notified by app and SMS.': 'جرعة فائتة: {med} ({time}). تم إبلاغ {a} و{b} عبر التطبيق والرسائل النصية.',
  'Daily check-in was not completed by {time}. Reminder sent to {a}; escalated to {b}.': 'لم تتم المتابعة اليومية حتى الساعة {time}. تم إرسال تذكير إلى {a} وتم التصعيد إلى {b}.',
  /* voice */
  'The helper records a short voice note in her own language. AI transcribes it, translates it into Arabic and suggests a category. A person reviews it before it is saved.': 'تسجّل العاملة ملاحظة صوتية قصيرة بلغتها. يحوّلها الذكاء الاصطناعي إلى نص ويترجمها إلى العربية ويقترح تصنيفاً. يراجعها شخص قبل حفظها.',
  'Language': 'اللغة', 'Stop recording': 'إيقاف التسجيل', 'Start recording': 'بدء التسجيل', 'Recording… tap to stop': 'جارٍ التسجيل… اضغط للإيقاف',
  'Transcribing and translating…': 'جارٍ التفريغ والترجمة…', 'Tap to record (simulated in this prototype)': 'اضغط للتسجيل (محاكاة في هذا النموذج)',
  'Review before saving': 'المراجعة قبل الحفظ', 'AI draft — needs human confirmation': 'مسودة الذكاء الاصطناعي — تحتاج إلى تأكيد شخص',
  'Arabic translation (editable)': 'الترجمة العربية (قابلة للتعديل)', 'English': 'الإنجليزية', 'Suggested category': 'التصنيف المقترح', 'Confirm & save': 'تأكيد وحفظ',
  'No draft yet. Record a voice note to see the transcription and translation here.': 'لا توجد مسودة بعد. سجّل ملاحظة صوتية لتظهر هنا النسخة المكتوبة والترجمة.',
  'Saved voice notes': 'الملاحظات الصوتية المحفوظة', 'None yet': 'لا يوجد بعد',
  'Confirmed AI voice note': 'تأكيد ملاحظة صوتية من الذكاء الاصطناعي', 'Voice note saved to timeline': 'تم حفظ الملاحظة الصوتية في سجل التحديثات',
  /* appointments */
  'Doctor visit summary': 'ملخص زيارة الطبيب', 'Reminder': 'التذكير', 'Reminder channels updated': 'تم تحديث قنوات التذكير', 'Add appointment': 'إضافة موعد', 'Time': 'الوقت', 'Doctor': 'الطبيب', 'Specialty': 'التخصص', 'Place': 'المكان',
  'Prescriptions & reports': 'الوصفات والتقارير', 'Upload a prescription or medical report. AI reads it and suggests follow-ups; nothing is saved until a person confirms.': 'ارفع وصفة طبية أو تقريراً طبياً. يقرؤه الذكاء الاصطناعي ويقترح متابعات؛ ولا يُحفظ شيء حتى يؤكده شخص.',
  'Upload file': 'رفع ملف', 'AI suggestion': 'اقتراح الذكاء الاصطناعي', 'from {file}': 'من {file}', 'Past visits': 'الزيارات السابقة',
  'Appointment added — reminders scheduled': 'تمت إضافة الموعد — وتمت جدولة التذكيرات', 'Reminder updated': 'تم تحديث التذكير', 'Reading document…': 'جارٍ قراءة المستند…',
  'Book follow-up blood test (HbA1c) in 3 months': 'حجز فحص دم للمتابعة (السكر التراكمي) بعد 3 أشهر',
  'Schedule a check-up with the prescribing doctor in 4 weeks': 'تحديد موعد مراجعة مع الطبيب الذي وصف الدواء بعد 4 أسابيع',
  'Uploaded medical document': 'رفع مستند طبي', 'Added to family tasks': 'تمت الإضافة إلى مهام العائلة',
  '{name} will accompany to {doctor} on {date}.': 'سيرافق {name} إلى {doctor} بتاريخ {date}.',
  'Print / Save as PDF': 'طباعة / حفظ بصيغة بي دي إف', 'Generated doctor visit summary': 'إنشاء ملخص زيارة الطبيب',
  '{name} · {age} years · Blood {blood} · Period: {from} – {to}': '{name} · {age} سنة · فصيلة الدم {blood} · الفترة: {from} – {to}',
  'Conditions:': 'الحالات الصحية:', 'Allergies:': 'الحساسية:', 'Current medications': 'الأدوية الحالية', 'Medication': 'الدواء', 'Dose': 'الجرعة', 'Times': 'الأوقات', 'Prescribed by': 'وصفه الطبيب',
  'Vitals (last 30 days)': 'المؤشرات الحيوية (آخر 30 يوماً)', 'Systolic BP': 'ضغط الدم الانقباضي', 'Diastolic BP': 'ضغط الدم الانبساطي', '{avg} (range {min}–{max})': '{avg} (النطاق {min}–{max})',
  'Out-of-range readings': 'قراءات خارج النطاق', 'Wellbeing': 'الحالة العامة', 'Check-ins: {n} · Avg sleep {h} h · Avg mood {m}/5': 'عدد المتابعات: {n} · متوسط النوم {h} ساعة · متوسط المزاج {m}/5',
  'Notable observations': 'ملاحظات بارزة', 'Questions for the doctor': 'أسئلة للطبيب', 'Add questions before printing…': 'أضف أسئلتك قبل الطباعة…',
  'Generated by Ma3kom from family-entered data. Not a diagnosis.': 'أُنشئ بواسطة معكم من بيانات أدخلتها العائلة. ليس تشخيصاً.',
  /* medications */
  'Prescription change': 'تغيير في الوصفة', 'Acknowledged by: {names}': 'تم الاطلاع من: {names}', 'nobody yet': 'لا أحد بعد',
  'You acknowledged the {med} change · also: {names}': 'لقد أكدت الاطلاع على تغيير {med} · وكذلك: {names}',
  "Today's doses": 'جرعات اليوم', 'Mark taken': 'تم أخذه', 'Mark missed': 'لم يؤخذ', 'Missed doses notify {a} and {b} automatically.': 'عند فوات الجرعة يُبلَّغ {a} و{b} تلقائياً.',
  'Shared medication list': 'قائمة الأدوية المشتركة', 'prescribed by {name}': 'وصفه {name}', '{n} left': 'متبقي {n}', '{n} days left': 'متبقي {n} يوم', 'Reminders:': 'التذكيرات:', 'Request refill': 'طلب إعادة صرف',
  'Add medication (exactly as prescribed)': 'إضافة دواء (تماماً كما وُصف)', 'Name': 'الاسم', 'Dose on prescription': 'الجرعة في الوصفة', 'e.g. 10 mg tablet': 'مثال: حبة 10 ملغ',
  'Times (comma separated)': 'الأوقات (مفصولة بفواصل)', 'Quantity': 'الكمية',
  'Acknowledged prescription change: {med} is now {dose}.': 'تم تأكيد الاطلاع على تغيير الوصفة: {med} أصبح الآن {dose}.',
  '{med} marked as taken': 'تم تسجيل {med} كمأخوذ', 'Missed dose: {med} ({time}). {a} and {b} notified.': 'جرعة فائتة: {med} ({time}). تم إبلاغ {a} و{b}.',
  'Family notified about missed dose': 'تم إبلاغ العائلة بالجرعة الفائتة',
  'Refill requested for {med}. Pharmacy pick-up added to tasks.': 'تم طلب إعادة صرف {med}. أُضيف استلام الأدوية من الصيدلية إلى المهام.',
  'Pick up {med} refill': 'استلام إعادة صرف {med}', 'Refill requested': 'تم طلب إعادة الصرف',
  'New medication added: {name} {dose}. Please acknowledge.': 'تمت إضافة دواء جديد: {name} {dose}. يرجى تأكيد الاطلاع.',
  /* elderly mode */
  'This is what {name} sees on their phone or tablet.': 'هذا ما يظهر لـ{name} على الهاتف أو الجهاز اللوحي.',
  'Good morning, {name}': 'صباح الخير، {name}', 'Good evening, {name}': 'مساء الخير، {name}', 'Listen': 'استمع', 'Next medicine: {med} at {time}': 'الدواء التالي: {med} الساعة {time}',
  'I took my medicine': 'أخذت دوائي', 'Remind me later': 'ذكّرني لاحقاً', 'I need help': 'أحتاج مساعدة', 'Call 911': 'اتصل بالطوارئ 911',
  'Works on basic phones too': 'يعمل أيضاً على الهواتف العادية', 'No smartphone? The same features work by automated voice call and SMS.': 'لا يوجد هاتف ذكي؟ تعمل الميزات نفسها عبر الاتصال الصوتي الآلي والرسائل النصية.',
  'SMS simulation': 'محاكاة الرسائل النصية',
  'Reminder: time for {med}. Reply 1 if you took it, 2 to be reminded in 30 minutes, 9 for help.': 'تذكير: حان وقت دواء {med}. أرسل 1 إذا أخذته، أو 2 للتذكير بعد 30 دقيقة، أو 9 للمساعدة.',
  'Simulate a reply:': 'محاكاة رد:', 'Reply {n}': 'رد {n}',
  'Voice call: "Press 1 if you took your medicine, 2 to be reminded later, 9 for help." The family app is updated either way.': 'اتصال صوتي: «اضغط 1 إذا أخذت دواءك، أو 2 للتذكير لاحقاً، أو 9 للمساعدة.» يتم تحديث تطبيق العائلة في الحالتين.',
  'Emergency escalation chain': 'سلسلة التصعيد في الطوارئ',
  'Thank you, your medicine has been recorded ✓': 'شكراً لك، تم تسجيل الدواء ✓', 'We will remind you in 30 minutes': 'سنذكّرك بعد 30 دقيقة', 'Your family has been notified. Someone will call you now.': 'تم إبلاغ عائلتك. سيتصل بك أحدهم الآن.',
  'Time for your medicine: {med}.': 'حان وقت دوائك: {med}.', 'You have taken all your medicines today.': 'لقد أخذت كل أدويتك اليوم.', 'If you need help, press the red button.': 'إذا احتجت إلى مساعدة، اضغط الزر الأحمر.',
  'No medicine is due right now.': 'لا يوجد دواء مستحق الآن.', 'No dose due right now': 'لا توجد جرعة مستحقة الآن',
  '{name} confirmed taking: {meds}.': 'تم تأكيد أخذ الدواء من {name}: {meds}.', 'Thank you, your medicine has been recorded.': 'شكراً لك، تم تسجيل الدواء.',
  'Medication confirmed — family updated': 'تم تأكيد الدواء — وتم تحديث العائلة', 'Okay, I will remind you in 30 minutes.': 'حسناً، سأذكّرك بعد 30 دقيقة.', 'Reminder set for 30 minutes': 'تم ضبط تذكير بعد 30 دقيقة',
  '{name} asked to be reminded in 30 minutes.': 'تم طلب التذكير بعد 30 دقيقة من {name}.',
  'What kind of help do you need?': 'ما نوع المساعدة التي تحتاجها؟', 'What kind of help?': 'ما نوع المساعدة؟', 'Call family': 'اتصل بالعائلة', 'Household needs': 'احتياجات المنزل', 'Urgent help': 'مساعدة عاجلة',
  'Your request was sent to your family.': 'تم إرسال طلبك إلى عائلتك.', 'Request sent to family': 'تم إرسال الطلب إلى العائلة',
  'Urgent help request sent. We are calling your family now.': 'تم إرسال طلب المساعدة العاجلة. نتصل بعائلتك الآن.',
  'Urgent help — escalation': 'مساعدة عاجلة — التصعيد', 'Calling the family in order until someone answers.': 'نتصل بأفراد العائلة بالترتيب حتى يرد أحدهم.',
  'no answer': 'لا رد', 'answered, on the way': 'ردّ وهو في الطريق', 'calling…': 'جارٍ الاتصال…', 'waiting': 'بالانتظار', '911 — if nobody answers': '911 — إذا لم يرد أحد', 'Call 911 now': 'اتصل بالطوارئ 911 الآن',
  '{name} wants to talk to family (from Elderly Mode).': 'يرغب {name} في التحدث مع العائلة (من وضع كبار السن).',
  '{name} needs help with medication (from Elderly Mode).': 'يحتاج {name} إلى مساعدة في الدواء (من وضع كبار السن).',
  '{name} needs household items (from Elderly Mode).': 'يحتاج {name} إلى أغراض للمنزل (من وضع كبار السن).',
  '{name} pressed URGENT HELP (from Elderly Mode).': 'ضغط {name} على زر المساعدة العاجلة (من وضع كبار السن).',
  '{name} answered the urgent help call and is on the way.': 'ردّ {name} على نداء المساعدة العاجلة وهو في الطريق.',
  '{name} asked for help by SMS (basic phone).': 'طلب {name} المساعدة عبر الرسائل النصية (هاتف عادي).',
  /* family */
  'Tasks': 'المهام', 'rotates': 'تتناوب', 'Pass to next family member': 'إسنادها لفرد العائلة التالي', 'Rotate': 'تدوير', 'New task': 'مهمة جديدة', 'Assign to': 'إسناد إلى', 'Due': 'الاستحقاق', 'Rotate weekly': 'تدوير أسبوعي',
  'Shared care costs': 'تكاليف الرعاية المشتركة', 'This month': 'هذا الشهر', 'Fair share ({n} people)': 'الحصة العادلة ({n} أشخاص)', 'JOD each': 'دينار للشخص', 'Member': 'العضو', 'Paid': 'المدفوع', 'Balance': 'الرصيد',
  'To settle up:': 'للتسوية:', '{a} → {b}: {amt} {u}': '{a} يدفع إلى {b}: {amt} {u}', 'paid by {name}': 'دفعها {name}', 'Expense': 'المصروف', 'Amount ({u})': 'المبلغ ({u})', 'Paid by': 'دفعها',
  'Now assigned to {name}': 'تم إسناد المهمة إلى {name}', 'Expense added and split': 'تمت إضافة المصروف وتقسيمه', 'Done — next week assigned to the next person': 'تم — وأُسندت مهمة الأسبوع القادم إلى الشخص التالي',
  /* providers */
  'Trusted nurses, physiotherapists and labs. Each licence is checked against the Ministry of Health register (simulated).': 'ممرضون ومعالجون طبيعيون ومختبرات موثوقة. يتم التحقق من كل ترخيص مقابل سجل وزارة الصحة (محاكاة).',
  'MoH licence verified': 'ترخيص وزارة الصحة موثق', 'Licence expired': 'الترخيص منتهي', 'Licence {lic} · checked {date}': 'الترخيص {lic} · تم التحقق في {date}',
  'Request service': 'طلب خدمة', 'Service requests': 'طلبات الخدمة', 'No requests yet': 'لا توجد طلبات بعد', 'Professional visit reports': 'تقارير زيارات المختصين', 'No reports yet': 'لا توجد تقارير بعد',
  'Service': 'الخدمة', 'Notes for the provider': 'ملاحظات لمقدم الخدمة', 'Send request': 'إرسال الطلب', 'Request sent': 'تم إرسال الطلب', 'Requested "{svc}" from {prov}.': 'تم طلب «{svc}» من {prov}.',
  /* QR */
  "Print this QR on a card for {name}'s wallet or fridge. Anyone who scans it (e.g. paramedics) sees only the public emergency info. Full records need an authorized login.": 'اطبع رمز الطوارئ هذا على بطاقة لتوضع في محفظة {name} أو على الثلاجة. من يمسحه (مثل المسعفين) يرى معلومات الطوارئ العامة فقط. أما السجلات الكاملة فتحتاج إلى تسجيل دخول مخوّل.',
  'Open public page': 'فتح الصفحة العامة', 'Print card': 'طباعة البطاقة', 'What is public?': 'ما المعلومات العامة؟',
  'Blood type': 'فصيلة الدم', 'Allergies': 'الحساسية', 'Conditions': 'الحالات الصحية', 'Emergency contacts': 'جهات اتصال الطوارئ',
  'Always private: full history, vitals, documents, check-ins and voice notes. These are shown only to signed-in caregivers, family and professionals, and every view is logged.': 'خاص دائماً: السجل الكامل والمؤشرات الحيوية والمستندات والمتابعات والملاحظات الصوتية. تظهر فقط لمقدمي الرعاية والعائلة والمختصين المسجّلين، ويُسجَّل كل اطلاع.',
  'EMERGENCY': 'طوارئ', 'Blood {blood} · Allergies: {list}': 'فصيلة الدم {blood} · الحساسية: {list}', 'Scan for emergency medical info': 'امسح الرمز للاطلاع على المعلومات الطبية الطارئة',
  'Profile not found': 'الملف غير موجود', 'Emergency medical information': 'معلومات طبية طارئة', 'Full record (authorized)': 'السجل الكامل (مخوّل)',
  'Latest BP {bp}, sugar {sg} {u}.': 'آخر قياس لضغط الدم {bp}، والسكر {sg} {u}.', 'Last check-in:': 'آخر متابعة:', 'no notes': 'لا ملاحظات',
  'This view was recorded in the access log.': 'تم تسجيل هذا العرض في سجل الوصول.', 'Full medical records are available to authorized users only.': 'السجلات الطبية الكاملة متاحة للمستخدمين المخوّلين فقط.',
  'Sign in as authorized professional (demo)': 'تسجيل الدخول كمختص مخوّل (تجريبي)', 'Back to app': 'العودة إلى التطبيق',
  /* app connections */
  'Update on {name} ({date}): {n}/{t} doses taken. BP {bp}.{ci} — sent from Ma3kom': 'تحديث عن {name} ({date}): تم أخذ {n}/{t} جرعات. ضغط الدم {bp}.{ci} — أُرسل من معكم',
  'Last check-in: {obs}': 'آخر متابعة: {obs}', 'OK': 'بخير',
  'My Hakeem': 'حكيمي', 'Share prescriptions and lab results from the My Hakeem app into this app. They are checked by a person before saving.': 'شارك الوصفات ونتائج المختبر من تطبيق حكيمي إلى هذا التطبيق. يراجعها شخص قبل الحفظ.',
  'Simulate share from My Hakeem': 'محاكاة المشاركة من حكيمي', 'Open My Hakeem': 'فتح حكيمي', 'Imported — confirm': 'مستورد — بانتظار التأكيد',
  'Riaya': 'رعاية', "Request a home nurse through Riaya and upload the nurse's visit report here.": 'اطلب ممرضة منزلية عبر رعاية وارفع تقرير زيارتها هنا.', 'Request a nurse': 'طلب ممرضة', 'Upload visit report': 'رفع تقرير الزيارة',
  'WhatsApp': 'واتساب', 'Send summaries and alerts to the family group in one tap, or chat with a family member.': 'أرسل الملخصات والتنبيهات إلى مجموعة العائلة بضغطة واحدة، أو تحدث مع أحد أفراد العائلة.',
  "Share today's summary": 'مشاركة ملخص اليوم', 'Chat with {name}': 'محادثة مع {name}', 'Integrations are simulated in this prototype; phone numbers are placeholders.': 'الربط مع التطبيقات محاكاة في هذا النموذج؛ وأرقام الهواتف للتوضيح فقط.',
  'Prescription: Metformin 850 mg tablet — Dr. Sami Haddad': 'وصفة: ميتفورمين حبة 850 ملغ — د. سامي حداد', 'Lab result: HbA1c 7.4% ({date})': 'نتيجة مخبرية: السكر التراكمي 7.4% ({date})',
  'Imported from My Hakeem: {item}': 'تم الاستيراد من حكيمي: {item}', 'Saved to records': 'تم الحفظ في السجلات',
  'Visit report uploaded from Riaya ({file}).': 'تم رفع تقرير زيارة من رعاية ({file}).', 'Visit report uploaded: {file}': 'تم رفع تقرير الزيارة: {file}', 'Visit report uploaded': 'تم رفع تقرير الزيارة',
  /* wearables */
  'Connect a smartwatch': 'ربط ساعة ذكية', "Optional. Use {name}'s own watch to share heart rate, steps, activity and sleep with the family.": 'اختياري. استخدم ساعة {name} الخاصة لمشاركة معدل النبض والخطوات والنشاط والنوم مع العائلة.',
  '{device} · synced {when}': '{device} · آخر مزامنة {when}', 'Sync now': 'مزامنة الآن', 'Disconnect': 'فصل', 'Heart rate now': 'نبض القلب الآن', 'Resting HR': 'النبض أثناء الراحة',
  'Alert above {n} {u} at rest': 'تنبيه عند تجاوز {n} {u} أثناء الراحة', 'Steps today': 'خطوات اليوم', 'Sleep last night': 'النوم الليلة الماضية', 'Steps': 'الخطوات',
  '{device} connected': 'تم ربط {device}', 'Synced': 'تمت المزامنة',
  /* privacy */
  'Members & roles': 'الأعضاء والأدوار', 'Role': 'الدور', 'Role for {name}': 'دور {name}', 'Helper name': 'اسم العاملة', 'Add helper': 'إضافة عاملة',
  'Adding or removing a helper takes effect immediately on all devices.': 'إضافة العاملة أو إزالتها تسري فوراً على جميع الأجهزة.', 'Who can see what': 'من يرى ماذا',
  'Dashboard & timeline': 'لوحة المتابعة وسجل التحديثات', 'Post updates & check-ins': 'نشر التحديثات والمتابعات', 'Medication list': 'قائمة الأدوية', 'Vitals & reports': 'المؤشرات والتقارير',
  'Appointments & documents': 'المواعيد والمستندات', 'Costs & tasks': 'التكاليف والمهام', 'Emergency QR settings': 'إعدادات رمز الطوارئ', 'Manage members & privacy': 'إدارة الأعضاء والخصوصية',
  'Try the "{menu}" menu at the top to see the app as each role.': 'جرّب قائمة «{menu}» في الأعلى لعرض التطبيق بحسب كل دور.',
  'Consent of {name}': 'موافقة {name}', 'Consent given': 'تمت الموافقة', 'Consent withdrawn': 'تم سحب الموافقة', 'Sharing is paused.': 'تم إيقاف المشاركة.',
  'Record withdrawal of consent': 'تسجيل سحب الموافقة', 'Record consent': 'تسجيل الموافقة', 'Your data rights': 'حقوقك في بياناتك',
  "Under Jordan's Personal Data Protection Law (No. 24 of 2023) you can get a copy of your data or ask for it to be deleted.": 'بموجب قانون حماية البيانات الشخصية الأردني (رقم 24 لسنة 2023) يحق لك الحصول على نسخة من بياناتك أو طلب حذفها.',
  'Export my data': 'تصدير البيانات', 'Request deletion': 'طلب الحذف', 'Safety': 'السلامة', 'No diagnosis or dosing advice.': 'لا تشخيص ولا نصائح حول الجرعات.',
  'Every AI transcription, translation and suggestion is confirmed by a person.': 'يؤكد شخص كل تفريغ وترجمة واقتراح من الذكاء الاصطناعي.',
  'Offline mode: changes are saved on the device and sync when back online.': 'وضع عدم الاتصال: تُحفظ التغييرات على الجهاز وتتم مزامنتها عند عودة الاتصال.',
  'Access log': 'سجل الوصول', 'When': 'متى', 'Who': 'من', 'Action': 'الإجراء', 'Public QR': 'رمز الطوارئ العام',
  'Viewed vitals': 'اطّلع على المؤشرات الحيوية', 'Viewed medication list': 'اطّلع على قائمة الأدوية', 'Viewed appointments & documents': 'اطّلع على المواعيد والمستندات', 'Viewed emergency QR': 'اطّلع على رمز الطوارئ',
  'Uploaded visit report': 'رفع تقرير زيارة', 'Emergency QR profile scanned': 'تم مسح رمز الطوارئ للملف', 'Opened full record via QR': 'فتح السجل الكامل عبر رمز الطوارئ',
  'Exported personal data': 'تصدير البيانات الشخصية', 'Requested data deletion': 'طلب حذف البيانات', 'Recorded consent': 'تسجيل الموافقة', 'Recorded consent withdrawal': 'تسجيل سحب الموافقة',
  'Added helper {name}': 'إضافة العاملة {name}', '{name} added — access active now': 'تمت إضافة {name} — والوصول فعّال الآن', 'Removed member {name}': 'إزالة العضو {name}', 'Remove {name}? Their access ends immediately.': 'هل تريد إزالة {name}؟ سينتهي وصوله فوراً.',
  '{name} removed — access revoked': 'تمت إزالة {name} — أُلغي الوصول', '{name} (recorded by {by})': '{name} (سجّلها {by})', 'Switched view to {role}': 'تغيير العرض إلى {role}', "Changed {name}'s role to {role}": 'تغيير دور {name} إلى {role}',
  "All of {name}'s data will be permanently deleted within 30 days, as required by the Personal Data Protection Law. Family members will be notified.": 'سيتم حذف جميع بيانات {name} نهائياً خلال 30 يوماً، وفقاً لما يقتضيه قانون حماية البيانات الشخصية. سيتم إبلاغ أفراد العائلة.',
  'Submit request': 'إرسال الطلب', '{name} requested deletion of all data. It will be completed within 30 days unless cancelled.': 'طلب {name} حذف جميع البيانات. سيتم إكمال ذلك خلال 30 يوماً ما لم يُلغَ الطلب.',
  'Deletion request submitted': 'تم إرسال طلب الحذف'
};

/* ---------- seed data (display strings are {en, ar}; categories/statuses/roles are stable English keys) ---------- */
const MEMBERS = () => [
  { id: 'm1', name: 'Layla', nameAr: 'ليلى', rel: L('Daughter', 'ابنة'), role: 'caregiver', phone: '+962790000001' },
  { id: 'm2', name: 'Omar', nameAr: 'عمر', rel: L('Son', 'ابن'), role: 'family', phone: '+962790000002' },
  { id: 'm3', name: 'Rania', nameAr: 'رانيا', rel: L('Daughter', 'ابنة'), role: 'family', phone: '+962790000003' },
  { id: 'm4', name: 'Maria', nameAr: 'ماريا', rel: L('Live-in helper', 'عاملة منزلية مقيمة'), role: 'helper', lang: 'Tagalog', phone: '+962790000004' },
  { id: 'm5', name: 'Nurse Huda', nameAr: 'الممرضة هدى', rel: L('Home-care nurse', 'ممرضة رعاية منزلية'), role: 'professional', phone: '+962790000005' }
];
const ROLE_LABEL = { caregiver: 'Caregiver', family: 'Family member', helper: 'Helper', professional: 'Professional' };
const ME = { caregiver: 'm1', family: 'm2', helper: 'm4', professional: 'm5' };

function vitSeries(base, jit, base2, jit2, spikeAt, spike, spike2) {
  return Array.from({ length: 14 }, (_, i) => {
    const r = { t: at(i - 13, 8, 30), v: Math.round(base + Math.sin(i * 1.7) * jit + Math.cos(i * .9) * jit / 2) };
    if (base2) r.v2 = Math.round(base2 + Math.cos(i * 1.3) * jit2);
    if (i === spikeAt) { r.v = spike; if (spike2) r.v2 = spike2; }
    return r;
  });
}

const DR_SAMI = L('Dr. Sami Haddad', 'د. سامي حداد'), DR_NADER = L('Dr. Nader Saleh', 'د. نادر صالح');

function seed() {
  const rxDate = at(-2, 10);
  const fatima = {
    id: 'fatima', g: 'f', name: 'Hajja Fatima', nameAr: 'الحاجة فاطمة', initials: L('HF', 'ف'), age: 78, rel: L('Mother', 'الأم'), blood: 'O+',
    conditions: [L('Hypertension', 'ارتفاع ضغط الدم'), L('Type 2 diabetes', 'السكري من النوع الثاني'), L('High cholesterol', 'ارتفاع الكوليسترول')], allergies: [L('Penicillin', 'البنسلين')],
    meds: [
      { id: 'd1', name: L('Amlodipine', 'أملوديبين'), dose: L('5 mg tablet', 'حبة 5 ملغ'), times: ['08:00'], qty: 6, purpose: L('Blood pressure', 'ضغط الدم'), ch: ['app', 'voice'], by: DR_SAMI },
      { id: 'd2', name: L('Metformin', 'ميتفورمين'), dose: L('500 mg tablet', 'حبة 500 ملغ'), times: ['08:00', '20:00'], qty: 40, purpose: L('Blood sugar', 'سكر الدم'), ch: ['app', 'sms'], by: DR_SAMI },
      { id: 'd3', name: L('Atorvastatin', 'أتورفاستاتين'), dose: L('20 mg tablet', 'حبة 20 ملغ'), times: ['21:00'], qty: 25, purpose: L('Cholesterol', 'الكوليسترول'), ch: ['app'], by: DR_SAMI },
      { id: 'd4', name: L('Vitamin D3', 'فيتامين د3'), dose: L('1000 IU capsule', 'كبسولة 1000 وحدة دولية'), times: ['13:00'], qty: 50, purpose: L('Supplement', 'مكمل غذائي'), ch: ['app'], by: DR_SAMI }
    ],
    rxChange: {
      med: 'd2',
      text: L(`Dr. Sami Haddad changed Metformin to 850 mg tablet (prescription dated ${sDL(rxDate, 'en')}). Please confirm you have seen it so everyone uses the new prescription.`,
        `قام د. سامي حداد بتغيير ميتفورمين إلى حبة 850 ملغ (وصفة بتاريخ ${sDL(rxDate, 'ar')}). يرجى تأكيد الاطلاع ليعتمد الجميع الوصفة الجديدة.`),
      newDose: L('850 mg tablet', 'حبة 850 ملغ'), ack: []
    },
    doses: {},
    appts: [
      { id: 'a1', t: at(3, 10, 30), doctor: DR_SAMI, spec: L('Internal medicine', 'الأمراض الباطنية'), place: L('Jordan Hospital, Amman', 'مستشفى الأردن، عمّان'), with: 'm2', rem: '1 day before', notes: L('Bring glucose log and current medication box.', 'يرجى إحضار سجل قياسات السكر وعلبة الأدوية الحالية.') },
      { id: 'a2', t: at(12, 9), doctor: L('Dr. Lina Khoury', 'د. لينا خوري'), spec: L('Ophthalmology (diabetic eye check)', 'طب العيون (فحص العين للسكري)'), place: L('Al-Khalidi Hospital', 'مستشفى الخالدي'), with: 'm1', rem: '2 days before', notes: '' },
      { id: 'a0', t: at(-20, 11), doctor: DR_SAMI, spec: L('Internal medicine', 'الأمراض الباطنية'), place: L('Jordan Hospital, Amman', 'مستشفى الأردن، عمّان'), with: 'm1', rem: '', notes: L('HbA1c 7.6%. Continue current plan. Recheck in 3 months.', 'السكر التراكمي 7.6%. متابعة الخطة الحالية. إعادة الفحص بعد 3 أشهر.'), past: true }
    ],
    suggestions: [],
    vitals: { bp: vitSeries(132, 6, 82, 4, 13, 152, 94), sugar: vitSeries(138, 18, 0, 0, 9, 205), weight: vitSeries(68, .4, 0, 0, -1) },
    th: { sys: [90, 140], dia: [60, 90], sugar: [70, 180] },
    checkins: [
      { id: uid(), t: at(-1, 20, 15), by: 'm1', mood: 4, sleep: 7, meals: ['Breakfast', 'Lunch', 'Dinner'], obs: L('Good day. Walked in the garden with Maria.', 'يوم جيد. تمشّت في الحديقة مع ماريا.'), unusual: false },
      { id: uid(), t: at(-2, 20, 40), by: 'm1', mood: 3, sleep: 5, meals: ['Breakfast', 'Lunch'], obs: L('Skipped dinner, said she was not hungry.', 'لم تتناول العشاء وقالت إنها غير جائعة.'), unusual: false },
      { id: uid(), t: at(-3, 19, 55), by: 'm1', mood: 4, sleep: 6.5, meals: ['Breakfast', 'Lunch', 'Dinner'], obs: '', unusual: false }
    ],
    ciTime: '20:00', ciBy: 'm1',
    timeline: [
      { id: uid(), t: now() - 25 * MIN, src: 'helper', who: 'm4', cat: 'Health concern', text: L('Felt a little dizzy after the morning walk. Rested and drank water; feeling better now.', 'شعرت ببعض الدوخة بعد مشي الصباح. استراحت وشربت الماء وهي الآن أفضل.'), orig: 'Medyo nahilo si Lola pagkatapos maglakad kaninang umaga. Nagpahinga at uminom ng tubig; mas mabuti na ngayon.', voice: true, important: true, handled: null },
      { id: uid(), t: now() - 3 * H, src: 'system', who: null, cat: 'Vitals', vit: { type: 'bp', val: '152/94', lvl: 'warn', low: false }, text: L('Blood pressure 152/94 is above the alert threshold (140/90). Layla and Omar were notified.', 'ضغط الدم 152/94 أعلى من حد التنبيه (140/90). تم إبلاغ ليلى وعمر.'), important: true, handled: null },
      { id: uid(), t: now() - 5 * H, src: 'family', who: 'm2', cat: 'Visit', text: L('Visited this morning, brought groceries and fixed the bathroom grab bar.', 'زرتها هذا الصباح وأحضرت المشتريات وأصلحت مقبض الإمساك في الحمام.'), important: false },
      { id: uid(), t: now() - 26 * H, src: 'professional', who: 'm5', cat: 'Visit report', text: L('Home visit: wound on left foot healing well. Blood pressure 134/84. Next visit in one week.', 'زيارة منزلية: جرح القدم اليسرى يلتئم جيداً. ضغط الدم 134/84. الزيارة القادمة بعد أسبوع.'), important: false },
      { id: uid(), t: now() - 30 * H, src: 'helper', who: 'm4', cat: 'Meals', text: L('Ate full lunch: rice, chicken and salad. Drank 6 glasses of water today.', 'تناولت غداءً كاملاً: أرز ودجاج وسلطة. شربت 6 أكواب ماء اليوم.'), orig: 'Kumain si Lola ng buong tanghalian: kanin, manok at salad.', voice: true, important: false },
      { id: uid(), t: now() - 50 * H, src: 'family', who: 'm1', cat: 'Appointment', text: L('Booked follow-up with Dr. Sami. Omar will take her.', 'تم حجز موعد متابعة مع د. سامي. سيصطحبها عمر.'), important: false }
    ],
    tasks: [
      { id: uid(), title: L('Weekly pharmacy pick-up', 'استلام الأدوية من الصيدلية أسبوعياً'), who: 'm2', due: at(1, 17), done: false, rotate: true },
      { id: uid(), title: L('Friday visit & lunch', 'زيارة وغداء يوم الجمعة'), who: 'm3', due: at(2, 13), done: false, rotate: true },
      { id: uid(), title: L('Pay helper salary', 'دفع راتب العاملة'), who: 'm1', due: at(5, 10), done: false, rotate: false },
      { id: uid(), title: L('Book diabetic eye check', 'حجز فحص العين للسكري'), who: 'm1', due: at(-1, 10), done: true, rotate: false }
    ],
    costs: [
      { id: uid(), title: L('Helper monthly salary', 'راتب العاملة الشهري'), amt: 300, by: 'm1', t: at(-6, 10) },
      { id: uid(), title: L('Pharmacy — monthly medication', 'الصيدلية — أدوية الشهر'), amt: 42.5, by: 'm2', t: at(-4, 18) },
      { id: uid(), title: L('Home nurse visit', 'زيارة ممرضة منزلية'), amt: 25, by: 'm3', t: at(-1, 12) },
      { id: uid(), title: L('Lab tests (HbA1c, lipids)', 'فحوصات مخبرية (السكر التراكمي والدهون)'), amt: 35, by: 'm1', t: at(-20, 9) }
    ],
    requests: [{ id: uid(), prov: 'p1', service: L('Weekly nursing visit', 'زيارة تمريضية أسبوعية'), t: at(6, 11), status: 'Confirmed' }],
    reports: [{ id: uid(), prov: 'p1', t: now() - 26 * H, text: L('Wound on left foot healing well, dressing changed. BP 134/84, sugar 142 mg/dL. No new concerns. Next visit in one week.', 'جرح القدم اليسرى يلتئم جيداً وتم تغيير الضماد. ضغط الدم 134/84 والسكر 142 ملغ/دل. لا مخاوف جديدة. الزيارة القادمة بعد أسبوع.') }],
    chain: ['m1', 'm2', 'm3'],
    qrPublic: { blood: true, allergies: true, conditions: true, meds: true, contacts: true },
    wear: { on: true, device: L('Galaxy Watch 6', 'ساعة جالاكسي 6'), synced: now() - 6 * MIN, hr: [72, 75, 70, 78, 74, 71, 76], rest: 68, steps: [3100, 4200, 2800, 3900, 5100, 2600, 3400], sleep: [6.5, 7, 5, 6, 7.5, 6.8, 7.2] },
    consent: { given: true, t: at(-40, 12), by: L('Hajja Fatima (verbal, witnessed by Layla)', 'الحاجة فاطمة (شفهياً، بحضور ليلى كشاهدة)') },
    notified: {}, split: 'equal', shares: {}, settlements: [], lastTook: 0,
    pendingVoice: [{ id: uid(), t: now() - 50 * MIN, who: 'm4', lang: 'Tagalog', o: 'Kumain si Lola ng kalahating almusal. Sabi niya masakit ang tuhod niya kapag umaakyat sa hagdan.', ar: 'تناولت الجدة نصف الفطور. قالت إن ركبتها تؤلمها عند صعود الدرج.', en: 'Grandma ate half her breakfast. She said her knee hurts when climbing the stairs.', cat: 'Health concern' }]
  };
  const khaled = {
    id: 'khaled', g: 'm', name: 'Abu Khaled', nameAr: 'أبو خالد', initials: L('AK', 'خ'), age: 84, rel: L('Father', 'الأب'), blood: 'A+',
    conditions: [L('Heart failure', 'قصور القلب'), L('Arthritis', 'التهاب المفاصل')], allergies: [L('Aspirin', 'الأسبرين')],
    meds: [
      { id: 'k1', name: L('Bisoprolol', 'بيسوبرولول'), dose: L('2.5 mg tablet', 'حبة 2.5 ملغ'), times: ['09:00'], qty: 28, purpose: L('Heart', 'القلب'), ch: ['app', 'voice'], by: DR_NADER },
      { id: 'k2', name: L('Furosemide', 'فوروسيميد'), dose: L('40 mg tablet', 'حبة 40 ملغ'), times: ['09:00'], qty: 5, purpose: L('Fluid', 'السوائل'), ch: ['voice', 'sms'], by: DR_NADER },
      { id: 'k3', name: L('Paracetamol', 'باراسيتامول'), dose: L('500 mg tablet', 'حبة 500 ملغ'), times: ['14:00', '22:00'], qty: 60, purpose: L('Joint pain', 'ألم المفاصل'), ch: ['app'], by: DR_NADER }
    ],
    rxChange: null, doses: {},
    appts: [{ id: 'b1', t: at(6, 12), doctor: DR_NADER, spec: L('Cardiology', 'أمراض القلب'), place: L('Specialty Hospital, Amman', 'المستشفى التخصصي، عمّان'), with: 'm1', rem: '1 day before', notes: L('Weigh every morning before the visit.', 'يرجى قياس الوزن كل صباح قبل الزيارة.') }],
    suggestions: [],
    vitals: { bp: vitSeries(124, 5, 76, 3, -1), sugar: vitSeries(108, 8, 0, 0, -1), weight: vitSeries(74, .6, 0, 0, -1) },
    th: { sys: [90, 140], dia: [60, 90], sugar: [70, 180] },
    checkins: [{ id: uid(), t: at(-1, 19, 30), by: 'm2', mood: 3, sleep: 6, meals: ['Breakfast', 'Lunch', 'Dinner'], obs: L('Knee pain in the evening.', 'ألم في الركبة في المساء.'), unusual: false }],
    ciTime: '19:00', ciBy: 'm2',
    timeline: [{ id: uid(), t: now() - 8 * H, src: 'family', who: 'm2', cat: 'Visit', text: L('Took him for a short walk. Knee pain is a bit better.', 'خرجنا في مشوار قصير. ألم الركبة أفضل قليلاً.'), important: false }],
    tasks: [{ id: uid(), title: L('Morning weight log', 'تسجيل الوزن الصباحي'), who: 'm2', due: at(1, 9), done: false, rotate: true }],
    costs: [{ id: uid(), title: L('Physiotherapy session', 'جلسة علاج طبيعي'), amt: 30, by: 'm2', t: at(-3, 16) }],
    requests: [], reports: [], chain: ['m2', 'm1', 'm3'],
    qrPublic: { blood: true, allergies: true, conditions: true, meds: true, contacts: true },
    wear: { on: false, device: '', synced: 0, hr: [], rest: 0, steps: [], sleep: [] },
    consent: { given: true, t: at(-30, 12), by: L('Abu Khaled (signed)', 'أبو خالد (توقيع)') },
    notified: {}, split: 'equal', shares: {}, settlements: [], lastTook: 0, pendingVoice: []
  };
  const today = ymd(now());
  fatima.doses[`${today}|d1|08:00`] = 'taken';
  fatima.doses[`${today}|d2|08:00`] = 'taken';
  khaled.doses[`${today}|k1|09:00`] = 'taken';
  return {
    lang: 'en', profile: 'fatima', role: 'caregiver', offline: false, queue: 0, setupDone: false, hideDemo: false,
    members: MEMBERS(), people: { fatima, khaled },
    log: [
      { t: now() - 40 * MIN, who: 'm5', role: 'professional', what: lt('Viewed medication list', fatima) },
      { t: now() - 2 * H, who: 'm2', role: 'family', what: lt('Viewed vitals', fatima) },
      { t: now() - 26 * H, who: 'm5', role: 'professional', what: lt('Uploaded visit report', fatima) }
    ]
  };
}

const PROVIDERS = [
  { id: 'p1', name: L('Nurse Huda Al-Masri', 'الممرضة هدى المصري'), type: 'Nurse', area: L('Khalda, Amman', 'خلدا، عمّان'), rating: 4.9, lic: L('MOH-N-22817', 'وص-تمريض-22817'), ok: true, ver: at(-28, 9), price: L('25 JOD / visit', '25 دينار / زيارة') },
  { id: 'p2', name: L('Amman Home Physio', 'عمّان للعلاج الطبيعي المنزلي'), type: 'Physiotherapist', area: L('Abdoun, Amman', 'عبدون، عمّان'), rating: 4.7, lic: L('MOH-P-10442', 'وص-علاج-10442'), ok: true, ver: at(-60, 9), price: L('30 JOD / session', '30 دينار / جلسة') },
  { id: 'p3', name: L('MedLabs Home Collection', 'ميد لابس لسحب العينات المنزلي'), type: 'Lab', area: L('All Amman', 'جميع مناطق عمّان'), rating: 4.6, lic: L('MOH-L-00931', 'وص-مختبر-00931'), ok: true, ver: at(-12, 9), price: L('From 10 JOD', 'ابتداءً من 10 دنانير') },
  { id: 'p4', name: L('Nurse Khaled Odeh', 'الممرض خالد عودة'), type: 'Nurse', area: L('Jabal Amman', 'جبل عمّان'), rating: 4.4, lic: L('MOH-N-18220', 'وص-تمريض-18220'), ok: false, ver: at(-3, 9), price: L('20 JOD / visit', '20 دينار / زيارة') },
  { id: 'p5', name: L('Dr. Reem Physio Care', 'د. ريم لعناية العلاج الطبيعي'), type: 'Physiotherapist', area: L('Sweifieh, Amman', 'الصويفية، عمّان'), rating: 4.8, lic: L('MOH-P-11873', 'وص-علاج-11873'), ok: true, ver: at(-90, 9), price: L('35 JOD / session', '35 دينار / جلسة') }
];
const SERVICES = {
  Nurse: [L('Home nursing visit', 'زيارة تمريض منزلية'), L('Wound care', 'العناية بالجروح'), L('Injection', 'حقن'), L('Weekly nursing visit', 'زيارة تمريضية أسبوعية')],
  Physiotherapist: [L('Physiotherapy session', 'جلسة علاج طبيعي'), L('Mobility assessment', 'تقييم الحركة')],
  Lab: [L('Home blood test', 'فحص دم منزلي'), L('HbA1c & lipid panel', 'فحص السكر التراكمي والدهون')]
};
const WEARABLES = [L('Apple Watch', 'ساعة أبل'), L('Galaxy Watch', 'ساعة جالاكسي'), L('Fitbit', 'فيتبت'), L('Huawei Watch', 'ساعة هواوي')];
const CATS = ['General', 'Meals', 'Medication', 'Mood', 'Sleep', 'Visit', 'Health concern', 'Household'];
const MOODS = [['frown', L('Very low', 'منخفض جداً')], ['annoyed', L('Low', 'منخفض')], ['meh', L('Okay', 'عادي')], ['smile', L('Good', 'جيد')], ['laugh', L('Great', 'ممتاز')]];

/* ---------- state ---------- */
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
const UI = { tlf: 'all', vt: 'bp', rec: false, pf: 'All', auth: false, pubLang: 'ar', hl: null, hrec: null, hci: null, eo: null, et: [], ei: 0, ws: 0, wd: null, vres: null };
function save() {
  if (S.offline) S.queue++;
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage unavailable: keep in memory */ }
}
const P = () => S.people[S.profile];
const mem = id => S.members.find(m => m.id === id) || { name: 'Former member', nameAr: 'عضو سابق', role: 'family', rel: L('Former member', 'عضو سابق') };
const mName = id => S.lang === 'ar' ? mem(id).nameAr || mem(id).name : mem(id).name;
const mB = id => ({ en: mem(id).name, ar: mem(id).nameAr || mem(id).name });
const pName = p => S.lang === 'ar' ? p.nameAr : p.name;
const pB = p => ({ en: p.name, ar: p.nameAr });
const me = () => ME[S.role];
const can = r => R[r] && R[r].roles.includes(S.role[0]);
function log(what, vars) { S.log.unshift({ t: now(), who: me(), role: S.role, what: lt(what, P(), vars) }); S.log = S.log.slice(0, 80); }
function addTL(p, item) { p.timeline.unshift({ id: uid(), t: now(), important: false, handled: null, ...item }); }
function upd() { save(); render(); }

/* ---------- domain logic ---------- */
function todayDoses(p) {
  const day = ymd(now()), out = [];
  p.meds.forEach(m => m.times.forEach(tm => {
    const [h, mi] = tm.split(':').map(Number), t = at(0, h, mi), key = `${day}|${m.id}|${tm}`;
    let st = p.doses[key];
    if (!st) st = now() < t ? 'upcoming' : now() - t < 2 * H ? 'due' : 'missed';
    out.push({ m, tm, t, key, st });
  }));
  return out.sort((a, b) => a.t - b.t);
}
const daysLeft = m => Math.floor(m.qty / Math.max(1, m.times.length));
const outOfRange = (p, type, r) => type === 'bp'
  ? r.v > p.th.sys[1] || r.v < p.th.sys[0] || r.v2 > p.th.dia[1] || r.v2 < p.th.dia[0]
  : type === 'sugar' ? r.v > p.th.sugar[1] || r.v < p.th.sugar[0] : false;
const lastCheckin = p => p.checkins.slice().sort((a, b) => b.t - a.t)[0];
const checkedInToday = p => p.checkins.some(c => ymd(c.t) === ymd(now()));

function escalations() {
  let changed = false;
  for (const id in S.people) {
    const p = S.people[id];
    todayDoses(p).forEach(d => {
      if (d.st === 'missed' && !p.notified[d.key]) {
        p.notified[d.key] = 1; changed = true;
        addTL(p, { src: 'system', cat: 'Medication', important: true, dose: d.key, med: d.m.name, tm: d.tm, text: bi('Missed dose: {med} ({time}). {a} and {b} were notified by app and SMS.', { med: d.m.name, time: d.tm, a: mB(p.chain[0]), b: mB(p.chain[1]) }) });
      }
    });
    const [h, m] = p.ciTime.split(':').map(Number), k = 'ci' + ymd(now());
    if (now() > at(0, h, m) + 30 * MIN && !checkedInToday(p) && !p.notified[k]) {
      p.notified[k] = 1; changed = true;
      addTL(p, { src: 'system', cat: 'Check-in', important: true, ciMiss: true, text: bi('Daily check-in was not completed by {time}. Reminder sent to {a}; escalated to {b}.', { time: p.ciTime, a: mB(p.ciBy), b: mB(p.chain.find(x => x !== p.ciBy)) }) });
    }
  }
  if (changed) save();
}

/* ---------- small UI pieces ---------- */
function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}
function modal(html) {
  const m = $('#modal'); UI.sheet = null;
  m.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false; icons();
  const f = m.querySelector('input,select,textarea,button'); if (f) f.focus();
}
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; UI.sheet = null; if (S.role === 'helper' && $('.happ')) helperDocLang(); }
function icons() { if (window.lucide) window.lucide.createIcons(); }
function speak(text, lang) {
  try {
    const u = new SpeechSynthesisUtterance(String(text).replace(/✓/g, '')); u.lang = lang || (S.lang === 'ar' ? 'ar-JO' : 'en-GB'); u.rate = .85;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch { /* speech unavailable */ }
}
const badge = (txt, k = '') => `<span class="badge ${k}">${esc(txt)}</span>`;
const stBadge = st => badge(tr(st), { taken: 'ok', missed: 'bad', due: 'warn', upcoming: '' }[st]);
const ini = n => String(n || '?').replace(/^(Nurse |Dr\. |الممرضة |د\. )/, '')[0];
const av = id => `<div class="av" aria-hidden="true">${esc(ini(mName(id)))}</div>`;
const memberOpts = (sel, roles = ['caregiver', 'family']) => S.members.filter(m => roles.includes(m.role)).map(m => `<option value="${m.id}" ${m.id === sel ? 'selected' : ''}>${esc(mName(m.id))}</option>`).join('');
const disclaimer = () => `<p class="disclaimer">${ic('info')} ${tr('This app does not give diagnoses or dosing advice. Medication doses are entered exactly as prescribed, and every AI suggestion is confirmed by a person before it is saved. In an emergency call 911.')}</p>`;

function lineChart(pts, { keys = ['v'], lo, hi, unit = '', bad = () => false } = {}) {
  if (!pts.length) return `<p class="muted">${tr('No readings yet.')}</p>`;
  const W = 600, Hh = 210, px = 40, py = 20;
  const vals = pts.flatMap(p => keys.map(k => p[k])).filter(v => v != null).concat(hi != null ? [hi] : [], lo != null ? [lo] : []);
  let mn = Math.min(...vals), mx = Math.max(...vals); const padv = (mx - mn) * .12 || 2; mn -= padv; mx += padv;
  const x = i => px + i * (W - px - 10) / Math.max(1, pts.length - 1), y = v => Hh - py - (v - mn) / (mx - mn) * (Hh - 2 * py);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(tr('Trend chart'))}">`;
  if (lo != null && hi != null) s += `<rect class="band" x="${px}" y="${y(hi)}" width="${W - px - 10}" height="${y(lo) - y(hi)}" rx="4"/>`;
  [mn + padv, mx - padv].forEach(v => { s += `<text x="4" y="${y(v) + 4}">${Math.round(v)}</text>`; });
  keys.forEach((k, ki) => {
    s += `<polyline class="ln${ki + 1}" points="${pts.map((p, i) => `${x(i)},${y(p[k])}`).join(' ')}"/>`;
    pts.forEach((p, i) => { s += `<circle cx="${x(i)}" cy="${y(p[k])}" r="${bad(p) ? 6 : 3.5}" class="${bad(p) ? 'pt-bad' : 'pt' + (ki ? '2' : '')}"><title>${fD(p.t)}: ${p.v}${p.v2 ? '/' + p.v2 : ''} ${esc(tr(unit))}</title></circle>`; });
  });
  s += `<text x="${px}" y="${Hh - 2}">${fD(pts[0].t)}</text><text x="${W - 10}" y="${Hh - 2}" text-anchor="end">${fD(pts[pts.length - 1].t)}</text></svg>`;
  return s;
}
function barChart(vals, labels, hiIdx = -1) {
  const W = 600, Hh = 170, mx = Math.max(...vals, 1), bw = (W - 20) / vals.length;
  return `<svg class="chart bars" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(tr('Bar chart'))}">${vals.map((v, i) => {
    const h = v / mx * (Hh - 40);
    return `<rect x="${10 + i * bw + 6}" y="${Hh - 22 - h}" width="${bw - 12}" height="${h}" rx="6" class="${i === hiIdx ? 'hi' : ''}"><title>${v}</title></rect><text x="${10 + i * bw + bw / 2}" y="${Hh - 6}" text-anchor="middle">${esc(labels[i])}</text>`;
  }).join('')}</svg>`;
}
const lastDays = n => Array.from({ length: n }, (_, i) => new Date(at(i - n + 1, 12)).toLocaleDateString(loc(), { weekday: 'short' }));

/* ---------- v3 strings (Arabic) ---------- */
Object.assign(AR, {
  /* shell & navigation */
  'Today': 'اليوم', 'Health': 'الصحة', 'Calendar': 'التقويم', 'More': 'المزيد', 'Settings': 'الإعدادات', 'Skip to content': 'تخطَّ إلى المحتوى',
  'Switch person — now {name}': 'تبديل الشخص — حالياً {name}', 'Who are you caring for?': 'من ترعى؟', 'All settings': 'كل الإعدادات',
  'Connection (demo)': 'الاتصال (تجريبي)', 'Demo data': 'بيانات العرض', 'This device (demo)': 'هذا الجهاز (تجريبي)', 'Saved': 'تم الحفظ',
  'Helper voice notes': 'ملاحظات العاملة الصوتية', 'Privacy & roles': 'الخصوصية والأدوار', 'Elderly mode': 'وضع كبار السن', 'Feature': 'الميزة',
  'All updates and alerts': 'كل التحديثات والتنبيهات', 'Check translations from the helper': 'مراجعة ترجمات ملاحظات العاملة', 'Nurses, physiotherapy and labs': 'تمريض وعلاج طبيعي ومختبرات',
  'Wallet card for paramedics': 'بطاقة للمحفظة للمسعفين', 'My Hakeem, Riaya, WhatsApp': 'حكيمي، رعاية، واتساب', 'Heart rate, steps and sleep': 'النبض والخطوات والنوم',
  'Members, consent and access log': 'الأعضاء والموافقة وسجل الوصول', 'Check-in, escalation, thresholds': 'المتابعة والتصعيد وحدود التنبيه', 'Big-button screen and basic phones': 'شاشة بأزرار كبيرة والهواتف العادية',
  'Use "{menu}" in the settings drawer (gear icon) to see the app as each role.': 'استخدم «{menu}» في قائمة الإعدادات (رمز الترس) لعرض التطبيق بحسب كل دور.',
  /* today */
  'All good today': 'كل شيء على ما يرام اليوم', '1 thing needs you': 'أمر واحد يحتاجك', '{n} things need you': '{n} أمور تحتاجك',
  '{name} is on track: medicines, check-in and vitals look fine.': '{name} بخير: الأدوية والمتابعة والمؤشرات الحيوية كلها جيدة.',
  '{cat} alert · {when}': 'تنبيه {cat} · {when}', 'Voice note from {name} — check translation': 'ملاحظة صوتية من {name} — راجع الترجمة',
  'Prescription change to confirm': 'تغيير في الوصفة بانتظار الاطلاع', 'Daily check-in not done yet': 'لم تتم المتابعة اليومية بعد',
  'Needs attention': 'بحاجة إلى انتباه', 'Check translation': 'مراجعة الترجمة', "I've seen the new dose": 'اطلعت على الجرعة الجديدة',
  'Latest vitals': 'آخر المؤشرات', '{n}/3 meals': '{n}/3 وجبات', 'Overdue': 'متأخرة', 'Goes with {name} to {doctor}': 'يرافق {name} إلى {doctor}',
  "Who's doing what this week": 'من يفعل ماذا هذا الأسبوع', 'Nothing planned for the next 7 days.': 'لا شيء مخطط له في الأيام السبعة القادمة.', 'All tasks': 'كل المهام',
  'Recent activity': 'آخر النشاطات', 'Open timeline': 'فتح سجل التحديثات',
  /* handling */
  "I'm handling it": 'سأتولى الأمر', '{name} is handling it': '{name} يتولى الأمر', 'Resolved': 'تمت المعالجة', 'Add outcome': 'إضافة النتيجة',
  'What happened? (optional)': 'ماذا حدث؟ (اختياري)', 'Not yet — just letting everyone know': 'ليس بعد — فقط لإعلام الجميع', 'Note (optional)': 'ملاحظة (اختياري)',
  'Everyone in the family will see that you are handling it.': 'سيرى جميع أفراد العائلة أنك تتولى الأمر.', 'Everyone can see you are handling it': 'يستطيع الجميع رؤية أنك تتولى الأمر',
  'Dose taken late': 'أُخذت الجرعة متأخرة', 'Skipped — told doctor': 'لم تُؤخذ — تم إبلاغ الطبيب', 'Re-measured, normal now': 'أُعيد القياس وهو طبيعي الآن', 'Called doctor': 'تم الاتصال بالطبيب',
  'Called her': 'اتصلت بها', 'Called him': 'اتصلت به', 'Visiting now': 'في الطريق للزيارة الآن', 'Other': 'أخرى',
  '{name} is handling: {what}': '{name} يتولى: {what}', '{name} resolved an alert: {out}': 'عالج {name} تنبيهاً: {out}',
  /* timeline */
  'Updates from family, helpers and professionals. Important updates show who is handling them.': 'تحديثات من العائلة والعاملات والمختصين. التحديثات المهمة تُظهر من يتولاها.',
  'Mark as important (alerts the family)': 'تحديد كمهم (ينبّه العائلة)',
  /* health */
  'Checked in by {name} at {time}: {mood}, {n}/3 meals.': 'سجّل {name} المتابعة الساعة {time}: {mood}، {n}/3 وجبات.',
  'Daily check-in by {name} at {time}': 'المتابعة اليومية يقوم بها {name} الساعة {time}', 'change in Settings': 'التغيير من الإعدادات', 'Recent check-ins': 'آخر المتابعات',
  'Notified: {names}': 'تم إبلاغ: {names}', 'No one needed to be notified.': 'لم تكن هناك حاجة لإبلاغ أحد.', 'Next steps': 'الخطوات التالية',
  'Re-measure in 5 minutes, seated and rested.': 'أعد القياس بعد 5 دقائق وهي جالسة ومرتاحة.', 'Note any symptoms.': 'دوّن أي أعراض.', 'This is not medical advice.': 'هذه ليست نصيحة طبية.',
  'Normal': 'طبيعي', 'Above alert range': 'أعلى من نطاق التنبيه', 'Below alert range': 'أقل من نطاق التنبيه', 'Very high — crisis': 'مرتفع جداً — حالة حرجة', 'Very low — urgent': 'منخفض جداً — عاجل',
  'Call 911 if she has chest pain, shortness of breath, weakness, confusion or trouble speaking.': 'اتصل بالطوارئ 911 إذا كان لديها ألم في الصدر أو ضيق في التنفس أو ضعف أو ارتباك أو صعوبة في الكلام.',
  'Call 911 if he has chest pain, shortness of breath, weakness, confusion or trouble speaking.': 'اتصل بالطوارئ 911 إذا كان لديه ألم في الصدر أو ضيق في التنفس أو ضعف أو ارتباك أو صعوبة في الكلام.',
  'Call her doctor now': 'اتصل بطبيبها الآن', 'Call his doctor now': 'اتصل بطبيبه الآن',
  'Blood pressure {v} is at crisis level. Whole family alerted: {names}.': 'ضغط الدم {v} في مستوى حرج. تم تنبيه كل العائلة: {names}.',
  'Blood sugar {v} {u} is at an urgent level. Whole family alerted: {names}.': 'سكر الدم {v} {u} في مستوى عاجل. تم تنبيه كل العائلة: {names}.',
  'Seen by: {names}': 'اطلع عليه: {names}', 'New {med} dose seen by: {names}': 'اطلع على جرعة {med} الجديدة: {names}',
  'Prescription change seen: {med} is now {dose}.': 'تم الاطلاع على تغيير الوصفة: {med} أصبح الآن {dose}.',
  'New medication added: {name} {dose}. Please check it.': 'تمت إضافة دواء جديد: {name} {dose}. يرجى مراجعته.',
  /* voice (family side) */
  'The helper records a note in her own language and confirms the transcript. AI translates it; a family member checks the translation before it goes on the timeline.': 'تسجّل العاملة ملاحظة بلغتها وتؤكد النص المكتوب. يترجمها الذكاء الاصطناعي، ويراجع أحد أفراد العائلة الترجمة قبل إضافتها إلى سجل التحديثات.',
  'Confirmed by the helper in her language': 'أكدتها العاملة بلغتها', 'AI translation — please check': 'ترجمة آلية — يرجى المراجعة', 'Nothing to check. New notes from the helper appear here.': 'لا شيء للمراجعة. تظهر هنا الملاحظات الجديدة من العاملة.',
  /* elderly */
  'Exit preview': 'إنهاء المعاينة', '{med} was due at {time}': 'كان موعد {med} الساعة {time}', 'Calling {name} in {n}…': 'الاتصال بـ{name} خلال {n}…', 'Tap Cancel if you are okay.': 'اضغط «إلغاء» إذا كنت بخير.',
  '{name} is on the way': '{name} في الطريق', 'Calling your family…': 'نتصل بعائلتك…', 'Want to tell them more? (optional)': 'هل تريد أن تخبرهم بالمزيد؟ (اختياري)', 'Talk to family': 'التحدث مع العائلة',
  'Already recorded ✓ at {time}': 'سُجّل مسبقاً ✓ الساعة {time}', 'No need to press again.': 'لا حاجة للضغط مرة أخرى.', 'We will remind you when it is time.': 'سنذكّرك عندما يحين الموعد.', 'Done ✓': 'تم ✓',
  'Calling {name} in 5 seconds. Tap Cancel if you are okay.': 'سنتصل بـ{name} خلال 5 ثوانٍ. اضغط «إلغاء» إذا كنت بخير.', 'Cancelled ✓': 'تم الإلغاء ✓', 'No one was called.': 'لم يتم الاتصال بأحد.',
  'Done. Your family can see this.': 'تم. تستطيع عائلتك رؤية ذلك.',
  'A full-screen, big-button view for {name}. Open it on their phone or tablet.': 'شاشة كاملة بأزرار كبيرة لـ{name}. افتحها على الهاتف أو الجهاز اللوحي.', 'Open elderly mode': 'فتح وضع كبار السن',
  'When "I need help" is pressed there is a 5-second countdown to cancel, then we call in this order until someone answers.': 'عند الضغط على «أحتاج مساعدة» يبدأ عدّ تنازلي لمدة 5 ثوانٍ يمكن خلاله الإلغاء، ثم نتصل بهذا الترتيب حتى يرد أحدهم.',
  'Change order in Settings': 'تغيير الترتيب من الإعدادات',
  /* family */
  'Task': 'المهمة', 'Tasks': 'المهام', 'Costs': 'التكاليف', 'Split': 'التقسيم', 'Equal': 'بالتساوي', 'Custom': 'مخصص', 'Share': 'الحصة', 'Save shares': 'حفظ الحصص',
  "Set each person's share. We scale them to add up to 100%.": 'حدد حصة كل شخص. نعدّل النسب لتصبح 100% معاً.', 'Mark as settled': 'تسجيل التسوية', 'Everyone is settled up.': 'تمت التسوية بين الجميع.',
  'Settlements': 'التسويات', '{a} paid {b}': 'دفع {a} إلى {b}', 'Expenses': 'المصاريف', 'Marked as settled': 'تم تسجيل التسوية', 'Shares saved': 'تم حفظ الحصص',
  '{a} paid {b} {amt} {u} to settle up.': 'دفع {a} إلى {b} مبلغ {amt} {u} للتسوية.',
  /* QR */
  'The public page opens in Arabic by default, for paramedics in Jordan.': 'تُفتح الصفحة العامة بالعربية افتراضياً، للمسعفين في الأردن.', 'ALLERGY: {list}': 'حساسية: {list}',
  /* settings */
  'Who does the daily check-in': 'من يقوم بالمتابعة اليومية', 'Reminder time': 'وقت التذكير', 'Escalation order': 'ترتيب التصعيد',
  'When something is urgent we call in this order until someone answers. 911 comes last.': 'عند وجود أمر عاجل نتصل بهذا الترتيب حتى يرد أحدهم. ويأتي 911 في النهاية.',
  'Move {name} up': 'نقل {name} للأعلى', 'Move {name} down': 'نقل {name} للأسفل', 'Escalation order saved': 'تم حفظ ترتيب التصعيد', 'Changed escalation order': 'تغيير ترتيب التصعيد',
  'Set these with your doctor. The app only alerts; it does not give medical advice.': 'حدّد هذه القيم مع الطبيب. التطبيق يُنبّه فقط ولا يقدّم نصائح طبية.', 'Run setup again': 'تشغيل الإعداد من جديد',
  /* setup wizard */
  'Add your parent': 'أضف والدك أو والدتك', 'Invite family': 'دعوة العائلة', 'All set': 'كل شيء جاهز',
  'Just looking around?': 'تتصفح فقط؟', 'This demo already has a family set up for you.': 'يحتوي هذا العرض على عائلة جاهزة مسبقاً.', 'Skip — explore with demo data': 'تخطَّ — استكشف ببيانات العرض',
  'Tell us who you are caring for. You can change everything later in Settings.': 'أخبرنا بمن ترعاه. يمكنك تغيير كل شيء لاحقاً من الإعدادات.', 'Age': 'العمر',
  'Health conditions (comma separated)': 'الحالات الصحية (مفصولة بفواصل)', 'Allergies (comma separated)': 'الحساسية (مفصولة بفواصل)',
  'Who is in the family circle? Everyone gets their own view.': 'من في دائرة العائلة؟ لكل شخص عرضه الخاص.', 'New': 'جديد', 'Invite someone (name)': 'دعوة شخص (الاسم)',
  'One person does a short check-in every day. If it is missed, the next person is reminded.': 'يقوم شخص واحد بمتابعة قصيرة كل يوم. وإذا فاتت يتم تذكير الشخص التالي.',
  '{name}, {n} years': '{name}، {n} سنة', 'Escalation: {chain}': 'التصعيد: {chain}', 'Alerts outside {bp} {u1} and {sg} {u2}': 'تنبيه خارج {bp} {u1} و{sg} {u2}',
  'You can change all of this later in Settings.': 'يمكنك تغيير كل هذا لاحقاً من الإعدادات.', 'Skip': 'تخطَّ', 'Step {n} of {t}': 'الخطوة {n} من {t}', 'Setup progress': 'تقدّم الإعداد',
  'Finish': 'إنهاء', 'Next': 'التالي', 'Exploring with demo data': 'تستكشف الآن ببيانات العرض', 'Setup saved': 'تم حفظ الإعداد', 'Completed setup': 'أكمل الإعداد',
  /* helper (Arabic option in the helper app) + family-side helper texts */
  'Home': 'الرئيسية', 'Hello, {name}': 'مرحباً، {name}', 'Read aloud': 'القراءة بصوت عالٍ', 'Caring for {name}': 'ترعين {name}',
  'Record a note': 'سجّلي ملاحظة', 'Mark a dose given': 'تسجيل جرعة أُعطيت', '{n} due now': '{n} مستحقة الآن', "Log today's check-in": 'تسجيل متابعة اليوم',
  'What to do today': 'ما يجب فعله اليوم', 'Give {med}': 'إعطاء {med}', 'Appointment: {doctor}': 'موعد: {doctor}', 'All done for today ✓': 'تم كل شيء لليوم ✓',
  'Due now': 'مستحقة الآن', 'Later today': 'لاحقاً اليوم', 'Already given': 'أُعطيت', 'Given ✓': 'أُعطيت ✓', 'Given': 'أُعطيت',
  "Today's check-in is already saved ✓": 'متابعة اليوم محفوظة مسبقاً ✓', 'Meals eaten': 'الوجبات التي تناولتها', 'Good': 'جيد', 'Okay': 'عادي', 'Not good': 'ليس جيداً',
  'Anything unusual?': 'هل هناك شيء غير معتاد؟', 'No': 'لا', 'Yes': 'نعم', 'Tell us more (optional)': 'أخبرينا بالمزيد (اختياري)', 'Choose a mood to save.': 'اختاري المزاج للحفظ.',
  'Is this what you said?': 'هل هذا ما قلتِه؟', 'Yes, correct': 'نعم، صحيح', 'Record again': 'سجّلي مرة أخرى', 'Sent to the family ✓': 'أُرسلت إلى العائلة ✓',
  'The family will check the translation.': 'ستراجع العائلة الترجمة.', 'Speak in your own language. You will check the words before sending.': 'تحدثي بلغتك. ستراجعين الكلمات قبل الإرسال.',
  'Tap to record': 'اضغطي للتسجيل', 'Writing down what you said…': 'نكتب ما قلتِه…', '{med} given ✓': 'أُعطي {med} ✓', 'Check-in saved ✓': 'تم حفظ المتابعة ✓',
  '{name} gave {med} ({time}).': 'أعطت {name} دواء {med} ({time}).', 'Check-in by {name}: mood {mood}, {n}/3 meals.{obs}': 'متابعة من {name}: المزاج {mood}، {n}/3 وجبات.{obs}'
});

Object.assign(AR, {
  'Missed dose: {med} at {time}': 'جرعة فائتة: {med} الساعة {time}', '{name} asked for help': '{name} طلب المساعدة', 'Daily check-in missed': 'فاتت المتابعة اليومية',
  '{cat} from {name}': '{cat} من {name}', '{cat} alert': 'تنبيه {cat}', '{name}: {out}': '{name}: {out}',
  '1 other thing needs you': 'أمر آخر يحتاجك', '{n} other things need you': '{n} أمور أخرى تحتاجك', 'Nothing else needs you right now.': 'لا شيء آخر يحتاجك الآن.',
  '1 thing is being handled.': 'أمر واحد قيد المعالجة.', '{n} things are being handled.': '{n} أمور قيد المعالجة.', 'Do the check-in': 'إجراء المتابعة',
  'Done today ✓': 'تمت اليوم ✓', 'Edited {when}': 'عُدّلت {when}', "Edit today's check-in": 'تعديل متابعة اليوم', "Editing today's check-in": 'تعديل متابعة اليوم', 'Save changes': 'حفظ التغييرات', 'Check-in updated': 'تم تحديث المتابعة',
  'Total: 100% ✓': 'المجموع: 100% ✓', 'Total: {n}% — must add up to 100%. Balances use the last valid split.': 'المجموع: {n}% — يجب أن يساوي 100%. تُحسب الأرصدة حسب آخر تقسيم صحيح.',
  "Set each person's share. Balances update as you type.": 'حدد حصة كل شخص. تتحدث الأرصدة أثناء الكتابة.', 'Open medications': 'فتح الأدوية',
  'Blood pressure very low ({v})': 'ضغط الدم منخفض جداً ({v})', 'Blood pressure very high ({v})': 'ضغط الدم مرتفع جداً ({v})', 'Blood pressure below range ({v})': 'ضغط الدم أقل من النطاق ({v})', 'Blood pressure above range ({v})': 'ضغط الدم أعلى من النطاق ({v})',
  'Blood sugar very low ({v} {u})': 'سكر الدم منخفض جداً ({v} {u})', 'Blood sugar very high ({v} {u})': 'سكر الدم مرتفع جداً ({v} {u})', 'Blood sugar below range ({v} {u})': 'سكر الدم أقل من النطاق ({v} {u})', 'Blood sugar above range ({v} {u})': 'سكر الدم أعلى من النطاق ({v} {u})',
  'Good afternoon, {name}': 'طاب يومك، {name}'
});

/* ---------- Helper app UI in the helper's own language (Tagalog). Keys are the English strings. ---------- */
const HL = { tl: {
  'Home': 'Simula', 'Hello, {name}': 'Kumusta, {name}', 'Read aloud': 'Basahin nang malakas', 'Language': 'Wika', 'Settings': 'Mga setting',
  'Caring for {name}': 'Inaalagaan si {name}', 'Record a note': 'Mag-record ng mensahe', 'Mark a dose given': 'Gamot na naibigay', '{n} due now': '{n} na dapat ibigay ngayon',
  "Log today's check-in": 'Ulat para sa araw na ito', 'What to do today': 'Mga gagawin ngayon', 'Give {med}': 'Ibigay ang {med}', 'Appointment: {doctor}': 'Check-up kay {doctor}',
  'All done for today ✓': 'Tapos na lahat ngayong araw ✓', 'Overdue': 'Lampas na sa oras', 'Due now': 'Oras na ngayon', 'Later today': 'Mamaya', 'Already given': 'Naibigay na',
  'Given ✓': 'Naibigay ✓', 'Given': 'Naibigay', "Today's check-in is already saved ✓": 'Naitala na ang ulat ngayong araw ✓',
  'Meals eaten': 'Mga kinain', 'Breakfast': 'Almusal', 'Lunch': 'Tanghalian', 'Dinner': 'Hapunan',
  'Mood': 'Pakiramdam', 'Good': 'Masaya', 'Okay': 'Ayos lang', 'Not good': 'Hindi maganda',
  'Anything unusual?': 'May kakaiba ba?', 'No': 'Wala', 'Yes': 'Mayroon', 'Tell us more (optional)': 'Ikuwento pa (kung gusto mo)', 'Save': 'I-save', 'Choose a mood to save.': 'Pumili ng pakiramdam bago i-save.',
  'Is this what you said?': 'Ito ba ang sinabi mo?', 'Listen': 'Pakinggan', 'Yes, correct': 'Oo, tama', 'Record again': 'Mag-record ulit',
  'Sent to the family ✓': 'Naipadala sa pamilya ✓', 'The family will check the translation.': 'Titingnan ng pamilya ang pagsasalin.',
  'Speak in your own language. You will check the words before sending.': 'Magsalita sa sarili mong wika. Titingnan mo muna ang mga salita bago ipadala.',
  'Start recording': 'Simulan ang pag-record', 'Stop recording': 'Ihinto ang pag-record', 'Recording… tap to stop': 'Nagre-record… pindutin para huminto',
  'Writing down what you said…': 'Isinusulat ang sinabi mo…', 'Tap to record': 'Pindutin para mag-record',
  '{med} given ✓': 'Naibigay ang {med} ✓', 'Check-in saved ✓': 'Naitala na ✓', 'Cancel': 'Kanselahin', 'Back': 'Bumalik'
} };

/* ---------- shared v3 helpers ---------- */
const famMembers = () => S.members.filter(m => ['caregiver', 'family'].includes(m.role));
const isUnhandled = x => x.important && !x.handled;
const isOpen = x => x.important && !(x.handled && x.handled.outcome);
const findP = id => Object.values(S.people).find(p => p.timeline.some(t => t.id === id)) || P();
const pv = p => p.pendingVoice || (p.pendingVoice = []);
const gs = (p, f, m) => p.g === 'm' ? m : f;
const hhmm = t => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const wrapT = html => `<div class="tblwrap">${html}</div>`;
/* One model for "open items" — used by the Today summary, the Needs attention list/badge and the bell.
   tier 0 = crisis vitals / urgent help, 1 = missed dose & out-of-range, 2 = other alerts, 3 = missed check-in, 4 = prescription change & translations */
function alertTier(x) {
  if (x.urgent || x.cat === 'Help request') return 0;
  if (x.vit) return x.vit.lvl === 'bad' ? 0 : 1;
  if (x.cat === 'Vitals' || x.dose || x.cat === 'Medication') return 1;
  if (x.ciMiss || x.cat === 'Check-in') return 3;
  return 2;
}
function alertHead(x, p) {
  if (x.vit) {
    const v = x.vit, u = tr(v.type === 'bp' ? 'mmHg' : 'mg/dL');
    const k = v.type === 'bp' ? (v.lvl === 'bad' ? (v.low ? 'Blood pressure very low ({v})' : 'Blood pressure very high ({v})') : (v.low ? 'Blood pressure below range ({v})' : 'Blood pressure above range ({v})'))
      : (v.lvl === 'bad' ? (v.low ? 'Blood sugar very low ({v} {u})' : 'Blood sugar very high ({v} {u})') : (v.low ? 'Blood sugar below range ({v} {u})' : 'Blood sugar above range ({v} {u})'));
    return tr(k, { v: v.val, u });
  }
  if (x.dose && x.med) return tr('Missed dose: {med} at {time}', { med: tx(x.med), time: x.tm });
  if (x.urgent || x.cat === 'Help request') return tr('{name} asked for help', { name: pName(p) });
  if (x.ciMiss || x.cat === 'Check-in') return tr('Daily check-in missed');
  return x.who ? tr('{cat} from {name}', { cat: tr(x.cat), name: mName(x.who) }) : tr('{cat} alert', { cat: tr(x.cat) });
}
function openItems(p) {
  const out = p.timeline.filter(isOpen).map(x => ({ kind: 'alert', x, tier: alertTier(x), handled: !!x.handled, t: x.t, head: alertHead(x, p) }));
  if (can('voice')) pv(p).forEach(v => out.push({ kind: 'voice', v, tier: 4, handled: false, t: v.t, head: tr('Voice note from {name} — check translation', { name: mName(v.who) }) }));
  if (p.rxChange && !p.rxChange.ack.includes(me()) && S.role !== 'professional') out.push({ kind: 'rx', tier: 4, handled: false, t: 0, head: tr('Prescription change to confirm') });
  const [h, m] = p.ciTime.split(':').map(Number);
  if (!checkedInToday(p) && now() > at(0, h, m) && !out.some(i => i.kind === 'alert' && i.x.ciMiss)) out.push({ kind: 'ci', tier: 3, handled: false, t: at(0, h, m), head: tr('Daily check-in not done yet') });
  return out.sort((a, b) => a.tier - b.tier || a.handled - b.handled || b.t - a.t);
}
const needsYou = p => openItems(p).filter(i => !i.handled);
/* Bell = the same open items for the person being viewed (others are listed below them in the sheet) */
function bellCount() { return needsYou(P()).length; }
/* Vital severity: ok / warn (outside alert range) / bad (crisis). Not a diagnosis — fixed, conservative cut-offs. */
function sev(p, type, r) {
  if (type === 'bp') { if (r.v >= 180 || r.v2 >= 120) return 'bad'; return outOfRange(p, 'bp', r) ? 'warn' : 'ok'; }
  if (type === 'sugar') { if (r.v >= 300 || r.v < 70) return 'bad'; return outOfRange(p, 'sugar', r) ? 'warn' : 'ok'; }
  return 'ok';
}
function sevLabel(p, type, r, s = sev(p, type, r)) {
  if (s === 'ok') return 'Normal';
  const low = type === 'bp' ? r.v < p.th.sys[0] || r.v2 < p.th.dia[0] : r.v < p.th.sugar[0];
  if (s === 'bad') return low ? 'Very low — urgent' : 'Very high — crisis';
  return low ? 'Below alert range' : 'Above alert range';
}
const sevBadge = (p, type, r) => { const s = sev(p, type, r); return badge(tr(sevLabel(p, type, r, s)), s); };

/* Outcomes for "I'm handling it" (stable keys, labels via tr) */
const OUTS = { Medication: ['late', 'skipped', 'other'], Vitals: ['remeasured', 'doctor', 'other'], _: ['called', 'visiting', 'other'] };
const OUTL = { late: 'Dose taken late', skipped: 'Skipped — told doctor', remeasured: 'Re-measured, normal now', doctor: 'Called doctor', called: 'Called her', calledm: 'Called him', visiting: 'Visiting now', other: 'Other' };
const outKey = (k, p) => k === 'called' && p && p.g === 'm' ? 'calledm' : k;
const outLabel = (k, p) => tr(OUTL[outKey(k, p)] || k);

function handledLine(x, p) {
  const h = x.handled;
  return `<p class="handled ${h.outcome ? 'res' : ''}">${ic(h.outcome ? 'circle-check' : 'user-round-check')} <strong>${h.outcome ? esc(tr('{name}: {out}', { name: mName(h.by), out: outLabel(h.outcome, p) })) : esc(tr('{name} is handling it', { name: mName(h.by) }))}</strong>${h.outcome ? ' ' + badge(tr('Resolved'), 'ok') : ''}${h.note ? ` · <span data-allow-mixed>${esc(h.note)}</span>` : ''} <span class="small muted">· ${rel(h.t)}</span></p>`;
}
const handleBtn = (x, label = "I'm handling it") => S.role === 'helper' ? '' : `<button class="btn sm pri" data-act="handle" data-id="${x.id}">${ic('hand')} ${tr(label)}</button>`;
function alertState(x, p) {
  if (!x.important) return '';
  if (x.handled) return handledLine(x, p) + (!x.handled.outcome && S.role !== 'helper' ? `<div class="row"><button class="btn sm" data-act="handle" data-id="${x.id}">${ic('pencil')} ${tr('Add outcome')}</button></div>` : '');
  return `<div class="row" style="margin-top:6px">${badge(tr('Important'), 'bad')}${handleBtn(x)}</div>`;
}

const subTabs = (base, cur, list) => `<div class="tabs" role="tablist">${list.map(([k, l]) => `<a role="tab" href="#/${base}/${k}" class="tab ${cur === k ? 'on' : ''}" aria-selected="${cur === k}" ${cur === k ? 'aria-current="page"' : ''}>${tr(l)}</a>`).join('')}</div>`;

/* ---------- views ---------- */
function vDash() {
  const p = P(), ci = lastCheckin(p), doses = todayDoses(p), next = p.appts.filter(a => !a.past && a.t > now()).sort((a, b) => a.t - b.t)[0];
  const taken = doses.filter(d => d.st === 'taken').length, missed = doses.filter(d => d.st === 'missed').length;
  const bp = p.vitals.bp.at(-1), sg = p.vitals.sugar.at(-1);
  const refill = p.meds.filter(m => daysLeft(m) <= 7);
  const items = openItems(p), need = items.filter(i => !i.handled), busy = items.filter(i => i.handled);
  /* status summary: one specific headline for the most urgent open item */
  const lvl = !need.length ? 'ok' : need[0].tier === 0 ? 'bad' : 'warn', rest = need.length - 1;
  const status = `<section class="card status ${lvl}" aria-live="polite"><span class="s-ic">${ic(lvl === 'ok' ? 'circle-check' : lvl === 'bad' ? 'octagon-alert' : 'triangle-alert')}</span><div>
    <h2>${lvl === 'ok' ? tr('All good today') : esc(need[0].head)}</h2>
    <p>${lvl === 'ok' ? esc(tr('{name} is on track: medicines, check-in and vitals look fine.', { name: pName(p) })) : rest ? esc(rest === 1 ? tr('1 other thing needs you') : tr('{n} other things need you', { n: rest })) : tr('Nothing else needs you right now.')}${busy.length ? ' · ' + esc(busy.length === 1 ? tr('1 thing is being handled.') : tr('{n} things are being handled.', { n: busy.length })) : ''}</p></div></section>`;
  /* needs attention: urgent first; never hide tier-0 items */
  const li = i => {
    if (i.kind === 'voice') return `<li class="need"><div class="row sb"><strong>${ic('mic')} ${esc(i.head)}</strong><span class="small muted">${rel(i.t)}</span></div><a class="btn sm pri" href="#/voice">${ic('languages')} ${tr('Check translation')}</a></li>`;
    if (i.kind === 'rx') return `<li class="need"><div><strong>${ic('file-warning')} ${esc(i.head)}</strong></div><p>${et(p.rxChange.text)}</p><button class="btn sm pri" data-act="rxAck">${ic('check')} ${tr("I've seen the new dose")}</button></li>`;
    if (i.kind === 'ci') return `<li class="need"><div><strong>${ic('clipboard-check')} ${esc(i.head)}</strong></div><p class="small muted">${esc(tr('Daily check-in by {name} at {time}', { name: mName(p.ciBy), time: p.ciTime }))}</p><a class="btn sm pri" href="#/health/checkin">${ic('clipboard-check')} ${tr('Do the check-in')}</a></li>`;
    const x = i.x;
    return `<li class="need ${x.handled ? 'is-h' : ''}"><div class="row sb"><strong>${ic(i.tier === 0 ? 'octagon-alert' : 'triangle-alert')} ${esc(i.head)}</strong><span class="small muted">${rel(x.t)}</span></div><p class="small">${et(x.text)}</p>${alertState(x, p)}</li>`;
  };
  const shown = Math.max(5, items.filter(i => i.tier === 0).length);
  const needs = items.length ? `<section class="card"><h2>${ic('bell-ring')} ${tr('Needs attention')} ${need.length ? badge(need.length, 'bad') : ''}</h2><ul class="list">${items.slice(0, shown).map(li).join('')}</ul>
    ${items.length > shown ? `<a class="btn sm" href="#/timeline">${tr('+{n} more', { n: items.length - shown })}</a>` : ''}</section>` : '';
  const recent = p.timeline.filter(x => !x.important).sort((a, b) => b.t - a.t).slice(0, 3);
  const mood = ci && checkedInToday(p) ? MOODS[ci.mood - 1] : null;
  const tiles = `<div class="grid tiles">
    <a class="card tile" href="#/health/meds"><p class="t-h">${ic('pill')} ${tr('Medication today')}</p><div class="stat">${taken}/${doses.length}</div><p class="small">${missed ? badge(tr('{n} missed', { n: missed }), 'bad') : badge(tr('On track'), 'ok')} ${refill.length ? badge(tr('Refill soon'), 'warn') : ''}</p></a>
    <a class="card tile" href="#/appts"><p class="t-h">${ic('calendar-days')} ${tr('Next appointment')}</p>${next ? `<div class="stat sm">${fD(next.t)}</div><p class="small">${fT(next.t)} · ${et(next.doctor)}</p>` : `<p>${tr('None scheduled')}</p>`}</a>
    <a class="card tile" href="#/health/vitals"><p class="t-h">${ic('heart-pulse')} ${tr('Latest vitals')}</p><div class="stat sm">${bp.v}/${bp.v2} <span class="small muted">${tr('mmHg')}</span></div><p class="small">${sevBadge(p, 'bp', bp)}</p><p class="small">${esc(tr('Sugar {v} {u}', { v: sg.v, u: tr('mg/dL') }))} ${sevBadge(p, 'sugar', sg)}</p></a>
    <a class="card tile" href="#/health/checkin"><p class="t-h">${ic('smile')} ${tr('Wellbeing')}</p>${mood ? `<div class="stat sm">${ic(mood[0])} ${et(mood[1])}</div><p class="small muted">${ci.sleep != null ? esc(tr('{h} h sleep · {n}/3 meals', { h: ci.sleep, n: ci.meals.length })) : esc(tr('{n}/3 meals', { n: ci.meals.length }))}</p>` : `<p>${badge(tr('Check-in pending'), 'warn')}</p><p class="small muted">${esc(tr('Due {time} · {name}', { time: p.ciTime, name: mName(p.ciBy) }))}</p>`}</a>
  </div>`;
  /* who's doing what this week */
  let week = '';
  if (can('family')) {
    const wk = now() + 7 * D, ts = p.tasks.filter(t => !t.done && t.due < wk), ap = p.appts.filter(a => !a.past && a.t > now() && a.t < wk);
    const rows = famMembers().map(m => ({ m, items: [
      ...ts.filter(t => t.who === m.id).map(t => ({ t: t.due, h: `${ic('list-checks')} ${et(t.title)} <span class="small muted">· ${fD(t.due)}</span>${t.due < now() ? ' ' + badge(tr('Overdue'), 'warn') : ''}` })),
      ...ap.filter(a => a.with === m.id).map(a => ({ t: a.t, h: `${ic('car')} ${esc(tr('Goes with {name} to {doctor}', { name: pName(p), doctor: tx(a.doctor) }))} <span class="small muted">· ${fD(a.t)}</span>` }))
    ].sort((a, b) => a.t - b.t) })).filter(r => r.items.length);
    week = `<section class="card"><h2>${ic('users')} ${tr("Who's doing what this week")}</h2>${rows.length ? `<ul class="list">${rows.map(r => `<li class="who"><div class="row">${av(r.m.id)}<strong>${esc(mName(r.m.id))}</strong></div><ul class="sub">${r.items.map(i => `<li>${i.h}</li>`).join('')}</ul></li>`).join('')}</ul>` : `<p class="muted">${tr('Nothing planned for the next 7 days.')}</p>`}
      <a class="btn sm" href="#/family/tasks">${ic('list-checks')} ${tr('All tasks')}</a></section>`;
  }
  return `<div class="pg-h"><h1>${tr('Today')}</h1><p class="muted small">${fD(now())} · ${esc(pName(p))}</p></div>
  <div class="stack">${status}${needs}${tiles}
  <div class="grid g2" style="align-items:start">${week}
    <section class="card"><h2>${ic('activity')} ${tr('Recent activity')}</h2><ul class="list">${recent.map(x => `<li><strong>${x.who ? esc(mName(x.who)) : tr('Ma3kom')}</strong> · <span class="small muted">${rel(x.t)}</span><br><span class="clamp">${et(x.text)}</span></li>`).join('') || `<li class="muted">${tr('Nothing here yet.')}</li>`}</ul>
      <a class="btn sm" href="#/timeline">${ic('messages-square')} ${tr('Open timeline')}</a></section></div></div>`;
}

function tlItem(x) {
  const src = { family: 'Family', helper: 'Helper', professional: 'Professional', system: 'Alerts' }[x.src];
  const who = x.who ? esc(mName(x.who)) : tr('Ma3kom');
  const lang = x.who ? mem(x.who).lang : '';
  const arTxt = S.lang === 'en' && x.text && typeof x.text === 'object' ? x.text.ar : '';
  return `<li><div class="av" aria-hidden="true">${x.who ? esc(ini(mName(x.who))) : ic('bell')}</div><div>
    <div class="row sb"><span><strong>${who}</strong> ${badge(tr(src), x.src === 'system' ? 'bad' : x.src === 'professional' ? 'ok' : '')} ${badge(tr(x.cat))} ${x.voice ? badge(tr('Voice note'), 'info') : ''}</span><span class="small muted">${rel(x.t)}</span></div>
    <p>${et(x.text)}</p>${x.orig ? `<details class="small muted"><summary>${esc(tr('Original ({lang})', { lang: tr(lang || 'helper language') }))}</summary><span data-allow-mixed>${esc(x.orig)}</span>${arTxt ? `<p class="ar" dir="rtl">${esc(arTxt)}</p>` : ''}</details>` : ''}
    ${alertState(x, findP(x.id))}
  </div></li>`;
}

function vTimeline() {
  const p = P(), f = UI.tlf;
  const items = p.timeline.filter(x => f === 'all' || (f === 'alerts' ? x.important : x.src === f)).sort((a, b) => b.t - a.t);
  const tabs = [['all', 'All'], ['family', 'Family'], ['helper', 'Helper'], ['professional', 'Professional'], ['alerts', 'Alerts']];
  return `<h1>${tr('Timeline')}</h1><p class="muted">${tr('Updates from family, helpers and professionals. Important updates show who is handling them.')}</p>
  <div class="grid g2" style="align-items:start">
  <section class="card"><div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${f === k}" class="${f === k ? 'on' : ''}" data-act="tlf" data-k="${k}">${tr(l)}</button>`).join('')}</div>
    <ul class="list tl">${items.map(tlItem).join('') || `<li class="muted">${tr('Nothing here yet.')}</li>`}</ul></section>
  <section class="card"><h2>${tr('Post update')}</h2>
    <form data-form="post" class="stack"><div><label for="pt">${tr('Update')}</label><textarea id="pt" name="text" required placeholder="${esc(tr('e.g. She had a good lunch and a short walk.'))}"></textarea></div>
    <div><label for="pc">${tr('Category')}</label><select id="pc" name="cat">${CATS.map(c => `<option value="${c}">${esc(tr(c))}</option>`).join('')}</select></div>
    <label class="row chk"><input type="checkbox" name="imp"> ${tr('Mark as important (alerts the family)')}</label>
    <button class="btn pri">${ic('send')} ${tr('Post update')}</button></form></section></div>`;
}

/* Health: one page, three sub-tabs */
function vHealth(sub) {
  sub = ['checkin', 'vitals', 'meds'].includes(sub) ? sub : 'checkin';
  return `<h1>${tr('Health')}</h1>${subTabs('health', sub, [['checkin', 'Check-in'], ['vitals', 'Vitals'], ['meds', 'Medications']])}
  ${sub === 'checkin' ? hCheckin() : sub === 'vitals' ? hVitals() : vMeds()}`;
}
function ciSummary(ci) {
  const vars = { name: mName(ci.by), time: fT(ci.t), mood: tx(MOODS[ci.mood - 1][1]), h: ci.sleep, n: ci.meals.length };
  return ci.sleep != null ? tr('Checked in by {name} at {time}: {mood}, {h} h sleep, {n}/3 meals.', vars) : tr('Checked in by {name} at {time}: {mood}, {n}/3 meals.', vars);
}
function hCheckin() {
  const p = P(), done = checkedInToday(p), ci = lastCheckin(p);
  return `<div class="grid g2" style="align-items:start">
  <section class="card stack"><h2>${tr('Daily check-in')} ${done ? badge(tr('Done today'), 'ok') : badge(tr('Pending'), 'warn')}</h2>
    <p class="small muted">${ic('clock')} ${esc(tr('Daily check-in by {name} at {time}', { name: mName(p.ciBy), time: p.ciTime }))} · ${can('settings') && can('family') ? `<a class="lnk" href="#/settings">${tr('change in Settings')}</a>` : ''}</p>
    ${done && !UI.ciEdit ? `<div class="pending ok-box stack"><p><strong>${ic('circle-check')} ${tr('Done today ✓')}</strong></p><p>${esc(ciSummary(ci))}</p>${ci.obs ? `<p data-allow-mixed>${et(ci.obs)}</p>` : ''}${ci.edited ? `<p class="small muted">${esc(tr('Edited {when}', { when: rel(ci.edited) }))}</p>` : ''}</div>
    <button class="btn" data-act="ciEdit">${ic('pencil')} ${tr("Edit today's check-in")}</button>` : (() => { const e = UI.ciEdit && done ? ci : null; return `
    <form data-form="checkin" class="stack">${e ? `<p class="small muted">${ic('pencil')} ${tr("Editing today's check-in")}</p>` : ''}
      <fieldset class="fs"><legend class="lbl">${tr('Mood')}</legend><div class="moods">${MOODS.map(([i, l], n) => `<label title="${esc(tx(l))}"><input type="radio" name="mood" value="${n + 1}" ${(e ? e.mood === n + 1 : n === 3) ? 'checked' : ''}><span>${ic(i)}</span><span class="sr">${et(l)}</span></label>`).join('')}</div></fieldset>
      <div class="form"><div><label for="sl">${tr('Sleep (hours)')}</label><input id="sl" type="number" name="sleep" min="0" max="16" step=".5" value="${e && e.sleep != null ? e.sleep : 7}"></div></div>
      <fieldset class="fs"><legend class="lbl">${tr('Meals')}</legend><div class="row">${['Breakfast', 'Lunch', 'Dinner'].map(m => `<label class="row chk"><input type="checkbox" name="meal" value="${m}" ${!e || e.meals.includes(m) ? 'checked' : ''}> ${tr(m)}</label>`).join('')}</div></fieldset>
      <div><label for="ob">${tr('Observations')}</label><textarea id="ob" name="obs" placeholder="${esc(tr('Anything unusual? Confusion, falls, pain, appetite…'))}">${e ? esc(tx(e.obs) || '') : ''}</textarea></div>
      <label class="row chk"><input type="checkbox" name="unusual" ${e && e.unusual ? 'checked' : ''}> ${tr('Unusual observation — alert the family')}</label>
      <div class="row"><button class="btn pri">${ic('save')} ${tr(e ? 'Save changes' : 'Save check-in')}</button>${e ? `<button type="button" class="btn" data-act="ciEditCancel">${tr('Cancel')}</button>` : ''}</div>
    </form>`; })()}</section>
  <section class="card"><h2>${tr('Recent check-ins')}</h2><ul class="list">${p.checkins.slice().sort((a, b) => b.t - a.t).slice(0, 5).map(c => `<li><strong>${fD(c.t)}</strong> · ${esc(ciSummary(c))}${c.obs ? `<br><span class="small muted" data-allow-mixed>${et(c.obs)}</span>` : ''}</li>`).join('') || `<li class="muted">${tr('None yet')}</li>`}</ul></section></div>`;
}
function vitalResult(p) {
  const r = UI.vres; if (!r || r.pid !== p.id) return '';
  const unit = r.type === 'bp' ? 'mmHg' : 'mg/dL', reading = r.type === 'bp' ? `${r.v}/${r.v2}` : r.v;
  const icn = { ok: 'circle-check', warn: 'triangle-alert', bad: 'octagon-alert' }[r.lvl];
  return `<div class="result ${r.lvl}" role="status" tabindex="-1" id="vres">
    <div class="row sb"><strong class="res-lvl">${ic(icn)} ${tr(r.label)}</strong><button class="ibtn" data-act="vresClose" aria-label="${esc(tr('Close'))}">${ic('x')}</button></div>
    <p class="res-read">${tr(r.type === 'bp' ? 'Blood pressure' : 'Blood sugar')}: <strong>${reading}</strong> ${tr(unit)}</p>
    <p>${r.names.length ? esc(tr('Notified: {names}', { names: r.names.map(mName).join(tr(', ')) })) : tr('No one needed to be notified.')}</p>
    ${r.lvl === 'warn' ? `<p><strong>${tr('Next steps')}</strong></p><ul class="steps"><li>${tr('Re-measure in 5 minutes, seated and rested.')}</li><li>${tr('Note any symptoms.')}</li></ul>` : ''}
    ${r.lvl === 'bad' ? `<p class="crisis">${ic('siren')} ${tr(gs(p, 'Call 911 if she has chest pain, shortness of breath, weakness, confusion or trouble speaking.', 'Call 911 if he has chest pain, shortness of breath, weakness, confusion or trouble speaking.'))}</p>
      <div class="row"><a class="btn bad" href="tel:911">${ic('phone-call')} ${tr('Call 911')}</a><a class="btn pri" href="tel:+96265000000">${ic('phone')} ${tr(gs(p, 'Call her doctor now', 'Call his doctor now'))}</a></div>
      <ul class="steps"><li>${tr('Re-measure in 5 minutes, seated and rested.')}</li></ul>` : ''}
    <p class="small muted">${ic('info')} ${tr('This is not medical advice.')}</p></div>`;
}
function hVitals() {
  const p = P(), vt = UI.vt;
  const conf = { bp: { l: 'Blood pressure', u: 'mmHg', keys: ['v', 'v2'], lo: p.th.dia[0], hi: p.th.sys[1] }, sugar: { l: 'Blood sugar', u: 'mg/dL', keys: ['v'], lo: p.th.sugar[0], hi: p.th.sugar[1] }, weight: { l: 'Weight', u: 'kg', keys: ['v'] } }[vt];
  const series = p.vitals[vt];
  return `<div class="grid g2" style="align-items:start">
  <section class="card stack"><div class="tabs">${[['bp', 'Blood pressure'], ['sugar', 'Blood sugar'], ['weight', 'Weight']].map(([k, l]) => `<button class="${vt === k ? 'on' : ''}" aria-pressed="${vt === k}" data-act="vt" data-k="${k}">${tr(l)}</button>`).join('')}</div>
    <h2>${tr(conf.l)} · ${tr('{n} days', { n: 14 })}</h2>
    ${lineChart(series, { keys: conf.keys, lo: conf.lo, hi: conf.hi, unit: conf.u, bad: r => vt !== 'weight' && sev(p, vt, r) !== 'ok' })}
    ${vt === 'bp' ? `<div class="legend"><span><i style="background:var(--brand)"></i>${tr('Systolic')}</span><span><i style="background:var(--latte)"></i>${tr('Diastolic')}</span><span><i style="background:var(--ok-soft);height:10px"></i>${tr('Target band')}</span></div>` : ''}
    ${vt !== 'weight' ? `<p class="small muted">${esc(tr('Alert thresholds: {range}', { range: vt === 'bp' ? `${p.th.sys[0]}–${p.th.sys[1]} / ${p.th.dia[0]}–${p.th.dia[1]} ${tr('mmHg')}` : `${p.th.sugar[0]}–${p.th.sugar[1]} ${tr('mg/dL')}` }))}</p>${can('family') ? `<button class="btn sm" data-act="editTh">${ic('sliders-horizontal')} ${tr('Edit thresholds')}</button>` : ''}` : ''}
  </section>
  <section class="card stack"><h2>${tr('Add reading')}</h2>
    ${vt !== 'weight' ? vitalResult(p) : ''}
    <form data-form="vital" class="form"><input type="hidden" name="type" value="${vt}">
      <div><label for="v1">${vt === 'bp' ? tr('Systolic') : tr(conf.l)} (${tr(conf.u)})</label><input id="v1" type="number" inputmode="decimal" name="v" step="${vt === 'weight' ? '.1' : '1'}" required></div>
      ${vt === 'bp' ? `<div><label for="v2">${tr('Diastolic')} (${tr('mmHg')})</label><input id="v2" type="number" inputmode="numeric" name="v2" required></div>` : ''}
      <button class="btn pri">${ic('plus')} ${tr('Add reading')}</button></form>
    ${wrapT(`<table><thead><tr><th>${tr('Date')}</th><th>${tr('Reading')}</th><th>${tr('Status')}</th></tr></thead><tbody>${series.slice(-5).reverse().map(r => `<tr><td>${fDT(r.t)}</td><td>${r.v}${r.v2 ? '/' + r.v2 : ''} ${tr(conf.u)}</td><td>${vt === 'weight' ? '—' : sevBadge(p, vt, r)}</td></tr>`).join('')}</tbody></table>`)}
  </section></div>`;
}

const VOICE = {
  Tagalog: { o: 'Medyo nahilo si Lola pagkatapos maglakad. Kumain siya ng kaunting almusal at ininom na ang gamot sa umaga.', ar: 'شعرت الجدة ببعض الدوخة بعد المشي. تناولت القليل من الفطور وأخذت دواء الصباح.', en: 'Grandma felt a bit dizzy after walking. She ate a little breakfast and took her morning medicine.', cat: 'Health concern' },
  Sinhala: { o: 'ආච්චි ඊයේ රෑ හොඳට නිදාගත්තා. දවල් කෑම හොඳට කෑවා.', ar: 'نامت الجدة جيداً الليلة الماضية وتناولت الغداء جيداً.', en: 'Grandma slept well last night and ate lunch well.', cat: 'Sleep' },
  Bengali: { o: 'দাদি আজ দুপুরের খাবার খেয়েছেন। ওষুধ প্রায় শেষ হয়ে যাচ্ছে।', ar: 'تناولت الجدة الغداء اليوم. الدواء على وشك النفاد.', en: 'Grandma ate lunch today. The medicine is almost finished.', cat: 'Medication' },
  Amharic: { o: 'አያቴ ዛሬ ደስተኛ ነበሩ፣ ከጎረቤቶች ጋር ተጫወቱ።', ar: 'كانت الجدة سعيدة اليوم وتحدثت مع الجيران.', en: 'Grandma was happy today and chatted with the neighbours.', cat: 'Mood' },
  Hindi: { o: 'दादी ने आज नाश्ता किया और थोड़ी देर टहलीं।', ar: 'تناولت الجدة الفطور اليوم ومشت قليلاً.', en: 'Grandma had breakfast today and walked for a while.', cat: 'Meals' }
};
const SPEECH = { Tagalog: 'fil-PH', Sinhala: 'si-LK', Bengali: 'bn-BD', Amharic: 'am-ET', Hindi: 'hi-IN' };

/* Family side: confirm the translation of notes the helper already confirmed in her own language */
function vVoice() {
  const p = P(), isAr = S.lang === 'ar', list = pv(p);
  const notes = p.timeline.filter(x => x.voice);
  return `<h1>${tr('Helper voice notes')}</h1><p class="muted">${tr('The helper records a note in her own language and confirms the transcript. AI translates it; a family member checks the translation before it goes on the timeline.')}</p>
  <div class="grid g2" style="align-items:start">
  <section class="card stack"><h2>${tr('Check translation')} ${list.length ? badge(list.length, 'warn') : ''}</h2>
    ${list.map(d => `<div class="pending stack">
      <div class="row sb"><strong>${ic('mic')} ${esc(tr('Voice note from {name} — check translation', { name: mName(d.who) }))}</strong><span class="small muted">${rel(d.t)}</span></div>
      <p>${badge(tr('Confirmed by the helper in her language'), 'ok')} ${badge(tr('AI translation — please check'), 'warn')}</p>
      <div><p class="lbl">${esc(tr('Original ({lang})', { lang: tr(d.lang) }))}</p><p data-allow-mixed lang="${d.lang === 'Tagalog' ? 'fil' : ''}">${esc(d.o)}</p>
        <button class="btn sm" data-act="playOrig" data-id="${d.id}">${ic('volume-2')} ${tr('Listen')}</button></div>
      <div><label for="dar-${d.id}">${tr('Arabic translation (editable)')}</label><textarea id="dar-${d.id}" class="ar" dir="rtl" ${isAr ? '' : 'data-allow-mixed'}>${esc(d.ar)}</textarea></div>
      ${isAr ? '' : `<div><label for="den-${d.id}">${tr('English')}</label><textarea id="den-${d.id}">${esc(d.en)}</textarea></div>`}
      <div><label for="dcat-${d.id}">${tr('Category')}</label><select id="dcat-${d.id}">${['Meals', 'Medication', 'Mood', 'Sleep', 'Household', 'Health concern'].map(c => `<option value="${c}" ${c === d.cat ? 'selected' : ''}>${esc(tr(c))}</option>`).join('')}</select></div>
      <label class="row chk"><input type="checkbox" id="dimp-${d.id}" ${d.cat === 'Health concern' ? 'checked' : ''}> ${tr('Mark as important')}</label>
      <div class="row"><button class="btn ok" data-act="saveVoice" data-id="${d.id}">${ic('check')} ${tr('Confirm & save')}</button><button class="btn" data-act="discardVoice" data-id="${d.id}">${tr('Discard')}</button></div></div>`).join('')
      || `<p class="muted">${tr('Nothing to check. New notes from the helper appear here.')}</p>`}
  </section>
  <section class="card"><h2>${tr('Saved voice notes')}</h2><ul class="list tl">${notes.map(tlItem).join('') || `<li class="muted">${tr('None yet')}</li>`}</ul></section></div>${disclaimer()}`;
}

function vAppts() {
  const p = P(), up = p.appts.filter(a => !a.past).sort((a, b) => a.t - b.t), past = p.appts.filter(a => a.past);
  return `<div class="row sb pg-h"><h1>${tr('Calendar')}</h1><button class="btn pri" data-act="summary">${ic('file-text')} ${tr('Doctor visit summary')}</button></div>
  <div class="grid g2" style="align-items:start"><div class="stack">
  ${up.map(a => `<section class="card stack"><div class="row sb"><div><h2 style="margin:0">${fD(a.t)} · ${fT(a.t)}</h2><p><strong>${et(a.doctor)}</strong> · ${et(a.spec)}</p><p class="muted small">${ic('map-pin')} ${et(a.place)}</p></div>${badge(nDays(Math.ceil((a.t - now()) / D)), 'info')}</div>
    <div class="form"><div><label for="aw-${a.id}">${tr('Accompanied by')}</label><select id="aw-${a.id}" data-chg="apptWith" data-id="${a.id}">${memberOpts(a.with)}</select></div>
    <div><label for="ar-${a.id}">${tr('Reminder')}</label><select id="ar-${a.id}" data-chg="apptRem" data-id="${a.id}">${['1 hour before', '1 day before', '2 days before'].map(r => `<option value="${r}" ${r === a.rem ? 'selected' : ''}>${esc(tr(r))}</option>`).join('')}</select></div></div>
    ${a.notes ? `<p class="small">${ic('sticky-note')} ${et(a.notes)}</p>` : ''}</section>`).join('')}
  <section class="card"><h2>${tr('Add appointment')}</h2><form data-form="appt" class="form">
    <div><label for="ad">${tr('Date')}</label><input id="ad" type="date" name="d" required></div><div><label for="at">${tr('Time')}</label><input id="at" type="time" name="tm" value="10:00" required></div>
    <div><label for="adoc">${tr('Doctor')}</label><input id="adoc" type="text" name="doctor" required></div><div><label for="asp">${tr('Specialty')}</label><input id="asp" type="text" name="spec"></div>
    <div><label for="apl">${tr('Place')}</label><input id="apl" type="text" name="place"></div><div><label for="aw">${tr('Accompanied by')}</label><select id="aw" name="with">${memberOpts('m1')}</select></div>
    <button class="btn pri">${ic('calendar-plus')} ${tr('Add')}</button></form></section></div>
  <div class="stack">
  <section class="card stack"><h2>${tr('Prescriptions & reports')}</h2><p class="small muted">${tr('Upload a prescription or medical report. AI reads it and suggests follow-ups; nothing is saved until a person confirms.')}</p>
    <label class="btn" style="display:inline-flex;width:max-content">${ic('upload')} ${tr('Upload file')}<input type="file" accept="image/*,.pdf" data-chg="upload" hidden></label>
    ${p.suggestions.map(s => `<div class="pending row sb"><div style="flex:1;min-width:200px">${badge(tr('AI suggestion'), 'warn')} <span class="small muted" data-allow-mixed>${esc(tr('from {file}', { file: s.file }))}</span><p>${et(s.text)}</p></div><div class="row"><button class="btn sm ok" data-act="sugOk" data-id="${s.id}">${tr('Confirm')}</button><button class="btn sm" data-act="sugNo" data-id="${s.id}">${tr('Dismiss')}</button></div></div>`).join('')}
  </section>
  <section class="card"><h2>${tr('Past visits')}</h2><ul class="list">${past.map(a => `<li><strong>${fD(a.t)}</strong> · ${et(a.doctor)} (${et(a.spec)})<br><span class="small">${et(a.notes)}</span></li>`).join('') || `<li class="muted">${tr('None')}</li>`}</ul></section>
  </div></div>${disclaimer()}`;
}

function vMeds() {
  const p = P(), doses = todayDoses(p), rx = p.rxChange;
  const rxMed = rx && p.meds.find(m => m.id === rx.med);
  const rxOpen = rx && !rx.ack.includes(me()) && S.role !== 'professional';
  return `${rxOpen ? `<section class="card attn stack" style="margin-bottom:16px"><h2>${ic('file-warning')} ${tr('Prescription change')}</h2><p>${et(rx.text)}</p><p class="small muted">${esc(tr('Seen by: {names}', { names: rx.ack.map(id => mName(id)).join(tr(', ')) || tr('nobody yet') }))}</p><button class="btn pri" data-act="rxAck" style="width:max-content">${ic('check')} ${tr("I've seen the new dose")}</button></section>` : rx && rx.ack.length ? `<p class="small" style="color:var(--ok)">${ic('check-check')} ${esc(tr('New {med} dose seen by: {names}', { med: rxMed ? tx(rxMed.name) : '', names: rx.ack.map(id => mName(id)).join(tr(', ')) }))}</p>` : ''}
  <div class="grid g2" style="align-items:start">
  <section class="card"><h2>${tr("Today's doses")}</h2><ul class="list">${doses.map(d => `<li class="row sb"><span><strong>${d.tm}</strong> · ${et(d.m.name)} <span class="muted small">${et(d.m.dose)}</span></span><span class="row">${stBadge(d.st)}${d.st !== 'taken' ? `<button class="btn sm ok" data-act="dose" data-k="${d.key}" data-v="taken">${tr('Mark taken')}</button>` : ''}${d.st === 'due' || d.st === 'upcoming' ? `<button class="btn sm" data-act="dose" data-k="${d.key}" data-v="missed">${tr('Mark missed')}</button>` : ''}</span></li>`).join('')}</ul>
    <p class="small muted">${esc(tr('Missed doses notify {a} and {b} automatically.', { a: mName(p.chain[0]), b: mName(p.chain[1] || p.chain[0]) }))}</p></section>
  <section class="card"><h2>${tr('Shared medication list')}</h2><ul class="list">${p.meds.map(m => {
    const dl = daysLeft(m), low = dl <= 7;
    return `<li class="stack"><div class="row sb"><div><strong>${et(m.name)}</strong> · ${et(m.dose)}<br><span class="small muted">${m.times.join(tr(', '))}${m.purpose ? ' · ' + et(m.purpose) : ''} · ${esc(tr('prescribed by {name}', { name: tx(m.by) }))}</span></div>${low ? badge(tr('Refill soon'), 'warn') : ''}</div>
      <div><div class="bar ${low ? 'low' : ''}"><i style="width:${Math.min(100, dl / 30 * 100)}%"></i></div><span class="small muted">${tr('{n} left', { n: m.qty })} · ${tr('{n} days left', { n: dl })}</span></div>
      <div class="row small"><span class="muted">${tr('Reminders:')}</span>${[['app', 'App'], ['voice', 'Voice call'], ['sms', 'SMS']].map(([k, l]) => `<label class="row chk"><input type="checkbox" data-chg="medCh" data-id="${m.id}" data-k="${k}" ${m.ch.includes(k) ? 'checked' : ''}> ${tr(l)}</label>`).join('')}
      ${low ? `<button class="btn sm" data-act="refill" data-id="${m.id}">${ic('package-plus')} ${tr('Request refill')}</button>` : ''}</div></li>`;
  }).join('')}</ul></section></div>
  ${can('family') ? `<section class="card" style="margin-top:16px"><h2>${tr('Add medication (exactly as prescribed)')}</h2><form data-form="med" class="form">
    <div><label for="mn">${tr('Name')}</label><input id="mn" type="text" name="name" required></div><div><label for="mdo">${tr('Dose on prescription')}</label><input id="mdo" type="text" name="dose" required placeholder="${esc(tr('e.g. 10 mg tablet'))}"></div>
    <div><label for="mt">${tr('Times (comma separated)')}</label><input id="mt" type="text" name="times" value="08:00" required></div><div><label for="mq">${tr('Quantity')}</label><input id="mq" type="number" name="qty" value="30" min="0"></div>
    <div><label for="mby">${tr('Prescribed by')}</label><input id="mby" type="text" name="by"></div><button class="btn pri">${ic('plus')} ${tr('Add')}</button></form></section>` : ''}${disclaimer()}`;
}

/* ---------- Elderly mode: full screen, no app chrome ---------- */
function vElder() {
  const p = P(), o = UI.eo;
  if (o) return elderOverlay(p, o);
  const ds = todayDoses(p), over = ds.find(d => d.st === 'missed' || d.st === 'due'), up = ds.find(d => d.st === 'upcoming');
  const greet = greetKey();
  const status = over ? `<div class="e-status warn">${ic('alarm-clock')}<span>${esc(tr('{med} was due at {time}', { med: tx(over.m.name), time: over.tm }))}</span></div>`
    : up ? `<div class="e-status">${ic('pill')}<span>${esc(tr('Next medicine: {med} at {time}', { med: tx(up.m.name), time: up.tm }))}</span></div>`
    : `<div class="e-status ok">${ic('circle-check')}<span>${tr('You have taken all your medicines today.')}</span></div>`;
  return `<div class="eld">
    <div class="e-top"><button class="e-mini" data-act="elderExit">${ic('x')} ${tr('Exit preview')}</button><button class="e-mini" data-act="listen">${ic('volume-2')} ${tr('Listen')}</button></div>
    <h1 class="e-hi">${esc(tr(greet, { name: pName(p) }))}</h1>
    ${status}
    <div class="e-btns">
      <button class="ebtn g" data-act="eTook">${ic('pill')}<span>${tr('I took my medicine')}</span></button>
      <button class="ebtn b" data-act="eRemind">${ic('alarm-clock')}<span>${tr('Remind me later')}</span></button>
      <button class="ebtn r" data-act="help">${ic('hand-helping')}<span>${tr('I need help')}</span></button>
      <a class="ebtn o" href="tel:911">${ic('phone-call')}<span>${tr('Call 911')}</span></a>
    </div></div>`;
}
function elderOverlay(p, o) {
  const call911 = `<a class="ebtn o" href="tel:911">${ic('phone-call')}<span>${tr('Call 911')}</span></a>`;
  if (o.k === 'done') return `<div class="eld e-ov ${o.tone}" role="status"><div class="e-done">${ic(o.icon)}<p class="e-big">${esc(o.title)}</p>${o.sub ? `<p class="e-sub">${esc(o.sub)}</p>` : ''}</div></div>`;
  if (o.k === 'count') return `<div class="eld e-ov help">
    <button class="e-cancel" data-act="helpCancel">${ic('x')} ${tr('Cancel')}</button>
    <div class="e-mid" role="status"><p class="e-big">${esc(tr('Calling {name} in {n}…', { name: mName(p.chain[0]), n: o.n }))}</p><div class="e-count" aria-hidden="true">${o.n}</div><p class="e-sub">${tr('Tap Cancel if you are okay.')}</p></div>
    ${call911}</div>`;
  const ansI = Math.min(1, p.chain.length - 1);
  return `<div class="eld e-ov help">
    <button class="e-cancel" data-act="helpClose">${ic('x')} ${tr('Close')}</button>
    <div class="e-mid" role="status"><p class="e-big">${o.ok ? esc(tr('{name} is on the way', { name: mName(p.chain[ansI]) })) : tr('Calling your family…')}</p>
      <ol class="e-chain">${p.chain.map((id, j) => { const c = j < o.i ? 'fail' : j === o.i ? (o.ok ? 'done' : 'act') : ''; return `<li class="${c}">${ic(c === 'fail' ? 'phone-missed' : c === 'done' ? 'circle-check' : c === 'act' ? 'phone-outgoing' : 'clock')}<span>${esc(mName(id))} — ${tr(c === 'fail' ? 'no answer' : c === 'done' ? 'answered, on the way' : c === 'act' ? 'calling…' : 'waiting')}</span></li>`; }).join('')}
        <li>${ic('siren')}<span>${tr('911 — if nobody answers')}</span></li></ol>
      <p class="e-sub">${tr('Want to tell them more? (optional)')}</p>
      <div class="e-chips">${[['family', 'phone', 'Talk to family'], ['meds', 'pill', 'Medication'], ['home', 'shopping-basket', 'Household needs']].map(([k, i, l]) => `<button class="e-chip ${o.type === k ? 'on' : ''}" aria-pressed="${o.type === k}" data-act="helpType" data-k="${k}">${ic(o.type === k ? 'check' : i)}<span>${tr(l)}</span></button>`).join('')}</div>
    </div>${call911}</div>`;
}
/* Family-facing info page for elderly mode (moved off the elderly screen) */
function vElderInfo() {
  const p = P(), ds = todayDoses(p), next = ds.find(d => d.st !== 'taken') || ds[0];
  return `<h1>${tr('Elderly mode')}</h1><p class="muted">${esc(tr('A full-screen, big-button view for {name}. Open it on their phone or tablet.', { name: pName(p) }))}</p>
  <p><a class="btn pri" href="#/elder">${ic('hand-heart')} ${tr('Open elderly mode')}</a></p>
  <div class="grid g2" style="align-items:start;margin-top:12px">
  <section class="card stack"><h2>${ic('smartphone')} ${tr('Works on basic phones too')}</h2><p class="muted">${tr('No smartphone? The same features work by automated voice call and SMS.')}</p>
    <div class="phone" role="img" aria-label="${esc(tr('SMS simulation'))}">
      <div class="sms">${esc(tr('Reminder: time for {med}. Reply 1 if you took it, 2 to be reminded in 30 minutes, 9 for help.', { med: next ? tx(next.m.name) : '' }))}</div>
      ${(UI.sms || []).map(s => `<div class="sms ${s.me ? 'me' : ''}">${esc(tr(s.t))}</div>`).join('')}
    </div><p><strong>${tr('Simulate a reply:')}</strong></p><div class="row"><button class="btn" data-act="sms" data-k="1">${tr('Reply {n}', { n: 1 })}</button><button class="btn" data-act="sms" data-k="2">${tr('Reply {n}', { n: 2 })}</button><button class="btn bad" data-act="sms" data-k="9">${tr('Reply {n}', { n: 9 })}</button></div>
    <p class="small muted">${tr('Voice call: "Press 1 if you took your medicine, 2 to be reminded later, 9 for help." The family app is updated either way.')}</p></section>
  <section class="card stack"><h2>${ic('siren')} ${tr('Emergency escalation chain')}</h2><p class="small muted">${tr('When "I need help" is pressed there is a 5-second countdown to cancel, then we call in this order until someone answers.')}</p>
    <ol>${p.chain.map(id => `<li>${esc(mName(id))} (${tr(ROLE_LABEL[mem(id).role])})</li>`).join('')}<li>911</li></ol>
    ${can('settings') ? `<a class="btn sm" href="#/settings">${ic('settings')} ${tr('Change order in Settings')}</a>` : ''}</section></div>`;
}

/* ---------- Family: tasks + costs ---------- */
function vFamily(sub) {
  sub = sub === 'costs' ? 'costs' : 'tasks';
  return `<h1>${tr('Family')}</h1>${subTabs('family', sub, [['tasks', 'Tasks'], ['costs', 'Costs']])}${sub === 'tasks' ? famTasks() : famCosts()}`;
}
function famTasks() {
  const p = P();
  return `<div class="grid g2" style="align-items:start"><section class="card stack"><h2>${tr('Tasks')}</h2><ul class="list">${p.tasks.slice().sort((a, b) => a.done - b.done || a.due - b.due).map(tk => `<li class="row sb"><label class="row chk" style="flex:1;min-width:200px"><input type="checkbox" data-chg="task" data-id="${tk.id}" ${tk.done ? 'checked' : ''}><span style="${tk.done ? 'text-decoration:line-through;color:var(--muted)' : ''}"><strong>${et(tk.title)}</strong><br><span class="small muted">${fD(tk.due)} · ${esc(mName(tk.who))}${tk.rotate ? ' · ' + tr('rotates') : ''}</span></span></label>
      ${tk.rotate && !tk.done ? `<button class="btn sm" data-act="rotate" data-id="${tk.id}" title="${esc(tr('Pass to next family member'))}">${ic('rotate-cw')} ${tr('Rotate')}</button>` : ''}</li>`).join('')}</ul></section>
    <section class="card"><h2>${tr('New task')}</h2><form data-form="task" class="form"><div><label for="tt">${tr('Task')}</label><input id="tt" type="text" name="title" required></div><div><label for="tw">${tr('Assign to')}</label><select id="tw" name="who">${memberOpts(me())}</select></div>
    <div><label for="td">${tr('Due')}</label><input id="td" type="date" name="d" required></div><label class="row chk"><input type="checkbox" name="rotate"> ${tr('Rotate weekly')}</label><button class="btn pri">${ic('plus')} ${tr('Add')}</button></form></section></div>`;
}
const FILS = a => Math.round(a * 1000);
const fmtJ = f => (f / 1000).toFixed(Math.abs(f) % 10 ? 3 : 2);
function equalInts(ids) { const n = ids.length, b = Math.floor(100 / n); return Object.fromEntries(ids.map((id, i) => [id, b + (i < 100 - b * n ? 1 : 0)])); }
function rawShares(p) { const f = famMembers(), eq = equalInts(f.map(m => m.id)); return Object.fromEntries(f.map(m => [m.id, p.shares && p.shares[m.id] != null ? +p.shares[m.id] : eq[m.id]])); }
const sumSh = sh => Object.values(sh).reduce((a, b) => a + b, 0);
function shares(p) {
  const f = famMembers();
  if (p.split === 'custom') {
    const raw = rawShares(p); if (sumSh(raw) === 100) return raw;
    if (p.sharesOk) { const ok = Object.fromEntries(f.map(m => [m.id, +p.sharesOk[m.id] || 0])); if (sumSh(ok) === 100) return ok; }
  }
  return Object.fromEntries(f.map(m => [m.id, 100 / f.length]));
}
/* All money maths in integer fils (1 JOD = 1000 fils) so balances net to exactly zero. */
function balances(p) {
  const f = famMembers(), sh = shares(p), st = p.settlements || [], stF = x => x.amtF != null ? x.amtF : FILS(x.amt);
  const totalF = p.costs.reduce((s, c) => s + FILS(c.amt), 0);
  const exact = f.map(m => totalF * sh[m.id] / 100), owed = exact.map(Math.floor);
  let left = totalF - owed.reduce((a, b) => a + b, 0);
  exact.map((e, i) => [e - owed[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { owed[i]++; left--; } });
  const bal = f.map((m, i) => {
    const paid = p.costs.filter(c => c.by === m.id).reduce((s, c) => s + FILS(c.amt), 0);
    const sent = st.filter(x => x.from === m.id).reduce((s, x) => s + stF(x), 0), got = st.filter(x => x.to === m.id).reduce((s, x) => s + stF(x), 0);
    return { m, paid, owed: owed[i], share: sh[m.id], diff: paid - owed[i] + sent - got };
  });
  const debt = bal.filter(b => b.diff < 0).map(b => ({ ...b })), cred = bal.filter(b => b.diff > 0).map(b => ({ ...b })), settle = [];
  debt.forEach(d => cred.forEach(c => { const a = Math.min(-d.diff, c.diff); if (a > 0) { settle.push({ from: d.m.id, to: c.m.id, amtF: a }); d.diff += a; c.diff -= a; } }));
  return { totalF, bal, settle };
}
function shareMsg(p) {
  const n = sumSh(rawShares(p));
  return n === 100 ? `<span class="okt">${ic('circle-check')} ${tr('Total: 100% ✓')}</span>` : `<span class="warnt">${ic('triangle-alert')} ${esc(tr('Total: {n}% — must add up to 100%. Balances use the last valid split.', { n }))}</span>`;
}
function costsLive(p) {
  const { bal, settle } = balances(p), cur = tr('JOD');
  return `${wrapT(`<table><thead><tr><th>${tr('Member')}</th><th>${tr('Share')}</th><th>${tr('Paid')}</th><th>${tr('Balance')}</th></tr></thead><tbody>${bal.map(b => `<tr><td>${esc(mName(b.m.id))}</td><td>${Math.round(b.share * 10) / 10}%</td><td>${fmtJ(b.paid)}</td><td>${b.diff >= 0 ? badge((b.diff ? '+' : '') + fmtJ(b.diff), 'ok') : badge('−' + fmtJ(-b.diff), 'warn')}</td></tr>`).join('')}</tbody></table>`)}
    ${settle.length ? `<div class="pending stack"><strong>${tr('To settle up:')}</strong>${settle.map(x => `<div class="row sb"><span>${esc(tr('{a} → {b}: {amt} {u}', { a: mName(x.from), b: mName(x.to), amt: fmtJ(x.amtF), u: cur }))}</span><button class="btn sm ok" data-act="settle" data-from="${x.from}" data-to="${x.to}" data-amt="${x.amtF}">${ic('handshake')} ${tr('Mark as settled')}</button></div>`).join('')}</div>` : `<p class="small okt">${ic('circle-check')} ${tr('Everyone is settled up.')}</p>`}`;
}
function famCosts() {
  const p = P(), { totalF } = balances(p), cur = tr('JOD'), custom = p.split === 'custom', raw = rawShares(p);
  return `<div class="grid g2" style="align-items:start"><section class="card stack"><h2>${tr('Shared care costs')}</h2>
    <div><p class="small muted">${tr('This month')}</p><div class="stat">${fmtJ(totalF)} <span class="small">${cur}</span></div></div>
    <div><p class="lbl">${tr('Split')}</p><div class="tabs">${[['equal', 'Equal'], ['custom', 'Custom']].map(([k, l]) => `<button class="${(custom ? 'custom' : 'equal') === k ? 'on' : ''}" aria-pressed="${(custom ? 'custom' : 'equal') === k}" data-act="split" data-k="${k}">${tr(l)}</button>`).join('')}</div></div>
    ${custom ? `<div class="stack"><p class="small muted">${tr('Set each person\'s share. Balances update as you type.')}</p><div class="form">${famMembers().map(m => `<div><label for="sh-${m.id}">${esc(mName(m.id))} (%)</label><input id="sh-${m.id}" type="number" inputmode="numeric" min="0" max="100" step="1" data-inp="share" data-id="${m.id}" value="${raw[m.id]}"></div>`).join('')}</div>
      <p class="small" id="shmsg" role="status">${shareMsg(p)}</p></div>` : ''}
    <div id="costs-live" class="stack">${costsLive(p)}</div>
    ${(p.settlements || []).length ? `<h3>${tr('Settlements')}</h3><ul class="list">${p.settlements.slice().sort((a, b) => b.t - a.t).map(x => `<li class="row sb"><span>${esc(tr('{a} paid {b}', { a: mName(x.from), b: mName(x.to) }))}<br><span class="small muted">${fD(x.t)}</span></span><strong>${fmtJ(x.amtF != null ? x.amtF : FILS(x.amt))} ${cur}</strong></li>`).join('')}</ul>` : ''}
  </section>
  <section class="card stack"><h2>${tr('Expenses')}</h2><ul class="list">${p.costs.slice().sort((a, b) => b.t - a.t).map(c => `<li class="row sb"><span>${et(c.title)}<br><span class="small muted">${fD(c.t)} · ${esc(tr('paid by {name}', { name: mName(c.by) }))}</span></span><strong>${fmtJ(FILS(c.amt))} ${cur}</strong></li>`).join('')}</ul>
    <form data-form="cost" class="form"><div><label for="cti">${tr('Expense')}</label><input id="cti" type="text" name="title" required></div><div><label for="cam">${tr('Amount ({u})', { u: cur })}</label><input id="cam" type="number" step=".001" min="0" name="amt" required></div>
    <div><label for="cby">${tr('Paid by')}</label><select id="cby" name="by">${memberOpts(me())}</select></div><button class="btn pri">${ic('plus')} ${tr('Add')}</button></form></section></div>`;
}

function vProviders() {
  const p = P(), types = ['All', 'Nurse', 'Physiotherapist', 'Lab'];
  const list = PROVIDERS.filter(x => UI.pf === 'All' || x.type === UI.pf);
  return `<h1>${tr('Home-care Providers')}</h1><p class="muted">${tr('Trusted nurses, physiotherapists and labs. Each licence is checked against the Ministry of Health register (simulated).')}</p>
  <div class="tabs">${types.map(t => `<button class="${UI.pf === t ? 'on' : ''}" aria-pressed="${UI.pf === t}" data-act="pf" data-k="${t}">${tr(t)}</button>`).join('')}</div>
  <div class="grid g3">${list.map(x => `<section class="card stack"><div class="row"><div class="av">${ic({ Nurse: 'syringe', Physiotherapist: 'accessibility', Lab: 'test-tube' }[x.type])}</div><div><h2 style="margin:0">${et(x.name)}</h2><span class="small muted">${tr(x.type)} · ${et(x.area)}</span></div></div>
    <p>${x.ok ? badge('✓ ' + tr('MoH licence verified'), 'ok') : badge(tr('Licence expired'), 'bad')}<br><span class="small muted">${esc(tr('Licence {lic} · checked {date}', { lic: tx(x.lic), date: sD(x.ver) }))}</span></p>
    <p class="small">${ic('star')} ${x.rating} · ${et(x.price)}</p>
    <button class="btn ${x.ok ? 'pri' : ''}" data-act="reqSvc" data-id="${x.id}" ${x.ok ? '' : 'disabled'}>${ic('calendar-check')} ${tr('Request service')}</button></section>`).join('')}</div>
  <div class="grid g2" style="margin-top:16px;align-items:start">
  <section class="card"><h2>${tr('Service requests')}</h2><ul class="list">${p.requests.map(r => `<li class="row sb"><span><strong>${et(r.service)}</strong><br><span class="small muted">${et(PROVIDERS.find(x => x.id === r.prov).name)} · ${fDT(r.t)}</span></span>${badge(tr(r.status), r.status === 'Confirmed' ? 'ok' : 'warn')}</li>`).join('') || `<li class="muted">${tr('No requests yet')}</li>`}</ul></section>
  <section class="card"><h2>${tr('Professional visit reports')}</h2><ul class="list">${p.reports.map(r => `<li><strong>${et(PROVIDERS.find(x => x.id === r.prov)?.name || r.prov)}</strong> <span class="small muted">· ${fDT(r.t)}</span><p class="small">${et(r.text)}</p></li>`).join('') || `<li class="muted">${tr('No reports yet')}</li>`}</ul></section></div>`;
}

const pubURL = id => location.href.split('#')[0] + '#/e/' + id;
function vQR() {
  const p = P(), q = p.qrPublic;
  const fields = [['blood', 'Blood type'], ['allergies', 'Allergies'], ['conditions', 'Conditions'], ['meds', 'Current medications'], ['contacts', 'Emergency contacts']];
  return `<h1>${tr('Emergency QR')}</h1><p class="muted">${esc(tr("Print this QR on a card for {name}'s wallet or fridge. Anyone who scans it (e.g. paramedics) sees only the public emergency info. Full records need an authorized login.", { name: pName(p) }))}</p>
  <div class="grid g2" style="align-items:start">
  <section class="card stack" style="text-align:center"><div class="qrbox" id="qr"></div><p class="small muted" style="word-break:break-all" dir="ltr" data-allow-mixed>${esc(pubURL(p.id))}</p>
    <div class="row" style="justify-content:center"><a class="btn pri" href="#/e/${p.id}">${ic('external-link')} ${tr('Open public page')}</a><button class="btn" data-act="printQR">${ic('printer')} ${tr('Print card')}</button></div></section>
  <section class="card stack"><h2>${tr('What is public?')}</h2>${fields.map(([k, l]) => `<label class="row chk"><input type="checkbox" data-chg="qrf" data-k="${k}" ${q[k] ? 'checked' : ''}> ${tr(l)}</label>`).join('')}
    <p class="small muted">${tr('The public page opens in Arabic by default, for paramedics in Jordan.')}</p>
    <div class="pending small">${ic('lock')} ${tr('Always private: full history, vitals, documents, check-ins and voice notes. These are shown only to signed-in caregivers, family and professionals, and every view is logged.')}</div></section></div>`;
}
function renderPublic(id) {
  const p = S.people[id];
  if (p && !UI.loggedPub) { S.log.unshift({ t: now(), who: null, role: 'public', what: lt('Emergency QR profile scanned', p) }); UI.loggedPub = true; save(); }
  const keep = S.lang; S.lang = UI.pubLang || 'ar';
  try {
    document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = tr('Emergency medical information');
    const toggle = `<button class="chip-btn" data-act="pubLang">${ic('languages')} ${S.lang === 'ar' ? 'English' : 'عربي'}</button>`;
    if (!p) { $('#app').innerHTML = `<div class="pub"><h1>${tr('Profile not found')}</h1><div class="row sb"><a class="btn" href="#/dashboard">${tr('Back')}</a>${toggle}</div></div>`; icons(); return; }
    const q = p.qrPublic, lastC = lastCheckin(p), bp = p.vitals.bp.at(-1), sg = p.vitals.sugar.at(-1);
    $('#app').innerHTML = `<div class="pub">
    ${q.allergies && p.allergies.length ? `<div class="allergy" role="alert">${ic('triangle-alert')}<span>${esc(tr('ALLERGY: {list}', { list: p.allergies.map(a => tx(a)).join(tr(', ')) }))}</span></div>` : ''}
    <div class="row sb pub-bar"><span class="small muted">${ic('heart-pulse')} ${tr('Emergency medical information')}</span>${toggle}</div>
    <div class="card stack pub-card">
      <div class="row"><div class="av lg">${et(p.initials)}</div><div><h1 style="margin:0">${esc(pName(p))}</h1><p class="muted">${tr('{n} years', { n: p.age })}</p></div></div>
      ${q.blood ? `<p class="pub-blood"><span>${tr('Blood type')}</span> <strong dir="ltr">${esc(p.blood)}</strong></p>` : ''}
      ${q.conditions ? `<p><strong>${tr('Conditions')}:</strong> ${esc(p.conditions.map(c => tx(c)).join(tr(', ')))}</p>` : ''}
      ${q.meds ? `<p><strong>${tr('Medications')}:</strong> ${esc(p.meds.map(m => `${tx(m.name)} ${tx(m.dose)}`).join(S.lang === 'ar' ? '؛ ' : '; '))}</p>` : ''}
      ${q.contacts ? `<div><strong>${tr('Emergency contacts')}</strong>${p.chain.map(cid => `<p><a class="btn" href="tel:${mem(cid).phone}">${ic('phone')} ${esc(mName(cid))} · ${et(mem(cid).rel)}</a></p>`).join('')}</div>` : ''}
      <a class="btn bad big" href="tel:911">${ic('siren')} ${tr('Call 911')}</a>
      <hr class="sep">
      ${UI.auth ? `<h2>${ic('lock-open')} ${tr('Full record (authorized)')}</h2><p>${esc(tr('Latest BP {bp}, sugar {sg} {u}.', { bp: bp.v + '/' + bp.v2, sg: sg.v, u: tr('mg/dL') }))}</p><p>${tr('Last check-in:')} ${lastC ? fDT(lastC.t) + ' — ' + (lastC.obs ? `<span data-allow-mixed>${et(lastC.obs)}</span>` : tr('no notes')) : '—'}</p><p class="small muted">${tr('This view was recorded in the access log.')}</p>`
      : `<p class="small muted">${ic('lock')} ${tr('Full medical records are available to authorized users only.')}</p><button class="btn" data-act="pubAuth">${ic('log-in')} ${tr('Sign in as authorized professional (demo)')}</button>`}
      <a class="btn sm" href="#/qr">${S.lang === 'ar' ? '→' : '←'} ${tr('Back to app')}</a></div></div>`;
  } finally { S.lang = keep; }
  icons();
}

function vApps() {
  const p = P(), ds = todayDoses(p), lc = lastCheckin(p), bp = p.vitals.bp.at(-1);
  const sum = tr('Update on {name} ({date}): {n}/{t} doses taken. BP {bp}.{ci} — sent from Ma3kom', { name: pName(p), date: fD(now()), n: ds.filter(d => d.st === 'taken').length, t: ds.length, bp: bp.v + '/' + bp.v2, ci: lc ? ' ' + tr('Last check-in: {obs}', { obs: tx(lc.obs) || tr('OK') }) : '' });
  return `<h1>${tr('App Connections')}</h1><div class="grid g3" style="align-items:start">
  <section class="card stack"><h2>${ic('hospital')} ${tr('My Hakeem')}</h2><p class="small muted">${tr('Share prescriptions and lab results from the My Hakeem app into this app. They are checked by a person before saving.')}</p>
    <button class="btn pri" data-act="hakeem">${ic('download')} ${tr('Simulate share from My Hakeem')}</button>
    <a class="btn" href="https://hakeem.jo" target="_blank" rel="noopener">${ic('external-link')} ${tr('Open My Hakeem')}</a>
    ${(UI.imports || []).map((x, i) => `<div class="pending row sb"><span>${badge(tr('Imported — confirm'), 'warn')}<br>${et(x)}</span><span class="row"><button class="btn sm ok" data-act="impOk" data-k="${i}">${tr('Confirm')}</button><button class="btn sm" data-act="impNo" data-k="${i}">${tr('Dismiss')}</button></span></div>`).join('')}</section>
  <section class="card stack"><h2>${ic('stethoscope')} ${tr('Riaya')}</h2><p class="small muted">${tr("Request a home nurse through Riaya and upload the nurse's visit report here.")}</p>
    <button class="btn pri" data-act="reqSvc" data-id="p1">${ic('user-round-plus')} ${tr('Request a nurse')}</button>
    <label class="btn" style="width:max-content">${ic('upload')} ${tr('Upload visit report')}<input type="file" data-chg="riaya" hidden></label></section>
  <section class="card stack"><h2>${ic('message-circle')} ${tr('WhatsApp')}</h2><p class="small muted">${tr('Send summaries and alerts to the family group in one tap, or chat with a family member.')}</p>
    <a class="btn pri" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(sum)}">${ic('share-2')} ${tr("Share today's summary")}</a>
    ${S.members.filter(m => m.id !== me()).slice(0, 4).map(m => `<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${m.phone.replace('+', '')}">${ic('message-circle')} ${esc(tr('Chat with {name}', { name: mName(m.id) }))}</a>`).join('')}</section></div>
  <p class="small muted" style="margin-top:12px">${tr('Integrations are simulated in this prototype; phone numbers are placeholders.')}</p>`;
}

function vWear() {
  const w = P().wear;
  if (!w.on) return `<h1>${tr('Wearables')}</h1><section class="card stack" style="max-width:520px"><h2>${ic('watch')} ${tr('Connect a smartwatch')}</h2><p class="muted">${esc(tr("Optional. Use {name}'s own watch to share heart rate, steps, activity and sleep with the family.", { name: pName(P()) }))}</p>
    <div class="row">${WEARABLES.map(d => `<button class="btn" data-act="wearOn" data-k="${d.en}">${et(d)}</button>`).join('')}</div></section>`;
  const days = lastDays(7);
  return `<h1>${tr('Wearables')}</h1><p class="row small muted">${ic('refresh-cw')} ${esc(tr('{device} · synced {when}', { device: tx(w.device), when: rel(w.synced) }))} <button class="btn sm" data-act="wearSync">${tr('Sync now')}</button><button class="btn sm" data-act="wearOff">${tr('Disconnect')}</button></p>
  <div class="grid tiles" style="margin-bottom:16px">
    <div class="card"><p class="small muted">${ic('heart-pulse')} ${tr('Heart rate now')}</p><div class="stat">${w.hr.at(-1)} <span class="small">${tr('bpm')}</span></div></div>
    <div class="card"><p class="small muted">${ic('heart')} ${tr('Resting HR')}</p><div class="stat">${w.rest} <span class="small">${tr('bpm')}</span></div><p class="small muted">${esc(tr('Alert above {n} {u} at rest', { n: 110, u: tr('bpm') }))}</p></div>
    <div class="card"><p class="small muted">${ic('footprints')} ${tr('Steps today')}</p><div class="stat">${w.steps.at(-1).toLocaleString(loc())}</div></div>
    <div class="card"><p class="small muted">${ic('moon')} ${tr('Sleep last night')}</p><div class="stat">${w.sleep.at(-1)} <span class="small">${tr('h')}</span></div></div></div>
  <div class="grid g2"><section class="card"><h2>${tr('Steps')} · ${tr('{n} days', { n: 7 })}</h2>${barChart(w.steps, days, 6)}</section><section class="card"><h2>${tr('Sleep')} · ${tr('{n} days', { n: 7 })} (${tr('hours')})</h2>${barChart(w.sleep, days, 6)}</section></div>`;
}

function vPrivacy() {
  const p = P(), roles = ['caregiver', 'family', 'helper', 'professional'];
  const perm = [['Dashboard & timeline', 'cfp'], ['Post updates & check-ins', 'cfhp'], ['Medication list', 'cfhp'], ['Vitals & reports', 'cfp'], ['Appointments & documents', 'cfp'], ['Costs & tasks', 'cf'], ['Emergency QR settings', 'cf'], ['Manage members & privacy', 'c']];
  return `<h1>${tr('Privacy & roles')}</h1><div class="grid g2" style="align-items:start">
  <section class="card stack"><h2>${tr('Members & roles')}</h2>${wrapT(`<table><thead><tr><th>${tr('Name')}</th><th>${tr('Role')}</th><th><span class="sr">${tr('Action')}</span></th></tr></thead><tbody>${S.members.map(m => `<tr><td><strong>${esc(mName(m.id))}</strong><br><span class="small muted">${et(m.rel)}${m.lang ? ' · ' + esc(tr(m.lang)) : ''}</span></td>
    <td><select data-chg="role" data-id="${m.id}" aria-label="${esc(tr('Role for {name}', { name: mName(m.id) }))}" ${m.id === 'm1' ? 'disabled' : ''}>${roles.map(r => `<option value="${r}" ${m.role === r ? 'selected' : ''}>${esc(tr(ROLE_LABEL[r]))}</option>`).join('')}</select></td>
    <td>${m.id !== 'm1' ? `<button class="btn sm" data-act="rmMember" data-id="${m.id}">${ic('user-minus')} ${tr('Remove')}</button>` : ''}</td></tr>`).join('')}</tbody></table>`)}
    <form data-form="helper" class="form"><div><label for="hn">${tr('Helper name')}</label><input id="hn" type="text" name="name" required></div><div><label for="hl">${tr('Language')}</label><select id="hl" name="lang">${Object.keys(VOICE).map(l => `<option value="${l}">${esc(tr(l))}</option>`).join('')}</select></div><button class="btn pri">${ic('user-plus')} ${tr('Add helper')}</button></form>
    <p class="small muted">${tr('Adding or removing a helper takes effect immediately on all devices.')}</p></section>
  <section class="card stack"><h2>${tr('Who can see what')}</h2>${wrapT(`<table><thead><tr><th><span class="sr">${tr('Feature')}</span></th>${roles.map(r => `<th>${tr(ROLE_LABEL[r])}</th>`).join('')}</tr></thead><tbody>${perm.map(([l, k]) => `<tr><td>${tr(l)}</td>${roles.map(r => `<td>${k.includes(r[0]) ? ic('check') : '<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table>`)}
    <p class="small muted">${esc(tr('Use "{menu}" in the settings drawer (gear icon) to see the app as each role.', { menu: tr('Viewing as') }))}</p></section>
  <section class="card stack"><h2>${ic('badge-check')} ${esc(tr('Consent of {name}', { name: pName(p) }))}</h2>${p.consent.given ? `<p>${badge(tr('Consent given'), 'ok')} ${fD(p.consent.t)} · ${et(p.consent.by)}</p>` : `<p>${badge(tr('Consent withdrawn'), 'bad')} ${tr('Sharing is paused.')}</p>`}
    <button class="btn" data-act="consent">${tr(p.consent.given ? 'Record withdrawal of consent' : 'Record consent')}</button>
    <h3>${tr('Your data rights')}</h3><p class="small">${tr("Under Jordan's Personal Data Protection Law (No. 24 of 2023) you can get a copy of your data or ask for it to be deleted.")}</p>
    <div class="row"><button class="btn" data-act="export">${ic('download')} ${tr('Export my data')}</button><button class="btn bad" data-act="delReq">${ic('trash-2')} ${tr('Request deletion')}</button></div>
    <h3>${tr('Safety')}</h3><ul class="small"><li>${tr('No diagnosis or dosing advice.')}</li><li>${tr('Every AI transcription, translation and suggestion is confirmed by a person.')}</li><li>${tr('Offline mode: changes are saved on the device and sync when back online.')}</li></ul></section>
  <section class="card"><h2>${tr('Access log')}</h2>${wrapT(`<table><thead><tr><th>${tr('When')}</th><th>${tr('Who')}</th><th>${tr('Action')}</th></tr></thead><tbody>${S.log.slice(0, 15).map(l => `<tr><td class="small">${rel(l.t)}</td><td class="small">${l.who ? esc(mName(l.who)) : tr('Public QR')}<br><span class="muted">${tr(ROLE_LABEL[l.role] || 'Public')}</span></td><td class="small">${et(l.what)}</td></tr>`).join('')}</tbody></table>`)}</section></div>`;
}

/* ---------- More, Settings ---------- */
const MORE = ['timeline', 'voice', 'providers', 'qr', 'apps', 'wear', 'privacy', 'settings', 'elderinfo'];
function vMore() {
  const p = P();
  return `<h1>${tr('More')}</h1><div class="more">${MORE.filter(k => can(k)).map(k => `<a class="card more-tile" href="#/${k}"><span class="m-ic">${ic(R[k].i)}</span><span class="m-tx"><strong>${tr(R[k].l)}</strong><span class="small muted">${tr(R[k].d)}</span></span>${k === 'voice' && pv(p).length ? badge(pv(p).length, 'warn') : ''}${ic(S.lang === 'ar' ? 'chevron-left' : 'chevron-right', 'chev')}</a>`).join('')}</div>`;
}
function deviceSettings() {
  return `<div class="set-row"><label for="rs">${tr('Viewing as')}</label><select id="rs" data-chg="viewRole">${Object.keys(ROLE_LABEL).map(r => `<option value="${r}" ${S.role === r ? 'selected' : ''}>${esc(tr(ROLE_LABEL[r]))} · ${esc(mName(ME[r]))}</option>`).join('')}</select></div>
    <div class="set-row"><span class="lbl">${tr('Language')}</span><button class="chip-btn" data-act="lang">${ic('languages')} ${S.lang === 'ar' ? 'English' : 'عربي'}</button></div>
    <div class="set-row"><span class="lbl">${tr('Connection (demo)')}</span><button class="chip-btn" data-act="offline" aria-pressed="${S.offline}">${ic(S.offline ? 'wifi-off' : 'wifi')} ${tr(S.offline ? 'Offline' : 'Online')}</button></div>
    <div class="set-row"><span class="lbl">${tr('Demo data')}</span><button class="chip-btn" data-act="reset">${ic('rotate-ccw')} ${tr('Reset demo')}</button></div>`;
}
function vSettings() {
  const p = P(), fam = can('family');
  return `<h1>${tr('Settings')}</h1><div class="grid g2" style="align-items:start">
  ${fam ? `<section class="card stack"><h2>${ic('clipboard-check')} ${tr('Daily check-in')}</h2>
    <div class="form"><div><label for="cb">${tr('Who does the daily check-in')}</label><select id="cb" data-chg="ciBy">${memberOpts(p.ciBy)}</select></div>
    <div><label for="ct">${tr('Reminder time')}</label><input id="ct" type="time" value="${p.ciTime}" data-chg="ciTime"></div></div>
    <ul class="small muted"><li>${esc(tr('No check-in 30 min after {time} → reminder to {name}', { time: p.ciTime, name: mName(p.ciBy) }))}</li><li>${esc(tr('Still missing after 1 h → {chain}', { chain: p.chain.map(id => mName(id)).join(` ${ARW()} `) }))}</li><li>${tr('Vital out of range → immediate alert to whole family')}</li></ul>
    <button class="btn sm" data-act="simMissed">${ic('play')} ${tr('Simulate missed check-in')}</button></section>
  <section class="card stack"><h2>${ic('siren')} ${tr('Escalation order')}</h2><p class="small muted">${tr('When something is urgent we call in this order until someone answers. 911 comes last.')}</p>
    <ol class="chain">${p.chain.map((id, i) => `<li><span class="c-n">${i + 1}</span><strong>${esc(mName(id))}</strong><span class="sp"></span>
      <button class="ibtn" data-act="chainMv" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="${esc(tr('Move {name} up', { name: mName(id) }))}">${ic('arrow-up')}</button>
      <button class="ibtn" data-act="chainMv" data-i="${i}" data-d="1" ${i === p.chain.length - 1 ? 'disabled' : ''} aria-label="${esc(tr('Move {name} down', { name: mName(id) }))}">${ic('arrow-down')}</button></li>`).join('')}
      <li><span class="c-n">${p.chain.length + 1}</span><strong>911</strong></li></ol></section>
  <section class="card stack"><h2>${ic('sliders-horizontal')} ${tr('Alert thresholds')}</h2><p class="note">${ic('stethoscope')} ${tr('Set these with your doctor. The app only alerts; it does not give medical advice.')}</p>${thForm(p)}</section>` : ''}
  <section class="card stack"><h2>${ic('smartphone')} ${tr('This device (demo)')}</h2>${deviceSettings()}
    ${can('setup') ? `<button class="btn" data-act="setupAgain">${ic('wand-sparkles')} ${tr('Run setup again')}</button>` : ''}
    <p class="small muted">${ic('flask-conical')} ${tr('Prototype — demo data only. No real medical data is stored or sent.')}</p></section></div>`;
}
const thForm = (p, inModal) => `<form data-form="th" class="form">
  <div><label for="ths0">${tr('Systolic min')}</label><input id="ths0" type="number" name="s0" value="${p.th.sys[0]}"></div><div><label for="ths1">${tr('Systolic max')}</label><input id="ths1" type="number" name="s1" value="${p.th.sys[1]}"></div>
  <div><label for="thd0">${tr('Diastolic min')}</label><input id="thd0" type="number" name="d0" value="${p.th.dia[0]}"></div><div><label for="thd1">${tr('Diastolic max')}</label><input id="thd1" type="number" name="d1" value="${p.th.dia[1]}"></div>
  <div><label for="thg0">${tr('Sugar min')}</label><input id="thg0" type="number" name="g0" value="${p.th.sugar[0]}"></div><div><label for="thg1">${tr('Sugar max')}</label><input id="thg1" type="number" name="g1" value="${p.th.sugar[1]}"></div>
  <button class="btn pri">${tr('Save')}</button>${inModal ? `<button type="button" class="btn" data-act="close">${tr('Cancel')}</button>` : ''}</form>`;

/* ---------- Setup wizard ---------- */
const WZ = ['Add your parent', 'Invite family', 'Escalation order', 'Alert thresholds', 'All set'];
const splitList = s => String(s || '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
function wzDraft() {
  const p = P(), cond = p.conditions.map(tx).join(tr(', ')), allg = p.allergies.map(tx).join(tr(', '));
  const d0 = UI.wd;
  if (d0 && d0.pid === S.profile) {
    if (d0.lang !== S.lang) { /* language switched: re-localise untouched fields */
      if (d0.name === d0.name0) d0.name = d0.name0 = pName(p);
      if (d0.cond === d0.cond0) d0.cond = d0.cond0 = cond;
      if (d0.allg === d0.allg0) d0.allg = d0.allg0 = allg;
      d0.lang = S.lang;
    }
    return d0;
  }
  return (UI.wd = { pid: p.id, lang: S.lang, name: pName(p), name0: pName(p), age: p.age, cond, cond0: cond, allg, allg0: allg, roles: Object.fromEntries(S.members.map(m => [m.id, m.role])), add: [], ciBy: p.ciBy, ciTime: p.ciTime, chain: p.chain.slice(), th: JSON.parse(JSON.stringify(p.th)) });
}
function vSetup() {
  const d = wzDraft(), st = UI.ws, last = WZ.length - 1;
  const nm = id => { const a = d.add.find(x => x.id === id); return a ? a.name : mName(id); };
  const famIds = [...S.members.filter(m => ['caregiver', 'family'].includes(d.roles[m.id])).map(m => m.id), ...d.add.filter(a => ['caregiver', 'family'].includes(a.role)).map(a => a.id)];
  let body = '';
  if (st === 0) body = `<div class="skipcard"><p><strong>${tr('Just looking around?')}</strong> ${tr('This demo already has a family set up for you.')}</p><button class="btn pri" data-act="wzSkip">${ic('sparkles')} ${tr('Skip — explore with demo data')}</button></div>
    <p class="muted">${tr('Tell us who you are caring for. You can change everything later in Settings.')}</p>
    <div class="form"><div><label for="wz-name">${tr('Name')}</label><input id="wz-name" type="text" data-chg="wz" data-k="name" value="${esc(d.name)}"></div>
    <div><label for="wz-age">${tr('Age')}</label><input id="wz-age" type="number" min="40" max="120" data-chg="wz" data-k="age" value="${esc(d.age)}"></div></div>
    <div><label for="wz-cond">${tr('Health conditions (comma separated)')}</label><input id="wz-cond" type="text" data-chg="wz" data-k="cond" value="${esc(d.cond)}"></div>
    <div><label for="wz-allg">${tr('Allergies (comma separated)')}</label><input id="wz-allg" type="text" data-chg="wz" data-k="allg" value="${esc(d.allg)}"></div>`;
  if (st === 1) body = `<p class="muted">${tr('Who is in the family circle? Everyone gets their own view.')}</p>
    <ul class="list">${S.members.map(m => `<li class="row sb"><span class="row">${av(m.id)}<strong>${esc(mName(m.id))}</strong></span>${m.id === 'm1' ? badge(tr(ROLE_LABEL.caregiver), 'info') : `<select class="w-auto" data-chg="wzRole" data-id="${m.id}" aria-label="${esc(tr('Role for {name}', { name: mName(m.id) }))}">${Object.keys(ROLE_LABEL).map(r => `<option value="${r}" ${d.roles[m.id] === r ? 'selected' : ''}>${esc(tr(ROLE_LABEL[r]))}</option>`).join('')}</select>`}</li>`).join('')}
      ${d.add.map(a => `<li class="row sb"><span class="row"><span class="av" aria-hidden="true">${esc(ini(a.name))}</span><strong data-allow-mixed>${esc(a.name)}</strong> ${badge(tr('New'), 'ok')}</span>${badge(tr(ROLE_LABEL[a.role]))}</li>`).join('')}</ul>
    <div class="form"><div><label for="wzn">${tr('Invite someone (name)')}</label><input id="wzn" type="text"></div><div><label for="wzr">${tr('Role')}</label><select id="wzr">${Object.keys(ROLE_LABEL).filter(r => r !== 'caregiver').map(r => `<option value="${r}">${esc(tr(ROLE_LABEL[r]))}</option>`).join('')}</select></div><button class="btn" data-act="wzAdd">${ic('user-plus')} ${tr('Add')}</button></div>
    <h2>${ic('clipboard-check')} ${tr('Daily check-in')}</h2><p class="small muted">${tr('One person does a short check-in every day. If it is missed, the next person is reminded.')}</p>
    <div class="form"><div><label for="wz-ciby">${tr('Who does the daily check-in')}</label><select id="wz-ciby" data-chg="wz" data-k="ciBy">${famIds.map(id => `<option value="${id}" ${id === d.ciBy ? 'selected' : ''}>${esc(nm(id))}</option>`).join('')}</select></div>
    <div><label for="wz-cit">${tr('Reminder time')}</label><input id="wz-cit" type="time" data-chg="wz" data-k="ciTime" value="${d.ciTime}"></div></div>`;
  if (st === 2) body = `<p class="muted">${tr('When something is urgent we call in this order until someone answers. 911 comes last.')}</p>
    <ol class="chain">${d.chain.map((id, i) => `<li><span class="c-n">${i + 1}</span><strong>${esc(nm(id))}</strong><span class="sp"></span>
      <button class="ibtn" data-act="wzMv" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="${esc(tr('Move {name} up', { name: nm(id) }))}">${ic('arrow-up')}</button>
      <button class="ibtn" data-act="wzMv" data-i="${i}" data-d="1" ${i === d.chain.length - 1 ? 'disabled' : ''} aria-label="${esc(tr('Move {name} down', { name: nm(id) }))}">${ic('arrow-down')}</button></li>`).join('')}<li><span class="c-n">${d.chain.length + 1}</span><strong>911</strong></li></ol>`;
  if (st === 3) body = `<p class="note">${ic('stethoscope')} ${tr('Set these with your doctor. The app only alerts; it does not give medical advice.')}</p>
    <div class="form">${[['sys', 0, 'Systolic min'], ['sys', 1, 'Systolic max'], ['dia', 0, 'Diastolic min'], ['dia', 1, 'Diastolic max'], ['sugar', 0, 'Sugar min'], ['sugar', 1, 'Sugar max']].map(([k, i, l]) => `<div><label for="wzt-${k}${i}">${tr(l)}</label><input id="wzt-${k}${i}" type="number" data-chg="wzTh" data-k="${k}" data-i="${i}" value="${d.th[k][i]}"></div>`).join('')}</div>`;
  if (st === 4) body = `<div class="pending ok-box stack"><p><strong>${esc(tr('{name}, {n} years', { name: d.name, n: d.age }))}</strong></p>
    <p>${esc(tr('Daily check-in by {name} at {time}', { name: nm(d.ciBy), time: d.ciTime }))}</p>
    <p>${esc(tr('Escalation: {chain}', { chain: d.chain.map(nm).join(` ${ARW()} `) + ` ${ARW()} 911` }))}</p>
    <p>${esc(tr('Alerts outside {bp} {u1} and {sg} {u2}', { bp: `${d.th.sys[0]}–${d.th.sys[1]}/${d.th.dia[0]}–${d.th.dia[1]}`, u1: tr('mmHg'), sg: `${d.th.sugar[0]}–${d.th.sugar[1]}`, u2: tr('mg/dL') }))}</p></div>
    <p class="muted">${tr('You can change all of this later in Settings.')}</p>`;
  return `<div class="wz"><header class="wz-top"><div class="brand"><img class="logo-mark" src="assets/logo-mark.svg" alt=""> ${tr('Ma3kom')}</div><span class="sp"></span>
    <button class="chip-btn" data-act="lang">${ic('languages')} ${S.lang === 'ar' ? 'English' : 'عربي'}</button>${st ? `<button class="chip-btn" data-act="wzSkip">${tr('Skip')}</button>` : ''}</header>
  <main class="wz-main" id="main"><p class="small muted">${tr('Step {n} of {t}', { n: st + 1, t: WZ.length })}</p>
    <div class="prog" role="progressbar" aria-valuemin="1" aria-valuemax="${WZ.length}" aria-valuenow="${st + 1}" aria-label="${esc(tr('Setup progress'))}">${WZ.map((_, i) => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>
    <h1>${tr(WZ[st])}</h1><div class="stack">${body}</div>
    <div class="wz-nav"><button class="btn" data-act="wzBack" ${st === 0 ? 'disabled' : ''}>${ic(S.lang === 'ar' ? 'chevron-right' : 'chevron-left')} ${tr('Back')}</button>
      ${st === last ? `<button class="btn ok" data-act="wzFinish">${ic('check')} ${tr('Finish')}</button>` : `<button class="btn pri" data-act="wzNext">${tr('Next')} ${ic(S.lang === 'ar' ? 'chevron-left' : 'chevron-right')}</button>`}</div></main></div>`;
}

/* ---------- Helper app (own shell, own language) ---------- */
const HCODE = { Tagalog: 'tl' };
const HSPEECH = { tl: 'fil-PH', en: 'en-GB', ar: 'ar-JO' };
const hLang = () => UI.hl || HCODE[mem(me()).lang] || S.lang;
const ht = (s, vars) => { const l = hLang(); return fill(l === 'tl' ? (HL.tl[s] || s) : l === 'ar' ? (AR[s] || s) : s, vars, l === 'ar' ? 'ar' : 'en'); };
const htx = v => txl(v, hLang() === 'ar' ? 'ar' : 'en');
/* While the helper screen is shown, <html lang/dir> follow the helper's UI language. */
function helperDocLang() { const l = hLang(); document.documentElement.lang = l === 'tl' ? 'fil' : l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }
function renderHelper(sub) {
  const hm = mem(me()), l = hLang(), p = P();
  if (!['rec', 'dose', 'ci'].includes(sub)) sub = '';
  const body = sub === 'rec' ? hRec(p) : sub === 'dose' ? hDose(p) : sub === 'ci' ? hCi(p) : hHome(p);
  helperDocLang();
  $('#app').innerHTML = `<div class="happ" data-helper-lang lang="${l === 'tl' ? 'fil' : l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">
    <header class="htop">${sub ? `<a class="ibtn" href="#/h" aria-label="${esc(ht('Home'))}">${ic(l === 'ar' ? 'arrow-right' : 'arrow-left')}</a>` : ''}
      <span class="hhi"><strong>${esc(ht('Hello, {name}', { name: l === 'ar' ? hm.nameAr || hm.name : hm.name }))}</strong></span><span class="sp"></span>
      <button class="ibtn" data-act="hRead" aria-label="${esc(ht('Read aloud'))}">${ic('volume-2')}</button>
      <label class="sr" for="hlang">${ht('Language')}</label><select id="hlang" class="w-auto" data-chg="hlang">${[['tl', 'Tagalog'], ['en', 'English'], ['ar', 'العربية']].map(([k, n]) => `<option value="${k}" ${k === l ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <button class="ibtn" data-act="drawer" aria-label="${esc(ht('Settings'))}">${ic('settings')}</button></header>
    <main class="hmain" id="main">${body}</main></div>`;
  icons();
}
function hHome(p) {
  const l = hLang(), ds = todayDoses(p), open = ds.filter(d => d.st !== 'taken'), nowN = open.filter(d => d.st !== 'upcoming').length;
  const appts = p.appts.filter(a => !a.past && ymd(a.t) === ymd(now())), ciDone = checkedInToday(p);
  return `<p class="hfor">${esc(ht('Caring for {name}', { name: l === 'ar' ? p.nameAr : p.name }))}</p>
  <div class="hacts">
    <a class="hact a-rec" href="#/h/rec">${ic('mic')}<span>${ht('Record a note')}</span></a>
    <a class="hact a-dose" href="#/h/dose">${ic('pill')}<span>${ht('Mark a dose given')}</span>${nowN ? `<span class="hcount" aria-label="${esc(ht('{n} due now', { n: nowN }))}">${nowN}</span>` : ''}</a>
    <a class="hact a-ci" href="#/h/ci">${ic('clipboard-check')}<span>${ht("Log today's check-in")}</span>${ciDone ? ic('circle-check') : ''}</a>
  </div>
  <section class="card"><h2>${ic('list-checks')} ${ht('What to do today')}</h2><ul class="hlist">
    ${open.map(d => `<li class="${d.st !== 'upcoming' ? 'late' : ''}"><span class="htime">${d.tm}</span>${ic('pill')}<span class="hx">${esc(ht('Give {med}', { med: htx(d.m.name) }))} <span class="small muted">${esc(htx(d.m.dose))}</span></span>${d.st !== 'upcoming' ? `<span class="badge warn">${ht(d.st === 'missed' ? 'Overdue' : 'Due now')}</span>` : ''}</li>`).join('')}
    ${appts.map(a => `<li><span class="htime">${hhmm(a.t)}</span>${ic('calendar-days')}<span class="hx">${esc(ht('Appointment: {doctor}', { doctor: htx(a.doctor) }))}</span></li>`).join('')}
    ${!ciDone ? `<li>${ic('clipboard-check')}<span class="hx">${ht("Log today's check-in")}</span></li>` : ''}
    ${!open.length && !appts.length && ciDone ? `<li>${ic('circle-check')}<span class="hx">${ht('All done for today ✓')}</span></li>` : ''}
  </ul></section>`;
}
function hDose(p) {
  const ds = todayDoses(p);
  const grp = [['Overdue', ds.filter(d => d.st === 'missed')], ['Due now', ds.filter(d => d.st === 'due')], ['Later today', ds.filter(d => d.st === 'upcoming')], ['Already given', ds.filter(d => d.st === 'taken')]];
  return `<h1>${ht('Mark a dose given')}</h1>${grp.filter(([, a]) => a.length).map(([g, a]) => `<h2 class="hgrp ${g === 'Overdue' ? 'warn' : ''}">${g === 'Overdue' ? ic('alarm-clock') + ' ' : ''}${ht(g)}</h2><ul class="hdoses">${a.map(d => `<li class="card"><div><span class="htime">${d.tm}</span> <strong>${esc(htx(d.m.name))}</strong><br><span class="muted">${esc(htx(d.m.dose))}</span></div>${d.st === 'taken' ? `<span class="hgiven">${ic('circle-check')} ${ht('Given ✓')}</span>` : `<button class="hbtn ok" data-act="hGive" data-k="${d.key}">${ic('check')} ${ht('Given')}</button>`}</li>`).join('')}</ul>`).join('')}`;
}
function hCi(p) {
  const c = UI.hci || (UI.hci = { meals: [], mood: 0, unusual: null, obs: '' });
  return `<h1>${ht("Log today's check-in")}</h1>
  ${checkedInToday(p) ? `<p class="hnote">${ic('circle-check')} ${ht("Today's check-in is already saved ✓")}</p>` : ''}
  <section class="card stack"><h2>${ht('Meals eaten')}</h2><div class="hgrid3">${[['Breakfast', 'sunrise'], ['Lunch', 'sun'], ['Dinner', 'moon']].map(([m, i]) => `<button class="htog" aria-pressed="${c.meals.includes(m)}" data-act="hMeal" data-k="${m}">${ic(c.meals.includes(m) ? 'check' : i)}<span>${ht(m)}</span></button>`).join('')}</div></section>
  <section class="card stack"><h2>${ht('Mood')}</h2><div class="hgrid3">${[[4, 'smile', 'Good'], [3, 'meh', 'Okay'], [2, 'frown', 'Not good']].map(([v, i, lb]) => `<button class="htog" aria-pressed="${c.mood === v}" data-act="hMood" data-k="${v}">${ic(i)}<span>${ht(lb)}</span></button>`).join('')}</div></section>
  <section class="card stack"><h2>${ht('Anything unusual?')}</h2><div class="hgrid2"><button class="htog" aria-pressed="${c.unusual === false}" data-act="hUnu" data-k="0">${ic('thumbs-up')}<span>${ht('No')}</span></button><button class="htog" aria-pressed="${c.unusual === true}" data-act="hUnu" data-k="1">${ic('triangle-alert')}<span>${ht('Yes')}</span></button></div>
    ${c.unusual ? `<div><label for="hobs">${ht('Tell us more (optional)')}</label><textarea id="hobs" data-chg="hObs">${esc(c.obs)}</textarea></div>` : ''}</section>
  <button class="hbtn pri wide" data-act="hSaveCi" ${c.mood ? '' : 'disabled'}>${ic('save')} ${ht('Save')}</button>
  ${c.mood ? '' : `<p class="small muted">${ht('Choose a mood to save.')}</p>`}`;
}
function hRec() {
  const r = UI.hrec, lang = mem(me()).lang || 'Tagalog';
  if (r && r.k === 'draft') return `<h1>${ht('Is this what you said?')}</h1>
    <section class="card stack"><p class="htrans" lang="${lang === 'Tagalog' ? 'fil' : ''}">${esc(r.o)}</p><button class="hbtn" data-act="hPlay">${ic('volume-2')} ${ht('Listen')}</button></section>
    <div class="hgrid2"><button class="hbtn ok" data-act="hYes">${ic('check')} ${ht('Yes, correct')}</button><button class="hbtn" data-act="hAgain">${ic('rotate-ccw')} ${ht('Record again')}</button></div>`;
  if (r === 'sent') return `<div class="hsent" role="status">${ic('circle-check')}<h1>${ht('Sent to the family ✓')}</h1><p>${ht('The family will check the translation.')}</p><a class="hbtn pri" href="#/h">${ic('house')} ${ht('Home')}</a></div>`;
  return `<h1>${ht('Record a note')}</h1><div class="hrec"><button class="rec ${r === 'rec' ? 'on' : ''}" data-act="hRec" aria-label="${esc(ht(r === 'rec' ? 'Stop recording' : 'Start recording'))}">${ic(r === 'rec' ? 'square' : 'mic')}</button>
    <p class="hbig" role="status">${ht(r === 'rec' ? 'Recording… tap to stop' : r === 'busy' ? 'Writing down what you said…' : 'Tap to record')}</p>
    <p class="muted">${ht('Speak in your own language. You will check the words before sending.')}</p>
    ${r === 'rec' || r === 'busy' ? `<button class="hbtn" data-act="hCancel">${ic('x')} ${ht('Cancel')}</button>` : `<a class="hbtn" href="#/h">${ic(hLang() === 'ar' ? 'arrow-right' : 'arrow-left')} ${ht('Back')}</a>`}</div>`;
}

/* ---------- routing & shell ---------- */
const R = {
  dashboard: { i: 'house', l: 'Today', roles: 'cfp', f: vDash },
  health: { i: 'heart-pulse', l: 'Health', roles: 'cfp', f: vHealth },
  appts: { i: 'calendar-days', l: 'Calendar', roles: 'cfp', f: vAppts },
  family: { i: 'users', l: 'Family', roles: 'cf', f: vFamily },
  more: { i: 'layout-grid', l: 'More', roles: 'cfp', f: vMore },
  timeline: { i: 'messages-square', l: 'Timeline', d: 'All updates and alerts', roles: 'cfp', f: vTimeline },
  voice: { i: 'mic', l: 'Helper voice notes', d: 'Check translations from the helper', roles: 'cf', f: vVoice },
  providers: { i: 'stethoscope', l: 'Home-care Providers', d: 'Nurses, physiotherapy and labs', roles: 'cfp', f: vProviders },
  qr: { i: 'qr-code', l: 'Emergency QR', d: 'Wallet card for paramedics', roles: 'cf', f: vQR },
  apps: { i: 'plug', l: 'App Connections', d: 'My Hakeem, Riaya, WhatsApp', roles: 'cfp', f: vApps },
  wear: { i: 'watch', l: 'Wearables', d: 'Heart rate, steps and sleep', roles: 'cfp', f: vWear },
  privacy: { i: 'shield-check', l: 'Privacy & roles', d: 'Members, consent and access log', roles: 'c', f: vPrivacy },
  settings: { i: 'settings', l: 'Settings', d: 'Check-in, escalation, thresholds', roles: 'cfp', f: vSettings },
  elderinfo: { i: 'hand-heart', l: 'Elderly mode', d: 'Big-button screen and basic phones', roles: 'cf', f: vElderInfo },
  elder: { roles: 'cf' }, setup: { roles: 'cf' }
};
const NAV = ['dashboard', 'health', 'appts', 'family', 'more'];
const ALIAS = { checkin: ['health', 'checkin'], vitals: ['health', 'vitals'], meds: ['health', 'meds'], costs: ['family', 'costs'], tasks: ['family', 'tasks'] };
const LOGGED = { 'health/vitals': 'Viewed vitals', 'health/meds': 'Viewed medication list', appts: 'Viewed appointments & documents', qr: 'Viewed emergency QR' };
let lastRoute = '';

function shell(route, body) {
  const p = P(), n = bellCount(), cur = NAV.includes(route) ? route : 'more', nav = NAV.filter(k => can(k));
  return `<a class="skip" href="#main" data-act="skip">${tr('Skip to content')}</a><div class="shell">
  <nav class="rail" aria-label="${esc(tr('Main'))}"><div class="brand"><img class="logo-mark" src="assets/logo-mark.svg" alt=""> ${tr('Ma3kom')}</div>
    ${nav.map(k => `<a href="#/${k}" class="${k === route ? 'on' : ''}" ${k === route ? 'aria-current="page"' : ''}>${ic(R[k].i)}<span>${tr(R[k].l)}</span></a>`).join('')}
    <p class="sec">${tr('More')}</p>
    ${MORE.filter(k => can(k)).map(k => `<a href="#/${k}" class="sub ${k === route ? 'on' : ''}" ${k === route ? 'aria-current="page"' : ''}>${ic(R[k].i)}<span>${tr(R[k].l)}</span></a>`).join('')}
  </nav>
  <div class="main">
    <header class="top">
      <button class="prof" data-act="profiles" aria-haspopup="dialog" aria-label="${esc(tr('Switch person — now {name}', { name: pName(p) }))}"><span class="av sm" aria-hidden="true">${et(p.initials)}</span><span class="pn">${esc(pName(p))}</span>${ic('chevron-down')}</button>
      <span class="sp"></span>
      ${S.offline ? `<button class="badge warn off-pill" data-act="drawer">${ic('wifi-off')} ${tr('Offline')}</button>` : ''}
      <button class="ibtn" data-act="bell" aria-label="${esc(tr('Notifications'))}: ${n}">${ic('bell')}${n ? `<span class="dotn" aria-hidden="true">${n}</span>` : ''}</button>
      <button class="ibtn" data-act="drawer" aria-haspopup="dialog" aria-label="${esc(tr('Settings'))}">${ic('settings')}</button>
    </header>
    ${S.offline ? `<div class="banner off">${ic('wifi-off')} <span>${tr('You are offline. Changes are saved on this device and will sync when you reconnect.')} ${tr('({n} pending)', { n: S.queue })}</span></div>` : ''}
    ${S.hideDemo ? '' : `<div class="banner demo">${ic('flask-conical')} <span>${tr('Prototype — demo data only. No real medical data is stored or sent.')}</span><button class="xbtn" data-act="hideDemo" aria-label="${esc(tr('Dismiss'))}">${ic('x')}</button></div>`}
    <main class="content" id="main" tabindex="-1">${body}</main>
  </div>
  <nav class="tabbar" aria-label="${esc(tr('Main'))}">${nav.map(k => `<a href="#/${k}" class="${k === cur ? 'on' : ''}" ${k === cur ? 'aria-current="page"' : ''}>${ic(R[k].i)}<span>${tr(R[k].l)}</span>${k === 'dashboard' && n ? `<span class="tdot" aria-hidden="true"></span>` : ''}</a>`).join('')}</nav>
  </div>`;
}

function render() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = tr('Ma3kom') + ' – ' + tr('Prototype');
  const hash = location.hash.slice(2);
  if (hash.startsWith('e/')) return renderPublic(hash.slice(2));
  escalations();
  if (S.role === 'helper') { lastRoute = 'h'; return renderHelper(hash.startsWith('h/') ? hash.slice(2) : ''); }
  let [route, sub] = hash.split('/'); route = route || 'dashboard';
  if (ALIAS[route]) [route, sub] = ALIAS[route];
  if (!S.setupDone && can('setup')) route = 'setup';
  if (!R[route] || !can(route)) route = 'dashboard';
  const key = route + (sub ? '/' + sub : '');
  if (key !== lastRoute && LOGGED[key]) { log(LOGGED[key]); save(); }
  if (key !== lastRoute) window.scrollTo(0, 0);
  lastRoute = key;
  if (route === 'setup') $('#app').innerHTML = vSetup();
  else if (route === 'elder') $('#app').innerHTML = vElder();
  else $('#app').innerHTML = shell(route, R[route].f(sub));
  if (route === 'qr') drawQR();
  icons();
}
function drawQR() {
  const el = $('#qr'); if (!el) return;
  if (typeof qrcode === 'undefined') { el.textContent = tr('QR library could not load (offline?)'); return; }
  const q = qrcode(0, 'M'); q.addData(pubURL(P().id)); q.make();
  el.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2 });
}

/* ---------- elderly-mode helpers ---------- */
function clearElderTimers() { (UI.et || []).forEach(clearTimeout); UI.et = []; clearInterval(UI.ei); UI.ei = 0; }
const later = (fn, ms) => { UI.et.push(setTimeout(fn, ms)); };
function eDone(title, sub, tone = 'ok', icon = 'circle-check') {
  clearElderTimers(); UI.eo = { k: 'done', title, sub, tone, icon };
  speak(title + (sub ? '. ' + sub : '')); render();
  later(() => { UI.eo = null; render(); }, 2600);
}
function startChain() {
  const p = P(), ansI = Math.min(1, p.chain.length - 1);
  UI.eo = { k: 'chain', i: 0, ok: false, type: null };
  addTL(p, { src: 'system', cat: 'Help request', important: true, urgent: true, text: bi('{name} pressed URGENT HELP (from Elderly Mode).', { name: pB(p) }) }); save();
  speak(tr('Urgent help request sent. We are calling your family now.')); render();
  if (ansI > 0) later(() => { if (UI.eo && UI.eo.k === 'chain') { UI.eo.i = ansI; render(); } }, 2500);
  later(() => {
    if (!UI.eo || UI.eo.k !== 'chain') return;
    UI.eo.ok = true; addTL(p, { src: 'family', who: p.chain[ansI], cat: 'Help request', text: bi('{name} answered the urgent help call and is on the way.', { name: mB(p.chain[ansI]) }) }); save();
    speak(tr('{name} is on the way', { name: mName(p.chain[ansI]) })); render();
  }, 5000);
}
const greetKey = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning, {name}' : h < 17 ? 'Good afternoon, {name}' : 'Good evening, {name}'; };

/* ---------- actions ---------- */
const findTL = id => { for (const k in S.people) { const x = S.people[k].timeline.find(t => t.id === id); if (x) return x; } };
const A = {
  skip: () => { const m = $('#main'); if (m) m.focus(); },
  reset: () => { if (confirm(tr('Reset all demo data?'))) { const lang = S.lang; S = seed(); S.lang = lang; S.setupDone = true; UI.vres = null; UI.wd = null; closeModal(); upd(); toast(tr('Demo data restored')); } },
  lang: () => { S.lang = S.lang === 'ar' ? 'en' : 'ar'; upd(); if (UI.sheet === 'drawer') A.drawer(); },
  offline: () => {
    S.offline = !S.offline;
    if (!S.offline) { const n = S.queue; S.queue = 0; toast(n ? tr('Back online — {n} change(s) synced', { n }) : tr('Back online')); } else toast(tr('Offline mode: changes will sync later'));
    upd(); if (UI.sheet === 'drawer') A.drawer();
  },
  hideDemo: () => { S.hideDemo = true; upd(); },
  drawer: () => {
    modal(`<div class="row sb"><h2 style="margin:0">${ic('settings')} ${tr('Settings')}</h2><button class="ibtn" data-act="close" aria-label="${esc(tr('Close'))}">${ic('x')}</button></div>
      <div class="drawer">${deviceSettings()}</div>
      ${can('settings') ? `<a class="btn" href="#/settings">${ic('sliders-horizontal')} ${tr('All settings')}</a>` : ''}
      <p class="small muted" style="margin-top:12px">${ic('flask-conical')} ${tr('Prototype — demo data only. No real medical data is stored or sent.')}</p>`);
    UI.sheet = 'drawer'; document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  },
  profiles: () => {
    modal(`<div class="row sb"><h2 style="margin:0">${tr('Who are you caring for?')}</h2><button class="ibtn" data-act="close" aria-label="${esc(tr('Close'))}">${ic('x')}</button></div>
      <div class="stack" style="margin-top:12px">${Object.values(S.people).map(x => `<button class="opt-btn ${x.id === S.profile ? 'on' : ''}" aria-pressed="${x.id === S.profile}" data-act="pickProfile" data-k="${x.id}"><span class="av">${et(x.initials)}</span><span><strong>${esc(pName(x))}</strong><br><span class="small muted">${et(x.rel)} · ${tr('{n} years', { n: x.age })}</span></span>${x.id === S.profile ? ic('check') : ''}</button>`).join('')}</div>`);
  },
  pickProfile: d => { S.profile = d.k; UI.sms = []; UI.vres = null; UI.wd = null; closeModal(); upd(); },
  bell: () => {
    const rows = [P(), ...Object.values(S.people).filter(x => x !== P())].flatMap(p => needsYou(p).map(i => ({ i, p })));
    modal(`<div class="row sb"><h2 style="margin:0">${tr('Notifications')}</h2><button class="ibtn" data-act="close" aria-label="${esc(tr('Close'))}">${ic('x')}</button></div>
      <ul class="list">${rows.map(({ i, p }) => `<li class="stack"><span><strong>${esc(pName(p))}</strong> · <span class="small muted">${i.t ? rel(i.t) : ''}</span><br><strong>${esc(i.head)}</strong></span><div>${
        i.kind === 'alert' ? handleBtn(i.x) : i.kind === 'voice' ? `<button class="btn sm pri" data-act="goVoice" data-k="${p.id}">${ic('languages')} ${tr('Check translation')}</button>`
        : i.kind === 'rx' ? `<button class="btn sm pri" data-act="goTo" data-k="${p.id}" data-h="#/health/meds">${ic('pill')} ${tr('Open medications')}</button>` : `<button class="btn sm pri" data-act="goTo" data-k="${p.id}" data-h="#/health/checkin">${ic('clipboard-check')} ${tr('Do the check-in')}</button>`}</div></li>`).join('')}
      ${!rows.length ? `<li class="muted">${tr('No pending notifications')}</li>` : ''}</ul>`);
  },
  goTo: d => { S.profile = d.k; save(); closeModal(); if (location.hash === d.h) render(); else location.hash = d.h; },
  goVoice: d => { S.profile = d.k; save(); closeModal(); if (location.hash === '#/voice') render(); else location.hash = '#/voice'; },
  close: closeModal,
  handle: d => {
    const x = findTL(d.id); if (!x) return;
    const p = findP(d.id), outs = OUTS[x.cat] || OUTS._, h = x.handled || {};
    modal(`<form data-form="handle" class="stack"><input type="hidden" name="id" value="${x.id}">
      <div class="row sb"><h2 style="margin:0">${ic('hand')} ${tr("I'm handling it")}</h2><button type="button" class="ibtn" data-act="close" aria-label="${esc(tr('Close'))}">${ic('x')}</button></div>
      <p class="small muted">${esc(pName(p))} · ${esc(tr(x.cat))} · ${rel(x.t)}</p><p>${et(x.text)}</p>
      <fieldset class="fs"><legend class="lbl">${tr('What happened? (optional)')}</legend>
        ${outs.map(k => `<label class="opt"><input type="radio" name="outcome" value="${k}" ${h.outcome === k ? 'checked' : ''}> ${esc(outLabel(k, p))}</label>`).join('')}
        <label class="opt"><input type="radio" name="outcome" value="" ${!h.outcome ? 'checked' : ''}> ${tr('Not yet — just letting everyone know')}</label></fieldset>
      <div><label for="hnote">${tr('Note (optional)')}</label><textarea id="hnote" name="note">${esc(h.note || '')}</textarea></div>
      <p class="small muted">${tr('Everyone in the family will see that you are handling it.')}</p>
      <button class="btn pri">${ic('check')} ${tr("I'm handling it")}</button></form>`);
  },
  tlf: d => { UI.tlf = d.k; render(); },
  vt: d => { UI.vt = d.k; UI.vres = null; render(); },
  pf: d => { UI.pf = d.k; render(); },
  ciEdit: () => { UI.ciEdit = true; render(); const f = $('form[data-form=checkin] input'); if (f) f.focus(); },
  ciEditCancel: () => { UI.ciEdit = false; render(); },
  vresClose: () => { UI.vres = null; render(); },
  simMissed: () => { const p = P(); addTL(p, { src: 'system', cat: 'Check-in', important: true, ciMiss: true, text: bi('Simulated: no check-in by {time}. Reminder sent to {a} by app and SMS; after 1 hour escalated to {b}.', { time: p.ciTime, a: mB(p.ciBy), b: jn(p.chain.filter(x => x !== p.ciBy).map(mB)) }) }); upd(); toast(tr('Escalation sent to family'), 'bad'); },
  editTh: () => modal(`<h2>${tr('Alert thresholds')}</h2><p class="note">${ic('stethoscope')} ${tr('Set these with your doctor. The app only alerts; it does not give medical advice.')}</p>${thForm(P(), true)}`),
  chainMv: d => { const p = P(), i = +d.i, j = i + +d.d; if (j < 0 || j >= p.chain.length) return; [p.chain[i], p.chain[j]] = [p.chain[j], p.chain[i]]; log('Changed escalation order'); upd(); toast(tr('Escalation order saved')); },
  setupAgain: () => { UI.ws = 0; UI.wd = null; S.setupDone = false; save(); location.hash = '#/setup'; render(); },
  split: d => { const p = P(); p.split = d.k; if (d.k === 'custom' && !Object.keys(p.shares || {}).length) { p.shares = equalInts(famMembers().map(m => m.id)); p.sharesOk = { ...p.shares }; } upd(); },
  settle: d => {
    const p = P(), amtF = Math.round(+d.amt);
    (p.settlements || (p.settlements = [])).push({ id: uid(), from: d.from, to: d.to, amtF, amt: amtF / 1000, t: now() });
    addTL(p, { src: 'family', who: me(), cat: 'General', text: bi('{a} paid {b} {amt} {u} to settle up.', { a: mB(d.from), b: mB(d.to), amt: fmtJ(amtF), u: B('JOD') }) });
    upd(); toast(tr('Marked as settled'));
  },
  playOrig: d => { const v = pv(P()).find(x => x.id === d.id); if (v) speak(v.o, SPEECH[v.lang]); },
  saveVoice: d => {
    const p = P(), v = pv(p).find(x => x.id === d.id); if (!v) return;
    const en = $(`#den-${v.id}`), ar = $(`#dar-${v.id}`);
    addTL(p, { src: 'helper', who: v.who, voice: true, cat: $(`#dcat-${v.id}`).value, text: { en: en ? en.value : v.en, ar: ar ? ar.value : v.ar }, orig: v.o, important: $(`#dimp-${v.id}`).checked });
    p.pendingVoice = pv(p).filter(x => x.id !== v.id);
    log('Confirmed AI voice note'); upd(); toast(tr('Voice note saved to timeline'));
  },
  discardVoice: d => { const p = P(); p.pendingVoice = pv(p).filter(x => x.id !== d.id); upd(); },
  summary: () => {
    const p = P(), from = now() - 30 * D, bp = p.vitals.bp.filter(r => r.t > from), sg = p.vitals.sugar.filter(r => r.t > from), cis = p.checkins.filter(c => c.t > from);
    const st = (a, k) => a.length ? tr('{avg} (range {min}–{max})', { avg: Math.round(avg(a.map(r => r[k]))), min: Math.min(...a.map(r => r[k])), max: Math.max(...a.map(r => r[k])) }) : '—';
    const sl = cis.filter(c => c.sleep != null);
    log('Generated doctor visit summary');
    const mmhg = tr('mmHg');
    modal(`<div class="sheet"><div class="row sb noprint"><span></span><div class="row"><button class="btn pri" data-act="print">${ic('printer')} ${tr('Print / Save as PDF')}</button><button class="btn" data-act="close">${tr('Close')}</button></div></div>
      <h1>${tr('Doctor visit summary')}</h1><p class="muted">${esc(tr('{name} · {age} years · Blood {blood} · Period: {from} – {to}', { name: pName(p), age: p.age, blood: p.blood, from: sD(from), to: sD(now()) }))}</p>
      <p><strong>${tr('Conditions:')}</strong> ${esc(p.conditions.map(c => tx(c)).join(tr(', ')))} · <strong>${tr('Allergies:')}</strong> ${esc(p.allergies.map(c => tx(c)).join(tr(', ')))}</p>
      <h2>${tr('Current medications')}</h2>${wrapT(`<table><thead><tr><th>${tr('Medication')}</th><th>${tr('Dose')}</th><th>${tr('Times')}</th><th>${tr('Prescribed by')}</th></tr></thead><tbody>${p.meds.map(m => `<tr><td>${et(m.name)}</td><td>${et(m.dose)}</td><td>${m.times.join(tr(', '))}</td><td>${et(m.by)}</td></tr>`).join('')}</tbody></table>`)}
      <h2>${tr('Vitals (last 30 days)')}</h2><table><tbody><tr><td>${tr('Systolic BP')}</td><td>${esc(st(bp, 'v'))} ${mmhg}</td></tr><tr><td>${tr('Diastolic BP')}</td><td>${esc(st(bp, 'v2'))} ${mmhg}</td></tr><tr><td>${tr('Blood sugar')}</td><td>${esc(st(sg, 'v'))} ${tr('mg/dL')}</td></tr><tr><td>${tr('Out-of-range readings')}</td><td>${bp.filter(r => outOfRange(p, 'bp', r)).length + sg.filter(r => outOfRange(p, 'sugar', r)).length}</td></tr></tbody></table>
      <h2>${tr('Wellbeing')}</h2><p>${esc(tr('Check-ins: {n} · Avg sleep {h} h · Avg mood {m}/5', { n: cis.length, h: avg(sl.map(c => c.sleep)).toFixed(1), m: avg(cis.map(c => c.mood)).toFixed(1) }))}</p>
      <h2>${tr('Notable observations')}</h2><ul>${p.timeline.filter(x => x.t > from && (x.important || x.cat === 'Health concern')).slice(0, 6).map(x => `<li>${fD(x.t)}: ${et(x.text)}</li>`).join('') || `<li>${tr('None')}</li>`}</ul>
      <h2>${tr('Questions for the doctor')}</h2><textarea aria-label="${esc(tr('Questions for the doctor'))}" placeholder="${esc(tr('Add questions before printing…'))}"></textarea>
      <p class="small muted">${tr('Generated by Ma3kom from family-entered data. Not a diagnosis.')}</p></div>`);
  },
  print: () => window.print(),
  sugOk: d => { const p = P(), s = p.suggestions.find(x => x.id === d.id); p.tasks.push({ id: uid(), title: s.text, who: 'm1', due: now() + 7 * D, done: false, rotate: false }); p.suggestions = p.suggestions.filter(x => x.id !== d.id); upd(); toast(tr('Added to family tasks')); },
  sugNo: d => { const p = P(); p.suggestions = p.suggestions.filter(x => x.id !== d.id); upd(); },
  rxAck: () => { const p = P(), rx = p.rxChange; if (!rx || rx.ack.includes(me())) return; rx.ack.push(me()); const m = p.meds.find(x => x.id === rx.med); if (m) m.dose = rx.newDose; addTL(p, { src: 'family', who: me(), cat: 'Medication', text: bi('Prescription change seen: {med} is now {dose}.', { med: m ? m.name : '', dose: rx.newDose }) }); upd(); },
  dose: d => {
    const p = P(); p.doses[d.k] = d.v;
    const m = p.meds.find(x => x.id === d.k.split('|')[1]);
    if (d.v === 'taken') { m.qty = Math.max(0, m.qty - 1); toast(tr('{med} marked as taken', { med: tx(m.name) })); }
    else { p.notified[d.k] = 1; addTL(p, { src: 'system', cat: 'Medication', important: true, dose: d.k, med: m.name, tm: d.k.split('|')[2], text: bi('Missed dose: {med} ({time}). {a} and {b} notified.', { med: m.name, time: d.k.split('|')[2], a: mB(p.chain[0]), b: mB(p.chain[1] || p.chain[0]) }) }); toast(tr('Family notified about missed dose'), 'bad'); }
    upd();
  },
  refill: d => { const p = P(), m = p.meds.find(x => x.id === d.id); addTL(p, { src: 'family', who: me(), cat: 'Medication', text: bi('Refill requested for {med}. Pharmacy pick-up added to tasks.', { med: m.name }) }); p.tasks.push({ id: uid(), title: bi('Pick up {med} refill', { med: m.name }), who: 'm2', due: now() + D, done: false, rotate: false }); upd(); toast(tr('Refill requested')); },
  /* elderly mode */
  listen: () => {
    const p = P(), ds = todayDoses(p), over = ds.find(d => d.st === 'missed' || d.st === 'due'), up = ds.find(d => d.st === 'upcoming');
    speak(`${tr(greetKey(), { name: pName(p) })}. ${over ? tr('{med} was due at {time}', { med: tx(over.m.name), time: over.tm }) + '.' : up ? tr('Next medicine: {med} at {time}', { med: tx(up.m.name), time: up.tm }) + '.' : tr('You have taken all your medicines today.')} ${tr('If you need help, press the red button.')}`);
  },
  eTook: () => {
    const p = P(), d = todayDoses(p).filter(x => x.st === 'due' || x.st === 'missed');
    const recent = p.lastTook && now() - p.lastTook < 60e3;
    if (!d.length || recent) {
      if (p.lastTook && ymd(p.lastTook) === ymd(now())) return eDone(tr('Already recorded ✓ at {time}', { time: fT(p.lastTook) }), tr('No need to press again.'), 'info', 'circle-check');
      return eDone(tr('No medicine is due right now.'), tr('We will remind you when it is time.'), 'info', 'info');
    }
    d.forEach(x => { p.doses[x.key] = 'taken'; x.m.qty = Math.max(0, x.m.qty - 1); });
    p.lastTook = now();
    addTL(p, { src: 'family', who: null, cat: 'Medication', text: bi('{name} confirmed taking: {meds}.', { name: pB(p), meds: jn(d.map(x => x.m.name)) }) }); save();
    eDone(tr('Done ✓'), tr('Thank you, your medicine has been recorded.'));
  },
  eRemind: () => { addTL(P(), { src: 'system', cat: 'Medication', text: bi('{name} asked to be reminded in 30 minutes.', { name: pB(P()) }) }); save(); eDone(tr('Done ✓'), tr('Okay, I will remind you in 30 minutes.'), 'warn', 'alarm-clock'); },
  help: () => {
    const p = P(); if (!p.chain.length) return;
    clearElderTimers(); UI.eo = { k: 'count', n: 5 };
    speak(tr('Calling {name} in 5 seconds. Tap Cancel if you are okay.', { name: mName(p.chain[0]) })); render();
    UI.ei = setInterval(() => {
      if (!UI.eo || UI.eo.k !== 'count') { clearInterval(UI.ei); return; }
      UI.eo.n--;
      if (UI.eo.n <= 0) { clearInterval(UI.ei); startChain(); } else render();
    }, 1000);
  },
  helpCancel: () => eDone(tr('Cancelled ✓'), tr('No one was called.'), 'info', 'circle-x'),
  helpClose: () => { clearElderTimers(); UI.eo = null; render(); },
  helpType: d => {
    const p = P(), labels = { family: '{name} wants to talk to family (from Elderly Mode).', meds: '{name} needs help with medication (from Elderly Mode).', home: '{name} needs household items (from Elderly Mode).' };
    if (!UI.eo || UI.eo.type === d.k) return;
    UI.eo.type = d.k; addTL(p, { src: 'system', cat: 'Help request', text: bi(labels[d.k], { name: pB(p) }) }); save();
    speak(tr('Done. Your family can see this.')); render();
  },
  elderExit: () => { clearElderTimers(); UI.eo = null; location.hash = '#/elderinfo'; },
  sms: d => {
    const p = P(), r = { 1: 'Thank you, your medicine has been recorded ✓', 2: 'We will remind you in 30 minutes', 9: 'Your family has been notified. Someone will call you now.' }[d.k];
    UI.sms = [...(UI.sms || []), { me: true, t: d.k }, { me: false, t: r }];
    if (d.k === '1') { todayDoses(p).filter(x => x.st === 'due' || x.st === 'missed').forEach(x => { p.doses[x.key] = 'taken'; }); p.lastTook = now(); }
    if (d.k === '9') addTL(p, { src: 'system', cat: 'Help request', important: true, urgent: true, text: bi('{name} asked for help by SMS (basic phone).', { name: pB(p) }) });
    upd();
  },
  rotate: d => {
    const p = P(), tk = p.tasks.find(x => x.id === d.id), fam = famMembers().map(m => m.id);
    tk.who = fam[(fam.indexOf(tk.who) + 1) % fam.length]; toast(tr('Now assigned to {name}', { name: mName(tk.who) })); upd();
  },
  reqSvc: d => {
    const x = PROVIDERS.find(v => v.id === d.id);
    modal(`<h2>${tr('Request service')} — ${et(x.name)}</h2><form data-form="req" class="stack"><input type="hidden" name="prov" value="${x.id}">
      <div><label for="rs1">${tr('Service')}</label><select id="rs1" name="service">${SERVICES[x.type].map(s => `<option value="${s.en}">${et(s)}</option>`).join('')}</select></div>
      <div class="form"><div><label for="rs2">${tr('Date')}</label><input id="rs2" type="date" name="d" required></div><div><label for="rs3">${tr('Time')}</label><input id="rs3" type="time" name="tm" value="11:00"></div></div>
      <div><label for="rs4">${tr('Notes for the provider')}</label><textarea id="rs4" name="notes"></textarea></div>
      <div class="row"><button class="btn pri">${tr('Send request')}</button><button type="button" class="btn" data-act="close">${tr('Cancel')}</button></div></form>`);
  },
  printQR: () => {
    const p = P();
    modal(`<div class="sheet" style="text-align:center"><h2>${tr('EMERGENCY')}</h2><div class="qrbox" id="qr2"></div><h2>${esc(pName(p))}</h2><p>${esc(tr('Blood {blood} · Allergies: {list}', { blood: p.blood, list: p.allergies.map(a => tx(a)).join(tr(', ')) }))}</p><p class="small">${tr('Scan for emergency medical info')}</p>
      <div class="row noprint" style="justify-content:center"><button class="btn pri" data-act="print">${ic('printer')} ${tr('Print')}</button><button class="btn" data-act="close">${tr('Close')}</button></div></div>`);
    if (typeof qrcode !== 'undefined') { const q = qrcode(0, 'M'); q.addData(pubURL(p.id)); q.make(); $('#qr2').innerHTML = q.createSvgTag({ cellSize: 6, margin: 2 }); }
  },
  pubAuth: () => { UI.auth = true; const pp = S.people[location.hash.slice(4)]; S.log.unshift({ t: now(), who: 'm5', role: 'professional', what: lt('Opened full record via QR', pp || P()) }); save(); render(); },
  pubLang: () => { UI.pubLang = (UI.pubLang || 'ar') === 'ar' ? 'en' : 'ar'; render(); },
  hakeem: () => { UI.imports = [bi('Prescription: Metformin 850 mg tablet — Dr. Sami Haddad'), bi('Lab result: HbA1c 7.4% ({date})', { date: bS(at(-5, 9)) })]; render(); },
  impOk: d => { const p = P(), x = (UI.imports || [])[+d.k]; if (!x) return; addTL(p, { src: 'professional', who: null, cat: 'My Hakeem import', text: bi('Imported from My Hakeem: {item}', { item: x }) }); UI.imports = UI.imports.filter((_, i) => i !== +d.k); upd(); toast(tr('Saved to records')); },
  impNo: d => { UI.imports = (UI.imports || []).filter((_, i) => i !== +d.k); render(); },
  wearOn: d => { const w = P().wear, dev = WEARABLES.find(x => x.en === d.k); Object.assign(w, { on: true, device: dev, synced: now(), hr: [70, 74, 72, 76, 73, 71, 75], rest: 66, steps: [2900, 3500, 4100, 3300, 2700, 3800, 3100], sleep: [6, 6.5, 7, 5.5, 6.8, 7.1, 6.4] }); upd(); toast(tr('{device} connected', { device: tx(dev) })); },
  wearOff: () => { P().wear.on = false; upd(); },
  wearSync: () => { const w = P().wear; w.synced = now(); w.hr[6] = 68 + Math.round(Math.random() * 12); w.steps[6] += Math.round(Math.random() * 400); upd(); toast(tr('Synced')); },
  rmMember: d => { const m = mem(d.id); if (!confirm(tr('Remove {name}? Their access ends immediately.', { name: mName(d.id) }))) return; S.members = S.members.filter(x => x.id !== d.id); Object.values(S.people).forEach(p => { p.chain = p.chain.filter(x => x !== d.id); }); log('Removed member {name}', { name: { en: m.name, ar: m.nameAr || m.name } }); upd(); toast(tr('{name} removed — access revoked', { name: S.lang === 'ar' ? m.nameAr || m.name : m.name })); },
  consent: () => { const p = P(); p.consent = p.consent.given ? { given: false, t: now(), by: '' } : { given: true, t: now(), by: bi('{name} (recorded by {by})', { name: pB(p), by: mB(me()) }) }; log(p.consent.given ? 'Recorded consent' : 'Recorded consent withdrawal'); upd(); },
  export: () => {
    const p = P(), blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), person: p, members: S.members, accessLog: S.log }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${p.id}-data-export.json`; a.click(); URL.revokeObjectURL(a.href);
    log('Exported personal data'); upd();
  },
  delReq: () => modal(`<h2>${tr('Request deletion')}</h2><p>${esc(tr("All of {name}'s data will be permanently deleted within 30 days, as required by the Personal Data Protection Law. Family members will be notified.", { name: pName(P()) }))}</p><div class="row"><button class="btn bad" data-act="delOk">${tr('Submit request')}</button><button class="btn" data-act="close">${tr('Cancel')}</button></div>`),
  delOk: () => { log('Requested data deletion'); addTL(P(), { src: 'system', cat: 'Privacy', important: true, text: bi('{name} requested deletion of all data. It will be completed within 30 days unless cancelled.', { name: mB(me()) }) }); closeModal(); upd(); toast(tr('Deletion request submitted')); },
  /* setup wizard */
  wzNext: () => { UI.ws = Math.min(WZ.length - 1, UI.ws + 1); render(); window.scrollTo(0, 0); const h = $('.wz-main h1'); if (h) { h.tabIndex = -1; h.focus(); } },
  wzBack: () => { UI.ws = Math.max(0, UI.ws - 1); render(); },
  wzSkip: () => { S.setupDone = true; UI.wd = null; UI.ws = 0; save(); if (location.hash !== '#/dashboard') location.hash = '#/dashboard'; render(); toast(tr('Exploring with demo data')); },
  wzAdd: () => {
    const inp = $('#wzn'), n = inp.value.trim(); if (!n) { inp.focus(); return; }
    const d = wzDraft(), id = 'm' + uid(), role = $('#wzr').value;
    d.add.push({ id, name: n, role }); if (['caregiver', 'family'].includes(role)) d.chain.push(id); render();
  },
  wzMv: dd => { const d = wzDraft(), i = +dd.i, j = i + +dd.d; if (j < 0 || j >= d.chain.length) return; [d.chain[i], d.chain[j]] = [d.chain[j], d.chain[i]]; render(); },
  wzFinish: () => {
    const p = P(), d = wzDraft(), nm = String(d.name).trim();
    if (nm && nm !== d.name0) { p.name = p.nameAr = nm; p.initials = nm[0]; }
    if (+d.age) p.age = +d.age;
    if (d.cond !== d.cond0) p.conditions = splitList(d.cond);
    if (d.allg !== d.allg0) p.allergies = splitList(d.allg);
    S.members.forEach(m => { if (m.id !== 'm1' && d.roles[m.id]) m.role = d.roles[m.id]; });
    d.add.forEach(a => S.members.push({ id: a.id, name: a.name, nameAr: a.name, rel: B(ROLE_LABEL[a.role]), role: a.role, phone: '+962790000099', ...(a.role === 'helper' ? { lang: 'Tagalog' } : {}) }));
    p.ciBy = d.ciBy; p.ciTime = d.ciTime; p.th = d.th;
    p.chain = d.chain.filter(id => S.members.some(m => m.id === id && ['caregiver', 'family'].includes(m.role)));
    S.setupDone = true; UI.wd = null; UI.ws = 0; log('Completed setup'); save();
    if (location.hash !== '#/dashboard') location.hash = '#/dashboard'; render(); toast(tr('Setup saved'));
  },
  /* helper app */
  hRead: () => { const m = $('#main'); if (m) speak(m.innerText, HSPEECH[hLang()]); },
  hRec: () => {
    if (UI.hrec === 'rec') {
      UI.hrec = 'busy'; render();
      const lang = mem(me()).lang || 'Tagalog', v = VOICE[lang] || VOICE.Tagalog;
      setTimeout(() => { if (UI.hrec === 'busy') { UI.hrec = { k: 'draft', lang: VOICE[lang] ? lang : 'Tagalog', ...v }; render(); } }, 1200);
    } else { UI.hrec = 'rec'; render(); }
  },
  hCancel: () => { UI.hrec = null; render(); },
  hPlay: () => { const r = UI.hrec; if (r && r.o) speak(r.o, SPEECH[r.lang]); },
  hAgain: () => { UI.hrec = 'rec'; render(); },
  hYes: () => {
    const r = UI.hrec, p = P(); if (!r || !r.o) return;
    pv(p).unshift({ id: uid(), t: now(), who: me(), lang: r.lang, o: r.o, ar: r.ar, en: r.en, cat: r.cat });
    UI.hrec = 'sent'; save(); render();
  },
  hGive: d => {
    const p = P(), m = p.meds.find(x => x.id === d.k.split('|')[1]); if (!m) return;
    p.doses[d.k] = 'taken'; m.qty = Math.max(0, m.qty - 1);
    addTL(p, { src: 'helper', who: me(), cat: 'Medication', text: bi('{name} gave {med} ({time}).', { name: mB(me()), med: m.name, time: d.k.split('|')[2] }) });
    upd(); toast(ht('{med} given ✓', { med: htx(m.name) }));
  },
  hMeal: d => { const c = UI.hci; c.meals = c.meals.includes(d.k) ? c.meals.filter(x => x !== d.k) : [...c.meals, d.k]; render(); },
  hMood: d => { UI.hci.mood = +d.k; render(); },
  hUnu: d => { UI.hci.unusual = d.k === '1'; render(); if (UI.hci.unusual) { const t = $('#hobs'); if (t) t.focus(); } },
  hSaveCi: () => {
    const p = P(), c = UI.hci; if (!c || !c.mood) return;
    const t = $('#hobs'); if (t) c.obs = t.value;
    const mood = MOODS[c.mood - 1][1], meals = ['Breakfast', 'Lunch', 'Dinner'].filter(m => c.meals.includes(m));
    p.checkins.push({ id: uid(), t: now(), by: me(), mood: c.mood, sleep: null, meals, obs: c.unusual ? c.obs : '', unusual: !!c.unusual });
    addTL(p, { src: 'helper', who: me(), cat: 'Check-in', important: !!c.unusual, text: bi('Check-in by {name}: mood {mood}, {n}/3 meals.{obs}', { name: mB(me()), mood: { en: mood.en.toLowerCase(), ar: mood.ar }, n: meals.length, obs: c.unusual && c.obs ? ' ' + c.obs : '' }) });
    UI.hci = null; save(); toast(ht('Check-in saved ✓'));
    if (location.hash !== '#/h') location.hash = '#/h'; else render();
  }
};

/* ---------- forms ---------- */
const F = {
  post: (v, f) => { addTL(P(), { src: { caregiver: 'family', family: 'family', helper: 'helper', professional: 'professional' }[S.role], who: me(), cat: v.cat, text: v.text, important: !!v.imp }); f.reset(); upd(); toast(tr('Update posted')); },
  checkin: (v, f) => {
    const p = P(), meals = new FormData(f).getAll('meal'), mood = MOODS[v.mood - 1][1];
    const text = bi('Daily check-in: mood {mood}, {h} h sleep, {n}/3 meals.{obs}', { mood: { en: mood.en.toLowerCase(), ar: mood.ar }, h: v.sleep, n: meals.length, obs: v.obs ? ' ' + v.obs : '' });
    const cur = UI.ciEdit && checkedInToday(p) ? lastCheckin(p) : null;
    if (cur) { /* edit today's entry in place — no duplicate */
      Object.assign(cur, { mood: +v.mood, sleep: +v.sleep, meals, obs: v.obs, unusual: !!v.unusual, edited: now() });
      const t = cur.tl && p.timeline.find(x => x.id === cur.tl);
      if (t) { t.text = text; if (v.unusual) t.important = true; } else addTL(p, { src: 'family', who: me(), cat: 'Check-in', important: !!v.unusual, text });
      UI.ciEdit = false; upd(); toast(tr('Check-in updated')); return;
    }
    p.checkins.push({ id: uid(), t: now(), by: me(), mood: +v.mood, sleep: +v.sleep, meals, obs: v.obs, unusual: !!v.unusual });
    addTL(p, { src: S.role === 'helper' ? 'helper' : 'family', who: me(), cat: 'Check-in', important: !!v.unusual, text });
    p.checkins.at(-1).tl = p.timeline[0].id;
    upd(); toast(tr(v.unusual ? 'Check-in saved — family alerted' : 'Check-in saved'), v.unusual ? 'bad' : '');
  },
  vital: v => {
    const p = P(), r = { t: now(), v: +v.v }; if (v.v2) r.v2 = +v.v2;
    p.vitals[v.type].push(r);
    if (v.type === 'weight') { UI.vres = null; upd(); toast(tr('Reading saved')); return; }
    const lvl = sev(p, v.type, r), names = lvl === 'ok' ? [] : lvl === 'warn' ? p.chain.slice(0, 2) : p.chain.slice();
    UI.vres = { pid: p.id, type: v.type, v: r.v, v2: r.v2, lvl, label: sevLabel(p, v.type, r, lvl), names };
    if (lvl !== 'ok') {
      const nm = jn(names.map(mB)), val = v.type === 'bp' ? r.v + '/' + r.v2 : r.v;
      const key = v.type === 'bp' ? (lvl === 'bad' ? 'Blood pressure {v} is at crisis level. Whole family alerted: {names}.' : 'Blood pressure {v} is outside the alert range. {names} notified.')
        : (lvl === 'bad' ? 'Blood sugar {v} {u} is at an urgent level. Whole family alerted: {names}.' : 'Blood sugar {v} {u} is outside the alert range. {names} notified.');
      addTL(p, { src: 'system', cat: 'Vitals', important: true, vit: { type: v.type, val: v.type === 'bp' ? val : val + '', lvl, low: /low/i.test(UI.vres.label) }, text: bi(key, { v: val, u: B('mg/dL'), names: nm }) });
    }
    upd(); const el = $('#vres'); if (el) { el.scrollIntoView({ block: 'nearest' }); el.focus({ preventScroll: true }); }
  },
  th: v => { const p = P(); p.th = { sys: [+v.s0, +v.s1], dia: [+v.d0, +v.d1], sugar: [+v.g0, +v.g1] }; closeModal(); upd(); toast(tr('Thresholds updated')); },
  handle: v => {
    const x = findTL(v.id), p = findP(v.id); if (!x) return;
    const first = !x.handled;
    x.handled = { by: me(), t: now(), outcome: v.outcome || '', note: (v.note || '').trim() };
    if (v.outcome === 'late' && x.dose && p.doses[x.dose] !== 'taken') { /* apply the outcome: dose recorded as taken (late) */
      p.doses[x.dose] = 'taken'; const m = p.meds.find(y => y.id === x.dose.split('|')[1]); if (m) m.qty = Math.max(0, m.qty - 1);
    }
    if (first) addTL(p, { src: 'family', who: me(), cat: x.cat, text: bi('{name} is handling: {what}', { name: mB(me()), what: x.text }) });
    if (v.outcome) addTL(p, { src: 'family', who: me(), cat: x.cat, text: bi('{name} resolved an alert: {out}', { name: mB(me()), out: B(OUTL[outKey(v.outcome, p)]) }) });
    closeModal(); upd(); toast(tr('Everyone can see you are handling it'));
  },
  shares: v => { const p = P(); p.shares = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Math.max(0, +x || 0)])); p.split = 'custom'; upd(); toast(tr('Shares saved')); },
  appt: (v, f) => { const [y, mo, da] = v.d.split('-').map(Number), [h, mi] = v.tm.split(':').map(Number); P().appts.push({ id: uid(), t: new Date(y, mo - 1, da, h, mi).getTime(), doctor: v.doctor, spec: v.spec, place: v.place, with: v.with, rem: '1 day before', notes: '' }); f.reset(); upd(); toast(tr('Appointment added — reminders scheduled')); },
  med: (v, f) => { P().meds.push({ id: uid(), name: v.name, dose: v.dose, times: v.times.split(',').map(s => s.trim()).filter(Boolean), qty: +v.qty, purpose: '', ch: ['app'], by: v.by || '—' }); addTL(P(), { src: 'family', who: me(), cat: 'Medication', important: true, text: bi('New medication added: {name} {dose}. Please check it.', { name: v.name, dose: v.dose }) }); f.reset(); upd(); },
  task: (v, f) => { P().tasks.push({ id: uid(), title: v.title, who: v.who, due: new Date(v.d).getTime(), done: false, rotate: !!v.rotate }); f.reset(); upd(); },
  cost: (v, f) => { P().costs.push({ id: uid(), title: v.title, amt: +v.amt, by: v.by, t: now() }); f.reset(); upd(); toast(tr('Expense added and split')); },
  req: v => {
    const p = P(), x = PROVIDERS.find(y => y.id === v.prov), [y, mo, da] = v.d.split('-').map(Number), [h, mi] = (v.tm || '11:00').split(':').map(Number);
    const svc = SERVICES[x.type].find(s => s.en === v.service) || v.service;
    p.requests.unshift({ id: uid(), prov: v.prov, service: svc, t: new Date(y, mo - 1, da, h, mi).getTime(), status: 'Requested' });
    addTL(p, { src: 'family', who: me(), cat: 'Service request', text: bi('Requested "{svc}" from {prov}.', { svc, prov: x.name }) }); closeModal(); upd(); toast(tr('Request sent'));
  },
  helper: (v, f) => { const id = 'm' + uid(); S.members.push({ id, name: v.name, nameAr: v.name, rel: L('Helper', 'عاملة منزلية'), role: 'helper', lang: v.lang, phone: '+962790000099' }); log('Added helper {name}', { name: v.name }); f.reset(); upd(); toast(tr('{name} added — access active now', { name: v.name })); }
};

/* ---------- change handlers ---------- */
const C = {
  viewRole: el => {
    S.role = el.value; log('Switched view to {role}', { role: B(ROLE_LABEL[S.role]) }); closeModal(); save();
    const target = S.role === 'helper' ? '#/h' : location.hash.startsWith('#/h') ? '#/dashboard' : location.hash;
    if (target !== location.hash) location.hash = target; else render();
  },
  ciBy: el => { P().ciBy = el.value; upd(); toast(tr('Saved')); },
  ciTime: el => { P().ciTime = el.value; upd(); toast(tr('Saved')); },
  apptWith: el => { const a = P().appts.find(x => x.id === el.dataset.id); a.with = el.value; addTL(P(), { src: 'family', who: me(), cat: 'Appointment', text: bi('{name} will accompany to {doctor} on {date}.', { name: mB(el.value), doctor: a.doctor, date: bD(a.t) }) }); upd(); },
  apptRem: el => { P().appts.find(x => x.id === el.dataset.id).rem = el.value; upd(); toast(tr('Reminder updated')); },
  upload: el => {
    const f = el.files[0]; if (!f) return;
    toast(tr('Reading document…'));
    setTimeout(() => { P().suggestions.push(
      { id: uid(), file: f.name, text: bi('Book follow-up blood test (HbA1c) in 3 months') },
      { id: uid(), file: f.name, text: bi('Schedule a check-up with the prescribing doctor in 4 weeks') }); log('Uploaded medical document'); upd(); }, 1000);
  },
  riaya: el => { const f = el.files[0]; if (!f) return; P().reports.unshift({ id: uid(), prov: 'p1', t: now(), text: bi('Visit report uploaded from Riaya ({file}).', { file: f.name }) }); addTL(P(), { src: 'professional', who: 'm5', cat: 'Visit report', text: bi('Visit report uploaded: {file}', { file: f.name }) }); upd(); toast(tr('Visit report uploaded')); },
  medCh: el => { const m = P().meds.find(x => x.id === el.dataset.id), k = el.dataset.k; m.ch = el.checked ? [...new Set([...m.ch, k])] : m.ch.filter(x => x !== k); save(); toast(tr('Reminder channels updated')); },
  task: el => { const tk = P().tasks.find(x => x.id === el.dataset.id); tk.done = el.checked; if (tk.done && tk.rotate) { const fam = famMembers().map(m => m.id); P().tasks.push({ ...tk, id: uid(), done: false, due: tk.due + 7 * D, who: fam[(fam.indexOf(tk.who) + 1) % fam.length] }); toast(tr('Done — next week assigned to the next person')); } upd(); },
  qrf: el => { P().qrPublic[el.dataset.k] = el.checked; upd(); },
  role: el => { const m = mem(el.dataset.id); m.role = el.value; log("Changed {name}'s role to {role}", { name: mB(m.id), role: B(ROLE_LABEL[el.value]) }); upd(); },
  wz: el => { wzDraft()[el.dataset.k] = el.value; if (el.dataset.k !== 'name' && el.dataset.k !== 'cond' && el.dataset.k !== 'allg') render(); },
  wzRole: el => { const d = wzDraft(), id = el.dataset.id, fam = ['caregiver', 'family'].includes(el.value); d.roles[id] = el.value; if (fam && !d.chain.includes(id)) d.chain.push(id); if (!fam) d.chain = d.chain.filter(x => x !== id); render(); },
  wzTh: el => { wzDraft().th[el.dataset.k][+el.dataset.i] = +el.value; },
  hlang: el => { UI.hl = el.value; render(); },
  hObs: el => { if (UI.hci) UI.hci.obs = el.value; }
};

/* ---------- wiring ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return closeModal();
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const fn = A[b.dataset.act];
  if (fn) { e.preventDefault(); fn(b.dataset, b); }
});
document.addEventListener('submit', e => { const f = e.target; if (f.dataset.form && F[f.dataset.form]) { e.preventDefault(); F[f.dataset.form](Object.fromEntries(new FormData(f)), f); } });
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.inp === 'share') {
    const p = P(); p.shares = { ...rawShares(p), [el.dataset.id]: Math.max(0, Math.round(+el.value || 0)) };
    if (sumSh(rawShares(p)) === 100) p.sharesOk = { ...p.shares };
    save(); const live = $('#costs-live'), msg = $('#shmsg');
    if (live) { live.innerHTML = costsLive(p); msg.innerHTML = shareMsg(p); icons(); }
  }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el && C[el.dataset.chg]) C[el.dataset.chg](el); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
window.addEventListener('hashchange', () => {
  closeModal(); UI.ciEdit = false;
  if (!location.hash.startsWith('#/elder')) { clearElderTimers(); UI.eo = null; }
  if (location.hash !== '#/h/rec' && UI.hrec !== 'rec') UI.hrec = null;
  render();
});
setInterval(() => {
  const a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName);
  if (!document.hidden && $('#modal').hidden && !UI.eo && UI.hrec !== 'rec' && UI.hrec !== 'busy' && !typing && !location.hash.startsWith('#/e/')) render();
}, 60e3);
render();
})();
