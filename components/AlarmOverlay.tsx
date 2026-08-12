import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { MedicationReminder, getReminders, markDoseAsTaken } from '../lib/reminderStorage';
import { useTheme } from '../lib/ThemeContext';

export default function AlarmOverlay() {
    const [alarmActive, setAlarmActive] = useState(false);
    const [medication, setMedication] = useState<MedicationReminder | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [notificationData, setNotificationData] = useState<any>(null);
    const vibrationInterval = useRef<NodeJS.Timeout | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        // Check for missed initial notification from cold boot
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                handleNotification(response.notification);
            }
        });

        // Foreground notification listener
        const foregroundSubscription = Notifications.addNotificationReceivedListener(handleNotification);
        
        // Background tap listener
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            handleNotification(response.notification);
        });

        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);

    const handleNotification = async (notification: Notifications.Notification) => {
        const data = notification.request.content.data;
        if (data && data.medicationId) {
            let medName = data.medicationName;
            let dose = data.dose;

            // Fallback for older scheduled notifications that lack this data
            if (!medName) {
                const reminders = await getReminders();
                const foundMed = reminders.find(r => r.id === data.medicationId);
                if (foundMed) {
                    medName = foundMed.medicationName;
                    dose = foundMed.dose;
                } else {
                    medName = "Medication";
                    dose = "";
                }
            }

            // Use data from notification payload directly or fallback
            setMedication({
                id: data.medicationId,
                medicationName: medName,
                dose: dose || '',
                timesPerDay: 1,
                doseTimes: [],
                startDate: new Date().toISOString(),
                duration: 7,
                takenDoses: {},
                createdAt: new Date().toISOString()
            } as MedicationReminder);
            setNotificationData(data);
            startAlarm();
        }
    };

    const startAlarm = async () => {
        setAlarmActive(true);
        
        // Handle Vibration
        if (Platform.OS === 'ios') {
            // iOS doesn't support vibration patterns or looping via the API
            Vibration.vibrate();
            vibrationInterval.current = setInterval(() => {
                Vibration.vibrate();
            }, 1000);
        } else {
            // Android supports looping pattern
            Vibration.vibrate([1000, 1000], true);
        }

        try {
            // Configure audio for iOS to play even if silent switch is on
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            // Load and play the alarm sound (WAV works on iOS)
            const { sound: audioSound } = await Audio.Sound.createAsync(
                require('../assets/sounds/alarm.wav'),
                { shouldPlay: true, isLooping: true }
            );
            setSound(audioSound);
        } catch (error) {
            console.log("Failed to load alarm sound, relying on vibration", error);
        }
    };

    const stopAlarm = async () => {
        if (Platform.OS === 'ios' && vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }
        Vibration.cancel();

        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }
        
        setAlarmActive(false);
        setMedication(null);
        setNotificationData(null);
    };

    const handleTakeMedication = async () => {
        if (medication && notificationData && notificationData.time) {
            const today = new Date().toISOString().split('T')[0];
            await markDoseAsTaken(medication.id, today, notificationData.time);
        }
        await stopAlarm();
    };

    if (!alarmActive || !medication) {
        return null;
    }

    return (
        <Modal transparent={true} visible={alarmActive} animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.alarmBox, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.danger }]}>Medication Alarm!</Text>
                    <Text style={[styles.medName, { color: theme.text }]}>{medication.medicationName}</Text>
                    <Text style={[styles.dose, { color: theme.primary }]}>{medication.dose}</Text>
                    
                    <Text style={[styles.instruction, { color: theme.textSecondary }]}>It is time to take your medication.</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.takeButton, { backgroundColor: theme.primary }]} onPress={handleTakeMedication}>
                            <Text style={styles.buttonText}>Take Medication</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.button, styles.dismissButton, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={stopAlarm}>
                            <Text style={[styles.buttonText, styles.dismissButtonText, { color: theme.textSecondary }]}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alarmBox: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#32B5F4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF5252',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    medName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    dose: {
        fontSize: 20,
        color: '#32B5F4',
        fontWeight: '600',
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    takeButton: {
        backgroundColor: '#32B5F4',
    },
    dismissButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    dismissButtonText: {
        color: '#666',
    },
});
