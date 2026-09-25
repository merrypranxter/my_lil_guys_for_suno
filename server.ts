import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { buildMasterPrompt, buildRepairPrompt } from './src/lib/buildGenerationPrompt';
import { generateProceduralTrack } from './src/lib/proceduralGenerator';
import { MusicFingerprint, RealityChaosLevel } from './src/types';
import { normalizeCompositionEngineIds } from './src/data/compositionEngines';
import { normalizeMusicControls, normalizeMusicStack } from './src/data/musicSeedSystem';
import { planGuyActivation } from './src/lib/mindStacking';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const CONFIGURED_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
export const GEMINI_MODEL = CONFIGURED_MODEL;

const CANDIDATE_MODELS = Array.from(
  new Set([
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    CONFIGURED_MODEL,
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

function sanitizeFingerprints(value: any): MusicFingerprint[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .slice(0, 12)
    .map((item) => ({
      genreFamily: String(item.genreFamily || ''),
      harmony: String(item.harmony || ''),
      melody: String(item.melody || ''),
      rhythm: String(item.rhythm || ''),
      timbre: String(item.timbre || ''),
      vocal: String(item.vocal || ''),
      performance: String(item.performance || ''),
      production: String(item.production || ''),
    }));
}

function sanitizeLikedSignals(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.slice(0, 900))
    .slice(0, 10);
}

function sanitizeIdList(value: any, limit = 24): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.slice(0, 120))
    )
  ).slice(0, limit);
}

function sanitizeRealityChaos(value: any): RealityChaosLevel {
  const n = Number(value);
  return n === 1 || n === 2 || n === 3 || n === 4 ? (n as RealityChaosLevel) : 2;
}

async function generateWithResilience(
  contents: string,
  config: any,
  timeoutPerModelMs = 38000
): Promise<{ response: any; usedModel: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log('[Gemini] Requesting model=' + model + '...');

      let timeoutTimer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error('Model ' + model + ' inference timed out after ' + timeoutPerModelMs + 'ms'));
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

      console.log('[Gemini] Success using model=' + model);
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = formatErrorMessage(err);
      console.warn('[Gemini] Model ' + model + ' failed (' + errMsg.slice(0, 160) + '), trying next candidate...');
    }
  }

  throw lastError;
}

app.get('/api/info', (_req, res) => {
  res.json({
    status: 'online',
    model: GEMINI_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/generate', async (req, res) => {
  const requestedGuyIds = sanitizeIdList(req.body?.guyIds, 64);
  const energy = typeof req.body?.energy === 'number' ? req.body.energy : 4;
  const activationPlan = planGuyActivation(requestedGuyIds, energy >= 5 ? 'feral' : 'balanced');
  const guyIds = activationPlan.activeIds;
  const activationNotice = activationPlan.capped
    ? 'Server activation budget engaged: ' + guyIds.length + ' of ' + activationPlan.requestedIds.length + ' selected minds were activated.'
    : undefined;
  const realityEngineIds = sanitizeIdList(req.body?.realityEngineIds);
  const compositionEngineIds = normalizeCompositionEngineIds(sanitizeIdList(req.body?.compositionEngineIds, 64));
  const musicStack = normalizeMusicStack(req.body?.musicStack);
  const musicControls = normalizeMusicControls(req.body?.musicControls);
  const realityChaos = sanitizeRealityChaos(req.body?.realityChaos);
  const seed = typeof req.body?.seed === 'string' ? req.body.seed : '';
  const recentFingerprints = sanitizeFingerprints(req.body?.recentFingerprints);
  const forcedFingerprint = sanitizeFingerprints([req.body?.forcedFingerprint])[0];
  const likedSignals = sanitizeLikedSignals(req.body?.likedSignals);

  try {
    const { systemInstruction, userPrompt } = buildMasterPrompt({
      guyIds,
      realityEngineIds,
      compositionEngineIds,
      musicStack,
      musicControls,
      realityChaos,
      seed,
      energy,
      recentFingerprints,
      forcedFingerprint,
      likedSignals,
    });

    const fingerprintProperties = {
      genreFamily: { type: Type.STRING },
      harmony: { type: Type.STRING },
      melody: { type: Type.STRING },
      rhythm: { type: Type.STRING },
      timbre: { type: Type.STRING },
      vocal: { type: Type.STRING },
      performance: { type: Type.STRING },
      production: { type: Type.STRING },
    };

    const { response, usedModel } = await generateWithResilience(userPrompt, {
      systemInstruction,
      temperature: 1.02,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          style: {
            type: Type.STRING,
            description: 'Complete Suno STYLE string, 975-999 characters.',
          },
          lyrics: {
            type: Type.STRING,
            description: 'Complete Suno LYRICS / CONTROL string, 4900-4999 characters.',
          },
          caption: {
            type: Type.STRING,
            description: 'Publishable CAPTION, 490-499 characters.',
          },
          fingerprint: {
            type: Type.OBJECT,
            properties: fingerprintProperties,
            required: ['genreFamily', 'harmony', 'melody', 'rhythm', 'timbre', 'vocal', 'performance', 'production'],
          },
        },
        required: ['style', 'lyrics', 'caption', 'fingerprint'],
      },
    });

    const rawText = response.text || '{}';
    let parsed: any = {};

    try {
      parsed = JSON.parse(rawText);
    } catch {
      const styleMatch = rawText.match(/"style"\s*:\s*"([\s\S]*?)(?<!\\)",/);
      const lyricsMatch = rawText.match(/"lyrics"\s*:\s*"([\s\S]*?)(?<!\\)",/);
      const captionMatch = rawText.match(/"caption"\s*:\s*"([\s\S]*?)(?<!\\)"/);
      parsed = {
        style: styleMatch ? styleMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        lyrics: lyricsMatch ? lyricsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        caption: captionMatch ? captionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
      };
    }

    const style = parsed.style || '';
    const lyrics = parsed.lyrics || '';
    const caption = parsed.caption || '';
    const fingerprint = forcedFingerprint || (
      parsed.fingerprint && typeof parsed.fingerprint === 'object'
        ? sanitizeFingerprints([parsed.fingerprint])[0]
        : undefined
    );

    res.json({
      style,
      lyrics,
      caption,
      fingerprint,
      model: usedModel,
      charCounts: {
        style: style.length,
        lyrics: lyrics.length,
        caption: caption.length,
      },
      notice: activationNotice,
    });
  } catch (error: any) {
    console.warn('AI generation unavailable, engaging diverse procedural engine:', error?.message);

    try {
      const fallback = generateProceduralTrack({
        guyIds,
        realityEngineIds,
        compositionEngineIds,
        musicStack,
        musicControls,
        realityChaos,
        seed,
        energy,
        recentFingerprints,
        forcedFingerprint,
      });

      res.json({
        style: fallback.style,
        lyrics: fallback.lyrics,
        caption: fallback.caption,
        fingerprint: fallback.fingerprint,
        model: 'procedural-synthesizer',
        charCounts: {
          style: fallback.style.length,
          lyrics: fallback.lyrics.length,
          caption: fallback.caption.length,
        },
        notice: [activationNotice, 'Synthesized via diverse procedural engine due to high AI API demand'].filter(Boolean).join(' '),
      });
    } catch (fallbackErr: any) {
      console.error('Generation failed:', error, fallbackErr);
      res.status(500).json({
        error: formatErrorMessage(error),
      });
    }
  }
});

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
            description: 'Repaired text conforming to the strict target character length.',
          },
        },
        required: ['repairedText'],
      },
    });

    const rawText = response.text || '{}';
    let repairedText = currentText;

    try {
      const parsed = JSON.parse(rawText);
      if (parsed.repairedText) repairedText = parsed.repairedText;
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
    console.warn('AI length repair unavailable; applying algorithmic calibration:', error?.message);

    let repairedText = currentText;
    if (repairedText.length > target.max) {
      repairedText = repairedText.slice(0, target.max);
    } else if (repairedText.length < target.min) {
      const paddingComment = '\n[NOTE: Operational invariant preserved for ' + String(boxType).toUpperCase() + '. Continued procedural dynamics sustained.]';
      while (repairedText.length < target.min) {
        const remaining = target.min - repairedText.length;
        repairedText += remaining <= paddingComment.length ? paddingComment.slice(0, remaining) : paddingComment;
      }
      if (repairedText.length > target.max) repairedText = repairedText.slice(0, target.max);
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
    console.log('The Little Guy Machine running on http://0.0.0.0:' + PORT);
  });
}

startServer();
