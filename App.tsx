import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './context/AppContext';
import { Home } from './screens/Home';
import { Planner } from './screens/Planner';
import { WorkoutTimer } from './screens/WorkoutTimer';
import { Meals } from './screens/Meals';
import { Sleep } from './screens/Sleep';
import { Settings } from './screens/Settings';
import { Notifications } from './screens/Notifications';
import { notificationService } from './utils/notifications';
import { storage } from './utils/storage';
import * as ExpoNotifications from 'expo-notifications';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Split routes to place Timer (Workout) in the center, and remove Sleep from tabs
  const filteredRoutes = state.routes.filter(r => r.name !== 'Sleep');
  const timerIndex = filteredRoutes.findIndex(r => r.name === 'Workout');
  const leftRoutes = filteredRoutes.slice(0, timerIndex);
  const rightRoutes = filteredRoutes.slice(timerIndex + 1);
  const timerRoute = filteredRoutes[timerIndex];

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {/* Left tabs */}
        {leftRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          let labelText = typeof label === 'string' ? label : route.name;
          const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
          let iconName = 'home-outline';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Planner') iconName = 'calendar-outline';
          else if (route.name === 'Meals') iconName = 'restaurant-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName as any} size={22} color={isFocused ? '#2979FF' : '#888'} />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{labelText}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Spacer for center button */}
        <View style={styles.centerSpacer} />

        {/* Right tabs */}
        {rightRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          let labelText = typeof label === 'string' ? label : route.name;
          const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
          let iconName = 'home-outline';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Planner') iconName = 'calendar-outline';
          else if (route.name === 'Meals') iconName = 'restaurant-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName as any} size={22} color={isFocused ? '#2979FF' : '#888'} />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{labelText}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Center Timer (Workout) tab with notch effect */}
      {timerRoute && (() => {
        const { options } = descriptors[timerRoute.key];
        const isFocused = state.index === state.routes.findIndex(r => r.key === timerRoute.key);
        return (
          <TouchableOpacity
            key={timerRoute.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => navigation.navigate(timerRoute.name)}
            style={styles.centerButton}
            activeOpacity={0.85}
          >
            <View style={[styles.centerCircle, isFocused && styles.fabCircleActive]}>
              <Ionicons name="timer-outline" size={28} color={isFocused ? '#fff' : '#2979FF'} />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive, { marginTop: 0 }]}>Timer</Text>
          </TouchableOpacity>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#181A20',
    borderRadius: 32,
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    width: '90%',
    overflow: 'visible',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
  },
  tabLabelActive: {
    color: '#2979FF',
    fontWeight: 'bold',
  },
  centerSpacer: {
    width: 64,
  },
  centerButton: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  centerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#23272F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#181A20',
    shadowColor: '#2979FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  fabCircleActive: {
    backgroundColor: '#2979FF',
    borderColor: '#fff',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Planner" component={Planner} />
      <Tab.Screen name="Workout" component={WorkoutTimer} />
      <Tab.Screen name="Meals" component={Meals} />
      {/* <Tab.Screen name="Sleep" component={Sleep} /> */}
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();

      // Set up notification listeners
      setupNotificationListeners();

      // Schedule daily notifications
      await scheduleDailyNotifications();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotificationListeners = () => {
    // Handle notification received while app is running
    const notificationListener = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // You can handle in-app notification display here
      }
    );

    // Handle notification response (when user taps notification)
    const responseListener = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        handleNotificationResponse(response);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  };

  const handleNotificationResponse = (response: ExpoNotifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    switch (data.type) {
      case 'meal':
        // Navigate to meals screen
        console.log('Navigate to meals for:', data.mealName);
        break;
      case 'workout':
        // Navigate to workout timer
        console.log('Navigate to workout for:', data.workoutName);
        break;
      case 'sleep':
        // Navigate to sleep screen
        console.log('Navigate to sleep screen');
        break;
      case 'summary':
        // Navigate to home screen for daily summary
        console.log('Navigate to home for daily summary');
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  const scheduleDailyNotifications = async () => {
    try {
      // Check if notifications were already scheduled today
      const lastSchedule = await storage.getLastNotificationSchedule();
      const today = new Date().toDateString();
      
      if (lastSchedule !== today) {
        await notificationService.scheduleDailyNotifications();
        await storage.saveLastNotificationSchedule(today);
        console.log('Daily notifications scheduled for today');
      }
    } catch (error) {
      console.error('Error scheduling daily notifications:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Sleep" component={Sleep} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
