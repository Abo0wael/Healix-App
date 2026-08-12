import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { checkDrugConflicts } from './conflict-service.js';
import { analyzeMealWithOllama, findAlternativesWithOllama } from './local-llm-service.js';
import { chatWithOllama } from './chat-service.js';
import { analyzeMedicalReport } from './report-analysis-service.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("-----------------------------------------");
console.log("   🚀 SERVER VERSION: 3.1 (Groq Cloud + Fixed UI)   ");
console.log("-----------------------------------------");

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Drug alternatives endpoint (Groq)
app.post('/ai/drug-alternatives', async (req, res) => {
    const requestId = Date.now();
    try {
        const { drug } = req.body;
        if (!drug || typeof drug !== 'string') {
            return res.status(400).json({ error: 'Drug name is required' });
        }
        console.log(`[${requestId}] 🔍 Alternatives for: "${drug}"`);
        
        const alternatives = await findAlternativesWithOllama(drug);
        
        res.json({
            success: true,
            original: drug,
            generic: drug,
            alternatives: alternatives.alternatives || [],
            note: "Analysis powered by Groq"
        });
    } catch (error) {
        console.error(`[${requestId}] 💥 Alternatives Error:`, error.message);
        res.status(503).json({ error: true, message: "AI Service unavailable.", details: error.message });
    }
});

// Conflict Detection Endpoint (Groq)
app.post('/ai/drug-conflict', async (req, res) => {
    const requestId = Date.now();
    try {
        const { drugs } = req.body;
        if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
            return res.status(400).json({ error: "Please provide at least two drugs." });
        }
        console.log(`[${requestId}] ⚔️ Analyzing conflicts: ${drugs.join(' + ')}`);
        
        const result = await checkDrugConflicts(drugs);
        
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(`[${requestId}] 💥 Conflict Check Failed:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PILOT FEATURE: Local AI Drug Interaction (Ollama/Groq)
// The UI might still hit /ai/drug-interaction from the older screen
import { analyzeInteractionWithOllama } from './local-llm-service.js';
app.post('/ai/drug-interaction', async (req, res) => {
    const requestId = Date.now();
    try {
        const { drugs } = req.body;
        if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
            return res.status(400).json({ error: "Please provide at least two drugs." });
        }
        const aiResponse = await analyzeInteractionWithOllama(drugs);
        
        // Ensure parsing works
        let status = "UNKNOWN";
        let reason = aiResponse;
        
        if (typeof aiResponse === 'object') {
            status = aiResponse.status || "UNKNOWN";
            reason = aiResponse.reason || JSON.stringify(aiResponse);
        } else {
            const statusMatch = aiResponse.match(/Status:\s*(.*)/i);
            const reasonMatch = aiResponse.match(/Reason:\s*(.*)/i);
            if (statusMatch) status = statusMatch[1].trim().toUpperCase();
            if (reasonMatch) reason = reasonMatch[1].trim();
        }

        res.json({
            success: true,
            source: "Groq (llama-3.1-8b-instant)",
            data: {
                status: status,
                reason: reason,
                raw: typeof aiResponse === 'object' ? JSON.stringify(aiResponse) : aiResponse
            }
        });
    } catch (error) {
        res.status(503).json({ error: true, message: "AI Service unavailable.", details: error.message });
    }
});

// Meal Analysis Endpoint (Groq with Vision support)
app.post('/ai/meal-analysis', async (req, res) => {
    const requestId = Date.now();
    try {
        const { mealName, imageBase64 } = req.body;
        if (!mealName && !imageBase64) {
            return res.status(400).json({ error: "Please provide a 'mealName' string or an 'imageBase64' image." });
        }
        
        console.log(`[${requestId}] 🥗 Analyzing meal: "${mealName || "Uploaded Image"}" (Has Image: ${!!imageBase64})`);
        
        const analysis = await analyzeMealWithOllama(mealName || "This uploaded meal", imageBase64);
        
        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error(`[${requestId}] 💥 Meal Analysis Error:`, error.message);
        res.status(503).json({ error: true, message: "AI Service unavailable.", details: error.message });
    }
});

// Helix Chat Endpoint (Groq)
app.post('/ai/chat', async (req, res) => {
    const requestId = Date.now();
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        
        console.log(`\n[${requestId}] 🧬 User: "${message}" | History: ${history?.length || 0} messages`);
        
        const reply = await chatWithOllama(message, history || []);
        res.json({ success: true, reply });
    } catch (error) {
        console.error(`[${requestId}] 💥 Helix Error:`, error.message);
        res.status(500).json({ success: false, message: 'AI failed to respond.' });
    }
});

// Medical Report Analysis Endpoint (Groq Vision)
app.post('/ai/report-analysis', async (req, res) => {
    const requestId = Date.now();
    try {
        const { reportText, imageBase64, lang } = req.body;

        if (!reportText && !imageBase64) {
            return res.status(400).json({ error: 'Please provide reportText or imageBase64.' });
        }

        console.log(`[${requestId}] 📋 Analyzing medical report (Has Image: ${!!imageBase64}, Has Text: ${!!reportText})`);

        const result = await analyzeMedicalReport(reportText || '', imageBase64 || null, lang || 'en');

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(`[${requestId}] 💥 Report Analysis Error:`, error.message);
        res.status(503).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Backend server running on:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://YOUR_IP_ADDRESS:${PORT} (use ipconfig to find your IP)`);
    console.log(`\n💚 Health check: GET /health`);
    console.log('💊 AI Service: Ready');
});
