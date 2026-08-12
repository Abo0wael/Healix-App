export interface Theme {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    danger: string;
    success: string;
    warningBackground: string;
    warningText: string;
    successBackground: string;
    successBorder: string;
}

export const lightTheme: Theme = {
    background: '#F5F9FF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1a1a1a',
    textSecondary: '#666666',
    primary: '#32B5F4',
    border: '#E0E0E0',
    danger: '#FF5252',
    success: '#4CAF50',
    warningBackground: '#FFF3E0',
    warningText: '#FF9800',
    successBackground: '#E8F5E9',
    successBorder: '#4CAF50',
};

export const darkTheme: Theme = {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    primary: '#32B5F4',
    border: '#333333',
    danger: '#FF5252',
    success: '#4CAF50',
    warningBackground: '#332b1a',
    warningText: '#FFB74D',
    successBackground: '#1a3320',
    successBorder: '#4CAF50',
};
