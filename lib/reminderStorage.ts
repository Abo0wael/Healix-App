import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const REMINDERS_KEY = '@medication_reminders';

export const saveReminder = async (reminder: MedicationReminder): Promise<void> => {
    try {
        const existingReminders = await getReminders();
        const updatedReminders = [...existingReminders, reminder];
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    } catch (error) {
        console.error('Error saving reminder:', error);
        throw error;
    }
};

export const getReminders = async (): Promise<MedicationReminder[]> => {
    try {
        const reminders = await AsyncStorage.getItem(REMINDERS_KEY);
        return reminders ? JSON.parse(reminders) : [];
    } catch (error) {
        console.error('Error getting reminders:', error);
        return [];
    }
};

export const updateReminder = async (updatedReminder: MedicationReminder): Promise<void> => {
    try {
        const reminders = await getReminders();
        const index = reminders.findIndex((r) => r.id === updatedReminder.id);
        if (index !== -1) {
            reminders[index] = updatedReminder;
            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
        }
    } catch (error) {
        console.error('Error updating reminder:', error);
        throw error;
    }
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
    try {
        const reminders = await getReminders();
        const filteredReminders = reminders.filter((r) => r.id !== reminderId);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filteredReminders));
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
        const reminders = await getReminders();
        const reminder = reminders.find((r) => r.id === reminderId);

        if (reminder) {
            if (!reminder.takenDoses) {
                reminder.takenDoses = {};
            }
            if (!reminder.takenDoses[date]) {
                reminder.takenDoses[date] = [];
            }
            if (!reminder.takenDoses[date].includes(time)) {
                reminder.takenDoses[date].push(time);
            }

            await updateReminder(reminder);
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

            return now >= startDate && now <= endDate;
        });
    } catch (error) {
        console.error('Error getting active reminders:', error);
        return [];
    }
};
