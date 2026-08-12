import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { auth } from "../lib/firebase";
import i18n from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

export default function Login() {
  const { theme, isDarkMode } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Login Handler
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(i18n.t('missing_info'), i18n.t('enter_email_password'));
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success alert is optional, sometimes better to just transition
      // Alert.alert("Welcome Back", "Logged in successfully.");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error(error);
      let msg = i18n.t('invalid_credentials');
      if (error.code === 'auth/user-not-found') msg = i18n.t('account_not_found');
      if (error.code === 'auth/wrong-password') msg = i18n.t('incorrect_password');
      Alert.alert(i18n.t('login_failed'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDarkMode ? ['#121212', '#1E1E1E'] : ['#e0f7fa', '#ffffff']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 100 }}>
          <LanguageSwitcher />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >

            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={[styles.logoCircle, { backgroundColor: theme.surface }]}>
                <Ionicons name="medical" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>{i18n.t('app_name')}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{i18n.t('app_subtitle')}</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>{i18n.t('email_label')}</Text>
                <View style={[styles.inputContainer, styles.shadow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder={i18n.t('email_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { color: theme.text }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>{i18n.t('password_label')}</Text>
                <View style={[styles.inputContainer, styles.shadow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder={i18n.t('password_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!passwordVisible}
                    style={[styles.input, { color: theme.text }]}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>{i18n.t('forgot_password')}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, styles.shadow, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>{i18n.t('sign_in')}</Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Footer / Register */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>{i18n.t('no_account')}</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={[styles.registerLink, { color: theme.text }]}>{i18n.t('create_account')}</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 40,
  },

  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#32B5F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#083D5E",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#546E7A",
    letterSpacing: 0.2,
  },

  // Form Container
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ECEFF1",
  },
  shadow: {
    shadowColor: "#90A4AE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#263238",
    height: "100%",
  },
  eyeButton: {
    padding: 8,
  },

  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotText: {
    color: "#32B5F4",
    fontSize: 14,
    fontWeight: "500",
  },

  loginButton: {
    backgroundColor: "#32B5F4",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#32B5F4",
    shadowOpacity: 0.4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#78909C",
    fontSize: 14,
    marginRight: 6,
  },
  registerLink: {
    color: "#083D5E",
    fontSize: 14,
    fontWeight: "bold",
  },
});
