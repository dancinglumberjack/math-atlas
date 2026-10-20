import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { build, root } from './build.mjs';

// Publish only browser-facing assets. Source, tooling, and dependencies stay out.
build({ check: true });
const destination = resolve(root, 'dist');
if (dirname(destination) !== root) throw new Error('Refusing to clean outside the project build directory.');
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
for (const name of ['index.html', 'about.html', '.nojekyll', 'assets']) {
  if (existsSync(resolve(root, name))) cpSync(resolve(root, name), resolve(root, 'dist', name), { recursive: true });
}
const legacy = resolve(root, 'math-atlas-github-pages/index.html');
if (existsSync(legacy)) {
  mkdirSync(resolve(destination, 'math-atlas-github-pages'), { recursive: true });
  cpSync(legacy, resolve(destination, 'math-atlas-github-pages/index.html'));
}
console.log('Static site ready in dist/.');
