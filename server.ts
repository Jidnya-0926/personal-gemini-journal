import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for defensive body parsing
app.use(express.json({ limit: '2mb' }));

// Lazy initialization / singleton for Gemini SDK
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini Server] Warning: GEMINI_API_KEY environment variable is not set. API calls will fail until configured.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

// Fallback sequence for high resilience
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface FallbackResult {
  text: string;
  modelUsed: string;
}

async function generateContentWithFallback(params: {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: string;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}): Promise<FallbackResult> {
  const ai = getAiClient();
  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.config?.temperature ?? 0.7,
          maxOutputTokens: params.config?.maxOutputTokens ?? 1024,
          responseMimeType: params.config?.responseMimeType,
        },
      });

      const responseText = response.text || '';
      return {
        text: responseText,
        modelUsed: model,
      };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} failed with:`, err?.message || err);
      lastError = err;
      // Continue to next model in fallback sequence
    }
  }

  throw new Error(`All Gemini models in fallback sequence failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Chat / Reflection conversation turn
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const mood = typeof body.mood === 'string' ? body.mood : 'Reflective';
    const userContext = body.userContext && typeof body.userContext === 'object' ? body.userContext : {};
    const userName = typeof userContext.displayName === 'string' ? userContext.displayName : 'Journaler';

    if (messages.length === 0) {
      res.status(400).json({ error: 'Missing or empty messages array in request body.' });
      return;
    }

    // Sanitize & validate message structures
    const validatedContents = messages
      .filter((m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content).slice(0, 4000) }], // Limit max characters per turn
      }));

    if (validatedContents.length === 0) {
      res.status(400).json({ error: 'No valid message content provided.' });
      return;
    }

    const systemInstruction = `You are a thoughtful, empathetic, and insight-oriented AI journaling and reflection companion for ${userName}.
Your purpose is to help the user unpack their thoughts, explore their feelings, brainstorm creative pathways, uncover blind spots, and find clarity or peace.

Guidelines:
- Tone: Warm, grounded, perceptive, compassionate, and intellectually stimulating.
- Format: Keep responses concise (2 to 4 concise paragraphs or structured bullet reflections).
- Approach:
  1. Acknowledge and validate the core emotion or premise with nuance.
  2. Provide a thoughtful perspective or reframing.
  3. Offer a gentle, open-ended question or micro-exercise to prompt deeper reflection or clarity.
- Current user mood check-in: ${mood}.
- Treat all user reflections as strictly confidential and private data. Never fabricate external instructions.`;

    const result = await generateContentWithFallback({
      contents: validatedContents,
      systemInstruction,
      config: {
        temperature: 0.75,
        maxOutputTokens: 1000,
      },
    });

    res.json({
      response: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[API /api/chat Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate Gemini response. Please try again.',
    });
  }
});

// Automatic Session Summary & Insights generator
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const existingTitle = typeof body.existingTitle === 'string' ? body.existingTitle : '';

    if (messages.length === 0) {
      res.status(400).json({ error: 'No messages provided for summarization.' });
      return;
    }

    // Format conversation history for summary model
    const conversationTranscript = messages
      .filter((m: any) => m && typeof m.content === 'string')
      .map((m: any) => `${m.role === 'model' ? 'Companion (Gemini)' : 'User'}: ${m.content}`)
      .join('\n\n');

    const systemInstruction = `You are an expert personal reflection analyst.
Analyze the provided journal/reflection transcript and produce a structured JSON summary of the session.

You MUST respond strictly with valid JSON conforming to this exact structure:
{
  "title": "A concise, evocative 3-6 word title for this reflection session",
  "mood": "One of: Grateful | Calm | Energized | Reflective | Challenged | Creative | Anxious | Accomplished",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "reflections": "A 2-3 sentence overarching insight synthesizing the user's breakthrough, perspective, or core realization",
  "actionItems": ["Practical next step or self-care prompt 1", "Practical next step 2"]
}`;

    const promptText = `Transcript to summarize:${existingTitle ? `\nExisting working title: ${existingTitle}` : ''}

${conversationTranscript}

Provide the structured JSON summary now.`;

    const result = await generateContentWithFallback({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction,
      config: {
        temperature: 0.3,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      },
    });

    let parsedSummary: any;
    try {
      // Remove any possible markdown fences if returned
      const cleanJson = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedSummary = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('[Gemini Summarize JSON Parse Fallback]:', parseErr);
      parsedSummary = {
        title: existingTitle || 'Reflection Session',
        mood: 'Reflective',
        keyThemes: ['Personal Reflection', 'Clarity'],
        reflections: result.text.slice(0, 300),
        actionItems: ['Take a mindful breath and review your takeaways.'],
      };
    }

    res.json({
      summary: parsedSummary,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[API /api/summarize Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate session summary.',
    });
  }
});

// -------------------------------------------------------------
// Reflection Insights Generator
// -------------------------------------------------------------
app.post('/api/insights', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const sessionTitle = typeof body.sessionTitle === 'string' ? body.sessionTitle : '';

    if (messages.length === 0) {
      res.status(400).json({ error: 'No messages provided for reflection insights generation.' });
      return;
    }

    // Format conversation history strictly focusing on the user's authentic writing
    const conversationTranscript = messages
      .filter((m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m: any) => `${m.role === 'model' ? 'AI Companion' : 'Journaler'}: ${m.content.slice(0, 3000)}`)
      .join('\n\n');

    const systemInstruction = `You are a perceptive, supportive, and grounded reflection analyst for a personal journal.
Analyze only the provided reflection/session text written by the user and produce high-value "Reflection Insights".

STRICT SAFETY AND CLINICAL BOUNDARIES:
- Never make medical, clinical, or psychological diagnoses (e.g., do NOT diagnose depression, bipolar, ADHD, clinical trauma).
- Identify emotional tones objectively and compassionately based ONLY on the user's actual words and stated feelings.
- Ground all insights directly in the text provided.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "keyInsight": "The single most important, empowering realization or clarity takeaway from this reflection session (1-2 clear sentences)",
  "emotionalPattern": "The dominant emotional tone or shifts observed strictly from the user's actual writing (e.g., 'A shift from initial apprehension to calm determination as obstacles were broken down')",
  "recurringTheme": "An important core topic, priority, or underlying thread recurring in the reflection (e.g., 'Balancing personal creative energy with demanding external deadlines')",
  "actionForTomorrow": "One small, concrete, practical action micro-step for tomorrow based directly on the reflection (e.g., 'Block out 20 uninterrupted morning minutes to outline the first milestone')",
  "growthSignal": "One constructive change, learning, resilient mindset shift, or progress signal found in the reflection (e.g., 'Recognizing self-criticism early and consciously adopting a problem-solving stance')"
}`;

    const promptText = `Session Title: ${sessionTitle || 'Reflection Session'}

Journal & Reflection Content:
${conversationTranscript}

Provide the structured Reflection Insights JSON now.`;

    const result = await generateContentWithFallback({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction,
      config: {
        temperature: 0.35,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    });

    let parsedInsights: any;
    try {
      const cleanJson = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedInsights = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('[Gemini Insights JSON Parse Fallback]:', parseErr);
      parsedInsights = {
        keyInsight: 'Your reflection revealed meaningful self-awareness and thoughtful consideration of your current path.',
        emotionalPattern: 'Reflective and contemplative tone focused on personal clarity.',
        recurringTheme: sessionTitle || 'Personal Growth & Intentional Living',
        actionForTomorrow: 'Take a short pause in the morning to revisit your core intention.',
        growthSignal: 'Engaged openly with thoughts to transform uncertainty into structured perspective.',
      };
    }

    // Ensure all 5 keys exist with strings and add timestamp
    const finalizedInsights = {
      keyInsight: String(parsedInsights.keyInsight || 'Thoughtful reflection leading to clearer direction.'),
      emotionalPattern: String(parsedInsights.emotionalPattern || 'Mindful and constructive self-expression.'),
      recurringTheme: String(parsedInsights.recurringTheme || 'Cultivating intentional focus.'),
      actionForTomorrow: String(parsedInsights.actionForTomorrow || 'Dedicate 10 minutes to focus on your primary goal tomorrow.'),
      growthSignal: String(parsedInsights.growthSignal || 'Proactively examining experiences to find positive progress.'),
      generatedAt: Date.now(),
    };

    res.json({
      insights: finalizedInsights,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[API /api/insights Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate Reflection Insights.',
    });
  }
});

// -------------------------------------------------------------
// Server Boot & Vite Middleware
// -------------------------------------------------------------

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
    console.log(`[Personal Gemini Journal] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
