const { build, analyzeMetafile } = require('esbuild');
const { execSync } = require('child_process');
const path = require('path');

const banner = `/*! AACA Embed Script - MVP */`;

async function run() {
  const outfile = path.resolve(__dirname, '../dist/autofix.js');

  execSync('npx tsc -p ./tsconfig.lib.json --emitDeclarationOnly --declaration --outDir dist', {
    stdio: 'inherit',
  });

  const result = await build({
    entryPoints: [path.resolve(__dirname, '../src/lib/bootstrap.ts')],
    bundle: true,
    outfile,
    format: 'iife',
    globalName: 'AACAEmbed',
    banner: { js: banner },
    sourcemap: true,
    metafile: true,
    target: ['es2018'],
    logLevel: 'info',
    legalComments: 'none',
    drop: [], // Keep console.log statements for debugging
  });

  const analysis = await analyzeMetafile(result.metafile, { color: true });
  console.log('\nBundle analysis:\n', analysis);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
