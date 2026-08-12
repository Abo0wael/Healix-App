
import fetch from 'node-fetch'; // Or native fetch in Node 18+

console.log("🧪 Testing Ollama Connection (127.0.0.1)...");

const testOllama = async () => {
    try {
        const response = await fetch("http://127.0.0.1:11434/api/tags");
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Ollama is reachable via 127.0.0.1");
            console.log("   Available models:", data.models.map(m => m.name).join(", "));
        } else {
            console.error("❌ Ollama reachable but returned error:", response.status);
        }
    } catch (error) {
        console.error("❌ Failed to connect to Ollama via 127.0.0.1");
        console.error("   Error:", error.message);
    }
};

testOllama();
