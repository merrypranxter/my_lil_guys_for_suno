function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const memory = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  setItem(key: string, value: string) {
    memory.set(key, String(value));
  },
  removeItem(key: string) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  key(index: number) {
    return Array.from(memory.keys())[index] ?? null;
  },
  get length() {
    return memory.size;
  },
};

const storage = await import('../src/lib/localStorage');

const firstSession = storage.getActiveRunSession();
assert(firstSession.id.startsWith('session_'), 'active session should be created automatically');
assert(storage.getRunSessions().length === 1, 'new install should have one session');

const makeRun = (seed: string) => ({
  guyIds: ['taxonomy-goblin'],
  realityEngineIds: [],
  compositionEngineIds: [],
  seed,
  energy: 4,
  model: 'test-model',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
});

const firstRun = storage.saveGeneratedRun(makeRun('first'));
assert(firstRun.sessionId === firstSession.id, 'generated run should inherit the active session id');
assert(storage.getCurrentSessionRuns().length === 1, 'active session should contain its generated run');

storage.updateArchivedRun(firstRun.id, { starred: true, feedback: 'keep me' });
const secondSession = storage.startNewRunSession();

assert(secondSession.id !== firstSession.id, 'new session must receive a new id');
assert(storage.getRunArchive().length === 1, 'starting a new session must not delete archive history');
assert(storage.getCurrentSessionRuns().length === 0, 'fresh session must start with no current-session runs');
assert(storage.getRunArchive()[0].starred, 'starred history must survive a new session');
assert(storage.getRunArchive()[0].feedback === 'keep me', 'feedback must survive a new session');

const secondRun = storage.saveGeneratedRun(makeRun('second'));
assert(secondRun.sessionId === secondSession.id, 'second run should belong only to the second session');
assert(storage.getCurrentSessionRuns().length === 1, 'second session should see only its own run');

const resumed = storage.resumeRunSession(firstSession.id);
assert(resumed?.id === firstSession.id, 'previous session should be resumable');
const resumedRuns = storage.getCurrentSessionRuns();
assert(resumedRuns.length === 1 && resumedRuns[0].id === firstRun.id, 'resuming should restore the previous session boundary');

const sessionMarkdown = storage.sessionToMarkdown(resumed!);
assert(sessionMarkdown.includes('Session ID: ' + firstSession.id), 'session export should identify the session');
assert(sessionMarkdown.includes('Runs: 1'), 'session export should only include that session run count');
assert(sessionMarkdown.includes('**Session ID:** ' + firstSession.id), 'run export should include session provenance');
assert(!sessionMarkdown.includes('second'), 'session export must not leak runs from another session');

const allMarkdown = storage.archiveToMarkdown();
assert(allMarkdown.includes('first') && allMarkdown.includes('second'), 'full archive export should preserve all sessions');

console.log('Session hygiene verification passed:', {
  sessions: storage.getRunSessions().length,
  archiveRuns: storage.getRunArchive().length,
  resumedSession: resumed!.id,
});
