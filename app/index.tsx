import { router } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/splash.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.buttonText}>sign up</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A3D62",
  },
  background: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 200,
  },
  button: {
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
