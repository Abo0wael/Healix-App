import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";

import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { auth, db } from "../../lib/firebase";
import i18n from "../../lib/i18n";
import {
  deleteReminder,
  getActiveReminders,
  markDoseAsTaken,
  MedicationReminder,
} from "../../lib/reminderStorage";
import { notifyCaregivers } from "../../lib/pushNotifications";
import { useTheme } from "../../lib/ThemeContext";
import { useUserProfile } from '../../lib/useUserProfile';

export default function TabsHome() {
  const { name, loading } = useUserProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const { theme } = useTheme();

  // Load reminders
  const loadReminders = async () => {
    try {
      const activeReminders = await getActiveReminders();
      setReminders(activeReminders);
    } catch (error) {
      console.log("Error loading reminders:", error);
    }
  };

  // Reload reminders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const handleAddReminder = () => {
    router.push("/add-reminder");
  };

  const handleMarkAsTaken = async (reminder: MedicationReminder, time: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await markDoseAsTaken(reminder.id, today, time);
      await loadReminders(); // Reload to update UI
    } catch (error) {
      console.error("Error marking dose as taken:", error);
    }
  };

  const handleDeleteReminder = (reminder: MedicationReminder) => {
    Alert.alert(
      i18n.t('delete_reminder'),
      i18n.t('delete_confirmation'),
      [
        { text: i18n.t('cancel'), style: "cancel" },
        {
          text: i18n.t('delete'),
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await deleteReminder(reminder.id);
              await loadReminders();
            } catch (error) {
              Alert.alert(i18n.t('error'), i18n.t('delete_error'));
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getNextDoseTime = (reminder: MedicationReminder): string => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const today = now.toISOString().split("T")[0];

    const takenToday = reminder.takenDoses?.[today] || [];

    // Find next dose time that hasn't been taken
    for (const doseTime of reminder.doseTimes) {
      if (!takenToday.includes(doseTime) && doseTime > currentTime) {
        return doseTime;
      }
    }

    // If all today's doses are done, return first dose tomorrow
    return reminder.doseTimes[0] + i18n.t('tomorrow');
  };

  const isDoseTaken = (reminder: MedicationReminder, time: string): boolean => {
    const today = new Date().toISOString().split("T")[0];
    const takenToday = reminder.takenDoses?.[today] || [];
    return takenToday.includes(time);
  };

  if (loading || isUpdating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{i18n.t('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Greeting Section */}
      <View style={styles.topSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10 }}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </View>
        <View style={[styles.greetingCard, { backgroundColor: theme.surfaceElevated }]}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { color: theme.text }]}>
              {/* Force simple greeting as strictly mandated by user rules */}
              Hi, {name || "User"} 👋
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{i18n.t('how_are_you')}</Text>
        </View>

        {/* Health Tip Card */}
        <View style={[styles.healthTipCard, { backgroundColor: theme.surface, borderLeftColor: theme.primary }]}>
          <Text style={styles.tipEmoji}>💊</Text>
          <View style={styles.tipTextContainer}>
            <Text style={[styles.tipTitle, { color: theme.text }]}>{i18n.t('stay_on_track')}</Text>
            <Text style={[styles.tipSubtitle, { color: theme.textSecondary }]}>
              {i18n.t('set_reminders')}
            </Text>
          </View>
        </View>
      </View>

      {/* Reminders Section */}
      {reminders.length > 0 ? (
        <View style={styles.remindersSection}>
          <Text style={[styles.remindersSectionTitle, { color: theme.text }]}>{i18n.t('your_medications')}</Text>

          {reminders.map((reminder) => (
            <View key={reminder.id} style={[styles.reminderCard, { backgroundColor: theme.surfaceElevated }]}>
              {/* Reminder Header */}
              <View style={styles.reminderHeader}>
                <View style={[styles.reminderIcon, { backgroundColor: theme.surface }]}>
                  <Text style={styles.reminderIconText}>💊</Text>
                </View>
                <View style={styles.reminderHeaderText}>
                  <Text style={[styles.reminderName, { color: theme.text }]}>
                    {reminder.medicationName}
                  </Text>
                  <Text style={[styles.reminderDose, { color: theme.textSecondary }]}>{reminder.dose}</Text>
                  <Text style={[styles.reminderFrequency, { color: theme.primary }]}>
                    {i18n.t(reminder.timesPerDay !== 1 ? 'daily_times' : 'daily_time', { count: reminder.timesPerDay })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteReminder(reminder)}
                  style={styles.deleteButton}
                >
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Next Dose */}
              <View style={[styles.nextDoseContainer, { backgroundColor: theme.warningBackground }]}>
                <Text style={[styles.nextDoseLabel, { color: theme.textSecondary }]}>{i18n.t('next_dose')}</Text>
                <Text style={[styles.nextDoseTime, { color: theme.warningText }]}>
                  {getNextDoseTime(reminder)}
                </Text>
              </View>

              {/* Dose Times */}
              <View style={styles.doseTimesContainer}>
                {reminder.doseTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.doseTimeChip,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      isDoseTaken(reminder, time) && { backgroundColor: theme.successBackground, borderColor: theme.successBorder },
                    ]}
                    onPress={() => handleMarkAsTaken(reminder, time)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.doseTimeText,
                        { color: theme.textSecondary },
                        isDoseTaken(reminder, time) && { color: theme.success },
                      ]}
                    >
                      {time}
                    </Text>
                    {isDoseTaken(reminder, time) && (
                      <Text style={[styles.checkmark, { color: theme.success }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Warning (Optional) */}
              <View style={[styles.warningContainer, { backgroundColor: theme.warningBackground }]}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={[styles.warningText, { color: theme.textSecondary }]}>
                  {i18n.t('warning_msg')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        /* Add Reminder Button - when no reminders */
        <View style={styles.centerSection}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
            onPress={handleAddReminder}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonIcon}>⏰</Text>
            <Text style={styles.addButtonText}>{i18n.t('add_reminder')}</Text>
          </TouchableOpacity>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('stat_taken')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={styles.statEmoji}>⏳</Text>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('stat_pending')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={styles.statEmoji}>📋</Text>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('stat_total')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom padding for tab bar */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greetingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  waveEmoji: {
    fontSize: 32,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#666",
    fontWeight: "400",
    lineHeight: 24,
  },
  healthTipCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#32B5F4",
  },
  tipEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
  },
  centerSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 40,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#32B5F4",
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: "#32B5F4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 40,
  },
  addButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  remindersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  remindersSectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  reminderHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  reminderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reminderIconText: {
    fontSize: 24,
  },
  reminderHeaderText: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  reminderName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  reminderDose: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  reminderFrequency: {
    fontSize: 13,
    color: "#32B5F4",
    fontWeight: "600",
  },
  nextDoseContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  nextDoseLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  nextDoseTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF9800",
  },
  doseTimesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  doseTimeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
  },
  doseTimeChipTaken: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  doseTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  doseTimeTextTaken: {
    color: "#4CAF50",
  },
  checkmark: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4CAF50",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
  },
  bottomPadding: {
    height: 20,
  },
});
