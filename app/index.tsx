import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../lib/i18n";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/splash.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {/* Spacer to push buttons to bottom */}
            <View style={{ flex: 1 }} />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.loginText}>{i18n.t('log_in') || "Login"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.signupButton]}
                onPress={() => router.push("/signup")}
                activeOpacity={0.8}
              >
                <Text style={styles.signupText}>{i18n.t('signup_btn') || "Sign Up"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: "#00838F", // Teal/Medical color
  },
  signupButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#00838F",
  },
  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    color: "#00838F",
    fontSize: 18,
    fontWeight: "bold",
  },
});
