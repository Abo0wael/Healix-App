/**
 * Groq Cloud AI Service for Meal Analysis & Drug Alternatives
 * Models used: llama-3.1-8b-instant and meta-llama/llama-4-scout-17b-16e-instruct
 */

function extractJson(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            const jsonStr = text.substring(start, end + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e2) {
                console.warn("[JSON-Cleaner] Extraction failed:", e2.message);
            }
        }
        return null;
    }
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = 'llama-3.1-8b-instant';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function analyzeInteractionWithOllama(drugs) {
    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
        throw new Error("Invalid drugs list provided");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const drugList = drugs.join(" and ");

    const prompt = `
Act as a clinical drug interaction checker.
Analyze the interaction between: ${drugList}.

Rules:
1. Classify interaction as exactly ONE of: SAFE, CAUTION, CONTRAINDICATED.
2. Explanation must be medically accurate and very short (max 2 lines).
3. If anticoagulants (like Warfarin) and antiplatelets (like Aspirin) are involved, focus STRICTLY on bleeding risk.
4. DO NOT mention Vitamin K effects for Aspirin.
5. NO disclaimers. NO extra text. Output strictly valid JSON.

Output format must be exactly:
{
  "status": "<SAFE | CAUTION | CONTRAINDICATED>",
  "reason": "<short medical reason>"
}
    `.trim();

    try {
        console.log(`[Groq-LLM] 📡 Checking interaction for: ${drugList}`);

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: TEXT_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 150,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);

        const data = await response.json();
        const rawResponse = data.choices[0].message.content.trim();
        const parsed = extractJson(rawResponse);
        return parsed || { status: "UNKNOWN", reason: "Format error from AI" };

    } catch (error) {
        console.error(`[Groq-LLM] 💥 Error:`, error.message);
        throw new Error("AI Service Unavailable.");
    }
}

export async function findAlternativesWithOllama(drugName) {
    if (!drugName || typeof drugName !== 'string') {
        throw new Error("Invalid drug name provided");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const prompt = `
You are a clinical pharmacist.
Suggest safe medical alternatives for the given drug.
 
IMPORTANT:
- Return ONLY valid JSON.
- Each alternative MUST HAVE "name", "dose", and "reason".
- "reason" must be ONE short sentence (max 20 words).
- "dose" must be the standard adult starting dose (e.g. '500mg every 6 hours').
- If unsure, still return at least one reasonable alternative.
 
Return EXACTLY this structure in JSON:
{
  "alternatives": [
    {
      "name": "Drug name",
      "dose": "Standard adult dose",
      "reason": "Short clinical explanation."
    }
  ]
}
 
Drug:
${drugName}
    `.trim();

    try {
        console.log(`[Groq-LLM] 📡 Finding alternatives for: ${drugName}`);

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: TEXT_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 400,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);

        const data = await response.json();
        const rawResponse = data.choices[0].message.content.trim();
        const parsed = extractJson(rawResponse);
        
        if (parsed && parsed.alternatives && Array.isArray(parsed.alternatives)) {
            return parsed;
        } else {
            return { alternatives: [], note: "AI response format error." };
        }

    } catch (error) {
        console.error(`[Groq-LLM] 💥 Error:`, error.message);
        throw new Error("AI Service Unavailable for Alternatives.");
    }
}

export async function analyzeMealWithOllama(mealName, imageBase64 = null) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const prompt = `
Act as a clinical nutritionist.
Analyze this meal: "${mealName}".

Rules:
1. Estimate calories and macros (Low/Medium/High).
2. Determine if it's generally healthy.
3. List conditions it is good for (e.g. Muscle building).
4. List conditions to use with caution (e.g. Diabetes).
5. Provide a short summary.
6. NO disclaimers. Output strictly valid JSON.

Output Format:
{
  "calories": "Approx. X-Y kcal",
  "macros": {
    "protein": "Low/Medium/High",
    "carbs": "Low/Medium/High",
    "fats": "Low/Medium/High"
  },
  "healthy": true/false,
  "good_for": ["Condition A", "Condition B"],
  "use_with_caution_for": ["Condition C"],
  "summary": "Short 1-sentence summary."
}
    `.trim();

    const targetModel = imageBase64 ? VISION_MODEL : TEXT_MODEL;
    
    let messagesContent;
    if (imageBase64) {
        messagesContent = [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ];
    } else {
        messagesContent = prompt;
    }

    try {
        console.log(`[Groq-LLM] 📡 Analyzing meal: ${mealName} (${targetModel})`);

        const bodyOptions = {
            model: targetModel,
            messages: [{ role: 'user', content: messagesContent }],
            temperature: 0.2,
            max_tokens: 350
        };

        if (!imageBase64) {
            bodyOptions.response_format = { type: "json_object" };
        }

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(bodyOptions)
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);

        const data = await response.json();
        const rawResponse = data.choices[0].message.content.trim();
        const parsed = extractJson(rawResponse);
        
        if (parsed) {
            return parsed;
        } else {
            return {
                calories: "Unknown",
                macros: { protein: "?", carbs: "?", fats: "?" },
                healthy: false,
                good_for: [],
                use_with_caution_for: [],
                summary: "Error parsing AI response."
            };
        }
    } catch (error) {
        console.error(`[Groq-LLM] 💥 Error:`, error.message);
        throw new Error("AI Service Unavailable for Meal Analysis.");
    }
}
