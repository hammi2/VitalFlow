import React, { useEffect, useState } from 'react';
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
  const adUnitId = getAdUnitId('INTERSTITIAL', testMode);

  const loadAd = () => {
    setIsLoading(true);
    console.log('Loading interstitial ad with ID:', adUnitId);
    
    // محاكاة تحميل الإعلان
    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
      onAdLoaded?.();
      console.log('Interstitial ad loaded successfully');
    }, 2000);
  };

  const showAd = () => {
    if (!isLoaded) {
      console.log('Ad not loaded yet');
      return false;
    }

    console.log('Showing interstitial ad...');
    
    // محاكاة عرض الإعلان
    setTimeout(() => {
      setIsLoaded(false);
      onAdClosed?.();
      console.log('Interstitial ad closed');
    }, 3000);

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