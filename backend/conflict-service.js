import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_ID = "llama-3.1-8b-instant";
const ENDPOINT = `https://api.groq.com/openai/v1/chat/completions`;

export async function checkDrugConflicts(drugs) {
    if (!drugs || drugs.length < 2) {
        throw new Error("At least two drugs are required for conflict analysis.");
    }

    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
    }

    const drugList = drugs.join(", ");

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
        console.log(`[Conflict-Service] 📡 Connecting to Groq: ${MODEL_ID}`);

        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: messages,
                max_tokens: 500,
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || "";

        try {
            // Groq with json_object returns pure json, but let's be safe just in case
            const cleanText = content.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            return parsed;
        } catch (parseError) {
            console.error("[Conflict-Service] JSON Parse Error on:", content);
            return {
                interaction_level: "Unknown",
                reason: "Format Error from AI",
                recommendation: content.substring(0, 150)
            };
        }

    } catch (error) {
        console.error(`[Conflict-Service] 💥 Error:`, error.message);
        throw error;
    }
}
