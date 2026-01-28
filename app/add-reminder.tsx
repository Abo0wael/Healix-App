import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { MedicationReminder, saveReminder } from "../lib/reminderStorage";

export default function AddReminderScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [medicationName, setMedicationName] = useState("");
    const [dose, setDose] = useState("");
    const [timesPerDay, setTimesPerDay] = useState("1");
    const [duration, setDuration] = useState("7");
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

    // Available time slots
    const timeSlots = [
        "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
    ];

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

    const handleTimeToggle = (time: string) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter((t) => t !== time));
        } else {
            setSelectedTimes([...selectedTimes, time].sort());
        }
    };

    const handleAddReminder = async () => {
        // Validation
        if (!medicationName.trim()) {
            Alert.alert("Error", "Please enter medication name");
            return;
        }
        if (!dose.trim()) {
            Alert.alert("Error", "Please enter dose");
            return;
        }
        if (selectedTimes.length === 0) {
            Alert.alert("Error", "Please select at least one time");
            return;
        }

        try {
            const reminder: MedicationReminder = {
                id: Date.now().toString(),
                medicationName: medicationName.trim(),
                dose: dose.trim(),
                timesPerDay: selectedTimes.length,
                doseTimes: selectedTimes,
                startDate: selectedDate.toISOString(),
                duration: parseInt(duration) || 7,
                takenDoses: {},
                createdAt: new Date().toISOString(),
            };

            await saveReminder(reminder);

            Alert.alert(
                "Success",
                "Medication reminder added successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to add reminder. Please try again.");
            console.error("Error adding reminder:", error);
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Add Reminder</Text>

                <View style={styles.headerButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Date Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Select Start Date</Text>
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
                                        isSelected && styles.dateCardSelected,
                                    ]}
                                    onPress={() => setSelectedDate(date)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.dateDay,
                                            isSelected && styles.dateDaySelected,
                                        ]}
                                    >
                                        {formattedDate.day}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateNumber,
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

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Select Dose Times</Text>
                    <Text style={styles.sectionSubtitle}>
                        Choose when to take your medication
                    </Text>
                    <View style={styles.timesGrid}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.timeSlot,
                                    selectedTimes.includes(time) && styles.timeSlotSelected,
                                ]}
                                onPress={() => handleTimeToggle(time)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.timeSlotText,
                                        selectedTimes.includes(time) && styles.timeSlotTextSelected,
                                    ]}
                                >
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Medication Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💊 Medication Details</Text>

                    {/* Medication Name */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Drug Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Aspirin"
                            placeholderTextColor="#999"
                            value={medicationName}
                            onChangeText={setMedicationName}
                        />
                    </View>

                    {/* Dose */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Dose</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 500 mg or 5 ml"
                            placeholderTextColor="#999"
                            value={dose}
                            onChangeText={setDose}
                        />
                    </View>

                    {/* Times Per Day (Read-only, auto-filled) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Times Per Day</Text>
                        <View style={styles.inputReadOnly}>
                            <Text style={styles.inputReadOnlyText}>
                                {selectedTimes.length} time{selectedTimes.length !== 1 ? "s" : ""}
                            </Text>
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Duration (days)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 7"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                        />
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddReminder}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonText}>Add To Calendar</Text>
                </TouchableOpacity>

                {/* Bottom Padding */}
                <View style={styles.bottomPadding} />
            </ScrollView>
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
    timesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    timeSlot: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#E0E0E0",
    },
    timeSlotSelected: {
        backgroundColor: "#E3F2FD",
        borderColor: "#32B5F4",
    },
    timeSlotText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    timeSlotTextSelected: {
        color: "#32B5F4",
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
});
