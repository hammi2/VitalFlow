const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// إضافة دعم للمكتبات الأصلية
config.resolver.assetExts.push('bin');

module.exports = config; 