# دليل إعداد AdMob للوحدات الإعلانية - VitalFlow

## الخطوة 1: إنشاء الوحدات الإعلانية في AdMob

### 1. اذهب إلى AdMob Console
- افتح [AdMob Console](https://admob.google.com)
- اختر تطبيق VitalFlow

### 2. إنشاء الوحدات الإعلانية

#### Banner Ad (إعلان بانر)
1. اذهب إلى **"الوحدات الإعلانية"** (Ad units)
2. اضغط **"إنشاء وحدة إعلانية"** (Create ad unit)
3. اختر **"Banner"**
4. اكتب الاسم: `VitalFlow_Banner`
5. اختر **"أفضل أداء"** (Best performance)
6. احفظ الوحدة

#### Interstitial Ad (إعلان كامل الشاشة)
1. اضغط **"إنشاء وحدة إعلانية"** مرة أخرى
2. اختر **"Interstitial"**
3. اكتب الاسم: `VitalFlow_Interstitial`
4. اختر **"أفضل أداء"**
5. احفظ الوحدة

#### Rewarded Video Ad (إعلان فيديو مكافأة)
1. اضغط **"إنشاء وحدة إعلانية"**
2. اختر **"Rewarded"**
3. اكتب الاسم: `VitalFlow_Rewarded`
4. اختر **"أفضل أداء"**
5. احفظ الوحدة

#### Native Advanced Ad (إعلان أصلي)
1. اضغط **"إنشاء وحدة إعلانية"**
2. اختر **"Native Advanced"**
3. اكتب الاسم: `VitalFlow_Native`
4. اختر **"أفضل أداء"**
5. احفظ الوحدة

## الخطوة 2: الحصول على Ad Unit IDs

### لكل وحدة إعلانية:
1. **اضغط على اسم الوحدة**
2. **انسخ Ad Unit ID** (مثل: ca-app-pub-548396705444200/1234567890)
3. **احتفظ به للخطوة التالية**

## الخطوة 3: تحديث ملف الإعدادات

### افتح ملف `utils/admob.ts` واستبدل:

```typescript
export const ADMOB_CONFIG = {
  // استبدل بـ App ID الحقيقي من AdMob
  APP_ID: 'ca-app-pub-548396705444200~XXXXXXXXXX',
  
  // استبدل بـ Ad Unit IDs الحقيقية
  AD_UNITS: {
    BANNER: 'ca-app-pub-548396705444200/XXXXXXXXXX', // Banner Ad Unit ID
    INTERSTITIAL: 'ca-app-pub-548396705444200/XXXXXXXXXX', // Interstitial Ad Unit ID
    REWARDED: 'ca-app-pub-548396705444200/XXXXXXXXXX', // Rewarded Video Ad Unit ID
    NATIVE: 'ca-app-pub-548396705444200/XXXXXXXXXX', // Native Advanced Ad Unit ID
  },
  
  // اترك Test Ad Unit IDs كما هي للاختبار
  TEST_AD_UNITS: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    NATIVE: 'ca-app-pub-3940256099942544/2247696110',
  }
};
```

## الخطوة 4: استخدام الوحدات الإعلانية في التطبيق

### إضافة Banner Ad:
```typescript
import { BannerAd } from '../components/BannerAd';

// في المكون
<BannerAd position="bottom" testMode={false} />
```

### إضافة Interstitial Ad:
```typescript
import { useInterstitialAd } from '../components/InterstitialAd';

// في المكون
const interstitialAd = useInterstitialAd({
  testMode: false,
  onAdLoaded: () => console.log('Ad loaded'),
  onAdClosed: () => console.log('Ad closed')
});

// عرض الإعلان
interstitialAd.showAd();
```

### إضافة Rewarded Ad:
```typescript
import { useRewardedAd, RewardedAdButton } from '../components/RewardedAd';

// في المكون
const rewardedAd = useRewardedAd({
  testMode: false,
  onRewarded: (reward) => console.log('Reward:', reward)
});

// زر مشاهدة الإعلان
<RewardedAdButton
  onPress={() => rewardedAd.showAd()}
  isReady={rewardedAd.isAdReady()}
  isLoading={rewardedAd.isLoading}
  isWatching={rewardedAd.isWatching}
  rewardAmount={10}
/>
```

## الخطوة 5: اختبار الوحدات الإعلانية

### للاختبار:
1. **استخدم `testMode={true}`** في جميع المكونات
2. **ستظهر إعلانات تجريبية** من Google
3. **تأكد من عمل جميع الأنواع**

### للإنتاج:
1. **استخدم `testMode={false}`**
2. **تأكد من أن AdMob تم مراجعته**
3. **انتظر ظهور الإعلانات الحقيقية**

## ملاحظات مهمة:

1. **لا تستخدم إعلانات حقيقية** حتى يتم مراجعة AdMob
2. **اختبر جميع الأنواع** قبل النشر
3. **احترم سياسات AdMob** في عرض الإعلانات
4. **لا تعرض إعلانات كثيرة** لتجنب تجربة المستخدم السيئة

## الأماكن الموصى بها للإعلانات:

- **Banner**: أسفل الشاشة أو أعلاها
- **Interstitial**: بين الشاشات أو بعد إنجاز مهمة
- **Rewarded**: للحصول على مكافآت أو محتوى إضافي
- **Native**: داخل المحتوى بشكل طبيعي 