// Read from environment variable (EXPO_PUBLIC_API_BASE_URL)
// Fallback to local IP if the environment variable is not set
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.6:3000";

/**
 * Fetch wrapper with timeout and robust error handling.
 */
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 60000) => {
    // 8. Log the full request URL in console for debugging
    console.log(`[API] 📡 Request: ${options.method || 'GET'} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            console.error(`[API] ❌ Timeout after ${timeoutMs}ms: ${url}`);
            throw new Error("Network request timed out");
        }
        
        if (error.message === 'Failed to fetch' || error.message.includes('Network request failed')) {
            console.error(`[API] ❌ Server unreachable: ${url}`);
            throw new Error("Server unreachable");
        }
        
        console.error(`[API] ❌ Error: ${error.message} (${url})`);
        throw error;
    }
};
