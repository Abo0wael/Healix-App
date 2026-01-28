import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log("Checking API Key:", key ? "Present (" + key.substring(0, 5) + "...)" : "MISSING");

async function listModels() {
    if (!key) return;
    try {
        // We can't list models easily with the high-level SDK in one line, 
        // but we can try a simple generation with a known safe model to see if it works,
        // or check the error message more closely.

        // Actually, the SDK doesn't expose listModels cleanly in the browser-compatible entry point 
        // without some specific setups, so we will use a raw fetch to the list_models endpoint 
        // to be 100% sure what the API sees.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log("Fetching models from:", url.replace(key, "HIDDEN_KEY"));

        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.log("❌ Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listModels();
