import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL, fetchWithTimeout } from "../lib/api";

interface MealAnalysisResult {
    calories: string;
    macros: { protein: string; carbs: string; fats: string };
    healthy: boolean;
    good_for: string[];
    use_with_caution_for: string[];
    summary: string;
}

export default function MealAnalysisScreen() {
    const router = useRouter();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [mealName, setMealName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MealAnalysisResult | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission required", "You need to allow camera access.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            base64: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
            setResult(null);
        }
    };

    const analyzeMeal = async () => {
        if (!mealName.trim() && !imageBase64) {
            Alert.alert("Input Required", "Please enter a meal name or select an image.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetchWithTimeout(`${BASE_URL}/ai/meal-analysis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mealName, imageBase64 }),
                signal: controller.signal
            });
            clearTimeout(id);

            const data = await response.json();
            if (data.success && data.data) {
                setResult(data.data);
            } else {
                Alert.alert("Error", data.message || "Failed to analyze meal.");
            }
        } catch (error: any) {
            Alert.alert("Network Error", error.message || "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Meal Analysis</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="What are you eating? (e.g. Grilled Salmon)" 
                        value={mealName}
                        onChangeText={setMealName}
                    />
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                            <Ionicons name="image-outline" size={24} color="#007AFF" />
                            <Text style={styles.iconButtonText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={24} color="#007AFF" />
                            <Text style={styles.iconButtonText}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {imageUri && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => {
                            setImageUri(null);
                            setImageBase64(null);
                        }}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.analyzeButton} onPress={analyzeMeal} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeButtonText}>Analyze Meal</Text>}
                </TouchableOpacity>

                {result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Analysis Results</Text>
                        <View style={styles.resultRow}>
                            <Ionicons name="flame" size={20} color="#FF9500" />
                            <Text style={styles.resultText}>Calories: {result.calories}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Ionicons name="fitness" size={20} color="#34C759" />
                            <Text style={styles.resultText}>Protein: {result.macros.protein} | Carbs: {result.macros.carbs} | Fats: {result.macros.fats}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Ionicons name={result.healthy ? "checkmark-circle" : "warning"} size={20} color={result.healthy ? "#34C759" : "#FF3B30"} />
                            <Text style={styles.resultText}>{result.healthy ? "Generally Healthy" : "Consume with Moderation"}</Text>
                        </View>
                        <Text style={styles.summaryText}>{result.summary}</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    header: { flexDirection: "row", alignItems: "center", padding: 20, paddingTop: 60, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
    backButton: { marginRight: 15 },
    title: { fontSize: 20, fontWeight: "bold", color: "#333" },
    content: { padding: 20 },
    inputContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    input: { backgroundColor: "#f0f2f5", padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15 },
    buttonRow: { flexDirection: "row", justifyContent: "space-around" },
    iconButton: { alignItems: "center", padding: 10 },
    iconButtonText: { marginTop: 5, color: "#007AFF", fontSize: 14 },
    imagePreviewContainer: { position: "relative", alignSelf: "center", marginBottom: 20 },
    previewImage: { width: 300, height: 300, borderRadius: 15 },
    removeImageButton: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 15, padding: 5 },
    analyzeButton: { backgroundColor: "#007AFF", padding: 18, borderRadius: 15, alignItems: "center", marginBottom: 20 },
    analyzeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    resultCard: { backgroundColor: "#fff", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    resultTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#333" },
    resultRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    resultText: { marginLeft: 10, fontSize: 16, color: "#555" },
    summaryText: { marginTop: 15, fontSize: 16, color: "#333", fontStyle: "italic", lineHeight: 22 }
});
