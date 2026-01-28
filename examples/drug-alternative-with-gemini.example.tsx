/**
 * Example: How to integrate Gemini AI into the Drug Alternative Screen
 * 
 * This file shows the changes needed to test the Gemini integration.
 * You can copy parts of this code into drug-alternative.tsx when ready to test.
 */

import { checkBackendHealth, getDrugAlternatives } from "@/lib/gemini-service";
import { useState } from "react";

// Example 1: Add these state variables to your component
export function DrugAlternativeWithGemini() {
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);

    // NEW: Add these states for Gemini integration
    const [isLoading, setIsLoading] = useState(false);
    const [aiAlternatives, setAiAlternatives] = useState<any[]>([]);
    const [disclaimer, setDisclaimer] = useState("");
    const [error, setError] = useState("");

    // Example 2: Replace or modify handleSearch function
    const handleSearch = async () => {
        if (searchText.trim().length === 0) {
            setShowResults(false);
            return;
        }

        // Clear previous results
        setError("");
        setIsLoading(true);
        setShowResults(true);

        try {
            console.log(`🔍 Searching for alternatives to: ${searchText}`);

            // Call Gemini API
            const response = await getDrugAlternatives(searchText);

            console.log("✅ Gemini Response:", response);

            // Update state with AI results
            setAiAlternatives(response.alternatives);
            setDisclaimer(response.disclaimer);

        } catch (err: any) {
            console.error("❌ Error fetching alternatives:", err);
            setError(err.message || "Failed to fetch alternatives. Make sure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    // Example 3: Check backend health on component mount
    const checkBackend = async () => {
        const isHealthy = await checkBackendHealth();
        if (isHealthy) {
            console.log("✅ Backend is running and healthy");
        } else {
            console.warn("⚠️ Backend is not running. Start it with: cd backend && npm start");
        }
    };

    // Example 4: Render the AI results
    const renderAiResults = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>🤖 AI is thinking...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorHint}>
                        Make sure the backend is running on http://localhost:3000
                    </Text>
                </View>
            );
        }

        if (aiAlternatives.length === 0) {
            return null;
        }

        return (
            <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>🤖 AI-Generated Alternatives for</Text>
                    <Text style={styles.resultDrugName}>{searchText}</Text>
                </View>

                {aiAlternatives.map((drug, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.drugCard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.drugIconContainer}>
                            <View style={styles.drugIconCircle}>
                                <Text style={styles.drugIcon}>💊</Text>
                            </View>
                        </View>

                        <View style={styles.drugInfo}>
                            <Text style={styles.drugName}>{drug.name}</Text>
                            <Text style={styles.drugNote}>{drug.note}</Text>
                        </View>

                        <Text style={styles.arrowIcon}>›</Text>
                    </TouchableOpacity>
                ))}

                {disclaimer && (
                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>⚠️ {disclaimer}</Text>
                    </View>
                )}
            </View>
        );
    };

    // You would use renderAiResults() in your JSX where you want to show the results
}

// Example 5: Additional styles to add
const additionalStyles = {
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 18,
        color: '#32B5F4',
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#F57C00',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorHint: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
    disclaimerContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    disclaimerText: {
        fontSize: 13,
        color: '#F57C00',
        fontWeight: '500',
        lineHeight: 20,
    },
    drugNote: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        lineHeight: 20,
    },
};

/**
 * TESTING INSTRUCTIONS:
 * 
 * 1. Make sure backend is running:
 *    cd backend
 *    npm start
 * 
 * 2. Test the service independently first:
 *    import { getDrugAlternatives } from '@/lib/gemini-service';
 *    
 *    const test = async () => {
 *      const result = await getDrugAlternatives('Aspirin');
 *      console.log(result);
 *    };
 *    test();
 * 
 * 3. Then integrate into your screen by copying the relevant parts above
 * 
 * 4. Test with different drug names:
 *    - Aspirin
 *    - Metformin
 *    - Amoxicillin
 *    - Ibuprofen
 */
