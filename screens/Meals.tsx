import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  TextInput,
  Alert,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { storage, Meal } from '../utils/storage';
import { notificationService } from '../utils/notifications';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: '#FF9800' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline', color: '#4CAF50' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline', color: '#2196F3' },
  { key: 'snack', label: 'Snack', icon: 'cafe-outline', color: '#9C27B0' },
];

// Global variable to share meals data
let globalMeals: Meal[] = [];

export const Meals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editMealName, setEditMealName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSelectedMealType, setEditSelectedMealType] = useState<string>('breakfast');
  const [editSelectedTime, setEditSelectedTime] = useState('12:00');
  const [editShowTimePicker, setEditShowTimePicker] = useState(false);
  const [editSelectedDate, setEditSelectedDate] = useState(new Date());

  // Load meals from storage
  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const savedMeals = await storage.getMeals();
      if (savedMeals) {
        // Sort meals by time
        const sortedMeals = savedMeals.sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.time}`);
          const timeB = new Date(`2000-01-01T${b.time}`);
          return timeA.getTime() - timeB.getTime();
        });
        setMeals(sortedMeals);
        globalMeals = sortedMeals;
      } else {
        // Set sample meals if none exist
        const today = new Date().toISOString().split('T')[0];
        const sampleMeals: Meal[] = [
          {
            id: '1',
            name: 'Oatmeal with Berries',
            calories: 320,
            type: 'breakfast',
            time: '08:30',
            date: today,
            notes: 'With honey and almonds'
          },
          {
            id: '2',
            name: 'Grilled Chicken Salad',
            calories: 450,
            type: 'lunch',
            time: '13:00',
            date: today,
            notes: 'Mixed greens with olive oil'
          },
          {
            id: '3',
            name: 'Salmon with Vegetables',
            calories: 580,
            type: 'dinner',
            time: '19:30',
            date: today,
            notes: 'Steamed broccoli and quinoa'
          }
        ];
        await storage.saveMeals(sampleMeals);
        setMeals(sampleMeals);
        globalMeals = sampleMeals;
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const todayMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0]);
  
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = 2000; // Default target
  const remainingCalories = targetCalories - totalCalories;

  const getMealTypeInfo = (type: string) => {
    return MEAL_TYPES.find(mealType => mealType.key === type);
  };

  const handleAddMeal = async () => {
    if (!mealName.trim() || !calories.trim()) {
      Alert.alert('Error', 'Please fill in meal name and calories');
      return;
    }

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      calories: parseInt(calories),
      type: selectedMealType as any,
      time: selectedTime,
      notes: notes.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedMeals = [...meals, newMeal];
    // Sort meals by time
    const sortedMeals = updatedMeals.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.time}`);
      const timeB = new Date(`2000-01-01T${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    setMeals(sortedMeals);
    globalMeals = sortedMeals;
    await storage.saveMeals(sortedMeals);

    // Schedule notification for the new meal
    try {
      await notificationService.scheduleMealNotifications();
    } catch (error) {
      console.error('Failed to schedule meal notification:', error);
    }

    setShowAddMeal(false);
    resetForm();
  };

  const resetForm = () => {
    setMealName('');
    setCalories('');
    setNotes('');
    setSelectedMealType('breakfast');
    setSelectedTime('12:00');
    setSelectedDate(new Date());
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedDate(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  };

  const showTimePickerModal = () => {
    setShowTimePicker(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    setMealToDelete(meal || null);
    setDeleteModalVisible(true);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;
    const updatedMeals = meals.filter(meal => meal.id !== mealToDelete.id);
    // Sort meals by time
    const sortedMeals = updatedMeals.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.time}`);
      const timeB = new Date(`2000-01-01T${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
    setMeals(sortedMeals);
    globalMeals = sortedMeals;
    await storage.saveMeals(sortedMeals);

    // Reschedule notifications after meal deletion
    try {
      await notificationService.scheduleMealNotifications();
    } catch (error) {
      console.error('Failed to reschedule meal notifications:', error);
    }

    setDeleteModalVisible(false);
    setMealToDelete(null);
  };

  const handleMealLongPress = (meal: Meal) => {
    setSelectedMeal(meal);
    setOptionsModalVisible(true);
  };

  const handleEditTimeChange = (event: any, selectedTime?: Date) => {
    setEditShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setEditSelectedTime(`${hours}:${minutes}`);
      setEditSelectedDate(selectedTime);
    }
  };

  const showEditTimePickerModal = () => {
    setEditShowTimePicker(true);
  };

  const handleEditMeal = () => {
    if (selectedMeal) {
      setEditingMeal(selectedMeal);
      setEditMealName(selectedMeal.name);
      setEditCalories(selectedMeal.calories.toString());
      setEditNotes(selectedMeal.notes || '');
      setEditSelectedMealType(selectedMeal.type);
      setEditSelectedTime(selectedMeal.time);
      // Parse the time string to set the date for time picker
      const [hours, minutes] = selectedMeal.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setEditSelectedDate(date);
    }
    setOptionsModalVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMeal || !editMealName.trim() || !editCalories.trim()) {
      Alert.alert('Error', 'Please fill in meal name and calories');
      return;
    }

    const updatedMeal: Meal = {
      ...editingMeal,
      name: editMealName.trim(),
      calories: parseInt(editCalories),
      type: editSelectedMealType as any,
      time: editSelectedTime,
      notes: editNotes.trim() || undefined
    };

    const updatedMeals = meals.map(meal => 
      meal.id === editingMeal.id ? updatedMeal : meal
    );
    
    // Sort meals by time
    const sortedMeals = updatedMeals.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.time}`);
      const timeB = new Date(`2000-01-01T${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    setMeals(sortedMeals);
    globalMeals = sortedMeals;
    await storage.saveMeals(sortedMeals);

    // Schedule notification for the updated meal
    try {
      await notificationService.scheduleMealNotifications();
    } catch (error) {
      console.error('Failed to schedule meal notification:', error);
    }

    setEditModalVisible(false);
    setEditingMeal(null);
    resetEditForm();
  };

  const resetEditForm = () => {
    setEditMealName('');
    setEditCalories('');
    setEditNotes('');
    setEditSelectedMealType('breakfast');
    setEditSelectedTime('12:00');
  };

  const handleDeleteMealOption = () => {
    setOptionsModalVisible(false);
    if (selectedMeal) {
      setMealToDelete(selectedMeal);
      setDeleteModalVisible(true);
    }
  };

  const renderMealItem = ({ item }: { item: Meal }) => {
    const mealTypeInfo = getMealTypeInfo(item.type);
    return (
      <TouchableOpacity
        onLongPress={() => handleMealLongPress(item)}
        activeOpacity={0.9}
        style={styles.mealItem}
      >
        <View style={styles.mealHeader}>
          <View style={styles.mealTypeContainer}>
            <View style={[styles.mealTypeIcon, { backgroundColor: mealTypeInfo?.color }]}> 
              <Ionicons name={mealTypeInfo?.icon as any} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.mealTypeText}>{mealTypeInfo?.label}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#888888" style={styles.timeIcon} />
            <Text style={styles.mealTime}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.mealName}>{item.name}</Text>
        <View style={styles.mealFooter}>
          <View style={styles.caloriesContainer}>
            <Ionicons name="flame-outline" size={16} color="#00E676" style={styles.caloriesIcon} />
            <Text style={styles.mealCalories}>{item.calories} cal</Text>
          </View>
          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="chatbubble-outline" size={14} color="#888888" style={styles.notesIcon} />
              <Text style={styles.mealNotes}>{item.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddMeal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Calories Summary */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesTitle}>Today's Calories</Text>
        <View style={styles.caloriesRow}>
          <View style={styles.caloriesItem}>
            <Text style={styles.caloriesNumber}>{totalCalories}</Text>
            <Text style={styles.caloriesLabel}>Consumed</Text>
          </View>
          <View style={styles.caloriesDivider} />
          <View style={styles.caloriesItem}>
            <Text style={styles.caloriesNumber}>{targetCalories}</Text>
            <Text style={styles.caloriesLabel}>Target</Text>
          </View>
          <View style={styles.caloriesDivider} />
          <View style={styles.caloriesItem}>
            <Text style={[
              styles.caloriesNumber,
              { color: remainingCalories >= 0 ? '#00E676' : '#FF5252' }
            ]}>
              {remainingCalories}
            </Text>
            <Text style={styles.caloriesLabel}>Remaining</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%`,
                backgroundColor: totalCalories > targetCalories ? '#FF5252' : '#00E676'
              }
            ]} 
          />
        </View>
      </View>

      {/* Meals List */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {todayMeals.length > 0 ? (
          <FlatList
            data={todayMeals}
            renderItem={renderMealItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mealsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#888888" />
            <Text style={styles.emptyTitle}>No Meals Today</Text>
            <Text style={styles.emptyText}>
              Add your first meal to start tracking your nutrition.
            </Text>
          </View>
        )}
      </View>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMeal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddMeal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Meal</Text>
              <TouchableOpacity onPress={handleAddMeal}>
                <Text style={styles.confirmButton}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Meal Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meal Type</Text>
                <View style={styles.mealTypeButtons}>
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.mealTypeButton,
                        selectedMealType === type.key && styles.mealTypeButtonActive
                      ]}
                      onPress={() => setSelectedMealType(type.key)}
                    >
                      <Ionicons 
                        name={type.icon as any} 
                        size={20} 
                        color={selectedMealType === type.key ? '#FFFFFF' : type.color} 
                      />
                      <Text style={[
                        styles.mealTypeButtonText,
                        selectedMealType === type.key && styles.mealTypeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Meal Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meal Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={mealName}
                  onChangeText={setMealName}
                  placeholder="Enter meal name"
                  placeholderTextColor="#888888"
                />
              </View>

              {/* Calories */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.textInput}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="Enter calories"
                  placeholderTextColor="#888888"
                  keyboardType="numeric"
                />
              </View>

              {/* Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={showTimePickerModal}
                >
                  <Ionicons name="time-outline" size={20} color="#888888" />
                  <Text style={styles.timePickerText}>{selectedTime}</Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about your meal"
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="trash-outline" size={40} color="#FF5252" style={{ marginBottom: 16 }} />
            <Text style={styles.deleteModalTitle}>Delete Meal</Text>
            <Text style={styles.deleteModalText}>Are you sure you want to delete this meal?</Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity style={styles.deleteModalCancel} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteModalDelete} onPress={confirmDeleteMeal}>
                <Text style={styles.deleteModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Options Bottom Sheet Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.optionsModalOverlay}>
          <View style={styles.optionsModalContent}>
            <View style={styles.optionsHandle} />
            <TouchableOpacity style={styles.optionsItem} onPress={handleEditMeal}>
              <Ionicons name="create-outline" size={22} color="#2979FF" style={styles.optionsIcon} />
              <Text style={styles.optionsText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsItem} onPress={handleDeleteMealOption}>
              <Ionicons name="trash-outline" size={22} color="#FF5252" style={styles.optionsIcon} />
              <Text style={[styles.optionsText, { color: '#FF5252' }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsCancelItem} onPress={() => setOptionsModalVisible(false)}>
              <Ionicons name="close-outline" size={22} color="#888888" style={styles.optionsIcon} />
              <Text style={[styles.optionsText, { color: '#888888' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Meal</Text>
              <TouchableOpacity onPress={handleSaveEdit}>
                <Text style={styles.confirmButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Meal Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meal Type</Text>
                <View style={styles.mealTypeButtons}>
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.mealTypeButton,
                        editSelectedMealType === type.key && styles.mealTypeButtonActive
                      ]}
                      onPress={() => setEditSelectedMealType(type.key)}
                    >
                      <Ionicons 
                        name={type.icon as any} 
                        size={20} 
                        color={editSelectedMealType === type.key ? '#FFFFFF' : type.color} 
                      />
                      <Text style={[
                        styles.mealTypeButtonText,
                        editSelectedMealType === type.key && styles.mealTypeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Meal Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meal Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editMealName}
                  onChangeText={setEditMealName}
                  placeholder="Enter meal name"
                  placeholderTextColor="#888888"
                />
              </View>

              {/* Calories */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.textInput}
                  value={editCalories}
                  onChangeText={setEditCalories}
                  placeholder="Enter calories"
                  placeholderTextColor="#888888"
                  keyboardType="numeric"
                />
              </View>

              {/* Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={showEditTimePickerModal}
                >
                  <Ionicons name="time-outline" size={20} color="#888888" />
                  <Text style={styles.timePickerText}>{editSelectedTime}</Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add any notes about your meal"
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker for Edit Modal */}
      {editShowTimePicker && (
        <DateTimePicker
          value={editSelectedDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleEditTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesCard: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  caloriesItem: {
    alignItems: 'center',
    flex: 1,
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
  caloriesDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mealsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  mealsList: {
    paddingBottom: 20,
  },
  mealItem: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
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
  mealTypeText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  mealTime: {
    fontSize: 14,
    color: '#888888',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00E676',
  },
  mealNotes: {
    fontSize: 14,
    color: '#888888',
    flex: 1,
    marginLeft: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  confirmButton: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  mealTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 8,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesIcon: {
    marginRight: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesIcon: {
    marginRight: 8,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  timePickerText: {
    fontSize: 16,
    color: '#888888',
    marginHorizontal: 8,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#1E1E1E',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    padding: 28,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5252',
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  deleteModalCancel: {
    flex: 1,
    backgroundColor: '#23272F',
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalDelete: {
    flex: 1,
    backgroundColor: '#FF5252',
    paddingVertical: 14,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteModalDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  optionsModalContent: {
    backgroundColor: '#23272F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  optionsHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginBottom: 18,
  },
  optionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionsIcon: {
    marginRight: 16,
  },
  optionsText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  optionsCancelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
}); 