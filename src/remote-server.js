import http from 'http';
import dotenv from 'dotenv';
import { LIST_TOOLS, lookupGenotype } from './helpers/tools.js';

const PORT = 3000;
const PATH = '/mcp';

dotenv.config();
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const JSON_RPC_ERROR_PARSE = {
  code: -32700,
  message: 'Invalid JSON',
};

const JSON_RPC_ERROR_METHOD_NOT_FOUND = {
  code: -32601,
  message: 'Method not found',
}

http.createServer(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Missing or invalid Authorization header' }));
  }

  const token = authHeader.slice(7);
  if (token !== AUTH_TOKEN) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Forbidden' }));
  }

  const pathname = req.url.split('?')[0];
  const httpMethod =  req.method;

  if (httpMethod === 'POST' && pathname === PATH) {
    let body = '';
    for await (const chunk of req) body += chunk;

    let rpc;
    try {
      rpc = JSON.parse(body)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(JSON_RPC_ERROR_PARSE));
    }

    const { id, method, params } = rpc;
    let result, error;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          serverInfo: { name: '23andme-raw-data-lookup', version:'1.0.0' },
          capabilities: { tools: {} },
        };
        break;
      case 'initialized':
        result = {};
        break;
      case 'tools/list':
        result = LIST_TOOLS;
        break;
      case 'tools/call':
        result = lookupGenotype(params?.arguments?.rsid || {});
        break;
      default:
        error = JSON_RPC_ERROR_METHOD_NOT_FOUND;
    }

    const response = {
      jsonrpc: '2.0',
      id,
      ...(error ? { error } : { result }),
    };

    res.writeHead(200, { 'Content-Type':'application/json' });
    return res.end(JSON.stringify(response));
  }

  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`🚀 JSON-RPC @ http://localhost:${PORT}${PATH}`)
});
