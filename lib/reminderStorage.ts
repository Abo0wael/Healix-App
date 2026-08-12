import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Configure notifications handler function
export const setupNotifications = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
        }),
    });

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('medication-alarm', {
            name: 'Medication Alarms',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
            lightColor: '#FF231F7C',
            bypassDnd: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'alarm.wav',
        });
    }
};

export interface MedicationReminder {
    id: string;
    medicationName: string;
    dose: string;
    timesPerDay: number;
    doseTimes: string[]; // Array of times like ["08:00", "14:00", "20:00"]
    startDate: string; // ISO date string
    duration: number; // Number of days
    takenDoses: { [date: string]: string[] }; // Track taken doses by date and time
    createdAt: string;
    notificationId?: string | null;
    notificationIds?: string[]; // Array of all notification IDs
    reminderEnabled?: boolean;
}

const getMedicationsRef = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, 'users', user.uid, 'medications');
};

export const saveReminder = async (reminder: MedicationReminder): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // Schedule Notification
        // We schedule a notification for EACH time slot.
        // We keep notificationId (singular) for backward compatibility (stores the first one),
        // and add notificationIds (array) for all of them.
        const notificationIds: string[] = [];

        // Request permissions first just in case
        const { status } = await Notifications.requestPermissionsAsync();

        if (status === 'granted' && reminder.doseTimes.length > 0) {
            for (const timeString of reminder.doseTimes) {
                const [hours, minutes] = timeString.split(':').map(Number);

                // Create a unique identifier string for this notification if needed, 
                // but Expo handles ID generation.
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Medication Reminder",
                        body: `Time to take ${reminder.medicationName} (${reminder.dose})`,
                        sound: 'alarm.wav',
                        data: { 
                            medicationId: reminder.id, 
                            time: timeString,
                            medicationName: reminder.medicationName,
                            dose: reminder.dose
                        },
                        interruptionLevel: 'timeSensitive',
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                        hour: hours,
                        minute: minutes,
                        repeats: true,
                        channelId: 'medication-alarm',
                    },
                });
                notificationIds.push(id);
            }
        }

        // Prepare data for Firestore
        // We exclude the local 'id' so Firestore generates one
        const reminderData = {
            medicationName: reminder.medicationName,
            dose: reminder.dose,
            timesPerDay: reminder.timesPerDay,
            doseTimes: reminder.doseTimes,
            startDate: reminder.startDate,
            duration: reminder.duration,
            takenDoses: reminder.takenDoses || {},
            createdAt: new Date().toISOString(),
            reminderEnabled: true,
            notificationId: notificationIds.length > 0 ? notificationIds[0] : null,
            notificationIds: notificationIds
        };

        await addDoc(getMedicationsRef(), reminderData);

    } catch (error) {
        console.error('Error saving reminder:', error);
        throw error;
    }
};

export const getReminders = async (): Promise<MedicationReminder[]> => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(getMedicationsRef());
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data
            } as MedicationReminder;
        });
    } catch (error) {
        console.log('Error getting reminders (check Firebase Rules):', error);
        return [];
    }
};

export const updateReminder = async (updatedReminder: MedicationReminder): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const docRef = doc(db, 'users', user.uid, 'medications', updatedReminder.id);

        // Exclude id from data update
        const { id, ...data } = updatedReminder;
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating reminder:', error);
        throw error;
    }
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const docRef = doc(db, 'users', user.uid, 'medications', reminderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as MedicationReminder;

            // Cancel notification if it exists (legacy)
            if (data.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(data.notificationId).catch(err => console.log("Failed to cancel legacy notification", err));
            }
            // Cancel all new notifications
            if (data.notificationIds && Array.isArray(data.notificationIds)) {
                for (const id of data.notificationIds) {
                    if (id !== data.notificationId) {
                        await Notifications.cancelScheduledNotificationAsync(id).catch(err => console.log("Failed to cancel notification", err));
                    }
                }
            }

            await deleteDoc(docRef);
        }
    } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
};

export const markDoseAsTaken = async (
    reminderId: string,
    date: string,
    time: string
): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const docRef = doc(db, 'users', user.uid, 'medications', reminderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as MedicationReminder;
            const takenDoses = data.takenDoses || {};

            if (!takenDoses[date]) {
                takenDoses[date] = [];
            }
            if (!takenDoses[date].includes(time)) {
                takenDoses[date].push(time);
            }

            await updateDoc(docRef, { takenDoses });
        }
    } catch (error) {
        console.error('Error marking dose as taken:', error);
        throw error;
    }
};

// Helper function to get active reminders (within duration period)
export const getActiveReminders = async (): Promise<MedicationReminder[]> => {
    try {
        const allReminders = await getReminders();
        const now = new Date();

        return allReminders.filter((reminder) => {
            const startDate = new Date(reminder.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + reminder.duration);

            return now >= startDate && now < endDate; // Changed to < for strict expiry time, or <= is fine
        });
    } catch (error) {
        console.error('Error getting active reminders:', error);
        return [];
    }
};
