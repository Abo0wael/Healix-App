import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';

export default function ThemeSwitcher() {
    const { isDarkMode, toggleTheme, theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Text style={styles.icon}>{isDarkMode ? '🌙' : '☀️'}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginLeft: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 16,
    },
});
