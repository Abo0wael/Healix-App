import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 Login Handler
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Error", "Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <Image
          source={require("../assets/images/login.png")}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Login</Text>

        {/* Email */}
        <View style={styles.inputRow}>
          <Text style={styles.icon}>@</Text>
          <TextInput
            placeholder="Email ID"
            placeholderTextColor="#cfd8dc"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputRow}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#cfd8dc"
            secureTextEntry={!passwordVisible}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eye}>{passwordVisible ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgot}>Forgot?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Register */}
        <Text style={styles.register}>
          New to this platform?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/signup")}
          >
            Register
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#083D5E",
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
  },

  content: {
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  image: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.5)",
    paddingBottom: 10,
    marginBottom: 20,
  },

  icon: {
    color: "#fff",
    fontSize: 18,
    marginRight: 12,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },

  eye: {
    fontSize: 18,
    color: "#fff",
  },

  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgot: {
    color: "#6ED3FF",
  },

  loginButton: {
    width: "100%",
    backgroundColor: "#32B5F4",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  register: {
    color: "#fff",
  },
  registerLink: {
    color: "#6ED3FF",
    fontWeight: "bold",
  },
});
