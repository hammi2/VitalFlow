import React, { useEffect, useState } from 'react';
import { getAdUnitId } from '../utils/admob';

interface RewardedAdProps {
  testMode?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
  onAdClosed?: () => void;
  onRewarded?: (reward: { type: string; amount: number }) => void;
}

export const useRewardedAd = ({
  testMode = false,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClosed,
  onRewarded
}: RewardedAdProps = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const adUnitId = getAdUnitId('REWARDED', testMode);

  const loadAd = () => {
    setIsLoading(true);
    console.log('Loading rewarded ad with ID:', adUnitId);
    
    // محاكاة تحميل الإعلان
    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
      onAdLoaded?.();
      console.log('Rewarded ad loaded successfully');
    }, 3000);
  };

  const showAd = () => {
    if (!isLoaded) {
      console.log('Ad not loaded yet');
      return false;
    }

    setIsWatching(true);
    console.log('Showing rewarded ad...');
    
    // محاكاة مشاهدة الإعلان
    setTimeout(() => {
      setIsWatching(false);
      setIsLoaded(false);
      
      // محاكاة المكافأة
      const reward = {
        type: 'coins',
        amount: 10
      };
      
      onRewarded?.(reward);
      onAdClosed?.();
      console.log('Rewarded ad completed, reward:', reward);
    }, 5000);

    return true;
  };

  const isAdReady = () => {
    return isLoaded && !isWatching;
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
    isWatching,
    adUnitId
  };
};

// مكون لعرض زر مشاهدة إعلان الفيديو
interface RewardedAdButtonProps {
  onPress: () => void;
  isReady: boolean;
  isLoading: boolean;
  isWatching: boolean;
  rewardAmount?: number;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  onPress,
  isReady,
  isLoading,
  isWatching,
  rewardAmount = 10
}) => {
  const getButtonText = () => {
    if (isWatching) return 'مشاهدة الإعلان...';
    if (isLoading) return 'تحميل الإعلان...';
    if (isReady) return `شاهد إعلان واحصل على ${rewardAmount} عملة`;
    return 'تحميل الإعلان...';
  };

  const getButtonStyle = () => {
    if (isWatching || isLoading) {
      return { backgroundColor: '#ccc', opacity: 0.7 };
    }
    if (isReady) {
      return { backgroundColor: '#4CAF50' };
    }
    return { backgroundColor: '#ccc' };
  };

  return (
    <button
      onClick={onPress}
      disabled={!isReady || isLoading || isWatching}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        cursor: isReady && !isLoading && !isWatching ? 'pointer' : 'not-allowed',
        ...getButtonStyle()
      }}
    >
      {getButtonText()}
    </button>
  );
}; 