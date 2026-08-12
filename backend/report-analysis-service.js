/**
 * Medical Report Analysis Service
 * Uses Groq Vision API (llama-4-scout) to analyze medical reports from images or text
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const TEXT_MODEL = 'llama-3.1-8b-instant';

function extractJson(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(text.substring(start, end + 1));
            } catch (e2) {
                console.warn('[Report-Service] JSON extraction failed:', e2.message);
            }
        }
        return null;
    }
}

export async function analyzeMedicalReport(reportText, imageBase64 = null, lang = 'en') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const hasImage = !!imageBase64;
    const hasText = !!(reportText && reportText.trim());

    if (!hasImage && !hasText) {
        throw new Error('No report content provided. Please provide text or an image.');
    }

    const prompt = `You are an expert medical report analyst. Analyze the provided medical report (which may be a lab result, radiology report, blood test, or clinical document).

Your task:
1. Extract all key findings from the report.
2. Identify any abnormal values (flag them clearly as HIGH, LOW, or ABNORMAL).
3. Provide a simple, patient-friendly summary in plain language.
4. List any mentioned medications or treatments.
5. Give a recommended next action (e.g., consult doctor, retest, normal - no action needed).
6. Detect the report type (Blood Test, X-Ray, MRI, Urine Test, ECG, etc.).

CRITICAL RULES:
- Use simple, non-technical language in the summary.
- Always flag abnormal values clearly.
- Be concise but comprehensive.
- Do NOT make diagnoses, only describe findings.
- If the image/text is unclear or not a medical report, say so in the summary.
- Output ONLY valid JSON, no extra text.
- IMPORTANT: Write ALL text values in the JSON response (summary, report_type, note fields, action_detail) in ${lang === 'ar' ? 'Arabic (العربية) - this is mandatory' : 'English'}.

Return EXACTLY this JSON structure:
{
  "report_type": "Type of medical report (e.g., Blood Test, MRI, X-Ray)",
  "summary": "1-3 sentence plain-language summary of the overall report",
  "key_findings": [
    {
      "name": "Test/Finding name",
      "value": "Result value or description",
      "unit": "Unit if applicable (e.g., mg/dL) or empty string",
      "status": "NORMAL | HIGH | LOW | ABNORMAL | INFO",
      "note": "Brief clinical note in simple language"
    }
  ],
  "abnormal_count": 0,
  "medications_mentioned": ["Drug name 1", "Drug name 2"],
  "recommended_action": "CONSULT_DOCTOR | URGENT_CARE | FOLLOW_UP | NORMAL",
  "action_detail": "Specific guidance for the patient",
  "report_date": "Date mentioned in report or empty string",
  "overall_status": "NORMAL | ATTENTION_NEEDED | URGENT"
}

${hasText ? `\nReport Text:\n${reportText}` : ''}`;

    const targetModel = hasImage ? VISION_MODEL : TEXT_MODEL;

    let messageContent;
    if (hasImage) {
        messageContent = [
            { type: "text", text: prompt },
            {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
        ];
    } else {
        messageContent = prompt;
    }

    try {
        console.log(`[Report-Service] 📋 Analyzing medical report (${hasImage ? 'Image' : 'Text'} mode) using ${targetModel}`);

        const bodyOptions = {
            model: targetModel,
            messages: [{ role: 'user', content: messageContent }],
            temperature: 0.1,
            max_tokens: 1200
        };

        // Only add JSON mode for text (vision doesn't support it)
        if (!hasImage) {
            bodyOptions.response_format = { type: 'json_object' };
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(bodyOptions)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Groq API Error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const rawResponse = data.choices[0].message.content.trim();
        console.log(`[Report-Service] ✅ Raw AI response received (${rawResponse.length} chars)`);

        const parsed = extractJson(rawResponse);

        if (parsed) {
            // Ensure all required fields exist
            return {
                report_type: parsed.report_type || 'Medical Report',
                summary: parsed.summary || 'Analysis complete.',
                key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings : [],
                abnormal_count: parsed.abnormal_count ?? 0,
                medications_mentioned: Array.isArray(parsed.medications_mentioned) ? parsed.medications_mentioned : [],
                recommended_action: parsed.recommended_action || 'CONSULT_DOCTOR',
                action_detail: parsed.action_detail || 'Please consult your doctor to review these results.',
                report_date: parsed.report_date || '',
                overall_status: parsed.overall_status || 'ATTENTION_NEEDED'
            };
        } else {
            console.warn('[Report-Service] ⚠️ Could not parse JSON from response, returning raw');
            return {
                report_type: 'Medical Report',
                summary: rawResponse.substring(0, 300),
                key_findings: [],
                abnormal_count: 0,
                medications_mentioned: [],
                recommended_action: 'CONSULT_DOCTOR',
                action_detail: 'Please consult your doctor to review these results.',
                report_date: '',
                overall_status: 'ATTENTION_NEEDED'
            };
        }
    } catch (error) {
        console.error('[Report-Service] 💥 Error:', error.message);
        throw new Error(`Medical Report Analysis Failed: ${error.message}`);
    }
}
