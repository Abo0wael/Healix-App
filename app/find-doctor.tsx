import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPECIALTY_IDS } from "../constants/specialties";
import i18n from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

const SPECIALTIES = [
    { id: '1', name: SPECIALTY_IDS.CARDIOLOGY, count: '40', icon: 'heart-outline', color: '#E3F2FD' },
    { id: '2', name: SPECIALTY_IDS.DERMATOLOGY, count: '150', icon: 'body-outline', color: '#FFF3E0' },
    { id: '3', name: SPECIALTY_IDS.MENTAL, count: '100', icon: 'happy-outline', color: '#E0F2F1' },
    { id: '4', name: SPECIALTY_IDS.DENTAL, count: '300', icon: 'add-circle-outline', color: '#F3E5F5' },
    { id: '5', name: SPECIALTY_IDS.DIGESTIVE, count: '50', icon: 'nutrition-outline', color: '#FFF8E1' },
    { id: '6', name: SPECIALTY_IDS.ORTHOPEDICS, count: '70', icon: 'walk-outline', color: '#FFEBEE' },
];

export default function FindDoctorScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode } = useTheme();

    const handleSpecialtyPress = (specialtyName: string) => {
        router.push({
            pathname: "/doctors/list",
            params: { specialty: specialtyName }
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.primary }]}>{i18n.t('choose_specialty')}</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: theme.primary }]}>
                    <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
                    <TextInput
                        placeholder={i18n.t('search_doctors')}
                        placeholderTextColor="#E1F5FE"
                        style={styles.searchInput}
                    />
                </View>

                {/* Specialties Grid */}
                <View style={styles.grid}>
                    {SPECIALTIES.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                            onPress={() => handleSpecialtyPress(item.name)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color === '#E3F2FD' ? theme.surface : item.color }]}>
                                {/* Using Ionicons as placeholder for the colorful icons in design */}
                                <Ionicons name={item.icon as any} size={40} color={isDarkMode ? theme.text : theme.primary} />
                            </View>
                            <Text style={[styles.specialtyName, { color: theme.text }]}>{i18n.t(`specialty.${item.name}`)}</Text>
                            <Text style={[styles.specialtyCount, { color: theme.primary }]}>{item.count} {i18n.t('specialist')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#32B5F4',
    },
    notificationButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    searchContainer: {
        backgroundColor: '#32B5F4',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 30,
        shadowColor: '#32B5F4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff', // Or specific colors if needed
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F5F9FF'
    },
    specialtyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    specialtyCount: {
        fontSize: 12,
        color: '#32B5F4',
    },
});
