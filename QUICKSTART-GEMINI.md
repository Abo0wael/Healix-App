# 🚀 Quick Start Guide - Gemini Pro Drug Alternatives API

## Step 1: Get Your Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the API key (it looks like: `AIzaSy...`)

## Step 2: Setup Backend

Open a terminal and run:

```bash
# Navigate to backend folder
cd "c:\Users\waela\OneDrive\سطح المكتب\figma_app\backend"

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env
```

## Step 3: Configure API Key

1. Open `backend\.env` in your text editor
2. Replace `your_gemini_api_key_here` with your actual API key:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

Save the file.

## Step 4: Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 Backend server running on http://localhost:3000
📍 API endpoint: POST http://localhost:3000/ai/drug-alternatives
💚 Health check: GET http://localhost:3000/health
```

## Step 5: Test the API

### Option A: Using the test script

Open a **new terminal** and run:

```bash
cd "c:\Users\waela\OneDrive\سطح المكتب\figma_app\backend"
node test-api.js
```

### Option B: Using cURL

```bash
curl -X POST http://localhost:3000/ai/drug-alternatives ^
  -H "Content-Type: application/json" ^
  -d "{\"drug\": \"Aspirin\"}"
```

### Option C: Using your browser

1. Open your browser
2. Install a REST client extension (like Thunder Client for VS Code)
3. Make a POST request to `http://localhost:3000/ai/drug-alternatives`
4. Body: `{"drug": "Aspirin"}`

## Step 6: Test from Your React Native App

You can now use the service in your app. Here's a quick example:

```typescript
import { getDrugAlternatives, checkBackendHealth } from '@/lib/gemini-service';

// Check if backend is running
const isHealthy = await checkBackendHealth();
console.log('Backend healthy:', isHealthy);

// Get drug alternatives
const result = await getDrugAlternatives('Aspirin');
console.log('Alternatives:', result.alternatives);
```

## Expected Response Example

```json
{
  "alternatives": [
    {
      "name": "Paracetamol (Acetaminophen)",
      "note": "Effective for pain and fever relief without anti-inflammatory effects"
    },
    {
      "name": "Ibuprofen",
      "note": "NSAID with similar pain relief and anti-inflammatory properties"
    },
    {
      "name": "Naproxen",
      "note": "Longer-acting NSAID, good for chronic pain"
    }
  ],
  "disclaimer": "AI-generated suggestions. Always consult a doctor before changing medications."
}
```

## Troubleshooting

### Problem: "Cannot find module"
**Solution:** Make sure you ran `npm install` in the backend directory

### Problem: "Gemini API key is not configured"
**Solution:** Check that your `.env` file exists and has the correct API key

### Problem: Port 3000 already in use
**Solution:** Change PORT in `.env` to 3001 or another available port

### Problem: Frontend can't connect
**Solution:** 
- Make sure backend is running
- Check the URL in `lib/gemini-service.ts` matches your backend port
- If testing on physical device, replace `localhost` with your computer's IP address

## Next Steps

Once everything is working:

1. ✅ Backend API responds correctly
2. ✅ You can see the Gemini AI responses in console
3. 🎯 Next: Integrate into your Drug Alternative Search screen
4. 🎯 Later: Add loading states, error handling, and UI display

---

**Remember:** This is for testing only. Always consult medical professionals for real medical advice! 💊
