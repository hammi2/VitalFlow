import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useInterstitialAd } from './InterstitialAd';

export const TestInterstitialButton: React.FC = () => {
  const interstitialAd = useInterstitialAd({
    testMode: true,
    onAdLoaded: () => console.log('✅ Interstitial ad loaded'),
    onAdFailedToLoad: (error) => console.log('❌ Interstitial ad failed:', error),
    onAdClosed: () => console.log('🔒 Interstitial ad closed')
  });

  const handleShowAd = () => {
    console.log('🎯 Attempting to show interstitial ad...');
    console.log('📊 Ad ready:', interstitialAd.isAdReady());
    console.log('📊 Ad loaded:', interstitialAd.isLoaded);
    console.log('📊 Ad loading:', interstitialAd.isLoading);
    
    if (interstitialAd.isAdReady()) {
      console.log('✅ Showing interstitial ad...');
      interstitialAd.showAd();
    } else {
      console.log('⏳ Ad not ready, loading...');
      interstitialAd.loadAd();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          !interstitialAd.isAdReady() && styles.buttonDisabled
        ]}
        onPress={handleShowAd}
        disabled={!interstitialAd.isAdReady()}
      >
        <Text style={styles.buttonText}>
          {interstitialAd.isLoading ? 'Loading Ad...' : 
           interstitialAd.isAdReady() ? 'Show Interstitial Ad' : 
           'Ad Not Ready'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {interstitialAd.isLoading ? 'Loading' : 
                  interstitialAd.isAdReady() ? 'Ready' : 'Not Ready'}
        </Text>
        <Text style={styles.statusText}>
          Ad Unit ID: {interstitialAd.adUnitId}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
}); 