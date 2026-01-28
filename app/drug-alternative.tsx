import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// Backend API configuration
// Using explicit Network IP as requested
const API_BASE_URL = "http://192.168.0.149:3000";

interface DrugAlternative {
    name: string;
    dose: string;
    reason: string;
}

interface ApiResponse {
    drugName: string;
    alternatives: DrugAlternative[];
}

export default function DrugAlternativeScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alternatives, setAlternatives] = useState<DrugAlternative[]>([]);
    const [queriedDrugName, setQueriedDrugName] = useState("");
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (searchText.trim().length === 0) {
            setShowResults(false);
            return;
        }

        // Clear previous results and errors
        setError("");
        setIsLoading(true);
        setShowResults(true);
        setAlternatives([]);

        try {
            console.log(`🔍 Searching for alternatives to: ${searchText}`);
            console.log(`📡 Connecting to backend at: ${API_BASE_URL}/ai/drug-alternatives`);

            const response = await fetch(`${API_BASE_URL}/ai/drug-alternatives`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ drug: searchText }),
            });

            console.log(`📨 Response status: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Backend Error Response:", errorData);

                // Handle quota errors specifically
                if (response.status === 429) {
                    const quotaMessage = errorData.retryMessage
                        ? `${errorData.message}\n${errorData.retryMessage}`
                        : errorData.message || 'API quota exceeded. Please wait and try again.';
                    throw new Error(quotaMessage);
                }

                // Other errors
                throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            console.log("✅ Received alternatives:", data);

            // Update state with API results
            setAlternatives(data.alternatives || []);
            setQueriedDrugName(data.drugName || searchText);

        } catch (err: any) {
            console.error("❌ Fetch Error:", err);

            // Check for network errors vs API errors
            const isNetworkError = err.message === 'Failed to fetch' || err.message.includes('Network request failed');

            if (isNetworkError) {
                setError(`Network Error: Cannot connect to ${API_BASE_URL}.\nMake sure you are on the same WiFi.`);
            } else {
                setError(err.message || "Failed to fetch alternatives.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleNotificationPress = () => {
        console.log("Notification button pressed");
        // Placeholder for notification logic
    };

    const handleCameraPress = () => {
        console.log("Camera button pressed");
        // Placeholder for camera/OCR feature
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

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Drug Alternative</Text>
                    <Text style={styles.headerTitle}>Search</Text>
                </View>

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
                {/* Intro Section */}
                <View style={styles.introSection}>
                    {/* Illustration/Icon */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.illustrationCircle}>
                            <Text style={styles.illustrationIcon}>💊</Text>
                            <Text style={styles.illustrationPlus}>➕</Text>
                        </View>
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Find safe and available alternatives in seconds.
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Put your drug..."
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleCameraPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cameraIcon}>📷</Text>
                    </TouchableOpacity>
                </View>

                {/* Search/Generate Button */}
                <TouchableOpacity
                    style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
                    onPress={handleSearch}
                    activeOpacity={0.8}
                    disabled={isLoading || searchText.trim().length === 0}
                >
                    <Text style={styles.searchButtonText}>
                        {isLoading ? "Searching..." : "🔍 Search / Generate"}
                    </Text>
                </TouchableOpacity>

                {/* Loading State */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#32B5F4" />
                        <Text style={styles.loadingText}>Finding alternatives...</Text>
                    </View>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.errorHint}>
                            Checking connection to: {API_BASE_URL.replace('http://', '')}
                        </Text>
                        <Text style={styles.errorHint} numberOfLines={2}>
                            Make sure backend is running and you are on the same WiFi.
                        </Text>
                    </View>
                )}

                {/* Empty State - No Results Found */}
                {!isLoading && !error && showResults && alternatives.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💊</Text>
                        <Text style={styles.emptyText}>No alternatives found</Text>
                        <Text style={styles.emptyTextSmall}>
                            Try searching for a different drug name
                        </Text>
                    </View>
                )}

                {/* Empty State - Initial */}
                {!showResults && !isLoading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔎</Text>
                        <Text style={styles.emptyText}>
                            Start typing a medication name
                        </Text>
                        <Text style={styles.emptyText}>to see alternatives</Text>
                    </View>
                )}

                {/* Results List */}
                {!isLoading && !error && showResults && alternatives.length > 0 && (
                    <View style={styles.resultsContainer}>
                        {/* Results Header */}
                        <View style={styles.resultHeaderBox}>
                            <Text style={styles.resultTitle}>💊 Alternatives for</Text>
                            <Text style={styles.resultDrugName}>{queriedDrugName}</Text>
                            <Text style={styles.resultSubtitle}>
                                {alternatives.length} option{alternatives.length !== 1 ? 's' : ''} found
                            </Text>
                        </View>

                        {/* Alternative Cards */}
                        <View style={styles.resultsSection}>
                            {alternatives.map((drug, index) => (
                                <View
                                    key={index}
                                    style={[styles.drugCard, {
                                        animationDelay: `${index * 100}ms`
                                    }]}
                                >
                                    {/* Left Side: Icon */}
                                    <View style={styles.drugIconContainer}>
                                        <View style={styles.drugIconCircle}>
                                            <Text style={styles.drugIcon}>💊</Text>
                                        </View>
                                    </View>

                                    {/* Center: Drug Info */}
                                    <View style={styles.drugInfo}>
                                        <Text style={styles.drugName}>{drug.name}</Text>
                                        <View style={styles.doseContainer}>
                                            <Text style={styles.doseLabel}>💉 Dose:</Text>
                                            <Text style={styles.drugDosage}>{drug.dose}</Text>
                                        </View>
                                        <View style={styles.reasonContainer}>
                                            <Text style={styles.reasonIcon}>ℹ️</Text>
                                            <Text style={styles.drugReason}>{drug.reason}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Disclaimer */}
                        <View style={styles.disclaimerBox}>
                            <Text style={styles.disclaimerIcon}>⚠️</Text>
                            <Text style={styles.disclaimerText}>
                                AI-generated suggestions. Always consult a healthcare professional before changing medications.
                            </Text>
                        </View>
                    </View>
                )}

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
    headerCenter: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#32B5F4",
        lineHeight: 24,
    },
    notificationIcon: {
        fontSize: 22,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    introSection: {
        alignItems: "center",
        marginBottom: 20,
    },
    illustrationContainer: {
        marginBottom: 12,
    },
    illustrationCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    illustrationIcon: {
        fontSize: 48,
    },
    illustrationPlus: {
        position: "absolute",
        bottom: 0,
        right: -5,
        fontSize: 28,
        color: "#32B5F4",
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        fontWeight: "500",
        lineHeight: 22,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#32B5F4",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 30,
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
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
    cameraButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    cameraIcon: {
        fontSize: 18,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
        opacity: 0.3,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        lineHeight: 24,
    },
    resultsContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    resultHeaderBox: {
        alignItems: "center",
        paddingBottom: 20,
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#F0F0F0",
    },
    resultTitle: {
        fontSize: 16,
        color: "#666",
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center",
    },
    resultDrugName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#32B5F4",
        letterSpacing: -0.5,
        textAlign: "center",
        marginBottom: 8,
    },
    resultSubtitle: {
        fontSize: 14,
        color: "#999",
        fontWeight: "500",
    },
    resultsSection: {
        gap: 16,
    },
    drugCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    drugIconContainer: {
        marginRight: 16,
    },
    drugIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    drugIcon: {
        fontSize: 30,
    },
    drugInfo: {
        flex: 1,
    },
    drugName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 10,
    },
    doseContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    doseLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#32B5F4",
        marginRight: 6,
    },
    drugDosage: {
        fontSize: 14,
        fontWeight: "600",
        color: "#32B5F4",
        flex: 1,
    },
    reasonContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#F9F9F9",
        borderRadius: 10,
        padding: 10,
    },
    reasonIcon: {
        fontSize: 14,
        marginRight: 6,
        marginTop: 2,
    },
    drugReason: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        flex: 1,
    },
    disclaimerBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFF9E6",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#FFB82E",
    },
    disclaimerIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        color: "#7A6E00",
        lineHeight: 20,
        fontWeight: "500",
    },
    arrowIcon: {
        fontSize: 28,
        color: "#CCC",
        fontWeight: "300",
    },
    searchButton: {
        backgroundColor: "#32B5F4",
        borderRadius: 25,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        marginBottom: 30,
        shadowColor: "#32B5F4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    searchButtonDisabled: {
        backgroundColor: "#B0BEC5",
        shadowOpacity: 0.1,
    },
    searchButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: "#32B5F4",
        fontWeight: "600",
        marginTop: 16,
    },
    errorContainer: {
        backgroundColor: "#FFF3E0",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: "#F57C00",
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    errorHint: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
    },
    emptyTextSmall: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginTop: 8,
    },
    bottomPadding: {
        height: 30,
    },
});
