import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { LabNotebook, LabResult, LabSession } from './types';

const NOTEBOOK_VERSION = 1 as const;
let writeQueue: Promise<unknown> = Promise.resolve();

function dataDir(): string {
  return process.env.LIL_GUYS_LAB_DIR?.trim() || path.join(os.homedir(), '.lil-guys-lab');
}

function notebookPath(): string {
  return path.join(dataDir(), 'notebook.json');
}

function emptyNotebook(): LabNotebook {
  return {
    version: NOTEBOOK_VERSION,
    sessions: [],
    results: [],
  };
}

function normalizeNotebook(raw: unknown): LabNotebook {
  if (!raw || typeof raw !== 'object') return emptyNotebook();
  const source = raw as Partial<LabNotebook>;
  return {
    version: NOTEBOOK_VERSION,
    sessions: Array.isArray(source.sessions) ? source.sessions : [],
    results: Array.isArray(source.results) ? source.results : [],
  };
}

export async function loadNotebook(): Promise<LabNotebook> {
  try {
    const raw = await readFile(notebookPath(), 'utf8');
    return normalizeNotebook(JSON.parse(raw));
  } catch (error: any) {
    if (error?.code === 'ENOENT') return emptyNotebook();
    throw error;
  }
}

async function saveNotebook(notebook: LabNotebook): Promise<void> {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  const finalPath = notebookPath();
  const tempPath = finalPath + '.tmp';
  await writeFile(tempPath, JSON.stringify(notebook, null, 2) + '\n', 'utf8');
  await rename(tempPath, finalPath);
}

export function updateNotebook<T>(mutator: (notebook: LabNotebook) => T | Promise<T>): Promise<T> {
  const task = writeQueue.then(async () => {
    const notebook = await loadNotebook();
    const result = await mutator(notebook);
    await saveNotebook(notebook);
    return result;
  });
  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export function createId(prefix: string): string {
  return prefix + '_' + randomUUID();
}

export async function getSession(sessionId: string): Promise<LabSession> {
  const notebook = await loadNotebook();
  const session = notebook.sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error('Lab session not found: ' + sessionId);
  return session;
}

export async function getResult(resultId: string): Promise<LabResult> {
  const notebook = await loadNotebook();
  const result = notebook.results.find((item) => item.id === resultId);
  if (!result) throw new Error('Lab result not found: ' + resultId);
  return result;
}

export function notebookLocation(): string {
  return notebookPath();
}
