import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL, fetchWithTimeout } from "../lib/api";
import i18n from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

interface InteractionResult {
    status: "SAFE" | "CAUTION" | "CONTRAINDICATED" | "UNKNOWN";
    reason: string;
}

export default function DrugInteractionScreen() {
    const [drug1, setDrug1] = useState("");
    const [drug2, setDrug2] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<InteractionResult | null>(null);
    const { theme, isDarkMode } = useTheme();

    const checkInteraction = async () => {
        if (!drug1.trim() || !drug2.trim()) {
            if (!drug1.trim() || !drug2.trim()) {
                Alert.alert(i18n.t('input_error'), i18n.t('enter_both_drugs'));
                return;
            }
            return;
        }

        setLoading(true);
        setResult(null);
        Keyboard.dismiss();

        try {
            console.log("Creating request to:", `${BASE_URL}/ai/drug-interaction`);

            const response = await fetchWithTimeout(`${BASE_URL}/ai/drug-interaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    drugs: [drug1.trim(), drug2.trim()]
                }),
            });

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                Alert.alert("Error", data.error || "Failed to analyze interaction.");
            }

        } catch (error) {
            console.error("Interaction check failed:", error);
            Alert.alert(
                "Connection Error",
                error instanceof Error ? error.message : `Could not connect to ${BASE_URL}. Ensure the server is running and accessible.`
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SAFE': return '#4CAF50'; // Green
            case 'CAUTION': return '#FF9800'; // Orange
            case 'CONTRAINDICATED': return '#F44336'; // Red
            default: return '#9E9E9E'; // Grey
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SAFE': return 'checkmark-circle';
            case 'CAUTION': return 'warning';
            case 'CONTRAINDICATED': return 'alert-circle';
            default: return 'help-circle';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={isDarkMode ? ['#121212', '#1E1E1E'] : ['#083D5E', '#062E46']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.header}>
                        <Ionicons name="git-merge-outline" size={44} color={isDarkMode ? theme.primary : "#32B5F4"} style={{ marginBottom: 10 }} />
                        <Text style={[styles.title, { color: isDarkMode ? theme.text : '#fff' }]}>{i18n.t('conflict_title')}</Text>
                        <Text style={styles.subtitle}>
                            {i18n.t('conflict_subtitle')}
                        </Text>
                    </View>

                    {/* Input Card */}
                    <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('first_drug')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="medkit-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder={i18n.t('drug1_placeholder')}
                                placeholderTextColor={theme.textSecondary}
                                value={drug1}
                                onChangeText={setDrug1}
                            />
                        </View>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('second_drug')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="medkit-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder={i18n.t('drug2_placeholder')}
                                placeholderTextColor={theme.textSecondary}
                                value={drug2}
                                onChangeText={setDrug2}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.analyzeButton,
                                { backgroundColor: theme.primary, shadowColor: theme.primary },
                                (loading || !drug1 || !drug2) && styles.disabledButton
                            ]}
                            onPress={checkInteraction}
                            disabled={loading || !drug1 || !drug2}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>{i18n.t('check_interaction')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Results Card */}
                    {result && (
                        <View style={[styles.resultCard, { borderLeftColor: getStatusColor(result.status), backgroundColor: theme.surfaceElevated }]}>
                            <View style={[styles.statusHeader, { backgroundColor: getStatusColor(result.status) }]}>
                                <Ionicons name={getStatusIcon(result.status) as any} size={24} color="#fff" />
                                <Text style={styles.statusText}>{result.status}</Text>
                            </View>

                            <View style={styles.resultBody}>
                                <Text style={[styles.reasonLabel, { color: theme.textSecondary }]}>{i18n.t('analysis_result')}</Text>
                                <Text style={[styles.reasonText, { color: theme.text }]}>{result.reason}</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#083D5E",
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#B0BEC5',
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#455A64',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E6EB',
        marginBottom: 20,
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#263238',
        height: '100%',
    },
    analyzeButton: {
        backgroundColor: '#083D5E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        marginTop: 8,
        shadowColor: "#083D5E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#CFD8DC',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderLeftWidth: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 1,
    },
    resultBody: {
        padding: 24,
    },
    reasonLabel: {
        fontSize: 12,
        color: '#90A4AE',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 16,
        color: '#37474F',
        lineHeight: 24,
    },
});
