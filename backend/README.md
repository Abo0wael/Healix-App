# Gemini Pro Drug Alternatives Backend

A simple Node.js backend API that uses Google's Gemini Pro AI to suggest alternative medications.

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

### 4. Run the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### Drug Alternatives
```
POST http://localhost:3000/ai/drug-alternatives
```

**Request Body:**
```json
{
  "drug": "Aspirin"
}
```

**Response:**
```json
{
  "alternatives": [
    {
      "name": "Paracetamol",
      "note": "Similar pain relief"
    },
    {
      "name": "Naproxen",
      "note": "Anti-inflammatory alternative"
    }
  ],
  "disclaimer": "AI-generated suggestions. Always consult a doctor before changing medications."
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/ai/drug-alternatives ^
  -H "Content-Type: application/json" ^
  -d "{\"drug\": \"Aspirin\"}"
```

## Testing with Postman or Thunder Client

1. Create a new POST request to `http://localhost:3000/ai/drug-alternatives`
2. Set header: `Content-Type: application/json`
3. Set body (raw JSON):
   ```json
   {
     "drug": "Aspirin"
   }
   ```
4. Send the request

## Frontend Integration (Later)

When you're ready to connect your React Native app:

```javascript
const getDrugAlternatives = async (drugName) => {
  try {
    const response = await fetch('http://localhost:3000/ai/drug-alternatives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ drug: drugName }),
    });

    const data = await response.json();
    console.log('Alternatives:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Important Notes

⚠️ **This is for testing/demo purposes only**
- Not production-ready
- No authentication
- No rate limiting
- No caching
- Always consult medical professionals for actual medical advice

## Troubleshooting

### "Module not found" errors
Make sure you ran `npm install` in the backend directory.

### "Gemini API key is not configured"
Check that your `.env` file exists and contains a valid `GEMINI_API_KEY`.

### Port already in use
Change the `PORT` in your `.env` file to a different number (e.g., 3001, 3002).

### CORS errors from frontend
The server has CORS enabled by default. If you still get errors, make sure the backend is running.
