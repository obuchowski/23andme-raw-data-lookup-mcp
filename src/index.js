import { LIST_TOOLS, lookupGenotype } from './helpers/tools.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const mcp = new Server(
  { name: '23andme-raw-data-lookup', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

mcp.setRequestHandler(ListToolsRequestSchema, async () => LIST_TOOLS);
mcp.setRequestHandler(CallToolRequestSchema, async ({ params }) => lookupGenotype(params.arguments?.rsid));

mcp.connect(new StdioServerTransport()).then(() => {
  console.log('🚀 MCP server is running');
});
