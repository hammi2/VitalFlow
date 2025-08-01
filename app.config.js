export default {
  expo: {
    name: "VitalFlow",
    slug: "VitalFlow",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/fitness-logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMobileAdsAppId: "ca-app-pub-5483967054440200~9266862724"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/fitness-logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.reactgamal.VitalFlow",
      config: {
        googleMobileAdsAppId: "ca-app-pub-5483967054440200~9266862724"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-sqlite",
      [
        "react-native-google-mobile-ads",
        {
          android: {
            appId: "ca-app-pub-5483967054440200~9266862724"
          },
          ios: {
            appId: "ca-app-pub-5483967054440200~9266862724"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "8bb1ff44-ee27-4579-80ad-7f80daa5cc9e"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/8bb1ff44-ee27-4579-80ad-7f80daa5cc9e"
    }
  }
}; 