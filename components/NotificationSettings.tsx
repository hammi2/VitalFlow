import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { notificationService } from '../utils/notifications';

interface NotificationSettingsProps {
  onBack: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    // Global settings
    globalEnabled: true,
    sound: true,
    vibration: true,
    
    // Individual type settings
    meals: true,
    workouts: true,
    sleep: true,
    dailySummary: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storage.getNotificationSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storage.saveNotificationSettings(newSettings);

    // Update notifications based on setting
    await updateNotifications(newSettings);
  };

  const updateNotifications = async (newSettings: typeof settings) => {
    try {
      // If global notifications are disabled, cancel all
      if (!newSettings.globalEnabled) {
        await notificationService.cancelAllNotifications();
        Alert.alert('Success', 'All notifications have been disabled');
        return;
      }

      // Update individual notification types
      if (newSettings.meals) {
        await notificationService.scheduleMealNotifications();
      } else {
        await notificationService.cancelNotificationsByType('meal');
      }

      if (newSettings.workouts) {
        await notificationService.scheduleWorkoutNotifications();
      } else {
        await notificationService.cancelNotificationsByType('workout');
      }

      if (newSettings.sleep) {
        await notificationService.scheduleSleepNotifications();
      } else {
        await notificationService.cancelNotificationsByType('sleep');
      }

      if (newSettings.dailySummary) {
        await notificationService.scheduleDailySummary();
      } else {
        await notificationService.cancelNotificationsByType('summary');
      }

      Alert.alert('Success', 'Notification settings updated successfully!');
    } catch (error) {
      console.error('Error updating notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const testNotification = async () => {
    if (!settings.globalEnabled) {
      Alert.alert('Error', 'Please enable notifications first');
      return;
    }

    try {
      await notificationService.sendImmediateNotification(
        '🔔 Test Notification',
        'This is a test notification from VitalFlow!'
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const resetAllNotifications = async () => {
    Alert.alert(
      'Reset Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.cancelAllNotifications();
              Alert.alert('Success', 'All notifications have been cancelled');
            } catch (error) {
              console.error('Error resetting notifications:', error);
              Alert.alert('Error', 'Failed to reset notifications');
            }
          },
        },
      ]
    );
  };

  const scheduleAllNotifications = async () => {
    try {
      await notificationService.scheduleDailyNotifications();
      Alert.alert('Success', 'All notifications have been scheduled!');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert('Error', 'Failed to schedule notifications');
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    key: keyof typeof settings,
    color: string = '#2979FF',
    disabled: boolean = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>{title}</Text>
          <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: '#333333', true: color }}
        thumbColor={settings[key] ? '#FFFFFF' : '#888888'}
        disabled={disabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Global Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Settings</Text>
          
          {renderSettingItem(
            'notifications-outline',
            'Enable Notifications',
            'Turn on/off all notifications',
            'globalEnabled',
            '#2979FF'
          )}

          {renderSettingItem(
            'volume-high-outline',
            'Sound',
            'Play sound for notifications',
            'sound',
            '#9C27B0',
            !settings.globalEnabled
          )}

          {renderSettingItem(
            'phone-portrait-outline',
            'Vibration',
            'Vibrate for notifications',
            'vibration',
            '#607D8B',
            !settings.globalEnabled
          )}
        </View>

        {/* Individual Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          
          {renderSettingItem(
            'restaurant-outline',
            'Meal Reminders',
            'Get notified about your scheduled meals',
            'meals',
            '#00E676',
            !settings.globalEnabled
          )}

          {renderSettingItem(
            'fitness-outline',
            'Workout Reminders',
            'Get notified about your scheduled workouts',
            'workouts',
            '#FF5252',
            !settings.globalEnabled
          )}

          {renderSettingItem(
            'bed-outline',
            'Sleep Reminders',
            'Get bedtime and wake-up notifications',
            'sleep',
            '#2979FF',
            !settings.globalEnabled
          )}

          {renderSettingItem(
            'stats-chart-outline',
            'Daily Summary',
            'Get a daily summary of your progress',
            'dailySummary',
            '#FF9800',
            !settings.globalEnabled
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={testNotification}>
            <Ionicons name="notifications-outline" size={20} color="#2979FF" />
            <Text style={styles.actionButtonText}>Send Test Notification</Text>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={scheduleAllNotifications}>
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Schedule All Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={resetAllNotifications}>
            <Ionicons name="refresh-outline" size={20} color="#FF5252" />
            <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>
              Reset All Notifications
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#888888" />
          <Text style={styles.infoText}>
            Notifications will work even when the app is closed. Make sure to grant notification permissions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingTitleDisabled: {
    color: '#888888',
  },
  settingDescriptionDisabled: {
    color: '#888888',
  },
}); 