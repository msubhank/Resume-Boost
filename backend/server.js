import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables. AI features will fail until it is added.');
} else {
  ai = new GoogleGenAI({ apiKey });
}

// Multer memory storage configuration for PDF upload
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are supported!'), false);
//     }
//   }
// });

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', geminiActive: !!ai });
});

// 1. PDF Parse Endpoint
app.post('/api/parse-resume', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const data = await pdf(req.file.buffer);
    res.json({ text: data.text });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse resume PDF. Make sure it is a valid text-based PDF.' });
  }
});

// 2. ATS Analyzer Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resumeText and jobDescription are required.' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API is not configured on the backend.' });
    }

    const promptText = `
Analyze the following resume text against the target job description.
Calculate an ATS match score (an integer between 0 and 100), extract matched keywords, extract missing keywords (important keywords or skills present in the job description that are missing or weak in the resume), and provide 3-4 actionable feedback points.

Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""
`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        score: { type: 'INTEGER' },
        matchedKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
        missingKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
        feedback: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['score', 'matchedKeywords', 'missingKeywords', 'feedback']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    const result = JSON.parse(resultText);

    res.json(result);
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'An error occurred during resume analysis. Please try again.' });
  }
});

// 3. Google XYZ Optimizer Endpoint
app.post('/api/optimize-bullet', async (req, res) => {
  try {
    const { bulletPoint, jobContext } = req.body;

    if (!bulletPoint) {
      return res.status(400).json({ error: 'bulletPoint is required.' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API is not configured on the backend.' });
    }

    const promptText = `
Rewrite the following resume bullet point using the Google XYZ method.
Google XYZ method formula: "Accomplished [X] as measured by [Y], by doing [Z]"
- X: The achievement or outcome (what did you accomplish?).
- Y: The measurement or metric (quantifiable results like revenue, speed, load times, scale). If the original bullet point does not include metrics, create highly plausible, realistic estimations or placeholder metrics that make sense for the role.
- Z: The action, technology, method, or strategy used (how did you do it?).

Suggest 3 varied options of the bullet point rewritten using this method. For each option, break down the sentence into its X, Y, and Z parts so they can be styled differently in the frontend.

Original Bullet Point:
"${bulletPoint}"

Optional Job Context (role or industry):
"${jobContext || 'Not specified'}"
`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        suggestions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              text: { type: 'STRING' }, // The full optimized bullet point
              x: { type: 'STRING' },    // The Accomplishment part (e.g. "Increased platform engagement")
              y: { type: 'STRING' },    // The Measurement part (e.g. "by 25% over 3 months")
              z: { type: 'STRING' }     // The Action part (e.g. "by redesigning the onboarding flow with React")
            },
            required: ['text', 'x', 'y', 'z']
          }
        }
      },
      required: ['suggestions']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    const result = JSON.parse(resultText);

    res.json(result);
  } catch (error) {
    console.error('Error in /api/optimize-bullet:', error);
    res.status(500).json({ error: 'An error occurred during bullet point optimization. Please try again.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server.' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
