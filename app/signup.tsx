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
import i18n from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

export default function Signup() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();

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
      Alert.alert(i18n.t('missing_info'), i18n.t('fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", i18n.t('password_mismatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", i18n.t('weak_password'));
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
      Alert.alert(i18n.t('welcome'), i18n.t('account_created'), [
        { text: i18n.t('continue_login'), onPress: () => router.replace("/login") }
      ]);
    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "An unexpected error occurred.";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = i18n.t('email_in_use');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = i18n.t('invalid_email');
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = i18n.t('network_error');
      }

      Alert.alert(i18n.t('signup_error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDarkMode ? ['#121212', '#1E1E1E', '#2C2C2C'] : ['#083D5E', '#0A4A72', '#106494']}
        style={styles.background}
      />

      <View style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? theme.text : "#fff"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && { color: theme.text }]}>{i18n.t('signup_title')}</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && { color: theme.textSecondary }]}>{i18n.t('signup_subtitle')}</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.formCard, { backgroundColor: theme.surfaceElevated }]}>

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('full_name')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={i18n.t('name_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('email_label')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={i18n.t('email_placeholder')}
                    placeholderTextColor={theme.textSecondary}
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
                  <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('age')}</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={i18n.t('age_placeholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={[styles.inputWrapper, { flex: 0.6 }]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('phone')}</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={i18n.t('phone_placeholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Gender Dropdown */}
              <View style={[styles.inputWrapper, { zIndex: 100 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('gender')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownContainer, { backgroundColor: theme.background, borderColor: theme.border }]}
                  activeOpacity={0.8}
                  onPress={() => setGenderDropdownOpen(!genderDropdownOpen)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                    <Text style={[styles.inputText, { color: theme.text }, !gender && styles.placeholderText]}>
                      {gender || i18n.t('gender_placeholder')}
                    </Text>
                  </View>
                  <Ionicons
                    name={genderDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>

                {genderDropdownOpen && (
                  <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {[i18n.t('gender_male'), i18n.t('gender_female'), i18n.t('gender_other')].map((item) => (
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
                          { color: theme.textSecondary },
                          gender === item && [styles.selectedDropdownItemText, { color: theme.text }]
                        ]}>{item}</Text>
                        {gender === item && (
                          <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('password_label')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={i18n.t('password_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('confirm_password')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={i18n.t('password_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{i18n.t('signup_btn')}</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>{i18n.t('already_have_account')} </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={[styles.linkText, { color: theme.text }]}>{i18n.t('log_in')}</Text>
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
