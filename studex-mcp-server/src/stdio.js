#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createStudexServer } from './server.js';

const server = createStudexServer();
const transport = new StdioServerTransport();
await server.connect(transport);
