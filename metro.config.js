const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for react-native-google-mobile-ads
config.resolver.assetExts.push('bin');

module.exports = config; 