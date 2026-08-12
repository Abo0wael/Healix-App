import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { Alert, I18nManager, NativeModules } from 'react-native';

import ar from '../locales/ar';
import en from '../locales/en';

const i18n = new I18n({ en, ar });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LANGUAGE_KEY = 'user-language';

export const loadLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            i18n.locale = savedLanguage;
        } else {
            const locales = Localization.getLocales();
            i18n.locale = locales[0]?.languageCode ?? 'en';
        }

        const isArabic = i18n.locale.startsWith('ar');
        // Ensure RTL matches language
        if (isArabic !== I18nManager.isRTL) {
            I18nManager.allowRTL(isArabic);
            I18nManager.forceRTL(isArabic);
        }
    } catch (error) {
        console.log('Error loading language', error);
    }
};

import * as Updates from 'expo-updates';

export const changeLanguage = async (lang: 'en' | 'ar') => {
    i18n.locale = lang;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);

    const isArabic = lang === 'ar';

    // Check if RTL needs to be toggled
    if (isArabic !== I18nManager.isRTL) {
        I18nManager.allowRTL(isArabic);
        I18nManager.forceRTL(isArabic);

        try {
            // Reload the app to apply RTL layout changes
            await Updates.reloadAsync();
        } catch (error) {
            // Fallback for development behavior
            if (__DEV__ && NativeModules.DevSettings) {
                NativeModules.DevSettings.reload();
            } else {
                Alert.alert(
                    isArabic ? "تغيير اللغة" : "Change Language",
                    isArabic ? "يرجى إعادة تشغيل التطبيق." : "Please restart the app."
                );
            }
        }
    }
};

export default i18n;
