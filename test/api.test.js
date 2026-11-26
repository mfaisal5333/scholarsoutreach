import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler as claude } from '../api/claude.js';
import { createHandler as store } from '../api/store.js';
import { authenticate } from '../lib/auth.js';
function response() {
  return { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
async function invoke(handler, body, method = 'POST') { const res = response(); await handler({ method, body, headers: {} }, res); return res; }
test('AI rejects unauthenticated requests before contacting the provider', async () => {
  let called = false;
  const res = await invoke(claude({ auth: async () => null, fetcher: async () => { called = true; } }), { prompt: 'hello' });
  assert.equal(res.code, 401); assert.equal(called, false);
});
test('API handlers reject unsupported methods and malformed input', async () => {
  for (const factory of [claude, store]) {
    const handler = factory({ auth: async () => 'user' });
    assert.equal((await invoke(handler, {}, 'GET')).code, 405);
    assert.equal((await invoke(handler, '{')).code, 400);
    assert.equal((await invoke(handler, [])).code, 400);
  }
  assert.equal((await invoke(claude({ auth: async () => 'user' }), { prompt: 'x'.repeat(50001) })).code, 400);
});
test('AI uses an allowed model and never returns upstream error details', async () => {
  process.env.CLAUDE_API_KEY = 'test-only';
  let request;
  const handler = claude({ auth: async () => 'user', fetcher: async (_, options) => { request = JSON.parse(options.body); return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'draft' }] }) }; } });
  const result = await invoke(handler, { prompt: 'hello', model: 'unknown' });
  assert.equal(result.body.text, 'draft'); assert.equal(request.model, 'claude-haiku-4-5-20251001');
  const failed = await invoke(claude({ auth: async () => 'user', fetcher: async () => ({ ok: false }) }), { prompt: 'hello' });
  assert.equal(failed.code, 502); assert.deepEqual(failed.body, { error: 'AI provider request failed' });
  delete process.env.CLAUDE_API_KEY;
});
test('storage isolates users, applies expiry, and rejects arbitrary keys', async () => {
  const data = new Map(); let expiry;
  const client = { async set(k, v, options) { data.set(k, v); expiry = options.ex; }, async get(k) { return data.get(k); } };
  const alice = store({ auth: async () => 'alice', client });
  const bob = store({ auth: async () => 'bob', client });
  assert.equal((await invoke(alice, { action: 'save', key: 'state', value: 'private' })).code, 200);
  assert.equal(expiry, 7776000);
  assert.deepEqual((await invoke(bob, { action: 'load', key: 'state' })).body, { data: null });
  assert.equal((await invoke(alice, { action: 'load-all' })).body.data.state, 'private');
  assert.equal((await invoke(alice, { action: 'save', key: '../other', value: 1 })).code, 400);
  assert.equal((await invoke(alice, { action: 'save', key: 'state' })).code, 400);
  assert.equal((await invoke(store({ auth: async () => null, client }), { action: 'load-all' })).code, 401);
});
test('Google credentials must match audience, issuer and expiry', async () => {
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  const req = { headers: { authorization: 'Bearer test-token' } };
  const valid = { aud: 'test-client', sub: 'user', iss: 'accounts.google.com', exp: Date.now() / 1000 + 3600 };
  const fetcher = value => async () => ({ ok: true, json: async () => value });
  assert.equal(await authenticate(req, fetcher(valid)), 'user');
  for (const changes of [{ aud: 'other' }, { exp: 0 }, { iss: 'other' }, { sub: '' }]) assert.equal(await authenticate(req, fetcher({ ...valid, ...changes })), null);
  assert.equal(await authenticate({ headers: {} }, fetcher(valid)), null);
  delete process.env.GOOGLE_CLIENT_ID;
});
