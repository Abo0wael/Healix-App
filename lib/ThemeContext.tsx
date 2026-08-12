import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme, Theme } from './theme';

interface ThemeContextType {
    isDarkMode: boolean;
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    theme: lightTheme,
    toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('appTheme');
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                } else {
                    // Default to system preference if no saved preference
                    const colorScheme = Appearance.getColorScheme();
                    setIsDarkMode(colorScheme === 'dark');
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        try {
            await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    // Render nothing until we know the initial theme to prevent flashing
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
