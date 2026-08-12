
import fetch from 'node-fetch';

async function testEndpoint() {
    try {
        console.log("🧪 Testing English Input...");
        const response = await fetch("http://localhost:3000/ai/drug-alternatives", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ drug: "Panadol" })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.alternatives && data.alternatives.length > 0) {
            console.log("✅ Success: Alternatives found.");
        } else {
            console.log("⚠️ Warning: No alternatives found (this might be normal if Ollama is strict, but format is what matters).");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testEndpoint();
