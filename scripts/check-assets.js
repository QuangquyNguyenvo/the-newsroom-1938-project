import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/assets/', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
const listed = new Set();
assert.equal(
  new Set(manifest.assets.map((asset) => asset.path)).size,
  manifest.assets.length,
  'Duplicate asset provenance',
);
let bytes = 0;

function localFile(path) {
  assert(path.startsWith('/assets/'), `Unexpected asset path: ${path}`);
  const file = resolve(root, path.slice('/assets/'.length));
  assert(file.startsWith(root), `Asset escapes its folder: ${path}`);
  return file;
}

for (const asset of manifest.assets) {
  if (!asset.path.startsWith('/assets/')) continue;
  assert(!listed.has(asset.path), `Duplicate manifest path: ${asset.path}`);
  const file = localFile(asset.path);
  const data = readFileSync(file);
  listed.add(asset.path);
  bytes += data.length;
  if (asset.sha256) {
    assert.equal(
      createHash('sha256').update(data).digest('hex'),
      asset.sha256,
      `Asset changed: ${asset.path}`,
    );
  }
  if (file.endsWith('.gltf')) {
    const model = JSON.parse(data.toString('utf8'));
    for (const entry of [...(model.buffers || []), ...(model.images || [])]) {
      if (!entry.uri || entry.uri.startsWith('data:')) continue;
      assert(!/^[a-z]+:/i.test(entry.uri), `Remote model dependency: ${entry.uri}`);
      const dependency = resolve(dirname(file), decodeURIComponent(entry.uri));
      assert(dependency.startsWith(root), `Model dependency escapes assets: ${entry.uri}`);
      readFileSync(dependency);
    }
  }
}

function visit(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.name !== 'manifest.json' && !entry.name.endsWith('-LICENSE.txt')) {
      const path = '/assets/' + file.slice(root.length).split(sep).join('/');
      assert(listed.has(path), `Asset has no provenance: ${path}`);
    }
  }
}
visit(root);
console.log(`Assets PASS: ${listed.size} registered files, ${(bytes / 1024 ** 2).toFixed(2)} MiB.`);
