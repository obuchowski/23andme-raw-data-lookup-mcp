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

const orientationCache = new Map();

export const fetchSNPediaOrientation = async (rsid) => {
  if (orientationCache.has(rsid)) {
    return orientationCache.get(rsid);
  }

  const url = `https://bots.snpedia.com/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${rsid}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(data?.query?.pages || {})[0];
    if (!pageId) return null;

    const content = pages[pageId]?.['revisions']?.[0]?.['*'];
    if (!content) return null;

    const orientation = content.match(/\|StabilizedOrientation=([a-z]+)/)?.[1] || null;

    if (orientation) {
      orientationCache.set(rsid, orientation);
    }

    return orientation;
  } catch (error) {
    console.error(`Error fetching SNPedia data for ${rsid}:`, error);
    return null;
  }
};

const flipGenotype = (genotype) => {
  const complementNucleotide = {
    'A': 'T',
    'T': 'A',
    'C': 'G',
    'G': 'C',
    'D': 'D',
    'I': 'I',
  };

  return genotype
    .split('')
    .map(nucleotide => complementNucleotide[nucleotide] || nucleotide)
    .join('');
};

export const lookupGenotype = async (rsid) => {
  let genotype = (rsid && genome.get(rsid)?.genotype) || '--';

  if (genotype !== '--' && genotype !== 'CG' && genotype !== 'AT') {
    try {
      const orientation = await fetchSNPediaOrientation(rsid);
      if (orientation === 'minus') {
        genotype = flipGenotype(genotype);
      }
    } catch (error) {
      console.error(`Error processing orientation for ${rsid}:`, error);
    }
  }

  return {
    content: [{
      type: 'text',
      text: genotype,
    }],
  }
};
