import type { GenerationRequest, GenerationResponse } from '../types';

function appUrl(): string {
  return (process.env.LIL_GUYS_APP_URL?.trim() || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function lilGuysAppUrl(): string {
  return appUrl();
}

export async function generateWithLilGuys(request: GenerationRequest): Promise<GenerationResponse> {
  const response = await fetch(appUrl() + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const raw = await response.text();
  let payload: any = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { error: raw || 'Lil Guys returned a non-JSON response.' };
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Lil Guys generation failed with HTTP ' + response.status + '.');
  }

  return payload as GenerationResponse;
}

export async function checkLilGuysConnection(): Promise<{
  url: string;
  status: string;
  model?: string;
  hasApiKey?: boolean;
}> {
  const response = await fetch(appUrl() + '/api/info');
  const payload = (await response.json()) as any;
  if (!response.ok) {
    throw new Error(payload?.error || 'Lil Guys health check failed with HTTP ' + response.status + '.');
  }
  return {
    url: appUrl(),
    status: String(payload?.status || 'unknown'),
    model: payload?.model ? String(payload.model) : undefined,
    hasApiKey: typeof payload?.hasApiKey === 'boolean' ? payload.hasApiKey : undefined,
  };
}
