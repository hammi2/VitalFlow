import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { storage, SleepRecord } from '../utils/storage';

const SLEEP_QUALITY_OPTIONS = [
  { key: 'excellent', label: 'Excellent', icon: 'happy-outline', color: '#00E676' },
  { key: 'good', label: 'Good', icon: 'thumbs-up-outline', color: '#4CAF50' },
  { key: 'fair', label: 'Fair', icon: 'remove-outline', color: '#FF9800' },
  { key: 'poor', label: 'Poor', icon: 'sad-outline', color: '#FF5252' },
];

export const Sleep: React.FC = () => {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeup, setWakeup] = useState('06:30');
  const [selectedQuality, setSelectedQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSleepRecords();
  }, []);

  const loadSleepRecords = async () => {
    try {
      const savedRecords = await storage.getSleepRecords();
      if (savedRecords) {
        setSleepRecords(savedRecords);
      } else {
        // Set sample data if none exists
        const today = new Date().toISOString().split('T')[0];
        const sampleRecords: SleepRecord[] = [
          {
            id: '1',
            date: today,
            bedtime: '22:30',
            wakeup: '06:30',
            duration: 7.5,
            quality: 'good',
            notes: 'Slept well, felt refreshed'
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            bedtime: '23:00',
            wakeup: '07:00',
            duration: 8,
            quality: 'excellent',
            notes: 'Deep sleep, very rested'
          }
        ];
        await storage.saveSleepRecords(sampleRecords);
        setSleepRecords(sampleRecords);
      }
    } catch (error) {
      console.error('Error loading sleep records:', error);
    }
  };

  const calculateDuration = (bedtime: string, wakeup: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeup.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
  };

  const handleAddSleep = async () => {
    const duration = calculateDuration(bedtime, wakeup);
    const today = new Date().toISOString().split('T')[0];
    
    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      date: today,
      bedtime,
      wakeup,
      duration,
      quality: selectedQuality,
      notes: notes.trim() || undefined
    };

    const updatedRecords = [newRecord, ...sleepRecords];
    setSleepRecords(updatedRecords);
    await storage.saveSleepRecords(updatedRecords);
    setShowAddSleep(false);
    resetForm();
  };

  const resetForm = () => {
    setBedtime('22:30');
    setWakeup('06:30');
    setSelectedQuality('good');
    setNotes('');
  };

  const getQualityInfo = (quality: string) => {
    return SLEEP_QUALITY_OPTIONS.find(option => option.key === quality);
  };

  const getAverageSleep = () => {
    if (sleepRecords.length === 0) return 0;
    const total = sleepRecords.reduce((sum, record) => sum + record.duration, 0);
    return total / sleepRecords.length;
  };

  const renderSleepItem = (record: SleepRecord) => {
    const qualityInfo = getQualityInfo(record.quality);
    
    return (
      <View key={record.id} style={styles.sleepItem}>
        <View style={styles.sleepHeader}>
          <View style={styles.sleepDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#888888" />
            <Text style={styles.sleepDate}>{record.date}</Text>
          </View>
          <View style={[styles.qualityBadge, { backgroundColor: qualityInfo?.color }]}>
            <Ionicons name={qualityInfo?.icon as any} size={14} color="#FFFFFF" />
            <Text style={styles.qualityText}>{qualityInfo?.label}</Text>
          </View>
        </View>
        
        <View style={styles.sleepTimes}>
          <View style={styles.timeContainer}>
            <Ionicons name="moon-outline" size={16} color="#7C4DFF" />
            <Text style={styles.timeText}>{record.bedtime}</Text>
          </View>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color="#00E676" />
            <Text style={styles.durationText}>{record.duration.toFixed(1)}h</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="sunny-outline" size={16} color="#FF9800" />
            <Text style={styles.timeText}>{record.wakeup}</Text>
          </View>
        </View>
        
        {record.notes && (
          <Text style={styles.sleepNotes}>{record.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Tracker</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddSleep(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Sleep Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Sleep Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{getAverageSleep().toFixed(1)}h</Text>
            <Text style={styles.summaryLabel}>Average</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>8h</Text>
            <Text style={styles.summaryLabel}>Goal</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{sleepRecords.length}</Text>
            <Text style={styles.summaryLabel}>Records</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((getAverageSleep() / 8) * 100, 100)}%`,
                backgroundColor: getAverageSleep() >= 8 ? '#00E676' : '#FF5252'
              }
            ]} 
          />
        </View>
      </View>

      {/* Sleep Records */}
      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Recent Sleep Records</Text>
        {sleepRecords.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {sleepRecords.slice(0, 7).map(renderSleepItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={64} color="#888888" />
            <Text style={styles.emptyTitle}>No Sleep Records</Text>
            <Text style={styles.emptyText}>
              Start tracking your sleep to improve your health and wellness.
            </Text>
          </View>
        )}
      </View>

      {/* Add Sleep Modal */}
      <Modal
        visible={showAddSleep}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddSleep(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Sleep Record</Text>
              <TouchableOpacity onPress={handleAddSleep}>
                <Text style={styles.confirmButton}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sleep Quality */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sleep Quality</Text>
                <View style={styles.qualityButtons}>
                  {SLEEP_QUALITY_OPTIONS.map((quality) => (
                    <TouchableOpacity
                      key={quality.key}
                      style={[
                        styles.qualityButton,
                        selectedQuality === quality.key && styles.qualityButtonActive
                      ]}
                      onPress={() => setSelectedQuality(quality.key as any)}
                    >
                      <Ionicons 
                        name={quality.icon as any} 
                        size={20} 
                        color={selectedQuality === quality.key ? '#FFFFFF' : quality.color} 
                      />
                      <Text style={[
                        styles.qualityButtonText,
                        selectedQuality === quality.key && styles.qualityButtonTextActive
                      ]}>
                        {quality.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did you sleep?"
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
  },
  summaryDivider: {
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
  recordsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sleepItem: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepDate: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 6,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00E676',
    marginLeft: 6,
  },
  sleepNotes: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    color: '#7C4DFF',
    fontSize: 16,
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
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  qualityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qualityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333333',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  qualityButtonActive: {
    backgroundColor: '#7C4DFF',
    borderColor: '#7C4DFF',
  },
  qualityButtonText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  qualityButtonTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
}); 