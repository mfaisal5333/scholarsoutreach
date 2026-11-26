import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('inline application scripts and landing script parse', () => {
  for (const file of ['index.html', 'dashboard.html']) {
    const html = readFileSync(file, 'utf8');
    assert.equal(html.includes('\0'), false);
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) if (match[1].trim()) new vm.Script(match[1], { filename: file });
  }
  new vm.Script(readFileSync('landing.js', 'utf8'));
});
test('Google credential accompanies server-side AI requests', () => {
  const html = readFileSync('dashboard.html', 'utf8');
  const proxyCall = html.slice(html.indexOf('fetch("/api/claude"'), html.indexOf('fetch("/api/claude"') + 500);
  assert.match(proxyCall, /Authorization/);
  assert.match(proxyCall, /pm:google_credential/);
});
