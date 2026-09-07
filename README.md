# ProfMatch

AI-powered professor outreach for grad school applicants.

## Stack
- Pure single-file HTML/CSS/JS (no build) - `index.html`
- Vercel serverless functions:
  - `api/claude.js` — Claude API proxy (keeps key server-side)
  - `api/store.js` — Upstash Redis store (cross-device data persistence)
- Gmail OAuth — primary email sending + inbox monitoring for replies
- EmailJS — fallback email sending (BYO keys)
- OpenAlex API (free, no key) for professor discovery
- Claude (default) or Gemini (BYOK) for AI features

## Deploy to Vercel

1. Push or upload to Vercel (drag this folder onto vercel.com/new, or `npx vercel`)
2. In Vercel project Settings -> Environment Variables, add:
   - **`CLAUDE_API_KEY`** — your Anthropic API key (`sk-ant-...`)
     Get a key at https://console.anthropic.com/settings/keys
   - **Environments:** Production, Preview, Development
3. In Vercel Dashboard -> Storage -> Create Upstash Redis Database:
   - Connect it to this project (prefix: `UPSTASH_REDIS_REST`)
   - This auto-sets `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`
4. Redeploy (Vercel may auto-redeploy when you change env vars; if not, click "Redeploy" in Deployments)

## How AI calls work

The browser POSTs prompts to `/api/claude`, which is a Vercel serverless function that holds your `CLAUDE_API_KEY` server-side. The key never reaches the browser, so anyone inspecting the deployed page can't steal it.

If a user opens **AI Settings** and pastes their own Claude or Gemini key, the app uses *their* key directly instead.

## How email sending works

- **Primary: Gmail OAuth** — user clicks "Connect Gmail" in Step 5, emails send from their own Gmail address. Also enables inbox monitoring for professor replies in Step 6.
- **Fallback: EmailJS** — third-party service, user configures their own keys in Email Settings. See `EMAILJS_SETUP.md` for details.

## How cross-device sync works

User data (profile, professors, email log, follow-up status) is synced to Upstash Redis via `/api/store`. Authenticated using Google ID token. Data persists for 90 days per key.

## Local dev

Open `index.html` in a browser. The `/api/claude` and `/api/store` endpoints won't work locally without `vercel dev`. For local testing, paste a Claude or Gemini key in AI Settings to use BYOK mode.

## Cost / quota

- OpenAlex: free, 100K calls/day
- EmailJS free tier: 200 emails/month, 50/day
- Claude Haiku 4.5: ~$0.0005 per typical request
- Gemini 1.5 Flash: free tier 1,500 requests/day per user
- Upstash Redis: free tier 10K commands/day
- Gmail API: 250 sends/day per user (Google's limit)
