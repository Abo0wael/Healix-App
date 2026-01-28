import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../lib/firebase";

export default function Signup() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);

  // Validation & Signup Logic
  const handleSignup = async () => {
    // 1. Basic Validation
    if (!email || !fullName || !age || !phone || !password || !confirmPassword || !gender) {
      Alert.alert("Missing Information", "Please fill in all fields to continue.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    // 2. Signup Process
    setLoading(true);
    try {
      // Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save Data to Firestore
      await setDoc(doc(db, "users", uid), {
        fullName,
        email,
        age: Number(age),
        phone,
        gender,
        createdAt: serverTimestamp(),
      });

      // Success
      Alert.alert("Welcome!", "Your account has been created successfully.", [
        { text: "Continue to Login", onPress: () => router.replace("/login") }
      ]);
    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "An unexpected error occurred.";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#083D5E', '#0A4A72', '#106494']}
        style={styles.background}
      />

      <View style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Sign up to get started</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#083D5E" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#90A4AE"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#083D5E" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. john@example.com"
                    placeholderTextColor="#90A4AE"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Age & Phone Row */}
              <View style={styles.row}>
                {/* Age */}
                <View style={[styles.inputWrapper, { flex: 0.4, marginRight: 10 }]}>
                  <Text style={styles.label}>Age</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#083D5E" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="25"
                      placeholderTextColor="#90A4AE"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={[styles.inputWrapper, { flex: 0.6 }]}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#083D5E" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+1 234..."
                      placeholderTextColor="#90A4AE"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Gender Dropdown */}
              <View style={[styles.inputWrapper, { zIndex: 100 }]}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  activeOpacity={0.8}
                  onPress={() => setGenderDropdownOpen(!genderDropdownOpen)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people-outline" size={20} color="#083D5E" style={styles.icon} />
                    <Text style={[styles.inputText, !gender && styles.placeholderText]}>
                      {gender || "Select Gender"}
                    </Text>
                  </View>
                  <Ionicons
                    name={genderDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#083D5E"
                  />
                </TouchableOpacity>

                {genderDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {["Male", "Female", "Other"].map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setGender(item);
                          setGenderDropdownOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          gender === item && styles.selectedDropdownItemText
                        ]}>{item}</Text>
                        {gender === item && (
                          <Ionicons name="checkmark-circle" size={18} color="#32B5F4" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#083D5E" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="******"
                    placeholderTextColor="#90A4AE"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#083D5E" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#083D5E" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="******"
                    placeholderTextColor="#90A4AE"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#083D5E" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.linkText}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E1F5FE',
    marginTop: 5,
    opacity: 0.9,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E6EB',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#263238',
    height: '100%',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E6EB',
  },
  inputText: {
    fontSize: 16,
    color: '#263238',
  },
  placeholderText: {
    color: '#90A4AE',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E6EB',
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#455A64',
  },
  selectedDropdownItemText: {
    color: '#083D5E',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#32B5F4',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: "#32B5F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#546E7A',
  },
  linkText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#083D5E',
  },
});
