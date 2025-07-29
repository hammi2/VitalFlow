# VitalFlow - تطبيق اللياقة البدنية

## 📱 تطبيق React Native مع Expo

تطبيق شامل لللياقة البدنية يتضمن:
- تتبع التمارين والوجبات
- مؤقت التمارين
- إعدادات النوم
- إشعارات ذكية
- إعلانات Google AdMob

## 🚀 البناء والتشغيل

### المتطلبات
- Node.js 18+
- Expo CLI
- EAS CLI

### التثبيت
```bash
# تثبيت التبعيات
yarn install

# تشغيل التطبيق
yarn start
```

### البناء
```bash
# بناء للتطوير
eas build --platform android --profile development

# بناء للإنتاج
eas build --platform android --profile production
```

## 📁 هيكل المشروع

### ملفات التكوين المهمة:
- `app.config.js` - إعدادات التطبيق
- `metro.config.js` - إعدادات Metro
- `babel.config.js` - إعدادات Babel
- `eas.json` - إعدادات EAS Build
- `.easignore` - استبعاد ملفات من البناء

### المجلدات الرئيسية:
- `components/` - مكونات React Native
- `screens/` - شاشات التطبيق
- `utils/` - أدوات مساعدة
- `assets/` - الصور والأيقونات

## 🔧 إعدادات AdMob

تم تكوين Google AdMob بشكل صحيح:
- App ID: `ca-app-pub-5483967054440200~9266862724`
- ملف `.easignore` يضمن عدم تضارب ملفات الموقع

## 📋 ملف .easignore

تم إنشاء ملف `.easignore` لتحسين عملية البناء:

### الملفات المستبعدة:
- ملفات الموقع (`public/`, `docs/`)
- ملفات البناء (`dist/`, `build/`)
- ملفات التطوير (`*.log`, `log.txt`)
- ملفات النظام (`.DS_Store`, `Thumbs.db`)

### الفوائد:
- ✅ تقليل حجم البناء
- ✅ تسريع العملية
- ✅ تجنب تضارب الملفات

## 🐛 استكشاف الأخطاء

إذا واجهت مشاكل في البناء:
1. راجع ملف `BUILD_FIX.md`
2. نظف الكاش: `npx expo install --fix`
3. أعد البناء: `eas build --clear-cache`

## 📄 الترخيص

هذا المشروع مملوك لـ React Gamal 