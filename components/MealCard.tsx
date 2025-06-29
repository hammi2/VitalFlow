import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  completed: boolean;
  onToggleComplete: () => void;
  onEdit?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  time,
  completed,
  onToggleComplete,
  onEdit,
}) => {
  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny-outline';
      case 'lunch':
        return 'restaurant-outline';
      case 'dinner':
        return 'moon-outline';
      default:
        return 'restaurant-outline';
    }
  };

  const getMealColor = () => {
    switch (mealType) {
      case 'breakfast':
        return '#FF9800';
      case 'lunch':
        return '#4CAF50';
      case 'dinner':
        return '#9C27B0';
      default:
        return '#2979FF';
    }
  };

  const getMealTitle = () => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const handleToggle = () => {
    if (completed) {
      Alert.alert(
        'Mark as Incomplete',
        `Are you sure you want to mark ${mealType} as incomplete?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: onToggleComplete },
        ]
      );
    } else {
      onToggleComplete();
    }
  };

  return (
    <View style={[styles.container, completed && styles.completedContainer]}>
      <View style={styles.header}>
        <View style={styles.mealInfo}>
          <View style={[styles.iconContainer, { backgroundColor: getMealColor() }]}>
            <Ionicons name={getMealIcon() as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.mealTitle, completed && styles.completedText]}>
              {getMealTitle()}
            </Text>
            <Text style={[styles.mealTime, completed && styles.completedText]}>
              {time}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.checkButton, completed && styles.checkedButton]}
            onPress={handleToggle}
          >
            <Ionicons
              name={completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={completed ? '#00E676' : '#888888'}
            />
          </TouchableOpacity>
          
          {onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={20} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {completed && (
        <View style={styles.completedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#00E676" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  completedContainer: {
    borderColor: '#00E676',
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
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
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#888888',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkButton: {
    padding: 4,
  },
  checkedButton: {
    // Additional styles for checked state
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  completedText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 