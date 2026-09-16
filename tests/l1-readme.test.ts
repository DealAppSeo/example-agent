/**
 * L1 — stranger path: github:DealAppSeo/trustshell until F-PUBLISH,
 * README is install → verify Paris → verify Rome → getRepID → presentProof.
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

test('depends on github:DealAppSeo/trustshell, not unpublished @1.4.0', () => {
  const dep = pkg.dependencies['@hyperdag/trustshell'];
  assert.equal(dep, 'github:DealAppSeo/trustshell');
  assert.doesNotMatch(JSON.stringify(pkg.dependencies), /1\.4\.0/);
});

test('README is install then the four keyless commands', () => {
  assert.match(readme, /npm install/);
  assert.match(readme, /trustshell verify ["']The capital of France is Paris\.["']/);
  assert.match(readme, /trustshell verify ["']The Eiffel Tower is located in Rome, Italy\.["']/);
  assert.match(readme, /trustshell (repid|getRepID) trinity-shofet/);
  assert.match(readme, /trustshell proof trinity-shofet --verify|presentProof/);
  assert.doesNotMatch(readme, /MVP launched/i);
});
