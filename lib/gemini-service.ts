// Drug Alternatives API Service
// Simple service to test Gemini AI integration

const API_BASE_URL = 'http://192.168.0.149:3000'; // USE LAN IP for Expo Go

export interface DrugAlternative {
    name: string;
    dose: string;
    reason?: string;
}

export interface DrugAlternativesResponse {
    success: boolean;
    original: string;
    generic?: string;
    alternatives: DrugAlternative[];
    message?: string;
}

/**
 * Fetch drug alternatives from Gemini AI
 * @param drugName - Name of the drug to find alternatives for
 * @returns Promise with alternatives
 */
export const getDrugAlternatives = async (
    drugName: string
): Promise<DrugAlternativesResponse> => {
    try {
        console.log(`🔍 Fetching alternatives for: ${drugName} from ${API_BASE_URL}`);

        const response = await fetch(`${API_BASE_URL}/ai/drug-alternatives`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ drug: drugName }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: DrugAlternativesResponse = await response.json();

        console.log('✅ Received alternatives:', data);

        return data;
    } catch (error: any) {
        console.error('❌ Error fetching drug alternatives:', error);
        if (error.message.includes('Network request failed')) {
            console.error(`⚠️ Check if backend is running at ${API_BASE_URL} and phone is on same WiFi.`);
        }
        throw error;
    }
};

/**
 * Check if backend server is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        console.log(`Checking backend health at ${API_BASE_URL}/health`);
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('Backend health:', data);
        return data.status === 'ok';
    } catch (error) {
        console.error('Backend is unreachable:', error);
        return false;
    }
};
