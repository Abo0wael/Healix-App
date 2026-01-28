import dotenv from 'dotenv';
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;

// Use the dedicated chat/completions endpoint on the router which is more standardized
// AND use 'HuggingFaceH4/zephyr-7b-beta' which we know works generally, or 'microsoft/Phi-3.5-mini-instruct'
// Let's stick to Zephyr as it's the most common default for free inference
const MODEL_ID = "HuggingFaceH4/zephyr-7b-beta";
const ENDPOINT = `https://router.huggingface.co/hf-inference/v1/chat/completions`;

export async function checkDrugConflicts(drugs) {
    if (!drugs || drugs.length < 2) {
        throw new Error("At least two drugs are required for conflict analysis.");
    }

    const drugList = drugs.join(", ");

    // Standard OpenAI-compatible format
    const messages = [
        {
            role: "system",
            content: `You are a medical AI assistant. Analyze the interaction between these drugs. 
            Respond ONLY in VALID JSON format with no markdown blocks.
            JSON Schema:
            {
              "interaction_level": "Safe" | "Caution" | "Dangerous" | "Unknown",
              "reason": "String",
              "recommendation": "String"
            }`
        },
        {
            role: "user",
            content: `Analyze: ${drugList}`
        }
    ];

    try {
        console.log(`[Conflict-Service] 📡 Connecting to Router Chat API: ${ENDPOINT}`);

        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
                "x-use-cache": "false"
            },
            body: JSON.stringify({
                model: MODEL_ID, // Router needs model ID in body for this endpoint
                messages: messages,
                max_tokens: 500,
                temperature: 0.1,
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF API Error: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        console.log("[Conflict-Service] 📥 Received response");

        const content = result.choices?.[0]?.message?.content || "";

        // Clean markdown
        const cleanText = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            return {
                interaction_level: "Unknown",
                reason: "Format Error",
                recommendation: cleanText.substring(0, 150)
            };
        }

    } catch (error) {
        console.error(`[Conflict-Service] 💥 Error:`, error.message);
        throw error;
    }
}
