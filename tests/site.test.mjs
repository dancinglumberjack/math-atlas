import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { build, root } from '../scripts/build.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';

const read = name => readFileSync(resolve(root, name), 'utf8');

test('committed pages exactly match the portable source build', () => {
  assert.ok(build({ check: true }).includes('index.html'));
  assert.ok(existsSync(resolve(root, '.nojekyll')));
  assert.doesNotMatch(read('index.html'), /\/\*(?:APP_CSS|APP_JS|CURRICULUM_JS)\*\//);
  assert.match(read('vendor/anatomy/LICENSE'), /MIT License/);
});

test('pages have no local-machine paths or external runtime dependencies', () => {
  for (const name of ['index.html', 'about.html'].filter(name => existsSync(resolve(root, name)))) {
    const html = read(name);
    assert.doesNotMatch(html, /(?:file:\/\/|[A-Z]:[\\/]Users[\\/]|127\.0\.0\.1|localhost|\.codex[\\/]|codex-runtimes)/i, name);
    assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]*(?:src|href)=["'](?:https?:)?\/\//i, name + ' should work without a CDN');
    for (const match of html.matchAll(/<(?:script|img|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
      const ref = match[1];
      if (/^(?:data:|#|https?:|\/\/)/.test(ref)) continue;
      assert.ok(!ref.startsWith('/'), 'Asset must work beneath a GitHub project path: ' + ref);
      assert.ok(existsSync(resolve(root, ref.split(/[?#]/)[0])), 'Missing asset: ' + ref);
    }
    for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) assert.doesNotThrow(() => new Script(script[1]), name + ' contains invalid JavaScript');
  }
  for (const file of readdirSync(resolve(root, 'src')).filter(file => /\.(?:js|css|html)$/.test(file))) {
    assert.doesNotMatch(read('src/' + file), /(?:[A-Z]:[\\/]Users[\\/]|file:\/\/)/i, file);
  }
});

test('static preview supports project paths and rejects non-public files', async () => {
  const server = createPreviewServer({ basePath: '/math-atlas/' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/math-atlas/';
  try {
    const home = await fetch(url);
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type'), /text\/html/);
    assert.match(await home.text(), /Math Atlas/);
    for (const path of ['.git/config', 'src/app.js', '../package.json', 'node_modules/playwright/package.json', '%2e%2e%2fpackage.json']) {
      assert.ok((await fetch(url + path)).status >= 400, path);
    }
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
