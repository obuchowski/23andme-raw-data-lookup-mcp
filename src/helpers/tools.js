import { loadData } from './load-data.js';

const genome = loadData();

export const LIST_TOOLS = {
  tools: [{
    name: 'get_genotype_by_rsid',
    description: 'Lookup genotype for a given RSID, responses with "--" if not found',
    inputSchema: {
      type: 'object',
      properties: { rsid: { type: 'string', pattern: '^[a-z]+\\d+$' } },
      required: ['rsid'],
    },
  }],
}

export const lookupGenotype = (rsid) => ({
  content: [{
    type: 'text',
    text: rsid ? (genome.get(rsid)?.genotype || '--') : '--',
  }],
});