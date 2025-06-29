import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WorkoutCardProps {
  type: string;
  duration: number;
  time: string;
  completed: boolean;
  onToggleComplete: () => void;
  onEdit?: () => void;
  onStart?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  type,
  duration,
  time,
  completed,
  onToggleComplete,
  onEdit,
  onStart,
}) => {
  const getWorkoutIcon = () => {
    switch (type.toLowerCase()) {
      case 'cardio':
        return 'fitness-outline';
      case 'strength':
        return 'barbell-outline';
      case 'yoga':
        return 'body-outline';
      case 'rest':
        return 'bed-outline';
      default:
        return 'fitness-outline';
    }
  };

  const getWorkoutColor = () => {
    switch (type.toLowerCase()) {
      case 'cardio':
        return '#FF5252';
      case 'strength':
        return '#2979FF';
      case 'yoga':
        return '#7C4DFF';
      case 'rest':
        return '#888888';
      default:
        return '#2979FF';
    }
  };

  const handleToggle = () => {
    if (completed) {
      Alert.alert(
        'Mark as Incomplete',
        'Are you sure you want to mark this workout as incomplete?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: onToggleComplete },
        ]
      );
    } else {
      onToggleComplete();
    }
  };

  const handleStart = () => {
    if (type.toLowerCase() === 'rest') {
      Alert.alert('Rest Day', 'Today is a rest day. Take it easy!');
      return;
    }
    onStart?.();
  };

  return (
    <View style={[styles.container, completed && styles.completedContainer]}>
      <View style={styles.header}>
        <View style={styles.workoutInfo}>
          <View style={[styles.iconContainer, { backgroundColor: getWorkoutColor() }]}>
            <Ionicons name={getWorkoutIcon() as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.workoutTitle, completed && styles.completedText]}>
              {type}
            </Text>
            <Text style={[styles.workoutDetails, completed && styles.completedText]}>
              {duration > 0 ? `${duration} min` : 'Rest Day'} • {time}
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

      {!completed && type.toLowerCase() !== 'rest' && (
        <View style={styles.startSection}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {completed && (
        <View style={styles.completedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#00E676" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}

      {type.toLowerCase() === 'rest' && (
        <View style={styles.restIndicator}>
          <Ionicons name="bed-outline" size={16} color="#888888" />
          <Text style={styles.restText}>Rest Day</Text>
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
  workoutInfo: {
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
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDetails: {
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
  startSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  startButton: {
    backgroundColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  restIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  restText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 