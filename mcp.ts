import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createLilGuysMcpServer } from './src/mcp/server';

void serveStdio(createLilGuysMcpServer);
console.error('Lil Guys Lab MCP running on stdio');
