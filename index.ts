import { registerRootComponent } from 'expo';
import mobileAds from 'react-native-google-mobile-ads';

import App from './App';

// تهيئة Google Mobile Ads
mobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('✅ Google Mobile Ads initialized successfully');
    console.log('📊 Adapter statuses:', adapterStatuses);
  })
  .catch(error => {
    console.error('❌ Failed to initialize Google Mobile Ads:', error);
  });

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
