# Scholars Outreach (ProfMatch)

An individual BSCS final-year project maintained by Muhammad Faisal, intended to help graduate applicants organize professor outreach.

**Release status: preparation only.** No v1.0.0 release or project-wide open-source license is currently authorized. Existing application source and `Logo.jpg` have unresolved provenance/licensing. Do not redistribute these as MIT-licensed material. See [PROVENANCE.md](PROVENANCE.md).

## Features present in the source

- Applicant profile, CV preview and PDF export using html2pdf.js.
- Professor discovery through OpenAlex, with filters and shortlisting.
- AI-assisted query generation, prompt-based relevance reranking, explanations and email drafts; template fallbacks exist. No dedicated sentence-embedding pipeline or measured accuracy is established.
- Human recipient approval and selection before sending through Gmail OAuth or configured EmailJS.
- Outreach logs, reply checks and follow-up tracking while the application is running.
- Browser local storage; optional Redis sync through the server API.

No user counts, adoption claims, accuracy benchmarks or student outcomes have been verified. This checkout is not the PHP/IONOS version described in historical context.

## Structure

`index.html` is the landing page; `landing.css` and `landing.js` support it. `dashboard.html` contains the application. `config.js` holds a **public** Google OAuth client ID. `api/claude.js` and `api/store.js` are Vercel handlers; `lib/auth.js` validates Google credentials. The historical ZIP is retained for provenance review, not used for deployment.

## Requirements and local setup

Use Node.js 22 or later and npm. After cloning this repository:

```sh
npm ci
npm test
npm run dev
```

The static preview is at http://localhost:3000; open `/dashboard.html` for the app. Static preview does not implement `/api/*`. Full server functionality needs Vercel's development runtime or a Vercel deployment. Do not publish until the provenance blocker is resolved.

### Google configuration

Create your own Google Cloud project, enable Gmail API, configure the OAuth consent screen and test users as appropriate, and create an OAuth **Web application** client. Add your exact local and deployment origins to its authorized JavaScript origins. Replace the placeholder in `config.js` with the public client ID. Set `GOOGLE_CLIENT_ID` on the server to the same value. Never put a client secret in browser files.

Google sign-in is required to enter the dashboard. Connecting Gmail additionally requests sending and read-only inbox permissions. Public availability may require Google verification; this repository does not establish that verification.

### Vercel setup (after rights clearance)

Import the repository as an Other/static project, with no frontend build command and the repository root as the output. Keep `api/` and `lib/` in the checkout. Configure server environment variables using `.env.example`:

- `GOOGLE_CLIENT_ID`: matches `config.js`.
- `CLAUDE_API_KEY`: server-side Anthropic API key.
- `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`: Redis REST URL/token. These exact names are read by this project; copy provider values explicitly.

Use `npx vercel dev` for local server testing, with local environment values configured securely. Do not commit credentials. Set provider spending limits and deployment-level abuse controls before exposing the AI endpoint; sign-in is not a usage quota.

Alternatively, AI Settings accepts a personal Claude or Gemini API key for browser calls. This exposes the supplied key to scripts on the page and stores settings locally. Use only trusted devices. Model availability, billing and external API quotas depend on each provider; no fixed free quota is promised here.

See [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for the optional email fallback. Verify recipient addresses manually; OpenAlex discovery does not guarantee email availability. Start with a test recipient and review drafts before sending.

## Data and security

Profiles, drafts, tokens and settings can be stored in browser local storage. AI prompts can include CV details; Gmail integration reads messages to check replies. Optional Redis data expires 90 days after its last save per key. Signing out is not a cloud-data deletion guarantee. Avoid real personal data during development. See [SECURITY.md](SECURITY.md).

## Validation and contributions

`npm test` runs mocked backend authorization, validation, storage isolation, expiry and provider-response tests, plus frontend script parsing. CI runs on Node 22 and 24. These tests do not verify real OAuth, email delivery, paid AI requests, PDF layout or production deployment.

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [PROVENANCE.md](PROVENANCE.md). Third-party library license information is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No project-wide MIT license has been added.
