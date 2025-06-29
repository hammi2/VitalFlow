import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeeklyPlan {
  [key: string]: {
    workout: {
      type: string;
      duration: number;
      time: string;
    };
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
    sleep: {
      bedtime: string;
      wakeup: string;
    };
  };
}

export interface UserSettings {
  name: string;
  avatar?: string;
  notifications: {
    meals: boolean;
    workouts: boolean;
    sleep: boolean;
  };
  defaultTimes: {
    workout: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    bedtime: string;
    wakeup: string;
  };
}

export interface CompletedActivities {
  [date: string]: {
    workout: boolean;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    sleep: boolean;
  };
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  date: string;
  notes?: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  bedtime: string;
  wakeup: string;
  duration: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

const STORAGE_KEYS = {
  WEEKLY_PLAN: 'vitalflow_weekly_plan',
  USER_SETTINGS: 'vitalflow_user_settings',
  COMPLETED_ACTIVITIES: 'vitalflow_completed_activities',
  AUTH_TOKEN: 'vitalflow_auth_token',
  MEALS: 'vitalflow_meals',
  SLEEP_RECORDS: 'vitalflow_sleep_records',
};

export const storage = {
  // Weekly Plan
  async getWeeklyPlan(): Promise<WeeklyPlan | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting weekly plan:', error);
      return null;
    }
  },

  async saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    }
  },

  // User Settings
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  },

  // Completed Activities
  async getCompletedActivities(): Promise<CompletedActivities | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_ACTIVITIES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting completed activities:', error);
      return null;
    }
  },

  async saveCompletedActivities(activities: CompletedActivities): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_ACTIVITIES, JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving completed activities:', error);
    }
  },

  async markActivityCompleted(date: string, activity: string, completed: boolean): Promise<void> {
    try {
      const activities = await this.getCompletedActivities() || {};
      if (!activities[date]) {
        activities[date] = {
          workout: false,
          breakfast: false,
          lunch: false,
          dinner: false,
          sleep: false,
        };
      }
      activities[date][activity as keyof typeof activities[typeof date]] = completed;
      await this.saveCompletedActivities(activities);
    } catch (error) {
      console.error('Error marking activity completed:', error);
    }
  },

  // Auth Token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  },

  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WEEKLY_PLAN,
        STORAGE_KEYS.USER_SETTINGS,
        STORAGE_KEYS.COMPLETED_ACTIVITIES,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.MEALS,
        STORAGE_KEYS.SLEEP_RECORDS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },

  // Meals
  async getMeals(): Promise<Meal[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting meals:', error);
      return null;
    }
  },

  async saveMeals(meals: Meal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  },

  // Sleep Records
  async getSleepRecords(): Promise<SleepRecord[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting sleep records:', error);
      return null;
    }
  },

  async saveSleepRecords(records: SleepRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving sleep records:', error);
    }
  },

  async getSleepRecord(id: string): Promise<SleepRecord | null> {
    try {
      const records = await this.getSleepRecords() || [];
      const record = records.find(r => r.id === id);
      return record || null;
    } catch (error) {
      console.error('Error getting sleep record:', error);
      return null;
    }
  },

  async saveSleepRecord(record: SleepRecord): Promise<void> {
    try {
      const records = await this.getSleepRecords() || [];
      const updatedRecords = [...records, record];
      await this.saveSleepRecords(updatedRecords);
    } catch (error) {
      console.error('Error saving sleep record:', error);
    }
  },

  async updateSleepRecord(id: string, record: Partial<SleepRecord>): Promise<void> {
    try {
      const records = await this.getSleepRecords() || [];
      const updatedRecords = records.map(r =>
        r.id === id ? { ...r, ...record } : r
      );
      await this.saveSleepRecords(updatedRecords);
    } catch (error) {
      console.error('Error updating sleep record:', error);
    }
  },

  async deleteSleepRecord(id: string): Promise<void> {
    try {
      const records = await this.getSleepRecords() || [];
      const updatedRecords = records.filter(r => r.id !== id);
      await this.saveSleepRecords(updatedRecords);
    } catch (error) {
      console.error('Error deleting sleep record:', error);
    }
  },

  // Sleep settings
  async saveSleepSettings(settings: {
    bedtime?: string;
    wakeTime?: string;
    sleepGoal?: number;
    notifications?: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('sleepSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving sleep settings:', error);
    }
  },

  async getSleepSettings(): Promise<{
    bedtime?: string;
    wakeTime?: string;
    sleepGoal?: number;
    notifications?: boolean;
  } | null> {
    try {
      const settings = await AsyncStorage.getItem('sleepSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting sleep settings:', error);
      return null;
    }
  },

  // Notification settings
  async saveNotificationSettings(settings: {
    globalEnabled: boolean;
    meals: boolean;
    workouts: boolean;
    sleep: boolean;
    dailySummary: boolean;
    sound: boolean;
    vibration: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  },

  async getNotificationSettings(): Promise<{
    globalEnabled: boolean;
    meals: boolean;
    workouts: boolean;
    sleep: boolean;
    dailySummary: boolean;
    sound: boolean;
    vibration: boolean;
  }> {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : {
        globalEnabled: true,
        meals: true,
        workouts: true,
        sleep: true,
        dailySummary: true,
        sound: true,
        vibration: true,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        globalEnabled: true,
        meals: true,
        workouts: true,
        sleep: true,
        dailySummary: true,
        sound: true,
        vibration: true,
      };
    }
  },

  // Last notification schedule date
  async saveLastNotificationSchedule(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem('lastNotificationSchedule', date);
    } catch (error) {
      console.error('Error saving last notification schedule:', error);
    }
  },

  async getLastNotificationSchedule(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('lastNotificationSchedule');
    } catch (error) {
      console.error('Error getting last notification schedule:', error);
      return null;
    }
  },
}; 