#!/usr/bin/env node

import fs from 'fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const [dataFile] = process.argv.slice(2);
if (!dataFile) {
  console.error('Usage: node src/index.js <data-file>');
  process.exit(1);
}

// Load and parse genome data (synchronous)
let file;
try {
  file = fs.readFileSync(dataFile, 'utf8');
} catch (err) {
  console.error(`Could not read file "${dataFile}": ${err.message}`);
  process.exit(1);
}

const genome = new Map();
file.split('\n').forEach(line => {
  if (!line || line.startsWith('#')) return;
  const [rsid, chr, pos, genotype] = line.split('\t');
  genome.set(rsid.trim(), {
    chromosome: chr.trim(),
    position: pos.trim(),
    genotype: genotype.trim()
  });
});

const mcp = new Server(
  { name: '23andme-raw-data-lookup', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'get_genotype_by_rsid',
    description: 'Get genotype for a given RSID, "--" if not found',
    inputSchema: {
      type: 'object',
      properties: { rsid: { type: 'string', pattern: '^[a-z]+\\d+$' } },
      required: ['rsid']
    }
  }]
}));

mcp.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  const rsid = params.arguments?.rsid;
  // Return '--' for missing or invalid RSID
  const genotype = rsid && /^[a-z]+\d+$/.test(rsid)
    ? genome.get(rsid)?.genotype || '--'
    : '--';
  return { content: [{ type: 'text', text: genotype }] };
});

// Start STDIO transport
const transport = new StdioServerTransport();
await mcp.connect(transport); 