import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.HF_API_KEY;
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

// List of potential endpoints to try
const ENDPOINTS = [
    {
        url: `https://router.huggingface.co/hf-inference/models/${MODEL}`,
        method: "POST",
        // Legacy "inputs" format
        body: { inputs: "Why is the sky blue?" }
    },
    {
        url: `https://router.huggingface.co/hf-inference/v1/chat/completions`,
        method: "POST",
        // OpenAI Chat format
        body: {
            model: MODEL,
            messages: [{ role: "user", content: "Why is the sky blue?" }]
        }
    },
    {
        url: `https://api-inference.huggingface.co/models/${MODEL}`,
        method: "POST",
        body: { inputs: "Why is the sky blue?" }
    }
];

async function testEndpoint(endpoint) {
    console.log(`\nTesting URL: ${endpoint.url}`);
    try {
        const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "x-use-cache": "false"
            },
            body: JSON.stringify(endpoint.body)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ SUCCESS! Payload:", JSON.stringify(data).slice(0, 100));
            return true;
        } else {
            const text = await response.text();
            console.log("❌ FAILED. Response:", text.slice(0, 200));
        }
    } catch (error) {
        console.log("💥 CRITICAL ERROR:", error.message);
    }
    return false;
}

async function run() {
    console.log("🔍 Diagnosing Hugging Face Connectivity...");
    console.log("API Key loaded: ", API_KEY ? "Yes (" + API_KEY.slice(0, 5) + "...)" : "No");

    for (const ep of ENDPOINTS) {
        const success = await testEndpoint(ep);
        if (success) {
            console.log("\n🎯 CONCLUSION: This URL works! Update your code to use it.");
            return;
        }
    }
    console.log("\n💀 CONCLUSION: All endpoints failed. Check your API Key or Network.");
}

run();
