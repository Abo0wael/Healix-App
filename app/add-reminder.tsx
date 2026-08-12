import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import i18n from "../lib/i18n";
import { MedicationReminder, saveReminder } from "../lib/reminderStorage";
import { useTheme } from "../lib/ThemeContext";

export default function AddReminderScreen() {
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [medicationName, setMedicationName] = useState("");
    const [dose, setDose] = useState("");
    const [duration, setDuration] = useState("7");
    const [doseTimes, setDoseTimes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedHour, setSelectedHour] = useState(8);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Generate dates for the horizontal date picker (7 days)
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates = generateDates();

    const openTimePicker = (index?: number) => {
        if (typeof index === 'number') {
            const [h, m] = doseTimes[index].split(':').map(Number);
            setSelectedHour(h);
            setSelectedMinute(m);
            setEditingIndex(index);
        } else {
            const now = new Date();
            // Default to next hour if adding new
            if (doseTimes.length === 0) {
                setSelectedHour(now.getHours() + 1);
                setSelectedMinute(0);
            } else {
                // Or keep previous selection / default
                setSelectedHour(8);
                setSelectedMinute(0);
            }
            setEditingIndex(null);
        }
        setModalVisible(true);
    };

    const handleSaveTime = () => {
        const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

        let newTimes = [...doseTimes];

        if (editingIndex !== null) {
            // Check for duplicates excluding current index
            if (doseTimes.some((t, i) => t === timeString && i !== editingIndex)) {
                Alert.alert(i18n.t('error') || "Error", "This time is already in your list.");
                return;
            }
            newTimes[editingIndex] = timeString;
        } else {
            if (doseTimes.includes(timeString)) {
                Alert.alert(i18n.t('error') || "Error", "This time is already in your list.");
                return;
            }
            newTimes.push(timeString);
        }

        // Sort times
        newTimes.sort();
        setDoseTimes(newTimes);
        setModalVisible(false);
    };

    const removeTime = (index: number) => {
        const newTimes = doseTimes.filter((_, i) => i !== index);
        setDoseTimes(newTimes);
    };

    const handleAddReminder = async () => {
        // Validation
        if (!medicationName.trim()) {
            Alert.alert(i18n.t('error'), i18n.t('enter_med_name'));
            return;
        }
        if (!dose.trim()) {
            Alert.alert(i18n.t('error'), i18n.t('enter_dose'));
            return;
        }
        if (doseTimes.length === 0) {
            Alert.alert(i18n.t('error'), "Please add at least one dose time.");
            return;
        }

        try {
            setLoading(true);
            const reminder: MedicationReminder = {
                id: Date.now().toString(),
                medicationName: medicationName.trim(),
                dose: dose.trim(),
                timesPerDay: doseTimes.length,
                doseTimes: doseTimes,
                startDate: selectedDate.toISOString(),
                duration: parseInt(duration) || 7,
                takenDoses: {},
                createdAt: new Date().toISOString(),
                // notificationIds will be handled in saveReminder
            };

            await saveReminder(reminder);

            Alert.alert(
                "Success",
                i18n.t('reminder_added'),
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(i18n.t('error'), i18n.t('failed_add_reminder'));
            console.error("Error adding reminder:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            isToday: date.toDateString() === new Date().toDateString(),
        };
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: theme.background }]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.backArrow, { color: theme.primary }]}>←</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.primary }]}>{i18n.t('add_reminder')}</Text>

                <View style={[styles.headerButton, { backgroundColor: 'transparent' }]} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('select_start_date')}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.datesContainer}
                    >
                        {dates.map((date, index) => {
                            const formattedDate = formatDate(date);
                            const isSelected =
                                date.toDateString() === selectedDate.toDateString();

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dateCard,
                                        { backgroundColor: theme.surfaceElevated },
                                        isSelected && { backgroundColor: theme.primary, shadowColor: theme.primary, elevation: 5 },
                                    ]}
                                    onPress={() => setSelectedDate(date)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.dateDay,
                                            { color: theme.textSecondary },
                                            isSelected && styles.dateDaySelected,
                                        ]}
                                    >
                                        {formattedDate.day}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateNumber,
                                            { color: theme.text },
                                            isSelected && styles.dateNumberSelected,
                                        ]}
                                    >
                                        {formattedDate.date}
                                    </Text>
                                    {formattedDate.isToday && (
                                        <View style={styles.todayDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Dose Times Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('select_dose_times') || "Dose Times"}</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                        Add the times you need to take this medication.
                    </Text>

                    <View style={[styles.timesContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        {doseTimes.length === 0 && (
                            <Text style={[styles.noTimesText, { color: theme.textSecondary }]}>No times added yet</Text>
                        )}
                        {doseTimes.map((time, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.timeRow, { borderBottomColor: theme.border }]}
                                onPress={() => openTimePicker(index)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.timeRowText, { color: theme.text }]}>{time}</Text>
                                <View style={styles.timeActions}>
                                    <Text style={[styles.editLabel, { color: theme.primary }]}>Edit</Text>
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation(); // prevent opening picker
                                            removeTime(index);
                                        }}
                                        style={[styles.deleteButton, { backgroundColor: theme.warningBackground }]}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Text style={[styles.deleteLabel, { color: theme.danger }]}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.addTimeButton, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.border }]}
                            onPress={() => openTimePicker()}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.addTimeButtonText, { color: theme.primary }]}>+ Add Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Medication Details */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('medication_details')}</Text>

                    {/* Medication Name */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{i18n.t('drug_name')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
                            placeholder={i18n.t('drug_placeholder')}
                            placeholderTextColor={theme.textSecondary}
                            value={medicationName}
                            onChangeText={setMedicationName}
                        />
                    </View>

                    {/* Dose */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{i18n.t('dose_label')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
                            placeholder={i18n.t('dose_placeholder')}
                            placeholderTextColor={theme.textSecondary}
                            value={dose}
                            onChangeText={setDose}
                        />
                    </View>

                    {/* Times Per Day (Read-only, auto-filled) */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{i18n.t('times_per_day')}</Text>
                        <View style={[styles.inputReadOnly, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Text style={[styles.inputReadOnlyText, { color: theme.primary }]}>
                                {i18n.t(doseTimes.length !== 1 ? 'daily_times' : 'daily_time', { count: doseTimes.length }) || `${doseTimes.length} times daily`}
                            </Text>
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{i18n.t('duration_label')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
                            placeholder={i18n.t('duration_placeholder')}
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                        />
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.addButton, loading && { opacity: 0.7 }]}
                    onPress={handleAddReminder}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.addButtonText}>{i18n.t('add_to_calendar')}</Text>
                    )}
                </TouchableOpacity>

                {/* Bottom Padding */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Custom Time Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.modalCancel, { color: theme.danger }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={handleSaveTime} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerContainer}>
                            {/* Hours */}
                            <ScrollView
                                style={styles.pickerColumn}
                                contentContainerStyle={styles.pickerContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[
                                            styles.pickerItem,
                                            selectedHour === h && { backgroundColor: theme.background, borderRadius: 10 }
                                        ]}
                                        onPress={() => setSelectedHour(h)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            { color: theme.textSecondary },
                                            selectedHour === h && [styles.pickerTextSelected, { color: theme.primary }]
                                        ]}>
                                            {h.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.colon, { color: theme.primary }]}>:</Text>

                            {/* Minutes */}
                            <ScrollView
                                style={styles.pickerColumn}
                                contentContainerStyle={styles.pickerContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.pickerItem,
                                            selectedMinute === m && { backgroundColor: theme.background, borderRadius: 10 }
                                        ]}
                                        onPress={() => setSelectedMinute(m)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            { color: theme.textSecondary },
                                            selectedMinute === m && [styles.pickerTextSelected, { color: theme.primary }]
                                        ]}>
                                            {m.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F9FF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F9FF",
        justifyContent: "center",
        alignItems: "center",
    },
    backArrow: {
        fontSize: 24,
        color: "#32B5F4",
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#32B5F4",
        letterSpacing: -0.3,
    },
    scrollContent: {
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    datesContainer: {
        paddingVertical: 8,
    },
    dateCard: {
        width: 70,
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    dateCardSelected: {
        backgroundColor: "#32B5F4",
        shadowColor: "#32B5F4",
        shadowOpacity: 0.3,
        elevation: 5,
    },
    dateDay: {
        fontSize: 13,
        color: "#666",
        fontWeight: "600",
        marginBottom: 4,
    },
    dateDaySelected: {
        color: "#FFFFFF",
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1a1a1a",
    },
    dateNumberSelected: {
        color: "#FFFFFF",
    },
    todayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#32B5F4",
        marginTop: 4,
    },

    // Time List Styles
    timesContainer: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        overflow: 'hidden',
    },
    noTimesText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        paddingVertical: 15,
        fontStyle: 'italic',
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    timeRowText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    timeActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    editLabel: {
        color: "#32B5F4",
        fontSize: 14,
        fontWeight: "500",
    },
    deleteButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#FFEBEE",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteLabel: {
        color: "#FF5252",
        fontWeight: "bold",
        fontSize: 14,
    },
    addTimeButton: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#F9FCFF',
        marginHorizontal: -16, // Bleed to edge
        marginBottom: -8, // Bleed to edge
        marginTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    addTimeButtonText: {
        color: "#32B5F4",
        fontSize: 16,
        fontWeight: "700",
    },

    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    inputReadOnly: {
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    inputReadOnlyText: {
        fontSize: 16,
        color: "#32B5F4",
        fontWeight: "600",
    },
    addButton: {
        marginHorizontal: 20,
        backgroundColor: "#32B5F4",
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
    bottomPadding: {
        height: 40,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        height: 500, // Fixed height for picker
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    modalCancel: {
        fontSize: 16,
        color: '#FF5252',
    },
    modalSave: {
        fontSize: 16,
        fontWeight: '600',
        color: '#32B5F4',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 350,
        paddingVertical: 20,
    },
    pickerColumn: {
        width: 80,
        height: '100%',
    },
    pickerContent: {
        paddingVertical: 130, // Padding to center items
    },
    pickerItem: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemSelected: {
        backgroundColor: '#F0F8FF',
        borderRadius: 10,
    },
    pickerText: {
        fontSize: 24,
        color: '#DDD',
    },
    pickerTextSelected: {
        fontSize: 28,
        fontWeight: '700',
        color: '#32B5F4',
    },
    colon: {
        fontSize: 28,
        fontWeight: '700',
        color: '#32B5F4',
        marginHorizontal: 10,
        marginBottom: 8,
    },
});
