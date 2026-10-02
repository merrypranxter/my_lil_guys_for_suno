import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { checkLilGuysConnection, lilGuysAppUrl } from './src/mcp/apiClient';
import { createLilGuysMcpServer } from './src/mcp/server';

let child: ChildProcessWithoutNullStreams | null = null;
let shuttingDown = false;

function isLocalDefaultTarget(): boolean {
  if (process.env.LIL_GUYS_APP_URL?.trim()) return false;
  const url = lilGuysAppUrl();
  return url.startsWith('http://127.0.0.1:') || url.startsWith('http://localhost:');
}

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function pipeChildToStderr(proc: ChildProcessWithoutNullStreams): void {
  proc.stdout.on('data', (chunk) => {
    process.stderr.write('[Lil Guys app] ' + String(chunk));
  });
  proc.stderr.on('data', (chunk) => {
    process.stderr.write('[Lil Guys app] ' + String(chunk));
  });
}

async function canReachApp(): Promise<boolean> {
  try {
    await checkLilGuysConnection();
    return true;
  } catch {
    return false;
  }
}

async function waitForApp(attempts = 40, delayMs = 250): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await canReachApp()) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (child?.exitCode !== null) {
      throw new Error('The local Lil Guys server exited before MCP could connect.');
    }
  }
  throw new Error('Timed out waiting for Lil Guys at ' + lilGuysAppUrl() + '.');
}

function cleanup(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  if (child && child.exitCode === null) {
    child.kill();
  }
}

async function main(): Promise<void> {
  const alreadyRunning = await canReachApp();

  if (!alreadyRunning) {
    if (!isLocalDefaultTarget()) {
      throw new Error(
        'Could not reach configured LIL_GUYS_APP_URL ' +
          lilGuysAppUrl() +
          '. Fix the URL or unset it to let MCP start Lil Guys locally.',
      );
    }

    console.error('Lil Guys app is not running; starting it locally for MCP...');
    child = spawn(npmCommand(), ['run', 'dev'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipeChildToStderr(child);
    await waitForApp();
  }

  const info = await checkLilGuysConnection();
  console.error(
    'Lil Guys Lab MCP connected to ' +
      info.url +
      ' (' +
      info.status +
      ', model=' +
      (info.model || 'unknown') +
      ').',
  );

  process.stdin.on('end', cleanup);
  process.stdin.on('close', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  process.on('exit', cleanup);

  void serveStdio(createLilGuysMcpServer);
  console.error('Lil Guys Lab MCP running on stdio');
}

main().catch((error) => {
  console.error('[Lil Guys MCP fatal]', error instanceof Error ? error.message : String(error));
  cleanup();
  process.exit(1);
});
