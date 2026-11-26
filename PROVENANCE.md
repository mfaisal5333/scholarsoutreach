# Provenance and release blockers

## Maintainer statement

Muhammad Faisal identifies Scholars Outreach as his individual BSCS final-year project. During release preparation he stated that he cannot currently confirm ownership or licensing permission for the referenced third-party code and logo. This statement does not establish permission to relicense that material.

## Existing references (preserved)

Historical `CLAUDE.md` identifies:

- https://github.com/Mjawadasad/academic-outreach-system
- https://profmatch-nu.vercel.app
- Vercel project `muhammad-jawad-asads-projects/profmatch`
- A later PHP/IONOS deployment at https://scholarsoutreach.com

The referenced GitHub API returned 404 during this review on 2026-11-26. That cannot establish whether the repository is private, removed, or licensed. The bundled `academic-outreach-system-main.zip` contains the application and older backend files but no license file. Its archive comment records source revision `632f36c647935d75126d5598ddecdae3f9289b89`; it is not this repository's commit history.

## Distribution decision

Existing application code, styles, branding and `Logo.jpg`, including copies in the ZIP, are excluded from any new release artifact until ownership or written permission and applicable notices are verified. They remain in this preparation branch for review and preservation of attribution; their existing public presence is not permission to redistribute them. No release artifact or deployment is authorized by this preparation work. No MIT license is applied.

The newly written `api/` handlers, `lib/auth.js`, tests, CI and documentation do not extract code from the ZIP. They preserve the application's expected HTTP interfaces. They do not clear rights in the frontend or logo.

Before v1.0.0: obtain evidence of rights for every existing source/branding asset or replace it with independently authored, rights-cleared material; retain all required notices; establish license scope; then validate a clean checkout and authenticated end-to-end workflows. Keep historical attribution rather than presenting imported source as original authorship.
