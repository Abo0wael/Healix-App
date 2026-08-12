import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL, fetchWithTimeout } from "../lib/api";
import { useTheme } from "../lib/ThemeContext";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    role: "assistant",
    content:
        "👋 Hi! I'm **Helix**, your personal AI medical assistant.\n\nYou can ask me about medications, symptoms, nutrition, or general health tips. How can I help you today?",
    timestamp: new Date(),
};

export default function HelixChatScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useTheme();
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isLoading]);

    const sendMessage = async () => {
        const userText = inputText.trim();
        if (!userText || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        // Build history for API (exclude welcome message)
        const history = messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content }));

        try {
            const response = await fetchWithTimeout(`${BASE_URL}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText, history }),
            });

            const data = await response.json();

            if (data.success && data.reply) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.reply,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error(data.message || "Failed to get response.");
            }
        } catch (error: any) {
            const errMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                    "⚠️ I'm having trouble connecting right now. Please check your connection and try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === "user";

        return (
            <View
                style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAI,
                ]}
            >
                {/* AI Avatar */}
                {!isUser && (
                    <View
                        style={[
                            styles.avatar,
                            { backgroundColor: isDarkMode ? "#1E3A5F" : "#E3F2FD" },
                        ]}
                    >
                        <Text style={styles.avatarEmoji}>🧬</Text>
                    </View>
                )}

                <View
                    style={[
                        styles.bubble,
                        isUser
                            ? [styles.bubbleUser, { backgroundColor: theme.primary }]
                            : [
                                  styles.bubbleAI,
                                  {
                                      backgroundColor: isDarkMode
                                          ? "#1E2A3A"
                                          : "#F0F8FF",
                                      borderColor: isDarkMode ? "#2A3F5A" : "#BBDEFB",
                                  },
                              ],
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            {
                                color: isUser
                                    ? "#FFFFFF"
                                    : theme.text,
                            },
                        ]}
                    >
                        {item.content}
                    </Text>
                    <Text
                        style={[
                            styles.timestamp,
                            {
                                color: isUser
                                    ? "rgba(255,255,255,0.65)"
                                    : theme.textSecondary,
                            },
                        ]}
                    >
                        {formatTime(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    const TypingIndicator = () => (
        <View style={[styles.messageRow, styles.messageRowAI]}>
            <View
                style={[
                    styles.avatar,
                    { backgroundColor: isDarkMode ? "#1E3A5F" : "#E3F2FD" },
                ]}
            >
                <Text style={styles.avatarEmoji}>🧬</Text>
            </View>
            <View
                style={[
                    styles.bubble,
                    styles.bubbleAI,
                    {
                        backgroundColor: isDarkMode ? "#1E2A3A" : "#F0F8FF",
                        borderColor: isDarkMode ? "#2A3F5A" : "#BBDEFB",
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                    },
                ]}
            >
                <View style={styles.typingDots}>
                    <View
                        style={[
                            styles.dot,
                            { backgroundColor: theme.primary },
                        ]}
                    />
                    <View
                        style={[
                            styles.dot,
                            styles.dotMiddle,
                            { backgroundColor: theme.primary },
                        ]}
                    />
                    <View
                        style={[
                            styles.dot,
                            { backgroundColor: theme.primary },
                        ]}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.background,
                        borderBottomColor: theme.border,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[
                        styles.backButton,
                        { backgroundColor: theme.surfaceElevated },
                    ]}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerTitleRow}>
                        <Text style={styles.headerEmoji}>🧬</Text>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Helix
                        </Text>
                    </View>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text
                            style={[
                                styles.onlineText,
                                { color: theme.textSecondary },
                            ]}
                        >
                            AI Medical Assistant
                        </Text>
                    </View>
                </View>

                <View style={{ width: 40 }} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View
                    style={[
                        styles.inputArea,
                        {
                            backgroundColor: theme.background,
                            borderTopColor: theme.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                backgroundColor: theme.surfaceElevated,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <TextInput
                            style={[styles.textInput, { color: theme.text }]}
                            placeholder="Ask Helix anything..."
                            placeholderTextColor={theme.textSecondary}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                            blurOnSubmit={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor:
                                    inputText.trim() && !isLoading
                                        ? theme.primary
                                        : isDarkMode
                                        ? "#2A3F5A"
                                        : "#B0BEC5",
                            },
                        ]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        alignItems: "center",
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    headerEmoji: {
        fontSize: 22,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    onlineBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#4CAF50",
    },
    onlineText: {
        fontSize: 12,
        fontWeight: "500",
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    messageRowUser: {
        justifyContent: "flex-end",
    },
    messageRowAI: {
        justifyContent: "flex-start",
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        marginBottom: 2,
    },
    avatarEmoji: {
        fontSize: 18,
    },
    bubble: {
        maxWidth: "78%",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleUser: {
        borderBottomRightRadius: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    bubbleAI: {
        borderBottomLeftRadius: 6,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: "400",
    },
    timestamp: {
        fontSize: 11,
        marginTop: 5,
        alignSelf: "flex-end",
    },
    typingDots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        opacity: 0.6,
    },
    dotMiddle: {
        opacity: 0.8,
        width: 9,
        height: 9,
        borderRadius: 4.5,
    },
    inputArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 16,
        borderTopWidth: 1,
        gap: 10,
    },
    inputContainer: {
        flex: 1,
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 48,
        maxHeight: 120,
        justifyContent: "center",
    },
    textInput: {
        fontSize: 15,
        lineHeight: 20,
        maxHeight: 100,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
});
