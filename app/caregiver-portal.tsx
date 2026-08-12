import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../lib/firebase";
import { useTheme } from "../lib/ThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CaregiverInfo {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
}

interface PatientInfo {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
}

// ─── Helper: generate 6-char invite code ──────────────────────────────────────
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CaregiverPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverInfo[]>([]);
  const [patients, setPatients] = useState<PatientInfo[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [linking, setLinking] = useState(false);

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data = snap.data();

      // --- Invite code ---
      let currentCode = data.inviteCode;
      if (!currentCode) {
        currentCode = generateInviteCode();
        await updateDoc(userRef, { inviteCode: currentCode });
      }

      // ALWAYS sync the code to the inviteCodes collection so it exists for lookup
      await setDoc(doc(db, "inviteCodes", currentCode), {
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setInviteCode(currentCode);

      // --- Caregivers list ---
      const caregiverUids: string[] = data.caregivers || [];
      if (caregiverUids.length > 0) {
        const cgProfiles: CaregiverInfo[] = [];
        for (const uid of caregiverUids) {
          const cgSnap = await getDoc(doc(db, "users", uid));
          if (cgSnap.exists()) {
            const d = cgSnap.data();
            cgProfiles.push({
              uid,
              fullName: d.fullName || "Unknown",
              email: d.email || "",
              phone: d.phone,
            });
          }
        }
        setCaregivers(cgProfiles);
      } else {
        setCaregivers([]);
      }

      // --- Patients list (where this user is caregiver) ---
      const patientUids: string[] = data.patients || [];
      if (patientUids.length > 0) {
        const ptProfiles: PatientInfo[] = [];
        for (const uid of patientUids) {
          const ptSnap = await getDoc(doc(db, "users", uid));
          if (ptSnap.exists()) {
            const d = ptSnap.data();
            ptProfiles.push({
              uid,
              fullName: d.fullName || "Unknown",
              email: d.email || "",
              phone: d.phone,
            });
          }
        }
        setPatients(ptProfiles);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.error("CaregiverPortal load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Link as caregiver using invite code ───────────────────────────────────
  const handleLinkWithCode = async () => {
    const me = auth.currentUser;
    if (!me) return;

    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-character invite code.");
      return;
    }

    setLinking(true);
    try {
      // Look up the invite code from the public `inviteCodes` collection
      // This avoids querying across all users (which requires broad permissions)
      const codeRef = doc(db, "inviteCodes", code);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        Alert.alert("Code Not Found", "No account found with this invite code. Please check and try again.");
        setLinking(false);
        return;
      }

      const patientUid: string = codeSnap.data().uid;
      // Fetch patient's name for the success message
      const patientDocSnap = await getDoc(doc(db, "users", patientUid));
      const patientName = patientDocSnap.exists() ? (patientDocSnap.data().fullName || "this patient") : "this patient";

      if (patientUid === me.uid) {
        Alert.alert("Oops!", "You can't link yourself as your own caregiver.");
        setLinking(false);
        return;
      }

      // Add each other in Firestore
      const patientRef = doc(db, "users", patientUid);
      const meRef = doc(db, "users", me.uid);

      await updateDoc(patientRef, {
        caregivers: arrayUnion(me.uid),
      });
      await updateDoc(meRef, {
        patients: arrayUnion(patientUid),
      });

      setShowAddModal(false);
      setCodeInput("");
      Alert.alert(
        "✅ Linked Successfully!",
        `You are now a caregiver for ${patientName}.`,
      );
      await loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLinking(false);
    }
  };

  // ─── Remove caregiver/patient ─────────────────────────────────────────────
  const handleRemovePerson = (uid: string, role: string, name: string) => {
    Alert.alert(
      "Remove Link",
      `Are you sure you want to remove ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const me = auth.currentUser;
            if (!me) return;
            try {
              const meRef = doc(db, "users", me.uid);
              const themRef = doc(db, "users", uid);

              if (role === "caregiver") {
                await updateDoc(meRef, { caregivers: arrayRemove(uid) });
                await updateDoc(themRef, { patients: arrayRemove(me.uid) });
              } else {
                await updateDoc(meRef, { patients: arrayRemove(uid) });
                await updateDoc(themRef, { caregivers: arrayRemove(me.uid) });
              }
              await loadData();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  // ─── Share invite code via native Share sheet ─────────────────────────────
  const shareCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `My Helix invite code is: ${inviteCode}\n\nEnter this code in the Family & Caregivers section to link to my account.`,
        title: "My Helix Invite Code",
      });
    } catch (e: any) {
      // Fallback: try old clipboard
      try { Clipboard.setString(inviteCode); } catch {}
      Alert.alert("Code: " + inviteCode, "Copy the code above manually.");
    }
  };

  // ─── Paste from clipboard into the code input ──────────────────────────────
  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        const cleaned = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 6);
        setCodeInput(cleaned);
      } else {
        Alert.alert("Clipboard is empty", "Copy the code first, then tap Paste.");
      }
    } catch {
      Alert.alert("Paste failed", "Please type the code manually.");
    }
  };

  // ─── UI ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Family & Caregivers</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Banner */}
        <LinearGradient
          colors={isDarkMode ? ["#2D1B4E", "#1A0F30"] : ["#9C27B0", "#7B1FA2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroIconRing}>
            <Ionicons name="people" size={36} color="#9C27B0" />
          </View>
          <Text style={styles.heroTitle}>Stay Connected{"\n"}with Loved Ones</Text>
          <Text style={styles.heroSub}>
            Share your health journey and let family members monitor your medication and wellbeing.
          </Text>
        </LinearGradient>

        {/* ── Your Invite Code ── */}
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="qr-code-outline" size={20} color="#388E3C" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Your Invite Code</Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Share this code with a family member so they can link to your account as your caregiver.
          </Text>

          <TouchableOpacity style={styles.codeBox} onPress={shareCode} activeOpacity={0.7}>
            <Text style={styles.codeText}>{inviteCode ?? "------"}</Text>
            <View style={styles.copyBtn}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.copyBtnText}>Share</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Add Caregiver ── */}
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="person-add-outline" size={20} color="#1565C0" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Add a Caregiver</Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Enter a family member's 6-digit invite code to become their caregiver.
          </Text>

          <TouchableOpacity
            style={[styles.addCaregiverBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={20} color="#fff" />
            <Text style={styles.addCaregiverText}>Enter Invite Code</Text>
          </TouchableOpacity>
        </View>

        {/* ── Caregivers List ── */}
        {caregivers.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: "#F3E5F5" }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#7B1FA2" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>My Caregivers</Text>
            </View>
            {caregivers.map((cg) => (
              <PersonRow key={cg.uid} person={cg} role="caregiver" theme={theme} onRemove={() => handleRemovePerson(cg.uid, "caregiver", cg.fullName)} />
            ))}
          </View>
        )}

        {/* ── Patients List ── */}
        {patients.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="heart-outline" size={20} color="#E65100" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>People I'm Caring For</Text>
            </View>
            {patients.map((pt) => (
              <PersonRow key={pt.uid} person={pt} role="patient" theme={theme} onRemove={() => handleRemovePerson(pt.uid, "patient", pt.fullName)} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {caregivers.length === 0 && patients.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No connections yet</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Share your invite code or enter someone's code to get started.
            </Text>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <InfoCard
            icon="notifications-outline"
            iconColor="#F57C00"
            bgColor="#FFF3E0"
            title="Missed Dose Alerts"
            desc="Caregivers are notified if you miss your medication"
            theme={theme}
          />
          <InfoCard
            icon="location-outline"
            iconColor="#C62828"
            bgColor="#FFEBEE"
            title="SOS Location"
            desc="Emergency alerts include your live location"
            theme={theme}
          />
        </View>
      </ScrollView>

      {/* ── Enter Code Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.modalIconRing, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="link" size={30} color="#1565C0" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enter Invite Code</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Ask your family member for their 6-character code
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="e.g. A3B7KX"
              placeholderTextColor={theme.textSecondary}
              value={codeInput}
              onChangeText={setCodeInput}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />

            {/* Paste Button */}
            <TouchableOpacity
              style={[styles.pasteBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={pasteFromClipboard}
              activeOpacity={0.75}
            >
              <Ionicons name="clipboard-outline" size={18} color={theme.primary} />
              <Text style={[styles.pasteBtnText, { color: theme.primary }]}>Paste Code from Clipboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkBtn, { backgroundColor: theme.primary }, linking && { opacity: 0.7 }]}
              onPress={handleLinkWithCode}
              disabled={linking}
              activeOpacity={0.85}
            >
              {linking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.linkBtnText}>Link Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PersonRow({ person, role, theme, onRemove }: { person: CaregiverInfo | PatientInfo; role: string; theme: any, onRemove: () => void }) {
  const initials = person.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const avatarColor = role === "caregiver" ? "#7B1FA2" : "#E65100";
  const avatarBg = role === "caregiver" ? "#F3E5F5" : "#FFF3E0";

  return (
    <View style={[styles.personRow, { borderTopColor: theme.border }]}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.personName, { color: theme.text }]}>{person.fullName}</Text>
        <Text style={[styles.personEmail, { color: theme.textSecondary }]}>{person.email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: role === "caregiver" ? "#F3E5F5" : "#FFF3E0" }]}>
        <Text style={[styles.roleBadgeText, { color: avatarColor }]}>
          {role === "caregiver" ? "Caregiver" : "Patient"}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={{ padding: 8 }}>
        <Ionicons name="trash-outline" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );
}

function InfoCard({
  icon,
  iconColor,
  bgColor,
  title,
  desc,
  theme,
}: {
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  desc: string;
  theme: any;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
      <View style={[styles.infoIconBg, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text style={[styles.infoTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>{desc}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },

  heroBanner: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  heroIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 30, marginBottom: 8 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 20 },

  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  cardIconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardSub: { fontSize: 13, lineHeight: 19, marginBottom: 16 },

  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4A148C",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  codeText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 8,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  addCaregiverBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  addCaregiverText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "800" },
  personName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  personEmail: { fontSize: 12 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: 11, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  infoRow: { flexDirection: "row", gap: 14, marginTop: 4 },
  infoCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  infoTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  infoDesc: { fontSize: 11, lineHeight: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
  },
  modalClose: { position: "absolute", top: 16, right: 20, padding: 4 },
  modalIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  modalSub: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  codeInput: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },
  linkBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  linkBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pasteBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  pasteBtnText: { fontSize: 14, fontWeight: "600" },
});
