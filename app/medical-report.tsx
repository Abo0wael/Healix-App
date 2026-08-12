import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BASE_URL, fetchWithTimeout } from "../lib/api";
import i18n from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeyFinding {
    name: string;
    value: string;
    unit: string;
    status: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL" | "INFO";
    note: string;
}

interface ReportAnalysisResult {
    report_type: string;
    summary: string;
    key_findings: KeyFinding[];
    abnormal_count: number;
    medications_mentioned: string[];
    recommended_action: "CONSULT_DOCTOR" | "URGENT_CARE" | "FOLLOW_UP" | "NORMAL";
    action_detail: string;
    report_date: string;
    overall_status: "NORMAL" | "ATTENTION_NEEDED" | "URGENT";
}

// ─── Helper colours ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    { bg: string; text: string; border: string; icon: string }
> = {
    NORMAL:     { bg: "#E8F5E9", text: "#2E7D32", border: "#81C784", icon: "checkmark-circle" },
    HIGH:       { bg: "#FFF3E0", text: "#E65100", border: "#FFB74D", icon: "arrow-up-circle" },
    LOW:        { bg: "#E3F2FD", text: "#1565C0", border: "#64B5F6", icon: "arrow-down-circle" },
    ABNORMAL:   { bg: "#FFEBEE", text: "#C62828", border: "#EF9A9A", icon: "warning" },
    INFO:       { bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8", icon: "information-circle" },
};

const OVERALL_CONFIG = {
    NORMAL:           { gradient: ["#2E7D32", "#43A047"] as [string, string], icon: "shield-checkmark", label: "All Clear" },
    ATTENTION_NEEDED: { gradient: ["#E65100", "#FB8C00"] as [string, string], icon: "alert-circle",     label: "Needs Attention" },
    URGENT:           { gradient: ["#B71C1C", "#E53935"] as [string, string], icon: "warning",           label: "Urgent Review" },
};

const ACTION_CONFIG = {
    NORMAL:         { icon: "checkmark-done-circle", color: "#2E7D32", label: "No Action Needed" },
    CONSULT_DOCTOR: { icon: "medical",               color: "#1565C0", label: "Consult Your Doctor" },
    FOLLOW_UP:      { icon: "calendar",              color: "#E65100", label: "Follow-Up Required" },
    URGENT_CARE:    { icon: "alert-circle",          color: "#B71C1C", label: "Seek Urgent Care" },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MedicalReportScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();

    const [imageUri, setImageUri]       = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [reportText, setReportText]   = useState("");
    const [loading, setLoading]         = useState(false);
    const [result, setResult]           = useState<ReportAnalysisResult | null>(null);
    const [inputMode, setInputMode]     = useState<"image" | "text">("image");
    const [fileName, setFileName]       = useState<string | null>(null);

    // ── Image / file handlers ──────────────────────────────────────────────────

    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            base64: true,
            quality: 0.7,
        });
        if (!res.canceled) {
            setImageUri(res.assets[0].uri);
            setImageBase64(res.assets[0].base64 || null);
            setFileName(null);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission Required", "Camera access is needed to take a photo of the report.");
            return;
        }
        const res = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            base64: true,
            quality: 0.7,
        });
        if (!res.canceled) {
            setImageUri(res.assets[0].uri);
            setImageBase64(res.assets[0].base64 || null);
            setFileName(null);
            setResult(null);
        }
    };

    const pickDocument = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            });
            if (res.canceled) return;
            const file = res.assets[0];

            if (file.mimeType?.includes("image")) {
                const b64 = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                setImageUri(file.uri);
                setImageBase64(b64);
                setFileName(file.name);
                setResult(null);
            } else {
                // PDF — we'll send it as a text note for now
                Alert.alert(
                    "PDF Support",
                    "PDF files are not yet supported for direct upload. Please take a screenshot or photo of the report instead.",
                    [{ text: "OK" }]
                );
            }
        } catch (e) {
            Alert.alert("Error", "Could not open the document.");
        }
    };

    const clearImage = () => {
        setImageUri(null);
        setImageBase64(null);
        setFileName(null);
        setResult(null);
    };

    // ── Analysis ───────────────────────────────────────────────────────────────

    const analyzeReport = async () => {
        const hasImage = !!imageBase64;
        const hasText  = !!reportText.trim();

        if (!hasImage && !hasText) {
            Alert.alert(
                "Nothing to Analyze",
                "Please take a photo, upload an image, or paste the report text."
            );
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const body: Record<string, string> = {};
            if (hasText)  body.reportText   = reportText;
            if (hasImage) body.imageBase64  = imageBase64!;
            body.lang = i18n.locale.startsWith("ar") ? "ar" : "en";

            const response = await fetchWithTimeout(
                `${BASE_URL}/ai/report-analysis`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                },
                90000
            );

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                Alert.alert("Analysis Failed", data.error || "Could not analyze the report.");
            }
        } catch (err: any) {
            Alert.alert("Network Error", err.message || "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    // ── UI ─────────────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* ── Gradient Header ── */}
            <LinearGradient
                colors={["#083D5E", "#145A85", "#1D789F"]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerIconWrap}>
                        <Ionicons name="document-text" size={22} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Medical Report</Text>
                        <Text style={styles.headerSubtitle}>AI-Powered Analysis</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Mode Toggle ── */}
                <View style={[styles.modeToggle, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.modeBtn, inputMode === "image" && styles.modeBtnActive]}
                        onPress={() => setInputMode("image")}
                    >
                        <Ionicons name="image" size={16} color={inputMode === "image" ? "#fff" : theme.textSecondary} />
                        <Text style={[styles.modeBtnText, inputMode === "image" && styles.modeBtnTextActive]}>
                            Image / Photo
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, inputMode === "text" && styles.modeBtnActive]}
                        onPress={() => setInputMode("text")}
                    >
                        <Ionicons name="text" size={16} color={inputMode === "text" ? "#fff" : theme.textSecondary} />
                        <Text style={[styles.modeBtnText, inputMode === "text" && styles.modeBtnTextActive]}>
                            Paste Text
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Image Mode ── */}
                {inputMode === "image" && (
                    <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            📸  Upload Report Image
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                            Take a photo or upload an image of your lab report, scan, or prescription.
                        </Text>

                        {imageUri ? (
                            <View style={styles.previewWrap}>
                                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
                                {fileName && (
                                    <View style={styles.fileNameBadge}>
                                        <Ionicons name="document-attach" size={14} color="#1565C0" />
                                        <Text style={styles.fileNameText} numberOfLines={1}>{fileName}</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.removeBtn} onPress={clearImage}>
                                    <Ionicons name="close" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.uploadGrid}>
                                <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
                                    <LinearGradient colors={["#083D5E", "#1D789F"]} style={styles.uploadIconBg}>
                                        <Ionicons name="camera" size={28} color="#fff" />
                                    </LinearGradient>
                                    <Text style={[styles.uploadLabel, { color: theme.text }]}>Camera</Text>
                                    <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>Take a photo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
                                    <LinearGradient colors={["#6A1B9A", "#AB47BC"]} style={styles.uploadIconBg}>
                                        <Ionicons name="images" size={28} color="#fff" />
                                    </LinearGradient>
                                    <Text style={[styles.uploadLabel, { color: theme.text }]}>Gallery</Text>
                                    <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>Choose image</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
                                    <LinearGradient colors={["#1B5E20", "#43A047"]} style={styles.uploadIconBg}>
                                        <Ionicons name="folder-open" size={28} color="#fff" />
                                    </LinearGradient>
                                    <Text style={[styles.uploadLabel, { color: theme.text }]}>Files</Text>
                                    <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>Upload file</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* ── Text Mode ── */}
                {inputMode === "text" && (
                    <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            📋  Paste Report Text
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                            Copy and paste the text content of your medical report below.
                        </Text>
                        <TextInput
                            style={[styles.textArea, {
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text,
                            }]}
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top"
                            placeholder="Paste your report text here..."
                            placeholderTextColor={theme.textSecondary}
                            value={reportText}
                            onChangeText={(t) => { setReportText(t); setResult(null); }}
                        />
                    </View>
                )}

                {/* ── Analyze Button ── */}
                <TouchableOpacity
                    style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
                    onPress={analyzeReport}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={loading ? ["#90A4AE", "#B0BEC5"] : ["#083D5E", "#1D789F"]}
                        style={styles.analyzeBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.analyzeBtnText}>Analyzing Report...</Text>
                            </View>
                        ) : (
                            <View style={styles.loadingRow}>
                                <Ionicons name="scan" size={20} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.analyzeBtnText}>Analyze Report</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* ── Loading Shimmer ── */}
                {loading && (
                    <View style={[styles.card, { backgroundColor: theme.surfaceElevated, alignItems: "center", paddingVertical: 30 }]}>
                        <ActivityIndicator size="large" color="#1D789F" />
                        <Text style={[styles.loadingTitle, { color: theme.text }]}>AI is reading your report…</Text>
                        <Text style={[styles.loadingSubtitle, { color: theme.textSecondary }]}>
                            This may take up to 30 seconds
                        </Text>
                    </View>
                )}

                {/* ── Results ── */}
                {result && !loading && (
                    <View style={styles.resultsContainer}>

                        {/* Overall Status Banner */}
                        <LinearGradient
                            colors={OVERALL_CONFIG[result.overall_status].gradient}
                            style={styles.statusBanner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons
                                name={OVERALL_CONFIG[result.overall_status].icon as any}
                                size={36}
                                color="#fff"
                            />
                            <View style={{ marginLeft: 14 }}>
                                <Text style={styles.statusBannerLabel}>
                                    {OVERALL_CONFIG[result.overall_status].label}
                                </Text>
                                <Text style={styles.statusBannerType}>{result.report_type}</Text>
                                {result.report_date ? (
                                    <Text style={styles.statusBannerDate}>📅 {result.report_date}</Text>
                                ) : null}
                            </View>
                            {result.abnormal_count > 0 && (
                                <View style={styles.abnormalBadge}>
                                    <Text style={styles.abnormalBadgeText}>{result.abnormal_count}</Text>
                                    <Text style={styles.abnormalBadgeLabel}>abnormal</Text>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Summary Card */}
                        <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconWrap, { backgroundColor: "#E3F2FD" }]}>
                                    <Ionicons name="newspaper" size={18} color="#1565C0" />
                                </View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>
                            </View>
                            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                                {result.summary}
                            </Text>
                        </View>

                        {/* Key Findings */}
                        {result.key_findings.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIconWrap, { backgroundColor: "#FFF3E0" }]}>
                                        <Ionicons name="list" size={18} color="#E65100" />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Findings</Text>
                                </View>
                                {result.key_findings.map((finding, idx) => {
                                    const cfg = STATUS_CONFIG[finding.status] || STATUS_CONFIG.INFO;
                                    return (
                                        <View
                                            key={idx}
                                            style={[styles.findingRow, { backgroundColor: cfg.bg, borderLeftColor: cfg.border }]}
                                        >
                                            <View style={styles.findingLeft}>
                                                <Ionicons name={cfg.icon as any} size={18} color={cfg.text} style={{ marginRight: 8 }} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.findingName, { color: theme.text }]}>{finding.name}</Text>
                                                    {finding.note ? (
                                                        <Text style={[styles.findingNote, { color: theme.textSecondary }]}>{finding.note}</Text>
                                                    ) : null}
                                                </View>
                                            </View>
                                            <View style={styles.findingRight}>
                                                <Text style={[styles.findingValue, { color: cfg.text }]}>
                                                    {finding.value}
                                                    {finding.unit ? ` ${finding.unit}` : ""}
                                                </Text>
                                                <View style={[styles.statusPill, { backgroundColor: cfg.border }]}>
                                                    <Text style={[styles.statusPillText, { color: cfg.text }]}>
                                                        {finding.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Recommended Action */}
                        <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconWrap, { backgroundColor: "#E8F5E9" }]}>
                                    <Ionicons name="checkmark-done" size={18} color="#2E7D32" />
                                </View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended Action</Text>
                            </View>
                            <View style={styles.actionRow}>
                                <Ionicons
                                    name={ACTION_CONFIG[result.recommended_action]?.icon as any ?? "medical"}
                                    size={26}
                                    color={ACTION_CONFIG[result.recommended_action]?.color ?? "#1565C0"}
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={[styles.actionLabel, { color: ACTION_CONFIG[result.recommended_action]?.color ?? "#1565C0" }]}>
                                        {ACTION_CONFIG[result.recommended_action]?.label ?? "Consult Your Doctor"}
                                    </Text>
                                    <Text style={[styles.actionDetail, { color: theme.textSecondary }]}>
                                        {result.action_detail}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Medications Mentioned */}
                        {result.medications_mentioned.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIconWrap, { backgroundColor: "#F3E5F5" }]}>
                                        <Ionicons name="medkit" size={18} color="#6A1B9A" />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Medications Mentioned</Text>
                                </View>
                                <View style={styles.pillsWrap}>
                                    {result.medications_mentioned.map((med, idx) => (
                                        <View key={idx} style={styles.medPill}>
                                            <Ionicons name="medical" size={13} color="#6A1B9A" style={{ marginRight: 5 }} />
                                            <Text style={styles.medPillText}>{med}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Disclaimer */}
                        <View style={[styles.disclaimerCard, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF8E1" }]}>
                            <Ionicons name="information-circle" size={18} color="#F9A825" style={{ marginRight: 8 }} />
                            <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                                This analysis is AI-generated and for informational purposes only. Always consult a licensed healthcare professional for medical advice.
                            </Text>
                        </View>

                        {/* Re-analyze button */}
                        <TouchableOpacity
                            style={[styles.reanalyzeBtn, { borderColor: "#1D789F" }]}
                            onPress={() => setResult(null)}
                        >
                            <Ionicons name="refresh" size={18} color="#1D789F" />
                            <Text style={styles.reanalyzeBtnText}>Analyze Another Report</Text>
                        </TouchableOpacity>

                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 55,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: { flexDirection: "row", alignItems: "center", gap: 12 },
    headerIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },

    // Scroll
    scrollContent: { padding: 16, paddingTop: 20 },

    // Mode toggle
    modeToggle: {
        flexDirection: "row",
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
    },
    modeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 11,
    },
    modeBtnActive: { backgroundColor: "#1D789F" },
    modeBtnText: { fontSize: 14, fontWeight: "600", color: "#90A4AE" },
    modeBtnTextActive: { color: "#fff" },

    // Cards
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
    cardSubtitle: { fontSize: 13, lineHeight: 19, marginBottom: 16 },

    // Upload grid
    uploadGrid: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
    uploadOption: { alignItems: "center", width: "28%" },
    uploadIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    uploadLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
    uploadHint: { fontSize: 11, textAlign: "center" },

    // Preview
    previewWrap: { position: "relative", alignItems: "center", marginTop: 8 },
    previewImage: { width: "100%", height: 220, borderRadius: 14 },
    removeBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 14,
        padding: 6,
    },
    fileNameBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 8,
        gap: 5,
    },
    fileNameText: { fontSize: 12, color: "#1565C0", flex: 1 },

    // Text area
    textArea: {
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        fontSize: 14,
        minHeight: 180,
        lineHeight: 22,
    },

    // Analyze button
    analyzeBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 16 },
    analyzeBtnDisabled: { opacity: 0.7 },
    analyzeBtnGradient: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    analyzeBtnText: { color: "#fff", fontSize: 17, fontWeight: "800", marginLeft: 8 },
    loadingRow: { flexDirection: "row", alignItems: "center" },

    // Loading
    loadingTitle: { fontSize: 17, fontWeight: "700", marginTop: 16, textAlign: "center" },
    loadingSubtitle: { fontSize: 13, marginTop: 6, textAlign: "center" },

    // Results
    resultsContainer: { gap: 0 },

    // Status banner
    statusBanner: {
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    statusBannerLabel: { fontSize: 20, fontWeight: "800", color: "#fff" },
    statusBannerType: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
    statusBannerDate: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
    abnormalBadge: {
        marginLeft: "auto",
        backgroundColor: "rgba(0,0,0,0.25)",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "center",
    },
    abnormalBadgeText: { fontSize: 22, fontWeight: "900", color: "#fff" },
    abnormalBadgeLabel: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

    // Section
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
    sectionIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: { fontSize: 16, fontWeight: "700" },

    // Summary
    summaryText: { fontSize: 15, lineHeight: 23 },

    // Findings
    findingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
    },
    findingLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 12 },
    findingRight: { alignItems: "flex-end" },
    findingName: { fontSize: 14, fontWeight: "700" },
    findingNote: { fontSize: 12, marginTop: 2, lineHeight: 16 },
    findingValue: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
    statusPill: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusPillText: { fontSize: 11, fontWeight: "700" },

    // Action
    actionRow: { flexDirection: "row", alignItems: "flex-start" },
    actionLabel: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    actionDetail: { fontSize: 14, lineHeight: 20 },

    // Meds pills
    pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    medPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3E5F5",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    medPillText: { fontSize: 13, fontWeight: "600", color: "#6A1B9A" },

    // Disclaimer
    disclaimerCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
    },
    disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },

    // Re-analyze
    reanalyzeBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 8,
    },
    reanalyzeBtnText: { fontSize: 15, fontWeight: "700", color: "#1D789F" },
});
