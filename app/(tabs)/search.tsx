import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Specialty {
    id: string;
    name: string;
    icon: string;
    specialists: number;
    color: string;
    iconBg: string;
}

export default function FindDoctorsScreen() {
    const [searchText, setSearchText] = useState("");

    const specialties: Specialty[] = [
        {
            id: "1",
            name: "Cardiology",
            icon: "❤️",
            specialists: 40,
            color: "#E3F2FD",
            iconBg: "#2196F3",
        },
        {
            id: "2",
            name: "Dermatology",
            icon: "🖐️",
            specialists: 140,
            color: "#FCE4EC",
            iconBg: "#E91E63",
        },
        {
            id: "3",
            name: "Mental Wellness",
            icon: "🧠",
            specialists: 100,
            color: "#E0F2F1",
            iconBg: "#009688",
        },
        {
            id: "4",
            name: "Dental Care",
            icon: "🦷",
            specialists: 300,
            color: "#F3E5F5",
            iconBg: "#9C27B0",
        },
        {
            id: "5",
            name: "Digestive",
            icon: "🫀",
            specialists: 50,
            color: "#FFF8E1",
            iconBg: "#FFA726",
        },
        {
            id: "6",
            name: "Orthopedics",
            icon: "🦴",
            specialists: 70,
            color: "#FFEBEE",
            iconBg: "#EF5350",
        },
    ];

    const handleSpecialtyPress = (specialty: Specialty) => {
        console.log(`Specialty pressed: ${specialty.name}`);
        // Placeholder for future navigation/logic
    };

    const handleBackPress = () => {
        console.log("Back button pressed");
        // Placeholder for future navigation
    };

    const handleNotificationPress = () => {
        console.log("Notification button pressed");
        // Placeholder for future notification logic
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Find Doctors</Text>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleNotificationPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search doctors, specialties..."
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Specialties</Text>
                    <Text style={styles.sectionSubtitle}>
                        Browse doctors by specialty
                    </Text>
                </View>

                {/* Specialties Grid */}
                <View style={styles.gridContainer}>
                    {specialties.map((specialty) => (
                        <TouchableOpacity
                            key={specialty.id}
                            style={[styles.specialtyCard, { backgroundColor: specialty.color }]}
                            onPress={() => handleSpecialtyPress(specialty)}
                            activeOpacity={0.7}
                        >
                            {/* Icon Container */}
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: specialty.iconBg },
                                ]}
                            >
                                <Text style={styles.specialtyIcon}>{specialty.icon}</Text>
                            </View>

                            {/* Specialty Name */}
                            <Text style={styles.specialtyName}>{specialty.name}</Text>

                            {/* Specialist Count */}
                            <Text style={styles.specialistCount}>
                                {specialty.specialists} Specialist{specialty.specialists !== 1 ? "s" : ""}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom Padding for tab bar */}
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
        fontSize: 24,
        fontWeight: "800",
        color: "#32B5F4",
        letterSpacing: -0.5,
    },
    notificationIcon: {
        fontSize: 22,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#32B5F4",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 24,
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1a1a1a",
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "400",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    specialtyCard: {
        width: "48%",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    specialtyIcon: {
        fontSize: 32,
    },
    specialtyName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        textAlign: "center",
        marginBottom: 4,
        lineHeight: 20,
    },
    specialistCount: {
        fontSize: 12,
        color: "#32B5F4",
        fontWeight: "600",
    },
    bottomPadding: {
        height: 30,
    },
});
