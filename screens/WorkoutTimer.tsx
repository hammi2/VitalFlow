import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Alert, ScrollView, Modal } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useInterstitialAd } from '../components/InterstitialAd';

const TIMER_RADIUS = 100;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

type TimerMode = 'countup' | 'countdown';

export const WorkoutTimer: React.FC = () => {
  // Interstitial Ad
  const interstitialAd = useInterstitialAd({
    testMode: true,
    onAdLoaded: () => console.log('Interstitial ad loaded'),
    onAdClosed: () => console.log('Interstitial ad closed')
  });

  // Timer mode state
  const [timerMode, setTimerMode] = useState<TimerMode>('countup');

  // Count-up timer state
  const [countUpTime, setCountUpTime] = useState(0);
  const [isCountUpRunning, setIsCountUpRunning] = useState(false);
  const countUpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer state
  const [countdownDuration, setCountdownDuration] = useState(30 * 60); // 30 minutes default
  const [countdownTimeLeft, setCountdownTimeLeft] = useState(countdownDuration);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom time picker state
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(30);

  // Count-up timer effects
  useEffect(() => {
    if (isCountUpRunning) {
      countUpIntervalRef.current = setInterval(() => {
        setCountUpTime(prev => prev + 1);
      }, 1000);
    } else {
      if (countUpIntervalRef.current) {
        clearInterval(countUpIntervalRef.current);
      }
    }
    return () => {
      if (countUpIntervalRef.current) {
        clearInterval(countUpIntervalRef.current);
      }
    };
  }, [isCountUpRunning]);

  // Countdown timer effects
  useEffect(() => {
    setCountdownTimeLeft(countdownDuration);
  }, [countdownDuration]);

  useEffect(() => {
    if (isCountdownRunning && !isCountdownPaused) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            setIsCountdownRunning(false);
            // Multiple vibrations and sound-like pattern
            Vibration.vibrate([0, 1000, 200, 1000, 200, 1000]);
            // عرض الإعلان البيني عند إكمال التمرين
            setTimeout(() => {
              if (interstitialAd.isAdReady()) {
                console.log('Showing interstitial ad after workout completion');
                interstitialAd.showAd();
              } else {
                console.log('Interstitial ad not ready, loading...');
                interstitialAd.loadAd();
              }
            }, 1000);
            
            Alert.alert(
              '⏰ Timer Complete!', 
              'Your workout session has ended. Great job! 🎉',
              [{ text: 'OK', style: 'default' }]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isCountdownRunning, isCountdownPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count-up timer functions
  const handleCountUpStart = () => {
    setIsCountUpRunning(true);
  };

  const handleCountUpStop = () => {
    setIsCountUpRunning(false);
    
    // عرض الإعلان البيني عند إيقاف التمرين
    setTimeout(() => {
      if (interstitialAd.isAdReady()) {
        console.log('Showing interstitial ad after workout stop');
        interstitialAd.showAd();
      } else {
        console.log('Interstitial ad not ready, loading...');
        interstitialAd.loadAd();
      }
    }, 500);
  };

  const handleCountUpReset = () => {
    setIsCountUpRunning(false);
    setCountUpTime(0);
  };

  // Countdown timer functions
  const handleCountdownStart = () => {
    setIsCountdownRunning(true);
    setIsCountdownPaused(false);
  };

  const handleCountdownPause = () => {
    setIsCountdownPaused(true);
  };

  const handleCountdownResume = () => {
    setIsCountdownPaused(false);
  };

  const handleCountdownReset = () => {
    setIsCountdownRunning(false);
    setIsCountdownPaused(false);
    setCountdownTimeLeft(countdownDuration);
  };

  const handleDurationChange = (minutes: number) => {
    setCountdownDuration(minutes * 60);
  };

  // Custom time picker functions
  const handleCustomTimeConfirm = () => {
    const totalSeconds = customMinutes * 60 + customSeconds;
    
    // Ensure minimum time of 1 second
    if (totalSeconds > 0) {
      setCountdownDuration(totalSeconds);
      setCountdownTimeLeft(totalSeconds);
    }
    setShowCustomTimePicker(false);
  };

  const handleCustomTimeCancel = () => {
    setShowCustomTimePicker(false);
  };

  const countdownProgress = 1 - countdownTimeLeft / countdownDuration;
  const countdownStrokeDashoffset = CIRCUMFERENCE * (1 - countdownProgress);

  // Generate arrays for picker options
  const minutesArray = Array.from({ length: 121 }, (_, i) => i); // 0-120 minutes
  const secondsArray = Array.from({ length: 60 }, (_, i) => i); // 0-59 seconds

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Timer</Text>
      
      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            timerMode === 'countup' && styles.modeButtonActive
          ]}
          onPress={() => setTimerMode('countup')}
        >
          <Ionicons 
            name="timer-outline" 
            size={20} 
            color={timerMode === 'countup' ? '#FFFFFF' : '#888'} 
          />
          <Text style={[
            styles.modeButtonText,
            timerMode === 'countup' && styles.modeButtonTextActive
          ]}>
            Count-up
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            timerMode === 'countdown' && styles.modeButtonActive
          ]}
          onPress={() => setTimerMode('countdown')}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={timerMode === 'countdown' ? '#FFFFFF' : '#888'} 
          />
          <Text style={[
            styles.modeButtonText,
            timerMode === 'countdown' && styles.modeButtonTextActive
          ]}>
            Countdown
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Count-up Timer Section */}
        {timerMode === 'countup' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Count-up Timer</Text>
            <Text style={styles.sectionSubtitle}>Track your workout duration</Text>
            
            <View style={styles.timerContainer}>
              <Svg width={220} height={220}>
                <Circle
                  cx={110}
                  cy={110}
                  r={TIMER_RADIUS}
                  stroke="#23272F"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <Circle
                  cx={110}
                  cy={110}
                  r={TIMER_RADIUS}
                  stroke="#00E676"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - (countUpTime % 60) / 60)}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="110,110"
                />
              </Svg>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>{formatTime(countUpTime)}</Text>
                <Text style={styles.timeLabel}>
                  {isCountUpRunning ? 'Running' : 'Ready'}
                </Text>
              </View>
            </View>
            
            <View style={styles.controls}>
              {!isCountUpRunning ? (
                <TouchableOpacity style={styles.startButton} onPress={handleCountUpStart}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.stopButton} onPress={handleCountUpStop}>
                    <Ionicons name="stop" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Stop</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={handleCountUpReset}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Countdown Timer Section */}
        {timerMode === 'countdown' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Countdown Timer</Text>
            <Text style={styles.sectionSubtitle}>Set your workout duration</Text>
            
            {/* Duration Selector */}
            <View style={styles.durationSelector}>
              <Text style={styles.durationLabel}>Duration:</Text>
              <View style={styles.durationButtons}>
                {[15, 30, 45, 60].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.durationButton,
                      countdownDuration === minutes * 60 && styles.durationButtonActive
                    ]}
                    onPress={() => handleDurationChange(minutes)}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      countdownDuration === minutes * 60 && styles.durationButtonTextActive
                    ]}>
                      {minutes}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Custom Time Button */}
              <TouchableOpacity
                style={styles.customTimeButton}
                onPress={() => setShowCustomTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#2979FF" />
                <Text style={styles.customTimeButtonText}>Custom Time</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timerContainer}>
              <Svg width={220} height={220}>
                <Circle
                  cx={110}
                  cy={110}
                  r={TIMER_RADIUS}
                  stroke="#23272F"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <Circle
                  cx={110}
                  cy={110}
                  r={TIMER_RADIUS}
                  stroke="#2979FF"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={countdownStrokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="110,110"
                />
              </Svg>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>{formatTime(countdownTimeLeft)}</Text>
                <Text style={styles.timeLabel}>
                  {isCountdownPaused ? 'Paused' : isCountdownRunning ? 'Running' : 'Ready'}
                </Text>
              </View>
            </View>
            
            <View style={styles.controls}>
              {!isCountdownRunning ? (
                <TouchableOpacity style={styles.startButton} onPress={handleCountdownStart}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.buttonRow}>
                  {isCountdownPaused ? (
                    <TouchableOpacity style={styles.resumeButton} onPress={handleCountdownResume}>
                      <Ionicons name="play" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Resume</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.pauseButton} onPress={handleCountdownPause}>
                      <Ionicons name="pause" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Pause</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.resetButton} onPress={handleCountdownReset}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Custom Time Picker Modal */}
      <Modal
        visible={showCustomTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCustomTimeCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Set Custom Time</Text>
              <TouchableOpacity onPress={handleCustomTimeConfirm}>
                <Text style={styles.confirmButton}>Confirm</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Minutes and Seconds:</Text>
              
              <View style={styles.timePickerRow}>
                {/* Minutes Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerColumnLabel}>Minutes</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {minutesArray.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          customMinutes === minute && styles.pickerItemActive
                        ]}
                        onPress={() => setCustomMinutes(minute)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          customMinutes === minute && styles.pickerItemTextActive
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.pickerSeparator}>:</Text>

                {/* Seconds Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerColumnLabel}>Seconds</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {secondsArray.map((second) => (
                      <TouchableOpacity
                        key={second}
                        style={[
                          styles.pickerItem,
                          customSeconds === second && styles.pickerItemActive
                        ]}
                        onPress={() => setCustomSeconds(second)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          customSeconds === second && styles.pickerItemTextActive
                        ]}>
                          {second.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <Text style={styles.previewTime}>
                {formatTime(customMinutes * 60 + customSeconds)}
              </Text>
            </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2979FF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2979FF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 25,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timeDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  timeLabel: {
    fontSize: 16,
    color: '#888',
    marginTop: 6,
  },
  durationSelector: {
    marginBottom: 25,
  },
  durationLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 15,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  durationButtonActive: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
  },
  durationButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  customTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2979FF',
    gap: 8,
    alignSelf: 'center',
  },
  customTimeButtonText: {
    color: '#2979FF',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 100,
    justifyContent: 'center',
    gap: 6,
  },
  resumeButton: {
    backgroundColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 100,
    justifyContent: 'center',
    gap: 6,
  },
  stopButton: {
    backgroundColor: '#FF5252',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 100,
    justifyContent: 'center',
    gap: 6,
  },
  resetButton: {
    backgroundColor: '#666666',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 100,
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
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
    color: '#2979FF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerColumn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pickerColumnLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 10,
    fontWeight: '600',
  },
  pickerScroll: {
    height: 150,
    width: 80,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#2979FF',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#888888',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pickerSeparator: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  previewLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2979FF',
  },
}); 