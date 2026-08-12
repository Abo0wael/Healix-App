import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalizeSpecialty } from "../../constants/specialties";
import { Doctor, getDoctors } from "../../lib/doctorStorage";
import i18n from "../../lib/i18n";
import { useTheme } from "../../lib/ThemeContext";

export default function DoctorListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const { specialty } = useLocalSearchParams();
    const { theme, isDarkMode } = useTheme();

    useEffect(() => {
        loadDoctors();
    }, [specialty]);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const specialtyStr = Array.isArray(specialty) ? specialty[0] : specialty;
            const data = await getDoctors(specialtyStr as string);
            setDoctors(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderDoctorCard = ({ item }: { item: Doctor }) => {
        return (
            <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, shadowColor: isDarkMode ? '#fff' : '#000' }]}>
                <View style={styles.cardContent}>
                    {/* Image */}
                    <Image
                        source={{ uri: item.imageUrl || "https://via.placeholder.com/100" }}
                        style={styles.doctorImage}
                    />

                    {/* Info */}
                    <View style={styles.infoColumn}>
                        <View style={styles.headerRow}>
                            <Text style={[styles.doctorName, { color: theme.text }]}>{i18n.t('dr_prefix')}{item.name}</Text>
                        </View>
                        <Text style={[styles.specialty, { color: theme.primary }]}>
                            {i18n.t(`specialty.${normalizeSpecialty(item.specialty)}`)}
                        </Text>
                        <View style={styles.statsRow}>
                            <Ionicons name="briefcase-outline" size={14} color={theme.textSecondary} />
                            <Text style={[styles.statsText, { color: theme.textSecondary }]}>{item.yearsOfExperience} {i18n.t('years_unit')}</Text>
                            <View style={styles.dot} />
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={[styles.statsText, { color: theme.textSecondary }]}>{item.rating}</Text>
                        </View>

                        {/* Fees */}
                        <Text style={[styles.feesText, { color: theme.text }]}>
                            <Text style={{ color: theme.textSecondary }}>{i18n.t('consultation_fee_label')}</Text>
                            ${item.fees || '50'}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push(`/doctors/${item.id}`)}
                    >
                        <Text style={styles.bookButtonText}>{i18n.t('book_btn')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {specialty
                        ? i18n.t(`specialty.${Array.isArray(specialty) ? specialty[0] : specialty}`)
                        : i18n.t('doctors_list_title')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={[styles.center, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={doctors}
                    renderItem={renderDoctorCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={[styles.center, { backgroundColor: theme.background }]}>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{i18n.t('no_docs', { specialty: specialty ? i18n.t(`specialty.${Array.isArray(specialty) ? specialty[0] : specialty}`) : '' })}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F9FF",
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardContent: {
        flexDirection: "row",
        marginBottom: 16,
    },
    doctorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f5f5f5",
    },
    infoColumn: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    doctorName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        color: "#32B5F4",
        marginBottom: 8,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 4,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ccc',
        marginHorizontal: 8,
    },
    feesText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    bookButton: {
        backgroundColor: '#32B5F4',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: "700",
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 20,
        textAlign: 'center',
    },
});
