import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { ClockPicker } from '../components/ClockPicker';
import { WeeklyPlan } from '../utils/storage';

interface PlannerProps {
  navigation: any;
}



const DAYS = [
  { key: 'monday', label: 'Monday', icon: <Ionicons name="sunny-outline" size={18} color="#2979FF" /> },
  { key: 'tuesday', label: 'Tuesday', icon: <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color="#2979FF" /> },
  { key: 'wednesday', label: 'Wednesday', icon: <Ionicons name="leaf-outline" size={18} color="#2979FF" /> },
  { key: 'thursday', label: 'Thursday', icon: <Ionicons name="cloud-outline" size={18} color="#2979FF" /> },
  { key: 'friday', label: 'Friday', icon: <FontAwesome5 name="coffee" size={16} color="#2979FF" /> },
  { key: 'saturday', label: 'Saturday', icon: <Ionicons name="star-outline" size={18} color="#2979FF" /> },
  { key: 'sunday', label: 'Sunday', icon: <Ionicons name="bed-outline" size={18} color="#2979FF" /> },
];

const WORKOUT_TYPES = [
  { name: 'Cardio', icon: 'heart-outline', color: '#FF5252' },
  { name: 'Strength', icon: 'fitness-outline', color: '#FF9800' },
  { name: 'Yoga', icon: 'body-outline', color: '#4CAF50' },
  { name: 'HIIT', icon: 'flash-outline', color: '#FF5722' },
  { name: 'Pilates', icon: 'leaf-outline', color: '#8BC34A' },
  { name: 'Rest', icon: 'bed-outline', color: '#9C27B0' },
];

export const Planner: React.FC<PlannerProps> = ({ navigation }) => {
  const { weeklyPlan, loading, updateDayPlan, resetWeeklyPlan } = useWeeklyPlan();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [clockPickerMode, setClockPickerMode] = useState<'workout' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime' | 'wakeup'>('workout');

  const currentDayPlan = weeklyPlan?.[selectedDay];

  const handleUpdateWorkout = (field: 'type' | 'duration' | 'time', value: string | number) => {
    if (!currentDayPlan) return;
    const updatedPlan = {
      ...currentDayPlan,
      workout: {
        ...currentDayPlan.workout,
        [field]: value,
      },
    };
    updateDayPlan(selectedDay, updatedPlan);
  };

  const handleUpdateMeal = (meal: 'breakfast' | 'lunch' | 'dinner', time: string) => {
    if (!currentDayPlan) return;
    const updatedPlan = {
      ...currentDayPlan,
      meals: {
        ...currentDayPlan.meals,
        [meal]: time,
      },
    };
    updateDayPlan(selectedDay, updatedPlan);
  };

  const handleUpdateSleep = (field: 'bedtime' | 'wakeup', time: string) => {
    if (!currentDayPlan) return;
    const updatedPlan = {
      ...currentDayPlan,
      sleep: {
        ...currentDayPlan.sleep,
        [field]: time,
      },
    };
    updateDayPlan(selectedDay, updatedPlan);
  };

  const openClockPicker = (mode: typeof clockPickerMode) => {
    setClockPickerMode(mode);
    setShowClockPicker(true);
  };

  const handleClockPickerChange = (time: string) => {
    switch (clockPickerMode) {
      case 'workout':
        handleUpdateWorkout('time', time);
        break;
      case 'breakfast':
        handleUpdateMeal('breakfast', time);
        break;
      case 'lunch':
        handleUpdateMeal('lunch', time);
        break;
      case 'dinner':
        handleUpdateMeal('dinner', time);
        break;
      case 'bedtime':
        handleUpdateSleep('bedtime', time);
        break;
      case 'wakeup':
        handleUpdateSleep('wakeup', time);
        break;
    }
    setShowClockPicker(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Weekly Plan',
      'Are you sure you want to reset the entire weekly plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetWeeklyPlan },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Planner</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>

      {/* Day Picker Dropdown */}
      <View style={styles.dayPickerWrapper}>
        <View style={styles.dayPickerRow}>
          <View style={styles.dayIcon}>{DAYS.find(d => d.key === selectedDay)?.icon}</View>
          <View style={{ flex: 1 }}>
            <RNPickerSelect
              value={selectedDay}
              onValueChange={setSelectedDay}
              items={DAYS.map(day => ({
                label: day.label,
                value: day.key,
                key: day.key,
                color: '#2979FF',
              }))}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Ionicons name="chevron-down" size={22} color="#2979FF" style={{ marginRight: 8 }} />}
              placeholder={{ label: 'Select Day', value: null }}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentDayPlan && (
          <>
            {/* Workout Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workout</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Workout Details</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.label}>Type:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                    {WORKOUT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.name}
                        style={[
                          styles.typeButton,
                          currentDayPlan.workout.type === type.name && styles.selectedTypeButton,
                        ]}
                        onPress={() => handleUpdateWorkout('type', type.name)}
                        activeOpacity={0.85}
                      >
                        <Ionicons 
                          name={type.icon as any} 
                          size={16} 
                          color={currentDayPlan.workout.type === type.name ? '#FFFFFF' : type.color} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.typeButtonText,
                          currentDayPlan.workout.type === type.name && styles.selectedTypeButtonText,
                        ]}>
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.label}>Duration (min):</Text>
                  <TextInput
                    style={styles.durationInput}
                    value={currentDayPlan.workout.duration.toString()}
                    onChangeText={(text) => handleUpdateWorkout('duration', parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#888888"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="fitness-outline" size={18} color="#2979FF" style={{ marginRight: 8 }} />
                    <Text style={styles.label}>Time:</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeInputButton}
                    onPress={() => openClockPicker('workout')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.timeInputText}>{currentDayPlan.workout.time}</Text>
                    <Ionicons name="time-outline" size={20} color="#2979FF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Meals Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meals</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Meal Times</Text>
                {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                  <View key={meal} style={styles.inputRow}>
                    <View style={styles.labelContainer}>
                      <Ionicons 
                        name={
                          meal === 'breakfast' ? 'sunny-outline' :
                          meal === 'lunch' ? 'restaurant-outline' : 'moon-outline'
                        } 
                        size={18} 
                        color="#2979FF" 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.label}>{meal.charAt(0).toUpperCase() + meal.slice(1)}:</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timeInputButton}
                      onPress={() => openClockPicker(meal)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.timeInputText}>{currentDayPlan.meals[meal]}</Text>
                      <Ionicons name="time-outline" size={20} color="#2979FF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Sleep Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sleep</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sleep Times</Text>
                <View style={styles.inputRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="bed-outline" size={18} color="#2979FF" style={{ marginRight: 8 }} />
                    <Text style={styles.label}>Bedtime:</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeInputButton}
                    onPress={() => openClockPicker('bedtime')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.timeInputText}>{currentDayPlan.sleep.bedtime}</Text>
                    <Ionicons name="time-outline" size={20} color="#2979FF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="sunny-outline" size={18} color="#2979FF" style={{ marginRight: 8 }} />
                    <Text style={styles.label}>Wake up:</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeInputButton}
                    onPress={() => openClockPicker('wakeup')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.timeInputText}>{currentDayPlan.sleep.wakeup}</Text>
                    <Ionicons name="time-outline" size={20} color="#2979FF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Clock Picker Modal */}
      {showClockPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Set {clockPickerMode.charAt(0).toUpperCase() + clockPickerMode.slice(1)} Time
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowClockPicker(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ClockPicker
              value={getCurrentTimeValue()}
              onValueChange={handleClockPickerChange}
            />
          </View>
        </View>
      )}
    </View>
  );

  function getCurrentTimeValue(): string {
    if (!currentDayPlan) return '07:00';
    switch (clockPickerMode) {
      case 'workout':
        return currentDayPlan.workout.time;
      case 'breakfast':
        return currentDayPlan.meals.breakfast;
      case 'lunch':
        return currentDayPlan.meals.lunch;
      case 'dinner':
        return currentDayPlan.meals.dinner;
      case 'bedtime':
        return currentDayPlan.sleep.bedtime;
      case 'wakeup':
        return currentDayPlan.sleep.wakeup;
      default:
        return '07:00';
    }
  }
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5252',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayPickerWrapper: {
    marginHorizontal: 20,
    marginBottom: 18,
    marginTop: 2,
    zIndex: 10,
  },
  dayPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#23272F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2979FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 18,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#23272F',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C4DFF',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '600',
    minWidth: 90,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 90,
  },
  typeScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 4,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#23272F',
    borderWidth: 1,
    borderColor: '#444444',
    marginRight: 8,
    marginBottom: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
  },
  typeButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  durationInput: {
    backgroundColor: '#23272F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    color: '#FFFFFF',
    fontSize: 18,
    minWidth: 70,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#444444',
    fontWeight: '600',
  },
  timeInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2979FF',
    minWidth: 90,
    justifyContent: 'center',
  },
  timeInputText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2979FF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#23272F',
    color: '#2979FF',
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#2979FF',
    marginBottom: 2,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#23272F',
    color: '#2979FF',
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#2979FF',
    marginBottom: 2,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    top: 18,
    right: 12,
  },
}); 