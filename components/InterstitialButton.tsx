import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useInterstitialAd } from './InterstitialAd';

interface InterstitialButtonProps {
  title: string;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
  testMode?: boolean;
}

export const InterstitialButton: React.FC<InterstitialButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  testMode = true
}) => {
  const interstitialAd = useInterstitialAd({
    testMode,
    onAdLoaded: () => console.log('Interstitial ad loaded'),
    onAdClosed: () => console.log('Interstitial ad closed')
  });

  const handlePress = () => {
    // عرض الإعلان البيني
    if (interstitialAd.isAdReady()) {
      interstitialAd.showAd();
    }
    
    // تنفيذ الإجراء المطلوب
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={!interstitialAd.isAdReady()}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {interstitialAd.isAdReady() ? title : 'Loading Ad...'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2979FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 