# ProfMatch — Project Context

AI-powered professor outreach platform for grad school applicants. Single-file HTML/CSS/JS app deployed on Vercel with serverless Claude proxy and Upstash Redis for cross-device persistence.

## Links

| Resource | URL |
|----------|-----|
| **Live** | https://profmatch-nu.vercel.app |
| **GitHub** | https://github.com/Mjawadasad/academic-outreach-system (branch: `main`) |
| **Vercel project** | muhammad-jawad-asads-projects/profmatch |
| **Vercel project ID** | prj_qKgQFD95bG8OwwuUWjJQmFiM11MY |
| **Vercel org ID** | team_qBZT5QZKeuReBAnsPhjCuz9O |

## Stack

- **Frontend**: Pure HTML/CSS/JS (single file `index.html`, ~160KB)
- **Backend**: Vercel serverless functions (`api/claude.js` — Claude proxy, `api/store.js` — Upstash Redis persistence)
- **Storage**: Upstash Redis (cross-device data sync, 90-day TTL per key)
- **APIs**: OpenAlex (free, professor discovery), Gmail API (OAuth, send & read emails), EmailJS (fallback email)
- **AI providers**: Claude (default, via `/api/claude` proxy) or Gemini (BYOK only)
- **PDF**: html2pdf.js (CDN) for CV generation

## File Structure

```
E:\profmatch\deploy\          <- Vercel deployment root (git repo)
├── index.html                <- Entire app (HTML + CSS + JS)
├── config.js                 <- Gmail OAuth Client ID
├── vercel.json               <- Security headers, cleanUrls
├── api/
│   ├── claude.js             <- Serverless Claude proxy
│   └── store.js              <- Upstash Redis store (cross-device sync)
├── .gitignore                <- Excludes .vercel/
├── README.md                 <- Deployment guide
├── EMAILJS_SETUP.md          <- EmailJS configuration guide
└── .vercel/                  <- Vercel metadata (not committed)

E:\profmatch\                 <- Project root (NOT a git repo)
├── deploy/                   <- (see above)
├── credentials/              <- OAuth client secret (not committed)
├── archive/                  <- Old scripts & test files
├── prof-match.html           <- v1 (111KB, archive)
├── prof-match-v2.html        <- v2 (80KB, archive)
└── prof-match-v3.html        <- v3 (107KB, archive)
```

## 6-Step Workflow

| Step | Title | Renders via | Key element ID |
|------|-------|-------------|----------------|
| 1 | Profile & CV | form fields | `f-name`, `f-email`, etc. |
| 2 | Professor Discovery | `renderDiscovery()` | `prof-list-discovery` |
| 3 | Scoring & Explanation | `renderScoringExplanation()` | `scoring-explanation-list` |
| 4 | Human Approval | `renderApproval()` | `approval-list` |
| 5 | Personalized Outreach | `renderEmails()` | `email-list` |
| 6 | Follow-Up | `renderFollowUp()` | `timeline` |

Steps 3+4 were merged from original 7-step design (May 2026). Step 3 shows score bars with expandable `<details>` for AI explanations.

## State Management

All state lives in JS, persisted to `localStorage` per user, and synced to Upstash Redis for cross-device access:

```javascript
const state = {
  current: 1,              // Active step (1-6)
  completed: new Set(),    // Set of completed step numbers
  selected: new Set(),     // Professor IDs selected in Step 2
  approved: new Set(),     // Professor IDs approved in Step 4
  rejected: new Set(),     // Rejected professor IDs
  archived: new Set(),     // Archived professor IDs (unused in UI)
  sentAt: null             // Timestamp when emails were sent
}
```

### localStorage Keys

| Key pattern | Contents |
|-------------|----------|
| `pm:{user}:state` | Step progress, selections, approvals |
| `pm:{user}:europass` | Full CV profile data |
| `pm:{user}:emailLog` | Email send history (timestamps per professor ID) |
| `pm:{user}:professors` | Discovered professor list |
| `pm:{user}:profStatus` | Per-professor follow-up status (stage, timestamps) |
| `pm:{user}:sentEmails` | Sent email records (to, subject, body, sentAt) |
| `pm:ai` | AI settings (provider, apiKey, model) |
| `pm:emailjs` | EmailJS config (publicKey, serviceId, templateId) |
| `pm:gmail:token` | Gmail access token (persisted with expiry for session restore) |
| `pm:aicache:exp:{id}` | Cached AI explanation for professor |
| `pm:aicache:email:{id}` | Cached AI email draft |
| `pm:aicache:analysis:{id}` | Cached AI response analysis |

### Cross-Device Persistence (Upstash Redis)

- **Serverless function**: `api/store.js`
- **Auth**: Google ID token (Bearer header) → verified via Google tokeninfo endpoint → `sub` claim used as user ID
- **Key format**: `pm:{sub}:{key}` in Redis
- **ALLOWED_KEYS**: `state`, `europass`, `emailLog`, `professors`, `profStatus`, `sentEmails`
- **TTL**: 90 days per key
- **Actions**: `save` (single key), `load` (single key), `load-all` (all keys via pipeline)
- **Env vars required**: `UPSTASH_REDIS_REST_KV_REST_API_URL`, `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` (auto-configured via Vercel Storage integration)

## CV Profile Data

```javascript
let europass = {
  fullName, email, dob, nationality, phone, address,
  institution, degree, interests, bio,
  education: [{ degree, institution, startDate, endDate, subjects }],
  experience: [{ position, employer, startDate, endDate, description }],
  motherTongue, languages: [{ language, listening, reading, ... }],
  digitalLevel, digitalDetails, publications, honours,
  generated: false
}
```

## Professor Data Structure

```javascript
{
  id: number,         // Demo: 1-6, OpenAlex: >= 1000, Custom: Date.now()
  name: string,
  email: string,
  aff: string,        // Affiliation (or "Custom recipient" for custom)
  area: string,       // Research area label (ml, eng, bio, chemistry, etc.)
  interests: string,  // Comma-separated
  tags: string[],     // Conference signals, funding, lab size
  score: number       // Fit score 0-100
}
```

## AI Configuration

```javascript
const AI_CFG = { provider: "claude", apiKey: "", model: "claude-haiku-4-5-20251001" }
```

**Claude models** (via `/api/claude` proxy or BYOK): `claude-haiku-4-5-20251001` (default), `claude-sonnet-4-6`, `claude-opus-4-6`
**Gemini models** (BYOK only): `gemini-1.5-flash` (free), `gemini-1.5-pro`, `gemini-2.0-flash-exp`

### AI Call Flow

- **Default**: Browser POSTs `{ prompt, model, jsonMode }` to `/api/claude` → serverless function reads `CLAUDE_API_KEY` env var → calls Anthropic API → returns `{ text }`
- **BYOK**: User pastes own key in AI Settings → calls made directly from browser (Gemini or Claude)

### AI Use Cases

| Function | Purpose |
|----------|---------|
| `aiPickQueries(student)` | LLM picks 3-5 OpenAlex search queries from CV |
| `aiRerankProfessors(student, profs)` | Score 0-100 fit against student profile |
| `aiExplanationFor(prof)` | "Why this is a match" text (tone adapts to score) |
| `aiEmailDraftFor(prof)` | Personalized cold email draft (adapts to degree level) |
| `aiAnalyzeResponse(prof, body)` | Analyze professor's reply (Step 6) |

## Gmail OAuth

- **Client ID**: `1007672331481-cu605lec5am41i4rtgc9ded94e53bk5c.apps.googleusercontent.com` (in `config.js`)
- **GCP Project**: `profmatch-496418`
- **Scopes**: `gmail.send`, `userinfo.email`, `gmail.readonly`
- **Library**: Google Identity Services (`accounts.google.com/gsi/client`)
- **Token**: Stored in localStorage with expiry for session persistence across page refreshes
- **Send function**: `sendViaGmailAPI()` — builds RFC 2822 MIME, base64url encodes, POSTs to Gmail API
- **Inbox check**: `checkGmailReplies()` — searches inbox for replies from emailed professors, auto-detects responses for Step 6
- **Polling**: 60-second interval auto-checks inbox while Gmail is connected

## EmailJS (Fallback)

Config stored in `pm:emailjs` localStorage key. Template variables: `{{to_email}}`, `{{from_name}}`, `{{reply_to}}`, `{{subject}}`, `{{message}}`, `{{cv_filename}}`.

## OpenAlex Integration (Step 2)

- **Endpoint**: `https://api.openalex.org/authors?search=...&per-page=50&sort=cited_by_count:desc`
- **Email header**: `mailto=hello@ecomsol.ai`
- **Flow**: AI picks queries → parallel fetch → deduplicate → filter (>20 works, has affiliation, not generic topic clusters) → field-relevance filter → AI rerank → remove <40 score → top 15
- **Field-relevance filter**: Classifies professors by area (ml, eng, bio, chemistry, physics, neuro, econ, psych, medical, earth, math) and removes those not matching student's field
- **Rate limit**: 100K requests/day (free, polite pool)

## Email Sending

- **Primary method**: Gmail OAuth (send from student's own Gmail)
- **Fallback**: EmailJS (third-party service)
- **Rate limiting**: Replaced with user confirmation — warns if professor was previously emailed, user can proceed or cancel
- **Select emails**: Step 5 has select-all checkbox + individual selection per email card
- **Subject line**: Adapts to student's degree level ("Prospective Master's/PhD/graduate student...")

## Demo Accounts

Two hardcoded profiles for testing (sign in via "Continue with email"):

1. **Aisha Khan** (`aisha.khan@stanford.edu`) — Stanford CS, ML/NLP, 6 demo professors pre-selected
2. **Marcus Reyes** (`m.reyes@berkeley.edu`) — UC Berkeley Bioengineering, computational biology

## Key Navigation Functions

```
goToStep(n)      → Shows step n, calls render function
completeStep(n)  → Validates, marks complete, advances to n+1
showStep(n)      → DOM: activates data-step="n" section
renderSidebar()  → Updates sidebar checkmarks and active state
restart()        → Resets to Step 1, clears approvals
```

## Deployment

```bash
# Deploy to Vercel (from E:\profmatch\deploy\)
npx vercel --prod

# Push to GitHub
cd E:\profmatch\deploy
git add <files>
git commit -m "message"
git push origin main
```

**Required Vercel env vars**:
- `CLAUDE_API_KEY` — Anthropic API key for the serverless proxy
- `UPSTASH_REDIS_REST_KV_REST_API_URL` — Upstash Redis URL (auto-set via Vercel Storage)
- `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` — Upstash Redis token (auto-set via Vercel Storage)

## Security

- Claude API key server-side only (never in browser)
- Gmail tokens stored in localStorage with expiry (cleared on disconnect or 401)
- Vercel headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- EmailJS public key visible by design (public-facing config)
- Upstash Redis authenticated via Google ID token verification

## Recent Changes (May 2026)

- Merged Step 3 (Scoring) + Step 4 (Explanation) into single Step 3 with score bars + expandable `<details>`
- Reduced from 7 steps to 6, renumbered all subsequent steps
- Removed 0-approval guard — email step works with custom recipients only
- Added red "Remove" button on each email card in Step 5
- Empty-state in Step 5 shows "+ Add custom recipient" button
- Removed "Europass" branding from all UI text (CV format unchanged internally)
- Added Gmail inbox auto-check for professor replies (60s polling)
- Gmail session persistence across page refreshes
- Added select-all/individual email selection in Step 5
- Replaced rate-limit blocking with user confirmation dialog
- Added Upstash Redis for cross-device data persistence
- Added field-relevance filter to exclude off-topic professors
- Stricter AI scoring rules + score-aware explanations
- Email subject/body adapts to student's actual degree level
- Removed "Archived" feature from Step 6 follow-up monitor

## IONOS Variant — ScholarsOutreach (June 2026)

A separate IONOS-hosted deployment exists at `E:\profmatch\fyp-test\academic-outreach-system-main\` for a student FYP demo.

- **Live**: https://scholarsoutreach.com
- **Hosting**: IONOS Web Hosting Plus (Apache/PHP), uploaded via Webspace Explorer
- **Key differences**: PHP proxy (`api/claude.php`) instead of Vercel serverless, no Upstash Redis, 5-step workflow, 11 HTML files (legal pages, auth pages)
- **Fixes applied**: CV PDF attachment in Gmail, clean URLs (mod_rewrite), print CSS blank pages fix, `.htaccess` API key
- **Docs**: `TECHNICAL_DOCUMENTATION.md` (comprehensive tech docs for students)
- See `E:\profmatch\CLAUDE.md` for full details
