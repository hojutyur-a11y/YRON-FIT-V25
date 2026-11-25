# Security policy — VYRON FIT V25

## Reporting

Do not publish credentials, personal data, or exploit details in a public issue. For a private repository, report suspected issues privately to the repository owner.

## Before publishing

- Scan current files and repository history for API keys, tokens, passwords, private URLs, and personal data.
- Do not commit `.env` files, browser profiles, exported user databases, or personal backups.
- Keep the repository private until code, assets, and publication rights have been reviewed.
- Review third-party scripts, fonts, image sources, and external network requests.
- Test backup/restore with disposable data before using real user data.

## Application data

The application includes browser-side persistence. Browser-local storage is not equivalent to encrypted server-side storage or authenticated cloud storage. Do not store highly sensitive information in it.

## Safe development

- Work on a feature branch and keep an untouched baseline.
- Review every diff before merging.
- Do not run untrusted shell commands or install unreviewed plugins/extensions.
- Run static checks and browser regression tests after changes.

This document is a security checklist, not a security certification. No penetration test or complete security audit is claimed.
