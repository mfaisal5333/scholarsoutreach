# Security

No stable release is currently supported; this is release preparation with unresolved source rights. Do not use it to handle sensitive data without an independent review.

## Reporting

Use the repository's GitHub **Security → Report a vulnerability** facility if enabled. If unavailable, open an issue requesting a private reporting channel without disclosing exploit details, credentials or personal data. No response-time commitment is currently established.

## Deployment considerations

- Keep Anthropic and Redis credentials server-side. The Google Web OAuth client ID is public; configure your own authorized origins and matching server audience.
- Server endpoints verify Google ID tokens and reject other audiences. Gmail authorization is separate. Sign-in alone does not prevent cost abuse; use provider budgets and hosting rate limits/access restrictions.
- Browser settings include BYOK API keys; Gmail sessions and identity credentials are stored locally. Third-party scripts and anyone with browser-profile access can potentially read local storage. Avoid shared devices; disconnect Gmail and clear site data after testing.
- CV/profile text may be transmitted to the selected AI provider. Gmail read permission enables reply checks. Use synthetic data for testing and review provider retention policies before deployment.
- Redis records expire 90 days after their most recent write per key. No account-wide deletion workflow is implemented.
- A pattern-based review of all three existing commits and the ZIP found no API-key-like secrets or private keys. It found public OAuth configuration, contact examples, project identifiers and author metadata. This is not proof that all secrets or personal data are absent. Historical content has not been rewritten; rotate any credential later found exposed rather than relying on deletion alone.

Production OAuth verification, abuse controls, browser security and live integration tests remain operator responsibilities. Do not send real outreach as part of automated tests.
