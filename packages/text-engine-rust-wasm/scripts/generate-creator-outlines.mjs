// Trusted offline generator for only the pinned creator-text-preview/1 font.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = new URL('../../../', import.meta.url);
const adapter = new URL('../', import.meta.url);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const font = new URL('assets/fonts/Sarabun/Sarabun-Regular.ttf', root);
const fontSha256 = 'b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d';
if (sha256(readFileSync(font)) !== fontSha256) throw Error('Pinned Sarabun font mismatch');
const result = spawnSync('cargo', ['run', '--locked', '--offline', '--quiet', '--manifest-path', fileURLToPath(new URL('rust-shaper/Cargo.toml', adapter)), '--bin', 'flowdoc-creator-outlines', '--', fileURLToPath(font)], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (result.status !== 0) throw Error(result.stderr || result.error?.message || 'Generator failed');
const extracted = JSON.parse(result.stdout);
const asset = Buffer.from(JSON.stringify({ source: 'flowdoc-creator-glyph-outlines', contractVersion: 1, layoutProfile: 'creator-text-preview/1', fontSha256, ...extracted }) + '\n');
const manifest = Buffer.from(JSON.stringify({ source: 'flowdoc-creator-glyph-outline-manifest', contractVersion: 1, fontSha256, outlineSha256: sha256(asset), byteLength: asset.length, unitsPerEm: extracted.unitsPerEm, glyphCount: extracted.glyphs.length, generator: 'flowdoc-creator-outlines/1', rustybuzz: '0.20.1', ttfParser: '0.25.1', generatorSourceSha256: sha256(readFileSync(new URL('rust-shaper/src/bin/flowdoc-creator-outlines.rs', adapter))), cargoLockSha256: sha256(readFileSync(new URL('rust-shaper/Cargo.lock', adapter))) }, null, 2) + '\n');
mkdirSync(new URL('assets/', adapter), { recursive: true });
for (const [name, data] of [['creator-sarabun-outlines.v1.json', asset], ['creator-sarabun-outlines.manifest.v1.json', manifest]]) {
  const target = new URL('assets/' + name, adapter);
  if (process.argv.includes('--check')) {
    if (!readFileSync(target).equals(data)) throw Error('Non-deterministic or stale ' + name);
  } else writeFileSync(target, data);
}
console.log(manifest.toString());
