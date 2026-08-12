/**
 * Helix Chatbot — powered by Groq (llama-3.3-70b-versatile)
 * Ultra-fast inference: ~500 tokens/sec vs Ollama's ~15 tokens/sec
 * Multi-turn medical AI conversation
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Best accuracy + speed on Groq

const SYSTEM_PROMPT = `You are Helix, a friendly and knowledgeable AI medical assistant built into a health app.
Your role is to help users with:
- Medication questions and information
- Symptom explanations (general info only)
- Nutrition and diet advice
- Wellness tips and healthy habits
- Understanding medical terms

Rules:
- Be empathetic, warm, and concise.
- Keep responses to 2-5 sentences unless the user asks for detail.
- NEVER diagnose specific diseases — always say you provide general info only.
- For serious symptoms (chest pain, difficulty breathing, severe bleeding), ALWAYS recommend immediate medical attention.
- Respond in the SAME language the user writes in (Arabic or English). If Arabic, respond in natural Egyptian/Levantine Arabic.
- Do NOT repeat disclaimers on every single message — only when genuinely needed.`;

/**
 * @param {string} message - current user message
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - prior messages
 */
export async function chatWithOllama(message, history = []) {
    if (!message || typeof message !== 'string') {
        throw new Error('Invalid message provided');
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    // Build messages array for OpenAI-compatible API
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10), // Keep last 10 messages for context window
        { role: 'user', content: message }
    ];

    try {
        console.log('[Helix-Chat] Sending to Groq (' + GROQ_MODEL + ')...');

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 512,
                top_p: 0.9,
                stream: false
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[Helix-Chat] Groq Error:', errBody);
            throw new Error('Groq API Error: ' + response.status + ' ' + response.statusText);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content.trim();

        console.log('[Helix-Chat] Reply (' + data.usage.completion_tokens + ' tokens in ' + (data.usage.total_time ? (data.usage.total_time * 1000).toFixed(0) + 'ms' : '?') + '):', reply.substring(0, 80) + '...');
        return reply;

    } catch (error) {
        console.error('[Helix-Chat] Error:', error.message);
        throw new Error('Helix AI is currently unavailable. Please try again.');
    }
}
