import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import i18n from "../lib/i18n";
import { notifyCaregivers } from "../lib/pushNotifications";
import { useTheme } from "../lib/ThemeContext";

export default function EmergencySOSScreen() {
    const { theme } = useTheme();
    const handleSOSPress = async () => {
        // 1. Notify caregivers FIRST and show an alert
        const success = await notifyCaregivers(
            "🚨 EMERGENCY SOS 🚨",
            "A patient has triggered an SOS alert! Please contact them immediately."
        );

        if (success) {
            Alert.alert("SOS Sent", "Caregivers have been notified successfully.");
        } else {
            Alert.alert("No Caregivers", "Could not notify caregivers. Make sure you have linked your account with a family member and they have opened the app.");
        }

        // 2. Open phone dialer
        const emergencyNumber = "911";
        const url = `tel:${emergencyNumber}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert("Error", "Phone dialing is not supported on this device.");
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error("An error occurred", err));
    };

    const handleBackPress = () => {
        console.log("Back button pressed");
        // Placeholder for navigation
    };

    const handleNotificationPress = () => {
        console.log("Notification button pressed");
        // Placeholder for notification logic
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: theme.surfaceElevated }]}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.error }]}>{i18n.t('sos_title')}</Text>

                <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: theme.surfaceElevated }]}
                    onPress={handleNotificationPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Emergency Icon */}
                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                </View>

                {/* Info Text */}
                <Text style={[styles.infoTitle, { color: theme.text }]}>{i18n.t('emergency_assistance')}</Text>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {i18n.t('sos_instruction')}
                </Text>
                <Text style={[styles.infoSubtext, { color: theme.textSecondary }]}>
                    {i18n.t('sos_subtext')}
                </Text>

                {/* SOS Button */}
                <View style={styles.sosButtonContainer}>
                    {/* Outer Circle (Light Gray) */}
                    <View style={[styles.sosOuterCircle, { backgroundColor: theme.surface }]}>
                        {/* Red SOS Button */}
                        <TouchableOpacity
                            style={styles.sosButton}
                            onPress={handleSOSPress}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sosText}>SOS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Info */}
                <View style={[styles.bottomInfo, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1 }]}>
                    <Text style={styles.bottomInfoIcon}>📞</Text>
                    <Text style={[styles.bottomInfoText, { color: theme.textSecondary }]}>
                        {i18n.t('immediate_assistance')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    backArrow: {
        fontSize: 24,
        color: "#EF5350",
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#EF5350",
        letterSpacing: -0.3,
    },
    notificationIcon: {
        fontSize: 22,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    warningContainer: {
        marginBottom: 20,
    },
    warningIcon: {
        fontSize: 48,
    },
    infoTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1a1a1a",
        marginBottom: 12,
        textAlign: "center",
    },
    infoText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 6,
        paddingHorizontal: 20,
    },
    infoSubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginBottom: 50,
        paddingHorizontal: 30,
    },
    sosButtonContainer: {
        marginVertical: 30,
    },
    sosOuterCircle: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    sosButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "#EF5350",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#EF5350",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    sosText: {
        fontSize: 42,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 4,
    },
    bottomInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF9C4",
        borderRadius: 16,
        padding: 16,
        marginTop: 40,
        maxWidth: 320,
    },
    bottomInfoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    bottomInfoText: {
        flex: 1,
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
        lineHeight: 18,
    },
});
