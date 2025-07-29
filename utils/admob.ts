// AdMob Configuration for VitalFlow
export const ADMOB_CONFIG = {
  // App ID - من AdMob
  APP_ID: 'ca-app-pub-5483967054440200~9266862724',
  
  // Ad Unit IDs - من AdMob
  AD_UNITS: {
    BANNER: 'ca-app-pub-5483967054440200/2846247426', // Banner Ad Unit ID
    INTERSTITIAL: 'ca-app-pub-5483967054440200/7663960843', // Interstitial Ad Unit ID
    REWARDED: 'ca-app-pub-5483967054440200/XXXXXXXXXX', // Rewarded Video Ad Unit ID
    NATIVE: 'ca-app-pub-5483967054440200/XXXXXXXXXX', // Native Advanced Ad Unit ID
  },
  
  // Test Ad Unit IDs (للاختبار فقط)
  TEST_AD_UNITS: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    NATIVE: 'ca-app-pub-3940256099942544/2247696110',
  }
};

// Helper function to get ad unit ID
export const getAdUnitId = (type: keyof typeof ADMOB_CONFIG.AD_UNITS, isTest: boolean = false) => {
  if (isTest) {
    return ADMOB_CONFIG.TEST_AD_UNITS[type];
  }
  return ADMOB_CONFIG.AD_UNITS[type];
};

// AdMob initialization
export const initializeAdMob = () => {
  // سيتم إضافة كود التهيئة هنا
  console.log('AdMob initialized');
};

// Ad loading functions
export const loadBannerAd = () => {
  // سيتم إضافة كود تحميل البانر هنا
  console.log('Loading banner ad...');
};

export const loadInterstitialAd = () => {
  // سيتم إضافة كود تحميل الإعلان الكامل الشاشة هنا
  console.log('Loading interstitial ad...');
};

export const loadRewardedAd = () => {
  // سيتم إضافة كود تحميل إعلان الفيديو هنا
  console.log('Loading rewarded ad...');
};

export const showInterstitialAd = () => {
  // سيتم إضافة كود عرض الإعلان الكامل الشاشة هنا
  console.log('Showing interstitial ad...');
};

export const showRewardedAd = () => {
  // سيتم إضافة كود عرض إعلان الفيديو هنا
  console.log('Showing rewarded ad...');
}; 