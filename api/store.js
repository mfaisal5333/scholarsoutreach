import { Redis } from '@upstash/redis';
import { authenticate, parseBody } from '../lib/auth.js';
export const keys = ['state', 'europass', 'emailLog', 'professors', 'profStatus', 'sentEmails'];
export function createHandler({ auth = authenticate, client } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const user = await auth(req);
      if (!user) return res.status(401).json({ error: 'Sign in with Google' });
      let body;
      try { body = parseBody(req.body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
      if (!['save', 'load', 'load-all'].includes(body.action) || (body.action !== 'load-all' && !keys.includes(body.key))) return res.status(400).json({ error: 'Invalid storage operation' });
      if (body.action === 'save' && (body.value === undefined || JSON.stringify(body.value).length > 500000)) return res.status(400).json({ error: 'Missing or oversized value' });
      const redis = client || new Redis({ url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL, token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN });
      const prefix = 'pm:' + user + ':';
      if (body.action === 'save') {
        await redis.set(prefix + body.key, body.value, { ex: 90 * 24 * 60 * 60 });
        return res.status(200).json({ ok: true });
      }
      if (body.action === 'load') return res.status(200).json({ data: (await redis.get(prefix + body.key)) ?? null });
      const values = await Promise.all(keys.map(key => redis.get(prefix + key)));
      return res.status(200).json({ data: Object.fromEntries(keys.map((key, i) => [key, values[i] ?? null])) });
    } catch { return res.status(503).json({ error: 'Storage service unavailable' }); }
  };
}
export default createHandler();
