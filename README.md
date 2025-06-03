# 23andMe Raw Data MCP Server

A minimal proof-of-concept Model Context Protocol (MCP) server for querying 23andMe raw genotype files by RSID.

## Requirements

- Node.js v18+
- 23andMe raw data file (TSV format, with header comments)

## Installation

```bash
git clone https://github.com/yourusername/23andme-mcp-poc.git
cd 23andme-mcp
npm install
```

## Usage

```bash
npm start sample-data.txt
```
or
```bash
node src/index.js sample-data.txt
```

This will parse `sample-data.txt` and wait for MCP requests over stdin/stdout.

## MCP Client Setup

Example of `mcp.json`:

```json
{
  "mcpServers": {
    "23andMe Genotype Lookup": {
      "command": "node",
      "args": ["~/src/index.js", "~/sample-data.txt"]
    }
  }
}
```

## Tool Definition

**get_genotype_by_rsid**

- **Input**: `{ "rsid": "rs3131972" }`
- **Output**: `AG`

Missing data returns: `--`

## License

MIT 