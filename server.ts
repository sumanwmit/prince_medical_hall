import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini API client lazily or safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'Prince Medical Hall', timestamp: new Date().toISOString() });
});

// Explicit sitemap.xml and robots.txt routes for SEO
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
});

// Prescription Scan endpoint (Image OCR or Raw Doctor Notes)
app.post('/api/prescription/scan', async (req, res) => {
  try {
    const { imageBase64, mimeType, doctorNotes } = req.body;
    
    if (!imageBase64 && !doctorNotes) {
      return res.status(400).json({ error: 'Please provide either a prescription image or doctor notes.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert pharmacist AI assistant at Prince Medical Hall. 
Analyze this medical prescription (image or handwritten notes) and extract structured medical information accurately.
Return a structured JSON object containing:
- patientName: string or "Not Specified"
- patientAge: string or "Not Specified"
- doctorName: string or "Not Specified"
- doctorRegNo: string or "Not Specified"
- diagnosis: string or "General Consultation"
- date: string (YYYY-MM-DD or as listed)
- medicines: list of objects with:
  - medicineName: string (brand or generic)
  - genericComposition: string (e.g. Paracetamol 650mg)
  - dosageForm: string (Tablet, Syrup, Injection, Cream, Capsule, Drops, Inhaler, Ointment)
  - frequency: string (e.g., 1-0-1, Once daily, 8 hourly, After meals)
  - timing: string (Before Food, After Food, With Food, Bedtime)
  - duration: string (e.g., 5 Days, 1 Month)
  - totalQuantity: number (estimated total count/units needed)
  - specialInstructions: string (e.g., Take with lukewarm water)
- pharmacistAlerts: array of strings (any critical warnings, missing info, or high-risk drug notes)

Be accurate with medicine spelling and dosage forms.`;

    let contents: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else {
      contents = `Doctor's Notes / Prescription Text:\n${doctorNotes}\n\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            patientAge: { type: Type.STRING },
            doctorName: { type: Type.STRING },
            doctorRegNo: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            date: { type: Type.STRING },
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  medicineName: { type: Type.STRING },
                  genericComposition: { type: Type.STRING },
                  dosageForm: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  timing: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  totalQuantity: { type: Type.NUMBER },
                  specialInstructions: { type: Type.STRING },
                },
                required: ['medicineName', 'dosageForm'],
              },
            },
            pharmacistAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['patientName', 'medicines'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error scanning prescription:', error);
    res.status(500).json({ error: error.message || 'Failed to scan prescription.' });
  }
});

// Drug Interaction Checker Endpoint
app.post('/api/drug-interaction/check', async (req, res) => {
  try {
    const { medicines } = req.body; // Array of strings or medicine objects
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'At least one medicine is required to check interactions.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are a clinical pharmacology expert at Prince Medical Hall.
Analyze the following combination of medicines for potential drug-drug interactions, contraindications, major side effects, and patient counseling safety tips:
Medicines: ${JSON.stringify(medicines)}

Return a structured JSON with:
- overallRiskLevel: "Low" | "Moderate" | "High" | "Severe"
- summary: string concise clinical summary
- interactions: array of objects with:
  - drugPair: string (e.g. "Aspirin + Warfarin")
  - severity: "Minor" | "Moderate" | "Major" | "Contraindicated"
  - description: string mechanism and clinical impact
  - management: string (what the pharmacist or patient should do)
- foodInteractions: array of strings (e.g., Avoid alcohol, Take after food)
- patientCounselingPoints: array of strings (important patient advice)
- genericEquivalents: array of objects with:
  - brandName: string
  - genericName: string
  - costSavingTip: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallRiskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            interactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  drugPair: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  management: { type: Type.STRING },
                },
                required: ['drugPair', 'severity', 'description'],
              },
            },
            foodInteractions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            patientCounselingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            genericEquivalents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  brandName: { type: Type.STRING },
                  genericName: { type: Type.STRING },
                  costSavingTip: { type: Type.STRING },
                },
              },
            },
          },
          required: ['overallRiskLevel', 'summary', 'interactions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error checking drug interaction:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze drug interactions.' });
  }
});

// Generic Drug Search & Price Comparison Assistant Endpoint
app.post('/api/generic/find', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query medicine name is required.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are a medical formula database assistant for Prince Medical Hall pharmacy.
Given medicine query: "${query}"
Find the active chemical composition/generic name, primary therapeutic use, dosage strengths, and bio-equivalent generic brands.
Return structured JSON:
- brandName: string
- activeIngredient: string
- therapeuticClass: string (e.g., Antibiotic, NSAID Analgesic, PPI Antacid, Antidiabetic)
- primaryUses: array of strings
- commonStrengths: array of strings (e.g. ["500mg", "650mg"])
- genericSubstitutes: array of objects:
  - substituteName: string
  - manufacturer: string
  - estimatedSavingsPercent: string (e.g. "30-50% cheaper")
- precautions: array of strings`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error finding generic substitutes:', error);
    res.status(500).json({ error: error.message || 'Failed to search generic substitutes.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prince Medical Hall App running on http://localhost:${PORT}`);
  });
}

startServer();
