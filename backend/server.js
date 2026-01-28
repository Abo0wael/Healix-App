import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { normalizeDrugName } from './ai-service.js';
import { getAlternativesFor } from './drug-database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("-----------------------------------------");
console.log("   🚀 SERVER VERSION: 2.0 (Chat API Configured)   ");
console.log("-----------------------------------------");

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Debug endpoint to verify server and env status
app.get('/debug', (req, res) => {
    console.log('🔍 /debug endpoint called');
    res.json({
        status: 'online',
        serverTime: new Date().toISOString(),
        env: {
            port: process.env.PORT,
            geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
            geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
        },
        ip: req.ip
    });
});

// Drug alternatives endpoint
app.post('/ai/drug-alternatives', async (req, res) => {
    const requestId = Date.now();
    console.log(`\n[${requestId}] 📥 Request received: POST /ai/drug-alternatives`);
    console.log(`[${requestId}] Body:`, JSON.stringify(req.body));

    try {
        const { drug } = req.body;

        if (!drug || typeof drug !== 'string') {
            console.error(`[${requestId}] ❌ Invalid input:`, req.body);
            return res.status(400).json({ error: 'Drug name is required' });
        }

        console.log(`[${requestId}] 🔍 Normalizing drug: "${drug}"`);

        // 1. Normalize the drug name using Gemini
        let genericName;
        try {
            genericName = await normalizeDrugName(drug);
            console.log(`[${requestId}] 🤖 Normalization Result: "${genericName}"`);
        } catch (aiError) {
            console.error(`[${requestId}] ❌ AI Normalization Verification Failed:`);
            console.error(aiError);
            throw new Error(`AI Service Error: ${aiError.message}`);
        }

        if (!genericName) {
            console.log(`[${requestId}] ❌ Could not identify drug.`);
            return res.json({
                success: false,
                original: drug,
                message: "Could not identify this drug. Please check the spelling."
            });
        }

        // 2. Fetch alternatives from controlled database
        const allAlternatives = getAlternativesFor(genericName);
        console.log(`[${requestId}] 📚 Database Lookup for "${genericName}": found ${allAlternatives ? allAlternatives.length : 0} items`);

        if (!allAlternatives) {
            console.warn(`[${requestId}] ⚠️ No alternatives found in DB`);
            return res.json({
                success: false,
                original: drug,
                generic: genericName,
                message: "No safe alternatives found in our database."
            });
        }

        // 3. Filter out the requested drug (if input was already a generic)
        const filteredAlternatives = allAlternatives.filter(
            alt => alt.name.toLowerCase() !== drug.toLowerCase() &&
                alt.name.toLowerCase() !== genericName
        );

        const response = {
            success: true,
            original: drug,
            generic: genericName,
            alternatives: filteredAlternatives.length > 0 ? filteredAlternatives : allAlternatives
        };

        console.log(`[${requestId}] ✅ Sending success response`);
        res.json(response);

    } catch (error) {
        console.error(`[${requestId}] 💥 CRITICAL SERVER ERROR:`);
        console.error(error);

        // Return explicit error details to frontend for debugging
        res.status(500).json({
            error: true,
            type: error.name,
            message: error.message,
            stack: error.stack ? error.stack.split('\n')[0] : 'No stack trace'
        });
    }
});

// Conflict Detection Endpoint
import { checkDrugConflicts } from './conflict-service.js';

app.post('/ai/drug-conflict', async (req, res) => {
    const requestId = Date.now();
    console.log(`\n[${requestId}] ⚔️  Request received: POST /ai/drug-conflict`);

    try {
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
            return res.status(400).json({ error: "Please provide at least two drugs." });
        }

        console.log(`[${requestId}] 🔍 Analyzing: ${drugs.join(' + ')}`);

        const result = await checkDrugConflicts(drugs);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(`[${requestId}] 💥 Conflict Check Failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to analyze conflicts."
        });
    }
});

// Start server - Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Backend server running on:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://YOUR_IP_ADDRESS:${PORT} (use ipconfig to find your IP)`);
    console.log(`\n💚 Health check: GET /health`);
    console.log('💊 AI Service: Ready');
});
