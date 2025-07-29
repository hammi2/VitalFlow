# إصلاح مشكلة بناء Android - VitalFlow

## المشكلة
كان هناك تضارب في إعدادات Google Mobile Ads بين:
- إعدادات التطبيق في `app.json`
- إعدادات `react-native-google-mobile-ads`

## الحلول المطبقة

### 1. تحديث إعدادات التطبيق
- تم إنشاء `app.config.js` بدلاً من `app.json`
- تم إضافة إعدادات `react-native-google-mobile-ads` بشكل صحيح

### 2. إضافة ملفات التكوين المطلوبة
- `metro.config.js` - لدعم react-native-google-mobile-ads
- `babel.config.js` - لدعم React Native Reanimated

### 3. تحديث إعدادات البناء
- تم تحديث `eas.json` مع أوامر Gradle الصحيحة

## خطوات البناء

### للبناء المحلي:
```bash
# تنظيف الكاش
npx expo install --fix

# بناء التطبيق
eas build --platform android --profile development
```

### للبناء للإنتاج:
```bash
eas build --platform android --profile production
```

## التحقق من الإعدادات

### 1. تأكد من وجود الملفات:
- ✅ `app.config.js`
- ✅ `metro.config.js`
- ✅ `babel.config.js`
- ✅ `eas.json` (محدث)
- ✅ `.easignore` (جديد - لاستبعاد ملفات الموقع)

### 2. تأكد من إعدادات AdMob:
- App ID: `ca-app-pub-5483967054440200~9266862724`
- تم إضافته في `app.config.js` و `utils/admob.ts`

## إذا استمرت المشكلة

### 1. تنظيف الكاش:
```bash
npx expo install --fix
rm -rf node_modules
yarn install
```

### 2. إعادة بناء:
```bash
eas build --platform android --profile development --clear-cache
```

### 3. التحقق من السجلات:
```bash
eas build:list
```

## ملف .easignore

تم إنشاء ملف `.easignore` لاستبعاد الملفات غير المطلوبة من عملية البناء:

### الملفات المستبعدة:
- **ملفات الموقع**: `public/`, `docs/`, `netlify.toml`, `vercel.json`
- **ملفات البناء**: `dist/`, `build/`, `.next/`, `out/`
- **ملفات التطوير**: `*.log`, `log.txt`
- **ملفات النظام**: `.DS_Store`, `Thumbs.db`
- **ملفات المحرر**: `.vscode/`, `.idea/`
- **ملفات الإصدار**: `Realees/`, `*.aab`, `*.apk`

### الفوائد:
- ✅ تقليل حجم البناء
- ✅ تسريع عملية البناء
- ✅ تجنب تضارب الملفات
- ✅ تحسين الأداء

## ملاحظات مهمة
- تأكد من أن جميع Ad Unit IDs صحيحة في `utils/admob.ts`
- استخدم Test Ad Unit IDs أثناء التطوير
- تأكد من أن حساب AdMob مفعل ومُعتمد
- ملف `.easignore` يضمن عدم رفع ملفات الموقع مع التطبيق 