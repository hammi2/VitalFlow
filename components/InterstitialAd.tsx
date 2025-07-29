import React, { useEffect, useState } from 'react';
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../utils/admob';

interface InterstitialAdProps {
  testMode?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
  onAdClosed?: () => void;
}

export const useInterstitialAd = ({
  testMode = false,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClosed
}: InterstitialAdProps = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const adUnitId = getAdUnitId('INTERSTITIAL', testMode);

  const loadAd = () => {
    setIsLoading(true);
    console.log('Loading interstitial ad with ID:', adUnitId);
    
    const newInterstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = newInterstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
      setIsLoading(false);
      setInterstitial(newInterstitial);
      onAdLoaded?.();
      console.log('Interstitial ad loaded successfully');
    });

    const unsubscribeFailed = newInterstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      setIsLoading(false);
      onAdFailedToLoad?.(error?.message || 'Unknown error');
      console.log('Interstitial ad failed to load:', error?.message);
    });

    const unsubscribeClosed = newInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      setInterstitial(null);
      onAdClosed?.();
      console.log('Interstitial ad closed');
      // إعادة تحميل الإعلان للاستخدام التالي
      setTimeout(() => loadAd(), 1000);
    });

    newInterstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeFailed();
      unsubscribeClosed();
    };
  };

  const showAd = () => {
    if (!isLoaded || !interstitial) {
      console.log('Ad not loaded yet or interstitial is null');
      return false;
    }

    console.log('Showing interstitial ad...');
    interstitial.show();
    return true;
  };

  const isAdReady = () => {
    return isLoaded;
  };

  useEffect(() => {
    // تحميل الإعلان عند تهيئة المكون
    loadAd();
  }, []);

  return {
    loadAd,
    showAd,
    isAdReady,
    isLoading,
    isLoaded,
    adUnitId
  };
};

// Hook لاستخدام Interstitial Ad في المكونات
export const useInterstitialAdManager = () => {
  const [ads, setAds] = useState<{ [key: string]: ReturnType<typeof useInterstitialAd> }>({});

  const createAd = (key: string, options?: InterstitialAdProps) => {
    if (!ads[key]) {
      const ad = useInterstitialAd(options);
      setAds(prev => ({ ...prev, [key]: ad }));
      return ad;
    }
    return ads[key];
  };

  const showAd = (key: string) => {
    const ad = ads[key];
    if (ad) {
      return ad.showAd();
    }
    return false;
  };

  const loadAd = (key: string) => {
    const ad = ads[key];
    if (ad) {
      ad.loadAd();
    }
  };

  return {
    createAd,
    showAd,
    loadAd,
    ads
  };
}; 