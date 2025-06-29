import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from './storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  trigger?: Notifications.NotificationTriggerInput;
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create specific channels for different notification types
        await Notifications.setNotificationChannelAsync('meals', {
          name: 'Meal Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00E676',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('workouts', {
          name: 'Workout Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FF5252',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('sleep', {
          name: 'Sleep Reminders',
          importance: Notifications.AndroidImportance.MEDIUM,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2979FF',
          sound: 'default',
        });
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Schedule meal notifications
  async scheduleMealNotifications(): Promise<void> {
    try {
      // Cancel existing meal notifications
      await this.cancelNotificationsByType('meal');

      const meals = await storage.getMeals();
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Get today's meals from the planner
      const planner = await storage.getWeeklyPlan();
      const todayPlan = planner[dayOfWeek] || { meals: [], workouts: [] };

      // Schedule notifications for planned meals
      for (const meal of todayPlan.meals) {
        if (meal.time && meal.name) {
          const [hours, minutes] = meal.time.split(':').map(Number);
          const notificationTime = new Date();
          notificationTime.setHours(hours, minutes, 0, 0);

          // If time has passed today, schedule for tomorrow
          if (notificationTime <= new Date()) {
            notificationTime.setDate(notificationTime.getDate() + 1);
          }

          await this.scheduleNotification({
            id: `meal_${meal.id}_${notificationTime.getTime()}`,
            title: '🍽️ Meal Time!',
            body: `Time for ${meal.name}`,
            data: { type: 'meal', mealId: meal.id, mealName: meal.name },
            trigger: {
              date: notificationTime,
              repeats: false,
            },
          }, 'meals');
        }
      }

      // Schedule notifications for added meals
      for (const meal of meals) {
        const [hours, minutes] = meal.time.split(':').map(Number);
        const notificationTime = new Date();
        notificationTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (notificationTime <= new Date()) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }

        await this.scheduleNotification({
          id: `meal_added_${meal.id}_${notificationTime.getTime()}`,
          title: '🍽️ Meal Reminder',
          body: `Don't forget: ${meal.name}`,
          data: { type: 'meal', mealId: meal.id, mealName: meal.name },
          trigger: {
            date: notificationTime,
            repeats: false,
          },
        }, 'meals');
      }

      console.log('Meal notifications scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule meal notifications:', error);
    }
  }

  // Schedule workout notifications
  async scheduleWorkoutNotifications(): Promise<void> {
    try {
      // Cancel existing workout notifications
      await this.cancelNotificationsByType('workout');

      const planner = await storage.getWeeklyPlan();
      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayPlan = planner[dayOfWeek] || { meals: [], workouts: [] };

      for (const workout of todayPlan.workouts) {
        if (workout.time && workout.name) {
          const [hours, minutes] = workout.time.split(':').map(Number);
          const notificationTime = new Date();
          notificationTime.setHours(hours, minutes, 0, 0);

          // If time has passed today, schedule for tomorrow
          if (notificationTime <= new Date()) {
            notificationTime.setDate(notificationTime.getDate() + 1);
          }

          await this.scheduleNotification({
            id: `workout_${workout.id}_${notificationTime.getTime()}`,
            title: '💪 Workout Time!',
            body: `Time for ${workout.name}`,
            data: { type: 'workout', workoutId: workout.id, workoutName: workout.name },
            trigger: {
              date: notificationTime,
              repeats: false,
            },
          }, 'workouts');
        }
      }

      console.log('Workout notifications scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule workout notifications:', error);
    }
  }

  // Schedule sleep notifications
  async scheduleSleepNotifications(): Promise<void> {
    try {
      // Cancel existing sleep notifications
      await this.cancelNotificationsByType('sleep');

      const sleepSettings = await storage.getSleepSettings();
      if (sleepSettings?.bedtime) {
        const [hours, minutes] = sleepSettings.bedtime.split(':').map(Number);
        const notificationTime = new Date();
        notificationTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (notificationTime <= new Date()) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }

        await this.scheduleNotification({
          id: `sleep_bedtime_${notificationTime.getTime()}`,
          title: '😴 Bedtime Reminder',
          body: 'Time to prepare for sleep',
          data: { type: 'sleep', action: 'bedtime' },
          trigger: {
            date: notificationTime,
            repeats: true,
          },
        }, 'sleep');

        // Wake up notification (8 hours after bedtime)
        const wakeTime = new Date(notificationTime);
        wakeTime.setHours(wakeTime.getHours() + 8);

        await this.scheduleNotification({
          id: `sleep_wakeup_${wakeTime.getTime()}`,
          title: '🌅 Good Morning!',
          body: 'Time to start your day',
          data: { type: 'sleep', action: 'wakeup' },
          trigger: {
            date: wakeTime,
            repeats: true,
          },
        }, 'sleep');
      }

      console.log('Sleep notifications scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule sleep notifications:', error);
    }
  }

  // Schedule daily summary notification
  async scheduleDailySummary(): Promise<void> {
    try {
      const summaryTime = new Date();
      summaryTime.setHours(22, 0, 0, 0); // 10 PM

      // If time has passed today, schedule for tomorrow
      if (summaryTime <= new Date()) {
        summaryTime.setDate(summaryTime.getDate() + 1);
      }

      await this.scheduleNotification({
        id: `daily_summary_${summaryTime.getTime()}`,
        title: '📊 Daily Summary',
        body: 'Check your progress for today',
        data: { type: 'summary' },
        trigger: {
          date: summaryTime,
          repeats: true,
        },
      }, 'default');

      console.log('Daily summary notification scheduled');
    } catch (error) {
      console.error('Failed to schedule daily summary:', error);
    }
  }

  // Schedule all daily notifications
  async scheduleDailyNotifications(): Promise<void> {
    await this.scheduleMealNotifications();
    await this.scheduleWorkoutNotifications();
    await this.scheduleSleepNotifications();
    await this.scheduleDailySummary();
  }

  // Schedule a single notification
  async scheduleNotification(
    notification: NotificationData,
    channelId: string = 'default'
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: notification.trigger,
        identifier: notification.id,
      });

      console.log(`Notification scheduled: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  // Cancel notifications by type
  async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.type === type
      );

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${notificationsToCancel.length} ${type} notifications`);
    } catch (error) {
      console.error(`Failed to cancel ${type} notifications:`, error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Send immediate notification (for testing or urgent alerts)
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }

  // Handle notification received while app is running
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 