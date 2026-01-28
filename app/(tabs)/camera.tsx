import { StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Camera Screen</Text>
            <Text style={styles.subtitle}>Coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
});
