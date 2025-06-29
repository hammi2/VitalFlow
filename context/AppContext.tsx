import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, UserSettings, CompletedActivities } from '../utils/storage';

interface Meal {
  id: string;
  name: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  date: string;
  notes?: string;
}

interface AppContextType {
  user: UserSettings | null;
  completedActivities: CompletedActivities | null;
  meals: Meal[];
  isAuthenticated: boolean;
  updateUser: (user: UserSettings) => Promise<void>;
  markActivityCompleted: (date: string, activity: string, completed: boolean) => Promise<void>;
  addMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  getTodayMeals: () => Meal[];
  getTodayCalories: () => number;
  logout: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [completedActivities, setCompletedActivities] = useState<CompletedActivities | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated

  const loadUserData = async () => {
    try {
      const [userData, activities, mealsData] = await Promise.all([
        storage.getUserSettings(),
        storage.getCompletedActivities(),
        storage.getMeals(),
      ]);

      if (userData) {
        setUser(userData);
      } else {
        // Set default user if none exists
        const defaultUser: UserSettings = {
          name: 'VitalFlow User',
          avatar: undefined,
          notifications: {
            meals: true,
            workouts: true,
            sleep: true,
          },
          defaultTimes: {
            workout: '07:00',
            breakfast: '07:30',
            lunch: '12:30',
            dinner: '19:00',
            bedtime: '22:30',
            wakeup: '06:30',
          },
        };
        await storage.saveUserSettings(defaultUser);
        setUser(defaultUser);
      }
      
      if (activities) {
        setCompletedActivities(activities);
      }

      if (mealsData) {
        setMeals(mealsData);
      } else {
        // Set sample meals if none exist
        const sampleMeals: Meal[] = [
          {
            id: '1',
            name: 'Oatmeal with Berries',
            calories: 320,
            type: 'breakfast',
            time: '08:30',
            date: new Date().toISOString().split('T')[0],
            notes: 'With honey and almonds'
          },
          {
            id: '2',
            name: 'Grilled Chicken Salad',
            calories: 450,
            type: 'lunch',
            time: '13:00',
            date: new Date().toISOString().split('T')[0],
            notes: 'Mixed greens with olive oil'
          },
          {
            id: '3',
            name: 'Salmon with Vegetables',
            calories: 580,
            type: 'dinner',
            time: '19:30',
            date: new Date().toISOString().split('T')[0],
            notes: 'Steamed broccoli and quinoa'
          }
        ];
        await storage.saveMeals(sampleMeals);
        setMeals(sampleMeals);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateUser = async (userData: UserSettings) => {
    try {
      await storage.saveUserSettings(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const markActivityCompleted = async (date: string, activity: string, completed: boolean) => {
    try {
      await storage.markActivityCompleted(date, activity, completed);
      const updatedActivities = await storage.getCompletedActivities();
      setCompletedActivities(updatedActivities);
    } catch (error) {
      console.error('Error marking activity completed:', error);
    }
  };

  const addMeal = async (meal: Meal) => {
    try {
      const updatedMeals = [meal, ...meals];
      await storage.saveMeals(updatedMeals);
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      await storage.saveMeals(updatedMeals);
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const getTodayMeals = () => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter(meal => meal.date === today);
  };

  const getTodayCalories = () => {
    return getTodayMeals().reduce((sum, meal) => sum + meal.calories, 0);
  };

  const logout = async () => {
    try {
      await storage.clearAuthToken();
      setUser(null);
      setCompletedActivities(null);
      setMeals([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const value: AppContextType = {
    user,
    completedActivities,
    meals,
    isAuthenticated,
    updateUser,
    markActivityCompleted,
    addMeal,
    deleteMeal,
    getTodayMeals,
    getTodayCalories,
    logout,
    loadUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 