// Google validates signature and expiry; additionally bind credentials to this app.
export async function authenticate(req, fetcher = fetch) {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) throw new Error('Missing Google configuration');
  const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
  if (!match) return null;
  const result = await fetcher('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(match[1]), { signal: AbortSignal.timeout(10000) });
  if (!result.ok) return null;
  const info = await result.json();
  if (info.aud !== audience || !['accounts.google.com', 'https://accounts.google.com'].includes(info.iss) || !info.sub || Number(info.exp) <= Date.now() / 1000) return null;
  return info.sub;
}
export function parseBody(body) {
  const value = typeof body === 'string' ? JSON.parse(body) : body;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid body');
  return value;
}
