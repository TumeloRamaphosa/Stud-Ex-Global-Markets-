#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createStudexServer } from './server.js';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [rawKey, ...rawValue] = trimmed.split('=');
    const key = rawKey.trim();
    if (process.env[key]) continue;
    process.env[key] = rawValue.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
}

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const envDirs = [process.cwd(), path.dirname(process.cwd()), path.resolve(serverDir, '..', '..')];
for (const dir of envDirs) {
  loadEnvFile(path.join(dir, '.env.local'));
  loadEnvFile(path.join(dir, '.env'));
}

const server = createStudexServer();
const transport = new StdioServerTransport();
await server.connect(transport);
