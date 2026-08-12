import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

import { normalizeSpecialty } from '../../constants/specialties';
import { bookAppointment, Doctor, DoctorSlot, generateDailySlots, getDoctorById, getDoctorSlots } from '../../lib/doctorStorage';
import i18n from '../../lib/i18n';
import { useTheme } from '../../lib/ThemeContext';

export default function DoctorProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [slots, setSlots] = useState<DoctorSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [patientNote, setPatientNote] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const { theme, isDarkMode } = useTheme();

    const { id } = useLocalSearchParams();

    useEffect(() => {
        if (!id) return;
        const doctorId = Array.isArray(id) ? id[0] : id;
        loadDoctorData(doctorId);
    }, [id]);

    const loadDoctorData = async (doctorId: string) => {
        try {
            const docData = await getDoctorById(doctorId);
            setDoctor(docData);

            // Generate slots if needed
            await generateDailySlots(doctorId);

            const slotsData = await getDoctorSlots(doctorId);
            setSlots(slotsData);
        } catch (error) {
            console.error("Failed to load doctor", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot || !doctor) return;

        try {
            setBookingLoading(true);
            const slot = slots.find(s => s.id === selectedSlot);
            if (!slot) return;

            const result = await bookAppointment(selectedSlot, doctor.id, slot.date, slot.time, patientNote);

            if (result.success) {
                alert(i18n.t('booking_success'));
                router.back();
            } else {
                alert(result.error || i18n.t('booking_failed'));
                // Refresh slots
                const slotsData = await getDoctorSlots(doctor.id);
                setSlots(slotsData);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!doctor) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Doctor not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.primary }]}>{i18n.t('doctor_profile_title')}</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Doctor Image & Heart */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: doctor.imageUrl || 'https://via.placeholder.com/150' }}
                        style={styles.doctorImage}
                    />
                    <TouchableOpacity style={[styles.heartButton, { backgroundColor: theme.surfaceElevated, shadowColor: isDarkMode ? '#fff' : '#000' }]}>
                        <Ionicons name="heart-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* Info */}
                <Text style={[styles.doctorName, { color: theme.text }]}>{doctor.name}</Text>
                <Text style={[styles.specialty, { color: theme.textSecondary }]}>{i18n.t(`specialty.${normalizeSpecialty(doctor.specialty)}`)}</Text>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{doctor.rating} ({doctor.reviewsCount || 96} {i18n.t('reviews')})</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBg, { backgroundColor: theme.surface }]}>
                            <Ionicons name="people" size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{doctor.patientsCount || '116+'}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('patients_label')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBg, { backgroundColor: theme.surface }]}>
                            <Ionicons name="calendar-outline" size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{doctor.yearsOfExperience || '3+'}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('years_unit')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBg, { backgroundColor: theme.surface }]}>
                            <Ionicons name="star" size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{doctor.rating}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{i18n.t('stat_total')}</Text>
                    </View>

                </View>

                {/* About (Optional but good) */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('about_section')}</Text>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                    {doctor.about || `Dr. ${doctor.name} is a top specialist in ${doctor.specialty} at ${doctor.clinicName}. dedicated to providing the best care.`}
                </Text>

                {/* Slots */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('available_slots_today')}</Text>
                <View style={styles.slotsGrid}>
                    {slots.filter(s => s.date === getLocalDateString()).length === 0 ? (
                        <Text style={styles.noSlots}>{i18n.t('no_slots_today')}</Text>
                    ) : (
                        slots.filter(s => s.date === getLocalDateString()).map((slot) => {
                            const isSelected = selectedSlot === slot.id;
                            return (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[styles.slotCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, isSelected && [styles.slotCardSelected, { backgroundColor: theme.primary, borderColor: theme.primary }]]}
                                    onPress={() => setSelectedSlot(slot.id)}
                                >
                                    <Text style={[styles.slotTime, { color: theme.text }, isSelected && styles.slotTextSelected]}>{slot.time}</Text>
                                    <Text style={[styles.slotStatus, isSelected && styles.slotTextSelected]}>{i18n.t('slot_available')}</Text>
                                </TouchableOpacity>
                            )
                        })
                    )}
                </View>

                {/* Patient Note Input - Always visible */}
                <View style={styles.noteContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('note_optional')}</Text>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{i18n.t('feeling_question')}</Text>
                    <TextInput
                        style={[styles.noteInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text }]}
                        placeholder={i18n.t('symptoms_placeholder')}
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={patientNote}
                        onChangeText={setPatientNote}
                    />
                </View>

            </ScrollView>

            {/* Book Button */}
            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }, (!selectedSlot || bookingLoading) && [styles.bookButtonDisabled, { backgroundColor: theme.surface }]]}
                    onPress={handleBook}
                    disabled={!selectedSlot || bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.bookButtonText}>{i18n.t('book_btn')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
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
        paddingBottom: 100,
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 20,
        position: 'relative',
    },
    doctorImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    heartButton: {
        position: 'absolute',
        right: '25%',
        top: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    doctorName: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#333',
    },
    specialty: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    ratingText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 24,
        marginBottom: 8,
        color: '#333',
    },
    aboutText: {
        marginHorizontal: 20,
        color: '#666',
        lineHeight: 22,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10,
        marginTop: 8,
    },
    slotCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        width: '48%', // 2 columns
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotCardSelected: {
        backgroundColor: '#32B5F4',
        borderColor: '#32B5F4',
    },
    slotTime: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    slotStatus: {
        fontSize: 11,
        color: '#4CAF50',
    },
    slotTextSelected: {
        color: '#fff',
    },
    noSlots: {
        color: '#999',
        fontStyle: 'italic',
        marginLeft: 10,
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    bookButton: {
        backgroundColor: '#32B5F4',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    bookButtonDisabled: {
        backgroundColor: '#b0dcf5',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    noteContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        marginLeft: 20,
    },
    noteInput: {
        marginHorizontal: 20,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
