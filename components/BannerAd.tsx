import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as RNBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../utils/admob';

interface BannerAdProps {
  size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE';
  position?: 'top' | 'bottom';
  testMode?: boolean;
}

export const BannerAd: React.FC<BannerAdProps> = ({ 
  size = 'BANNER', 
  position = 'bottom',
  testMode = false 
}) => {
  const adUnitId = getAdUnitId('BANNER', testMode);
  const bannerSize = size === 'BANNER' ? BannerAdSize.BANNER : 
                    size === 'LARGE_BANNER' ? BannerAdSize.LARGE_BANNER : 
                    BannerAdSize.MEDIUM_RECTANGLE;

  return (
    <View style={[
      styles.container, 
      position === 'top' ? styles.topPosition : styles.bottomPosition
    ]}>
      <RNBannerAd
        unitId={testMode ? TestIds.BANNER : adUnitId}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1000,
  },
  adPlaceholder: {
    width: 320,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContent: {
    alignItems: 'center',
  },
  adText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  adUnitId: {
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },
}); 