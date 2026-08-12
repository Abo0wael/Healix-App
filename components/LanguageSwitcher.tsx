import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import i18n, { changeLanguage } from '../lib/i18n';

export default function LanguageSwitcher() {
    // Initialize with current locale
    const [currentLang, setCurrentLang] = useState(i18n.locale);

    const toggleLanguage = async () => {
        // Determine new language
        const isArabic = currentLang.startsWith('ar');
        const newLang = isArabic ? 'en' : 'ar';

        // Update local state for immediate feedback
        setCurrentLang(newLang);

        // Perform the switch
        await changeLanguage(newLang);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={toggleLanguage}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>
                {currentLang.startsWith('ar') ? 'English' : 'العربية'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 4,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#32B5F4',
        fontWeight: '700',
        fontSize: 15,
    }
});
