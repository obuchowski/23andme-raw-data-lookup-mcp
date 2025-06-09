import fs from 'fs';

const [filePath] = process.argv.slice(2);

if (!filePath) {
  console.error('Usage: `npm start:local <data-file>` or `start:remote <data-file>`');
  process.exit(1);
}

export function loadData() {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent) {
      throw new Error(`File "${filePath}" is empty`);
    }

    const genome = new Map();
    fileContent
      .split('\n')
      .filter(line => line && !line.startsWith('#'))
      .forEach(line => {
        const [rsid, chromosome, position, genotype] = line.split('\t')
        genome.set(
          rsid.trim(),
          {
            chromosome: chromosome.trim(),
            position: position.trim(),
            genotype: genotype.trim()
          }
        )
      });

    return genome;
  } catch (e) {
    console.error(`Could not read file "${filePath}"`, e.message);
    process.exit(1);
  }
}
