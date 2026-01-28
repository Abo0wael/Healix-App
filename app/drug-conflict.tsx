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

// Backend URI - matching your existing setup
// Ensure this matches your local IP if running on device
const API_URL = "http://192.168.0.149:3000";

interface ConflictResult {
    interaction_level: "Safe" | "Caution" | "Dangerous" | "Unknown";
    reason: string;
    recommendation: string;
}

export default function DrugConflictScreen() {
    const [drugs, setDrugs] = useState<string[]>([]);
    const [currentDrug, setCurrentDrug] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ConflictResult | null>(null);

    const addDrug = () => {
        if (!currentDrug.trim()) return;

        if (drugs.includes(currentDrug.trim())) {
            Alert.alert("Duplicate", "This drug is already in the list.");
            return;
        }

        setDrugs([...drugs, currentDrug.trim()]);
        setCurrentDrug("");
    };

    const removeDrug = (index: number) => {
        const updated = [...drugs];
        updated.splice(index, 1);
        setDrugs(updated);
        // Reset result if list changes to force re-check
        setResult(null);
    };

    const checkConflicts = async () => {
        if (drugs.length < 2) {
            Alert.alert("Error", "Please add at least two drugs to check.");
            return;
        }

        setLoading(true);
        setResult(null);
        Keyboard.dismiss();

        try {
            // Replace localhost/IP with your machine's IP if testing on device!
            // Using generic localhost for simulator or configured IP
            const endpoint = `${API_URL}/ai/drug-conflict`;

            console.log("Sending request to:", endpoint);

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ drugs }),
            });

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                Alert.alert("Error", data.error || "Failed to analyze conflicts.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Network Error", "Could not connect to the backend server. Make sure it's running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#083D5E', '#062E46']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.header}>
                        <Ionicons name="flask-outline" size={40} color="#32B5F4" style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>Drug Conflict Detection</Text>
                        <Text style={styles.subtitle}>
                            AI-powered interaction checker for safer medication management.
                        </Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Add Medications:</Text>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter drug name (e.g. Aspirin)"
                                placeholderTextColor="#90A4AE"
                                value={currentDrug}
                                onChangeText={setCurrentDrug}
                                onSubmitEditing={addDrug}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addDrug}>
                                <Ionicons name="add" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Drug List */}
                        <View style={styles.chipContainer}>
                            {drugs.map((drug, index) => (
                                <View key={index} style={styles.chip}>
                                    <Text style={styles.chipText}>{drug}</Text>
                                    <TouchableOpacity onPress={() => removeDrug(index)}>
                                        <Ionicons name="close-circle" size={20} color="#fff" style={{ marginLeft: 5, opacity: 0.8 }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {drugs.length === 0 && (
                                <Text style={styles.emptyText}>No drugs added yet.</Text>
                            )}
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity
                            style={[
                                styles.analyzeButton,
                                (drugs.length < 2 || loading) && styles.disabledButton
                            ]}
                            onPress={checkConflicts}
                            disabled={drugs.length < 2 || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="scan-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Check Interactions</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Result Section */}
                    {result && (
                        <View style={[styles.resultCard, { borderLeftColor: result.interaction_level === 'Safe' ? '#4CAF50' : result.interaction_level === 'Caution' ? '#FFC107' : result.interaction_level === 'Dangerous' ? '#F44336' : '#9E9E9E' }]}>
                            <View style={[styles.statusBadge, { backgroundColor: result.interaction_level === 'Safe' ? '#4CAF50' : result.interaction_level === 'Caution' ? '#FFC107' : result.interaction_level === 'Dangerous' ? '#F44336' : '#9E9E9E' }]}>
                                <Ionicons name={result.interaction_level === 'Safe' ? "checkmark-circle" : result.interaction_level === 'Caution' ? "warning" : "alert-circle"} size={18} color="#fff" />
                                <Text style={styles.statusText}>{result.interaction_level.toUpperCase()}</Text>
                            </View>

                            <View style={styles.resultContent}>
                                <Text style={styles.resultLabel}>Analysis:</Text>
                                <Text style={styles.resultValue}>{result.reason}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.resultLabel}>Recommendation:</Text>
                                <Text style={styles.resultValue}>{result.recommendation}</Text>
                            </View>
                        </View>
                    )}

                    {/* Disclaimer */}
                    <Text style={styles.disclaimer}>
                        ⚠️ DISCLAIMER: This feature uses AI for educational purposes only.
                        It does NOT replace professional medical advice. Always consult your doctor or pharmacist.
                    </Text>

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
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#B0BEC5',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#37474F',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F7F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        fontSize: 16,
        color: '#263238',
        borderWidth: 1,
        borderColor: '#E0E6EB',
        marginRight: 10,
    },
    addButton: {
        width: 50,
        height: 50,
        backgroundColor: '#32B5F4',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
        minHeight: 40,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A4A72',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    chipText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        color: '#90A4AE',
        fontStyle: 'italic',
        paddingTop: 8,
    },
    analyzeButton: {
        backgroundColor: '#083D5E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#B0BEC5',
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderLeftWidth: 6,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 6,
        letterSpacing: 1,
    },
    resultContent: {
        padding: 20,
    },
    resultLabel: {
        fontSize: 14,
        color: '#78909C',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    resultValue: {
        fontSize: 16,
        color: '#263238',
        lineHeight: 24,
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#ECEFF1',
        marginVertical: 10,
    },
    disclaimer: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 18,
    },
});
