# حل مشكلة إثبات ملكية VitalFlow مع AdMob

## المشكلة
أنت تواجه مشكلة "يتطلب مراجعة" في AdMob لأن ملف `app-ads.txt` موجود على GitHub وليس على الموقع الرسمي للمطور.

## الحل المقدم
تم إنشاء موقع ويب رسمي بسيط في مجلد `public/` يحتوي على:
- صفحة رئيسية جميلة للتطبيق
- ملف `app-ads.txt` صحيح
- جميع الملفات المطلوبة للنشر

## خطوات الحل

### 1. نشر الموقع (اختر أحد الخيارات)

#### الخيار الأول: Netlify (الأسهل والأسرع)
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل حساب جديد
3. اضغط "New site from Git"
4. اختر GitHub واختر هذا المستودع
5. في إعدادات البناء:
   - Build command: اتركه فارغاً
   - Publish directory: `public`
6. اضغط "Deploy site"

#### الخيار الثاني: GitHub Pages
1. اذهب إلى إعدادات المستودع على GitHub
2. اذهب إلى "Pages"
3. اختر "Deploy from a branch"
4. اختر branch: `main` و folder: `/public`
5. اضغط "Save"

#### الخيار الثالث: Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل حساب جديد
3. اضغط "New Project"
4. اختر هذا المستودع
5. في إعدادات البناء:
   - Framework Preset: Other
   - Root Directory: `public`
6. اضغط "Deploy"

### 2. تحديث إعدادات AdMob

بعد الحصول على رابط الموقع (مثل: `https://your-site.netlify.app`):

1. اذهب إلى [AdMob Console](https://admob.google.com)
2. اختر تطبيق VitalFlow
3. اذهب إلى "App settings"
4. أضف رابط الموقع الرسمي في حقل "Developer website"
5. تأكد من أن ملف app-ads.txt متاح على: `https://your-site.netlify.app/app-ads.txt`

### 3. انتظار المراجعة

- انتظر 24-48 ساعة لمراجعة AdMob
- قد تحتاج إلى الضغط على "Search for updates" في AdMob

## الملفات المهمة

- `public/index.html` - الصفحة الرئيسية
- `public/app-ads.txt` - ملف إثبات ملكية AdMob
- `public/deploy.md` - تعليمات مفصلة للنشر

## ملاحظات مهمة

1. **الموقع يجب أن يكون على النطاق الرسمي للمطور**، وليس على GitHub
2. **ملف app-ads.txt يجب أن يكون في الجذر** (root) للموقع
3. **المحتوى الصحيح**: `google.com, pub-548396705444200, DIRECT, f08c47fec0942fa0`
4. **انتظر 24-48 ساعة** لمراجعة AdMob

## رابط الملفات

بعد النشر، تأكد من أن هذه الروابط تعمل:
- الموقع الرئيسي: `https://your-site.netlify.app/`
- ملف app-ads.txt: `https://your-site.netlify.app/app-ads.txt`

## الدعم

إذا واجهت أي مشكلة، راجع ملف `public/deploy.md` للحصول على تعليمات مفصلة. 