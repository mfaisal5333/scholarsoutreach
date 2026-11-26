# Release preparation report — 2026-11-26

Status: blocked for v1.0.0 publication. No MIT license, release tag, deployment or release artifact created. Preparation changes are on `release-preparation`; the original default branch and history are preserved.

## Completed

- Reviewed all three existing commits and the embedded archive for API-key-like patterns/private keys and email addresses. No matching secrets found; review is pattern-based, not a comprehensive security certification.
- Replaced public Google client configuration and runtime email examples with placeholders; preserved historical attribution and documented its limitations.
- Added newly written Vercel AI/storage endpoints, audience-bound Google identity validation, request limits, storage isolation/expiry and sanitized errors. Updated the browser AI proxy call to send its identity credential.
- Corrected login/register rewrites, removed trailing NUL bytes from the dashboard, documented actual entry points and required environment values.
- Added contributor/security/provenance/dependency documentation, lockfile, seven automated tests and Node 22/24 GitHub Actions CI.
- Updated the preview server after npm audit identified a vulnerable transitive compression dependency.

## Local validation

On Node v24.19.0: clean `npm ci --ignore-scripts`, seven passing `npm test` cases, zero npm audit findings during installation, and `git diff --check` passed. Tests use synthetic data and mocked external services. Node 22 results depend on hosted CI. Real OAuth, email, AI services, PDF layout and deployment have not been validated.

## Required before release

Obtain rights evidence or independently replace all uncertain application/branding material; preserve required third-party notices and verify bundled dependency terms before redistribution. Configure maintainer-owned Google credentials and service environments; validate a clean deployment and human-approved test email workflow. Add spending/abuse controls. Confirm hosted CI passes. Only then choose the project license, version/tag and publish a rights-cleared artifact.

The ZIP and historical source remain review evidence, excluded from any new release artifact. Public deployment does not prove usage or student outcomes; no such claims are made.
