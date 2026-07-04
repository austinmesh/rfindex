# Security Policy

## Reporting a vulnerability

Please report security issues privately through
[GitHub private vulnerability reporting](https://github.com/austinmesh/rfindex/security/advisories/new).
Do not open a public issue for anything security-sensitive.

Include what you found, where (URL, file, or data path), and steps to
reproduce. You should hear back within a week.

## Scope

RF Index is a statically generated site on Cloudflare Workers. Reports we care
most about:

- Cross-site scripting or content injection through contributed data (device
  and antenna JSON, commentary HTML)
- Anything that could tamper with purchase or referral URLs
- Issues in the CI or deploy pipeline (GitHub Actions, Cloudflare Workers
  Builds)
- Exposure of secrets or tokens

There is no bug bounty; this is a zero-budget community project. Credit is
gladly given in the fix commit unless you prefer otherwise.
