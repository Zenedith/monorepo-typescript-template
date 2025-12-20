#!/usr/bin/env node
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Get the package directory from command line argument
const packageDir = process.argv[2];

if (!packageDir) {
  console.error('Usage: node build.cjs <package-dir>');
  process.exit(1);
}

const srcPath = path.resolve(packageDir, 'src');
const distPath = path.resolve(packageDir, 'dist');

// Determine entry point - prefer server.ts, fall back to index.ts
let entryPoint;
if (fs.existsSync(path.resolve(srcPath, 'server.ts'))) {
  entryPoint = path.resolve(srcPath, 'server.ts');
} else if (fs.existsSync(path.resolve(srcPath, 'index.ts'))) {
  entryPoint = path.resolve(srcPath, 'index.ts');
} else {
  console.error(`No entry point found (server.ts or index.ts) in ${srcPath}`);
  process.exit(1);
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

const isLibrary = entryPoint.includes('/libs/');
console.log(`Building ${packageDir} (${isLibrary ? 'library' : 'service'}) -> ${distPath}/build.js`);

esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  outfile: path.resolve(distPath, 'build.js'),
  platform: 'node',
  target: 'node22',
  format: 'esm',
  conditions: ['node'],
  external: [
    // Keep Node.js built-in modules as external
    'node:*',
  ],
  logLevel: 'info',
  minify: false,
  banner: !isLibrary ? {
    js: '#!/usr/bin/env node\n// Use CommonJS require shim for dynamic requires\nimport { createRequire } from "module";\nconst require = createRequire(import.meta.url);\nglobalThis.require = require;'
  } : undefined,
}).then(() => {
  // Make the file executable for services
  const buildFile = path.resolve(distPath, 'build.js');
  if (!isLibrary) {
    fs.chmodSync(buildFile, '755');
  }
  console.log(`✓ Built to ${buildFile}`);
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
