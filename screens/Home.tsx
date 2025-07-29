import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { storage, Meal } from '../utils/storage';
import { BannerAd } from '../components/BannerAd';
import { TestInterstitialButton } from '../components/TestInterstitialButton';

interface HomeProps {
  navigation: any;
}

export const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { user, completedActivities, markActivityCompleted } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [todayPlan, setTodayPlan] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    loadData();
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      const [plan, meals] = await Promise.all([
        storage.getWeeklyPlan(),
        storage.getMeals(),
      ]);

      console.log('Plan:', plan);
      console.log('Meals:', meals);

      const today = new Date().toISOString().split('T')[0];
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      console.log('Today:', today);
      console.log('Day of week:', dayOfWeek);
      
      if (plan && plan[dayOfWeek]) {
        setTodayPlan(plan[dayOfWeek]);
      }

      if (meals) {
        const todayMealsData = meals.filter(meal => meal.date === today);
        setTodayMeals(todayMealsData);
        setTodayCalories(todayMealsData.reduce((sum, meal) => sum + meal.calories, 0));
      } else {
        // Set empty arrays if no meals data
        setTodayMeals([]);
        setTodayCalories(0);
      }

      console.log('Setting loading to false');
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setTodayMeals([]);
      setTodayCalories(0);
      setTodayPlan(null);
      setLoading(false);
    }
  };

  const getCompletedStatus = (activity: string) => {
    if (!completedActivities) return false;
    const todayDate = new Date().toISOString().split('T')[0];
    const todayActivities = completedActivities[todayDate];
    return todayActivities ? todayActivities[activity as keyof typeof todayActivities] : false;
  };

  const handleToggleActivity = async (activity: string, completed: boolean) => {
    const todayDate = new Date().toISOString().split('T')[0];
    await markActivityCompleted(todayDate, activity, completed);
  };

  const handleStartWorkout = () => {
    navigation.navigate('Workout');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getProgressPercentage = () => {
    if (!todayPlan) return 0;
    
    const activities = [];
    if (todayPlan.workout) activities.push('workout');
    if (todayPlan.meals) {
      activities.push('breakfast', 'lunch', 'dinner');
    }
    if (todayPlan.sleep) activities.push('sleep');
    
    if (activities.length === 0) return 0;
    
    const completed = activities.filter(activity => getCompletedStatus(activity)).length;
    return (completed / activities.length) * 100;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(getProgressPercentage())}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgressPercentage()}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {(() => {
            if (!todayPlan) return 'No plan for today';
            const activities = [];
            if (todayPlan.workout) activities.push('workout');
            if (todayPlan.meals) {
              activities.push('breakfast', 'lunch', 'dinner');
            }
            if (todayPlan.sleep) activities.push('sleep');
            
            if (activities.length === 0) return 'No activities planned';
            
            const completed = activities.filter(activity => getCompletedStatus(activity)).length;
            return `${completed}/${activities.length} activities completed`;
          })()}
        </Text>
      </View>

      {/* Calories Summary */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesTitle}>Today's Calories</Text>
        <View style={styles.caloriesRow}>
          <View style={styles.caloriesItem}>
            <Text style={styles.caloriesNumber}>{todayCalories}</Text>
            <Text style={styles.caloriesLabel}>Consumed</Text>
          </View>
          <View style={styles.caloriesDivider} />
          <View style={styles.caloriesItem}>
            <Text style={styles.caloriesNumber}>2000</Text>
            <Text style={styles.caloriesLabel}>Target</Text>
          </View>
          <View style={styles.caloriesDivider} />
          <View style={styles.caloriesItem}>
            <Text style={[
              styles.caloriesNumber,
              { color: (2000 - todayCalories) >= 0 ? '#00E676' : '#FF5252' }
            ]}>
              {2000 - todayCalories}
            </Text>
            <Text style={styles.caloriesLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* Banner Ad */}
      <View style={styles.bannerContainer}>
        <BannerAd position="bottom" testMode={true} />
      </View>

      {/* Test Interstitial Button */}
      <TestInterstitialButton />

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Planner')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2979FF' }]}>
              <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Planner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Workout')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF5252' }]}>
              <Ionicons name="fitness-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Meals')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#00E676' }]}>
              <Ionicons name="restaurant-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Meals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Sleep')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#7C4DFF' }]}>
              <Ionicons name="bed-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Sleep</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Meals */}
      {todayMeals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Meals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {todayMeals
            .sort((a, b) => {
              const timeA = new Date(`2000-01-01T${a.time}`);
              const timeB = new Date(`2000-01-01T${b.time}`);
              return timeA.getTime() - timeB.getTime();
            })
            .slice(0, 3)
            .map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealHeader}>
                <View style={styles.mealLeft}>
                  <View style={[
                    styles.mealTypeIcon,
                    {
                      backgroundColor: 
                        meal.type === 'breakfast' ? '#FF9800' :
                        meal.type === 'lunch' ? '#4CAF50' :
                        meal.type === 'dinner' ? '#2196F3' : '#9C27B0'
                    }
                  ]}>
                    <Ionicons 
                      name={
                        meal.type === 'breakfast' ? 'sunny-outline' :
                        meal.type === 'lunch' ? 'restaurant-outline' :
                        meal.type === 'dinner' ? 'moon-outline' : 'cafe-outline'
                      } 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <View style={styles.mealTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#888888" />
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
              </View>
              <View style={styles.mealFooter}>
                <Text style={styles.mealType}>{meal.type}</Text>
                <View style={styles.caloriesContainer}>
                  <Ionicons name="flame-outline" size={14} color="#00E676" />
                  <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Today's Plan */}
      {todayPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          
          {/* Workout */}
          {todayPlan.workout && (
            <View style={styles.planItem}>
              <View style={styles.planHeader}>
                <View style={styles.planLeft}>
                  <View style={[styles.planTypeIcon, { backgroundColor: '#FF5252' }]}> 
                    <Ionicons name="fitness-outline" size={16} color="#fff" />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      getCompletedStatus('workout') && styles.checkboxChecked
                    ]}
                    onPress={() => handleToggleActivity('workout', !getCompletedStatus('workout'))}
                    activeOpacity={0.7}
                  >
                    {getCompletedStatus('workout') && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <Text style={[
                    styles.planTitle,
                    getCompletedStatus('workout') && styles.planTitleCompleted
                  ]}>Workout</Text>
                </View>
                <Text style={styles.planTime}>{todayPlan.workout.time}</Text>
              </View>
              <Text style={[
                styles.planDetails,
                getCompletedStatus('workout') && styles.planDetailsCompleted
              ]}>
                {todayPlan.workout.type} - {todayPlan.workout.duration} minutes
              </Text>
            </View>
          )}

          {/* Meals */}
          {todayPlan.meals && (
            <>
              {/* Breakfast */}
              <View style={styles.planItem}>
                <View style={styles.planHeader}>
                  <View style={styles.planLeft}>
                    <View style={[styles.planTypeIcon, { backgroundColor: '#FF9800' }]}> 
                      <Ionicons name="sunny-outline" size={16} color="#fff" />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        getCompletedStatus('breakfast') && styles.checkboxChecked
                      ]}
                      onPress={() => handleToggleActivity('breakfast', !getCompletedStatus('breakfast'))}
                      activeOpacity={0.7}
                    >
                      {getCompletedStatus('breakfast') && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <Text style={[
                      styles.planTitle,
                      getCompletedStatus('breakfast') && styles.planTitleCompleted
                    ]}>Breakfast</Text>
                  </View>
                  <Text style={styles.planTime}>{todayPlan.meals.breakfast}</Text>
                </View>
              </View>
              {/* Lunch */}
              <View style={styles.planItem}>
                <View style={styles.planHeader}>
                  <View style={styles.planLeft}>
                    <View style={[styles.planTypeIcon, { backgroundColor: '#4CAF50' }]}> 
                      <Ionicons name="restaurant-outline" size={16} color="#fff" />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        getCompletedStatus('lunch') && styles.checkboxChecked
                      ]}
                      onPress={() => handleToggleActivity('lunch', !getCompletedStatus('lunch'))}
                      activeOpacity={0.7}
                    >
                      {getCompletedStatus('lunch') && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <Text style={[
                      styles.planTitle,
                      getCompletedStatus('lunch') && styles.planTitleCompleted
                    ]}>Lunch</Text>
                  </View>
                  <Text style={styles.planTime}>{todayPlan.meals.lunch}</Text>
                </View>
              </View>
              {/* Dinner */}
              <View style={styles.planItem}>
                <View style={styles.planHeader}>
                  <View style={styles.planLeft}>
                    <View style={[styles.planTypeIcon, { backgroundColor: '#2196F3' }]}> 
                      <Ionicons name="moon-outline" size={16} color="#fff" />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        getCompletedStatus('dinner') && styles.checkboxChecked
                      ]}
                      onPress={() => handleToggleActivity('dinner', !getCompletedStatus('dinner'))}
                      activeOpacity={0.7}
                    >
                      {getCompletedStatus('dinner') && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <Text style={[
                      styles.planTitle,
                      getCompletedStatus('dinner') && styles.planTitleCompleted
                    ]}>Dinner</Text>
                  </View>
                  <Text style={styles.planTime}>{todayPlan.meals.dinner}</Text>
                </View>
              </View>
            </>
          )}

          {/* Sleep */}
          {todayPlan.sleep && (
            <View style={styles.planItem}>
              <View style={styles.planHeader}>
                <View style={styles.planLeft}>
                  <View style={[styles.planTypeIcon, { backgroundColor: '#7C4DFF' }]}> 
                    <Ionicons name="bed-outline" size={16} color="#fff" />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      getCompletedStatus('sleep') && styles.checkboxChecked
                    ]}
                    onPress={() => handleToggleActivity('sleep', !getCompletedStatus('sleep'))}
                    activeOpacity={0.7}
                  >
                    {getCompletedStatus('sleep') && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <Text style={[
                    styles.planTitle,
                    getCompletedStatus('sleep') && styles.planTitleCompleted
                  ]}>Sleep</Text>
                </View>
                <Text style={styles.planTime}>{todayPlan.sleep.bedtime} - {todayPlan.sleep.wakeup}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Empty State */}
      {!todayPlan && todayMeals.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#888888" />
          <Text style={styles.emptyTitle}>No Plan for Today</Text>
          <Text style={styles.emptyText}>
            Set up your weekly plan to get started with your health journey.
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => navigation.navigate('Planner')}
          >
            <Text style={styles.setupButtonText}>Set Up Plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#888888',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E676',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 4,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: '#2979FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  caloriesCard: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesItem: {
    alignItems: 'center',
  },
  caloriesDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#333333',
  },
  caloriesNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#888888',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2979FF',
    fontWeight: '600',
  },
  mealItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mealTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTime: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCalories: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600',
    marginLeft: 4,
  },
  mealType: {
    fontSize: 14,
    color: '#888888',
    textTransform: 'capitalize',
  },
  planItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#888888',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: '#888888',
    fontWeight: '400',
  },
  planTime: {
    fontSize: 14,
    color: '#888888',
  },
  planDetails: {
    fontSize: 14,
    color: '#888888',
  },
  planDetailsCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: '#666666',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  planTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bannerContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 