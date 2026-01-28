import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealAnalysisScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Meal Analysis</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.icon}>🥗</Text>
                <Text style={styles.placeholderText}>Meal Analysis Feature Coming Soon!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { padding: 20, paddingTop: 50, flexDirection: "row", alignItems: "center" },
    backButton: { marginRight: 20 },
    backText: { fontSize: 24, color: "#32B5F4" },
    title: { fontSize: 24, fontWeight: "bold", color: "#333" },
    content: { flex: 1, justifyContent: "center", alignItems: "center" },
    icon: { fontSize: 60, marginBottom: 20 },
    placeholderText: { fontSize: 18, color: "#666" }
});
