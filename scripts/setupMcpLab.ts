import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(flag + '='));
  return inline ? inline.slice(flag.length + 1) : undefined;
}

async function main() {
  const root = process.cwd();
  const agentsDir = path.join(root, '.agents');
  const configPath = path.join(agentsDir, 'mcp_config.json');
  const appUrl =
    argValue('--app-url') ||
    process.env.LIL_GUYS_APP_URL ||
    'http://127.0.0.1:3000';

  let config: any = { mcpServers: {} };
  try {
    const raw = await readFile(configPath, 'utf8');
    config = JSON.parse(raw);
    if (!config || typeof config !== 'object') config = {};
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      throw new Error(
        'Could not read existing ' + configPath + '. Fix its JSON first so setup does not destroy another MCP config.'
      );
    }
  }

  if (!config.mcpServers || typeof config.mcpServers !== 'object' || Array.isArray(config.mcpServers)) {
    config.mcpServers = {};
  }

  config.mcpServers['lil-guys-lab'] = {
    command: 'npm',
    args: ['--prefix', root, 'run', 'mcp'],
    env: {
      LIL_GUYS_APP_URL: appUrl,
      LIL_GUYS_LAB_DIR: path.join(root, '.lil-guys-lab'),
    },
  };

  await mkdir(agentsDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

  console.log('Lil Guys Lab MCP config written:');
  console.log(configPath);
  console.log('');
  console.log('Lil Guys app target: ' + appUrl);
  console.log('');
  console.log('NEXT:');
  console.log('1. Make sure Lil Guys is reachable at that URL.');
  console.log('2. In Google Antigravity: MCP Servers → Manage MCP Servers → Refresh.');
  console.log('3. Ask the agent: "Use Lil Guys Lab to run a PETRI DISH on: <seed>"');
  console.log('');
  console.log('The MCP notebook will live at:');
  console.log(path.join(root, '.lil-guys-lab', 'notebook.json'));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
