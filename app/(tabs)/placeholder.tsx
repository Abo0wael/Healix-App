import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../../lib/i18n";
import { useTheme } from "../../lib/ThemeContext";

export default function ServicesScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();

    // Define the services grid matching the user's screenshot request
    const services = [
        {
            id: "meal",
            title: i18n.t('service_meal'),
            icon: "restaurant-outline",
            color: "#E3F2FD",
            iconColor: "#1976D2",
            route: "/meal-analysis",
        },
        {
            id: "drug-alt",
            title: i18n.t('service_drug_alt'),
            icon: "medkit-outline",
            color: "#E8EAF6",
            iconColor: "#3F51B5",
            route: "/drug-alternative",
        },
        {
            id: "conflict",
            title: i18n.t('service_conflict'),
            icon: "flask-outline", // or warning-outline for the triangle look
            color: "#FFF3E0",
            iconColor: "#F57C00",
            route: "/drug-conflict",
        },
        {
            id: "doctor",
            title: i18n.t('service_doctor'),
            icon: "person-outline",
            color: "#E1F5FE",
            iconColor: "#0288D1",
            route: "/find-doctor",
        },
        {
            id: "caregiver",
            title: i18n.t('service_caregiver') || "Family & Caregivers",
            icon: "people-circle-outline",
            color: "#F3E5F5",
            iconColor: "#7B1FA2",
            route: "/caregiver-portal",
        },
        {
            id: "reminder",
            title: i18n.t('service_reminder'),
            icon: "alarm-outline",
            color: "#E0F2F1",
            iconColor: "#00897B",
            route: "/add-reminder",
        },
        {
            id: "sos",
            title: i18n.t('service_sos'),
            icon: "call-outline",
            color: "#FFEBEE",
            iconColor: "#D32F2F",
            route: "/emergency-sos",
        },
        {
            id: "helix-chat",
            title: "Helix Chat",
            icon: "chatbubbles-outline",
            color: "#EDE7F6",
            iconColor: "#6A1B9A",
            route: "/helix-chat",
        },
        {
            id: "medical-report",
            title: "Report Analysis",
            icon: "document-text-outline",
            color: "#E0F7FA",
            iconColor: "#00838F",
            route: "/medical-report",
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.background }]}>
                    {/* Using a custom back button logic if needed, but since it's a tab, we might not need back arrow. 
                The screenshot showed a back arrow but this is a main tab. I'll keep it clean. */}
                    <Text style={[styles.headerTitle, { color: theme.primary }]}>{i18n.t('our_services')}</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color={theme.text} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[styles.card, { backgroundColor: isDarkMode ? theme.surfaceElevated : service.color, borderColor: theme.border }]}
                                onPress={() => router.push(service.route as any)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconCircle, isDarkMode && { backgroundColor: theme.surface }]}>
                                    {/* In a real app we might use Images like in the screenshot, but Ionicons are cleaner for now. 
                         If the user wants exact images I'd need assets. I'll use large Icons to mimic the visual weight. */}
                                    <Ionicons name={service.icon as any} size={40} color={isDarkMode ? theme.primary : service.iconColor} />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>{service.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the title
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0A4A72', // Keeping consistent with app theme
    },
    notificationButton: {
        position: 'absolute',
        right: 20,
        top: 25,
        padding: 5,
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    card: {
        width: '47%', // roughly half width with gap
        aspectRatio: 0.9, // Make it slightly taller than square or square
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.6)', // Semi-transparent white to make icon pop on colored bg
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
    },
});
