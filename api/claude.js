import { authenticate, parseBody } from '../lib/auth.js';
export const models = new Set(['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6']);
export function createHandler({ auth = authenticate, fetcher = fetch } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      if (!await auth(req)) return res.status(401).json({ error: 'Sign in with Google' });
      let body;
      try { body = parseBody(req.body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
      if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 50000) return res.status(400).json({ error: 'Prompt must contain 1–50000 characters' });
      if (!process.env.CLAUDE_API_KEY) return res.status(503).json({ error: 'AI service not configured' });
      const result = await fetcher('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: AbortSignal.timeout(30000),
        headers: { 'x-api-key': process.env.CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: models.has(body.model) ? body.model : 'claude-haiku-4-5-20251001', max_tokens: 1024, temperature: body.jsonMode ? 0.3 : 0.4, messages: [{ role: 'user', content: body.prompt }] })
      });
      if (!result.ok) return res.status(502).json({ error: 'AI provider request failed' });
      const data = await result.json();
      const text = data.content?.filter(item => item.type === 'text').map(item => item.text).join('');
      if (!text) return res.status(502).json({ error: 'AI provider returned no text' });
      return res.status(200).json({ text });
    } catch { return res.status(503).json({ error: 'AI service unavailable' }); }
  };
}
export default createHandler();
