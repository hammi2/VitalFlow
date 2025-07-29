# دليل النشر السريع على Netlify

## الطريقة الأولى: ربط GitHub (الأسهل)

### 1. إنشاء حساب Netlify
- اذهب إلى [netlify.com](https://netlify.com)
- اضغط "Sign up with GitHub"
- اتبع خطوات التسجيل

### 2. ربط المستودع
- اضغط "New site from Git"
- اختر "GitHub"
- اختر مستودع "VitalFlow"
- اضغط "Connect"

### 3. إعدادات البناء
- **Build command**: اتركه فارغاً
- **Publish directory**: `public`
- **Branch**: `main`

### 4. النشر
- اضغط "Deploy site"
- انتظر 1-2 دقائق
- احصل على الرابط

## الطريقة الثانية: الرفع المباشر

### 1. إنشاء حساب Netlify
- اذهب إلى [netlify.com](https://netlify.com)
- اضغط "Sign up"

### 2. رفع الملفات
- اضغط "New site from Git"
- اختر "Deploy manually"
- اسحب مجلد `public` بالكامل
- اضغط "Deploy site"

## بعد النشر

### تغيير اسم الموقع
1. في لوحة التحكم > "Site settings"
2. اضغط "Change site name"
3. اختر اسماً مثل: `vitalflow-app`

### التحقق من الملفات
- الموقع: `https://your-site.netlify.app/`
- app-ads.txt: `https://your-site.netlify.app/app-ads.txt`

## تحديث AdMob

1. اذهب إلى [AdMob Console](https://admob.google.com)
2. اختر تطبيق VitalFlow
3. اذهب إلى "App settings"
4. أضف رابط الموقع في "Developer website"
5. انتظر 24-48 ساعة للمراجعة

## حل المشاكل

### إذا لم يظهر app-ads.txt:
- تأكد من وجود الملف في مجلد public
- انتظر بضع دقائق
- تحقق من إعدادات Netlify

### إذا فشل النشر:
- تحقق من أن جميع الملفات موجودة
- تأكد من وجود index.html
- راجع رسائل الخطأ 