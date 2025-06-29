import { useState, useEffect, useCallback } from 'react';
import { storage, WeeklyPlan } from '../utils/storage';

export const useWeeklyPlan = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWeeklyPlan = useCallback(async () => {
    try {
      setLoading(true);
      const plan = await storage.getWeeklyPlan();
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWeeklyPlan = useCallback(async (plan: WeeklyPlan) => {
    try {
      await storage.saveWeeklyPlan(plan);
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    }
  }, []);

  const getTodayPlan = useCallback(() => {
    if (!weeklyPlan) return null;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return weeklyPlan[today] || null;
  }, [weeklyPlan]);

  const updateDayPlan = useCallback(async (day: string, plan: WeeklyPlan[string]) => {
    if (!weeklyPlan) return;
    
    const updatedPlan = {
      ...weeklyPlan,
      [day]: plan,
    };
    await saveWeeklyPlan(updatedPlan);
  }, [weeklyPlan, saveWeeklyPlan]);

  const resetWeeklyPlan = useCallback(async () => {
    const defaultPlan: WeeklyPlan = {
      monday: {
        workout: { type: 'Cardio', duration: 30, time: '07:00' },
        meals: { breakfast: '07:30', lunch: '12:30', dinner: '19:00' },
        sleep: { bedtime: '22:30', wakeup: '06:30' },
      },
      tuesday: {
        workout: { type: 'Strength', duration: 45, time: '07:00' },
        meals: { breakfast: '07:30', lunch: '12:30', dinner: '19:00' },
        sleep: { bedtime: '22:30', wakeup: '06:30' },
      },
      wednesday: {
        workout: { type: 'Yoga', duration: 30, time: '07:00' },
        meals: { breakfast: '07:30', lunch: '12:30', dinner: '19:00' },
        sleep: { bedtime: '22:30', wakeup: '06:30' },
      },
      thursday: {
        workout: { type: 'Cardio', duration: 30, time: '07:00' },
        meals: { breakfast: '07:30', lunch: '12:30', dinner: '19:00' },
        sleep: { bedtime: '22:30', wakeup: '06:30' },
      },
      friday: {
        workout: { type: 'Strength', duration: 45, time: '07:00' },
        meals: { breakfast: '07:30', lunch: '12:30', dinner: '19:00' },
        sleep: { bedtime: '22:30', wakeup: '06:30' },
      },
      saturday: {
        workout: { type: 'Rest', duration: 0, time: '08:00' },
        meals: { breakfast: '08:30', lunch: '13:00', dinner: '19:30' },
        sleep: { bedtime: '23:00', wakeup: '07:00' },
      },
      sunday: {
        workout: { type: 'Rest', duration: 0, time: '08:00' },
        meals: { breakfast: '08:30', lunch: '13:00', dinner: '19:30' },
        sleep: { bedtime: '23:00', wakeup: '07:00' },
      },
    };
    
    await saveWeeklyPlan(defaultPlan);
  }, [saveWeeklyPlan]);

  useEffect(() => {
    loadWeeklyPlan();
  }, [loadWeeklyPlan]);

  return {
    weeklyPlan,
    loading,
    getTodayPlan,
    updateDayPlan,
    saveWeeklyPlan,
    resetWeeklyPlan,
    loadWeeklyPlan,
  };
}; 