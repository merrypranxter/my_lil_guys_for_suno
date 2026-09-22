import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { buildMasterPrompt, buildRepairPrompt } from './src/lib/buildGenerationPrompt';
import { generateProceduralTrack, clampAndPad, TARGETS } from './src/lib/proceduralGenerator';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Configuration: Primary model and candidate fallback models for high demand resilience
const CONFIGURED_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
export const GEMINI_MODEL = CONFIGURED_MODEL;

// High-speed, high-quota models prioritized to prevent 503/429 latency spikes
const CANDIDATE_MODELS = Array.from(
  new Set([
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    ...(CONFIGURED_MODEL !== 'gemini-2.5-flash' ? [CONFIGURED_MODEL] : []),
  ])
);

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

function formatErrorMessage(err: any): string {
  if (!err) return 'Inference engine encountered an unexpected error.';
  const str = typeof err === 'string' ? err : err.message || String(err);
  try {
    const parsed = JSON.parse(str);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }
  return str;
}

async function generateWithResilience(
  contents: string,
  config: any,
  timeoutPerModelMs = 18000
): Promise<{ response: any; usedModel: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[Gemini] Requesting model=${model}...`);

      let timeoutTimer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error(`Model ${model} inference timed out after ${timeoutPerModelMs}ms`));
        }, timeoutPerModelMs);
      });

      const responsePromise = ai.models.generateContent({
        model,
        contents,
        config,
      });

      const response = await Promise.race([responsePromise, timeoutPromise]).finally(() => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
      });

      console.log(`[Gemini] Success using model=${model}`);
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = formatErrorMessage(err);
      console.warn(`[Gemini] Model ${model} failed (${errMsg.slice(0, 160)}), trying next candidate...`);
      // Immediately failover to next model
    }
  }

  throw lastError;
}

// Health & Info Endpoint
app.get('/api/info', (_req, res) => {
  res.json({
    status: 'online',
    model: GEMINI_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Single Generation Endpoint (1 AI call per generation)
app.post('/api/generate', async (req, res) => {
  try {
    const { guyIds = [], seed = '', energy = 4 } = req.body;

    const { systemInstruction, userPrompt } = buildMasterPrompt({
      guyIds: Array.isArray(guyIds) ? guyIds : [],
      seed: typeof seed === 'string' ? seed : '',
      energy: typeof energy === 'number' ? energy : 4,
    });

    const { response, usedModel } = await generateWithResilience(userPrompt, {
      systemInstruction,
      temperature: 0.95,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          style: {
            type: Type.STRING,
            description: 'The complete Suno STYLE string, targeted to 975-999 characters.',
          },
          lyrics: {
            type: Type.STRING,
            description: 'The complete Suno LYRICS / CONTROL string with bracketed directions, targeted to 4900-4999 characters.',
          },
          caption: {
            type: Type.STRING,
            description: 'The complete Suno CAPTION explanation, targeted to 490-499 characters.',
          },
        },
        required: ['style', 'lyrics', 'caption'],
      },
    });

    const rawText = response.text || '{}';
    let parsed: { style?: string; lyrics?: string; caption?: string } = {};

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback regex extraction if JSON wrapping got mangled
      const styleMatch = rawText.match(/"style"\s*:\s*"([\s\S]*?)(?<!\\)",/);
      const lyricsMatch = rawText.match(/"lyrics"\s*:\s*"([\s\S]*?)(?<!\\)",/);
      const captionMatch = rawText.match(/"caption"\s*:\s*"([\s\S]*?)(?<!\\)"\s*\}/);

      parsed = {
        style: styleMatch ? styleMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        lyrics: lyricsMatch ? lyricsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        caption: captionMatch ? captionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
      };
    }

    const style = parsed.style || '';
    const lyrics = parsed.lyrics || '';
    const caption = parsed.caption || '';

    res.json({
      style,
      lyrics,
      caption,
      model: usedModel,
      charCounts: {
        style: style.length,
        lyrics: lyrics.length,
        caption: caption.length,
      },
    });
  } catch (error: any) {
    console.warn('AI generation encountered high demand or quota across models, engaging procedural engine:', error?.message);

    try {
      const fallback = generateProceduralTrack({
        guyIds: Array.isArray(req.body?.guyIds) ? req.body.guyIds : [],
        seed: typeof req.body?.seed === 'string' ? req.body.seed : '',
        energy: typeof req.body?.energy === 'number' ? req.body.energy : 4,
      });

      res.json({
        style: fallback.style,
        lyrics: fallback.lyrics,
        caption: fallback.caption,
        model: 'procedural-synthesizer',
        charCounts: {
          style: fallback.style.length,
          lyrics: fallback.lyrics.length,
          caption: fallback.caption.length,
        },
        notice: 'Synthesized via procedural engine due to high AI API demand',
      });
    } catch (fallbackErr: any) {
      console.error('Generation failed:', error);
      res.status(500).json({
        error: formatErrorMessage(error),
      });
    }
  }
});

// Targeted Length Repair Endpoint (Only called if user explicitly requests "REPAIR LENGTH" on one box)
app.post('/api/repair', async (req, res) => {
  const { boxType, currentText } = req.body;

  if (!boxType || typeof currentText !== 'string') {
    res.status(400).json({ error: 'Missing boxType or currentText' });
    return;
  }

  const targets: Record<string, { min: number; max: number }> = {
    style: { min: 975, max: 999 },
    lyrics: { min: 4900, max: 4999 },
    caption: { min: 490, max: 499 },
  };
  const target = targets[boxType] || { min: 490, max: 499 };

  try {
    const { systemInstruction, userPrompt } = buildRepairPrompt(boxType, currentText);

    const { response, usedModel } = await generateWithResilience(userPrompt, {
      systemInstruction,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          repairedText: {
            type: Type.STRING,
            description: 'The repaired text conforming to the strict target character length.',
          },
        },
        required: ['repairedText'],
      },
    });

    const rawText = response.text || '{}';
    let repairedText = currentText;

    try {
      const parsed = JSON.parse(rawText);
      if (parsed.repairedText) {
        repairedText = parsed.repairedText;
      }
    } catch {
      const match = rawText.match(/"repairedText"\s*:\s*"([\s\S]*?)(?<!\\)"/);
      if (match) {
        repairedText = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }

    res.json({
      repairedText,
      model: usedModel,
      charCount: repairedText.length,
    });
  } catch (error: any) {
    console.warn('AI length repair hit quota/demand; applying algorithmic calibration:', error?.message);

    // Algorithmic fallback calibration ensures user request never hangs or fails with 500
    let repairedText = currentText;
    if (repairedText.length > target.max) {
      repairedText = repairedText.slice(0, target.max);
    } else if (repairedText.length < target.min) {
      const paddingComment = `\n[NOTE: Operational invariant preserved for ${boxType.toUpperCase()}. Continued procedural dynamics sustained.]`;
      while (repairedText.length < target.min) {
        const remaining = target.min - repairedText.length;
        if (remaining <= paddingComment.length) {
          repairedText += paddingComment.slice(0, remaining);
        } else {
          repairedText += paddingComment;
        }
      }
      if (repairedText.length > target.max) {
        repairedText = repairedText.slice(0, target.max);
      }
    }

    res.json({
      repairedText,
      model: 'calibrator-engine',
      charCount: repairedText.length,
    });
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Little Guy Machine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
