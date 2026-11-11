# Browser Extension Plan (F15, SM)

## Scope
- Manifest V3, Chrome first. Host permission: `https://www.instagram.com/*` only (TC-31).
- Runs only when the org member clicks **Share to Engage+** on a post they're viewing. No background crawling.
- Offered only after the org's first paste-box post (TC-30).

## Flow
1. Org member signs in to Engage+ in the extension popup (one-time token from the Org dashboard → stored in `chrome.storage.local`).
2. On an Instagram post, click the extension → content script reads caption, image URL, follower count (if visible).
3. POST to `/api/events/extension-submit` → server runs the caption parser (F14) → creates a **draft**.
4. Member reviews the draft in the dashboard and publishes (US-6.3).

## Resilience (NFR4)
- All selectors in one file `src/dom/instagram.ts`.
- Missing field → send `null`, not an error (TC-32).
- Nightly GitHub Action loads a known public test post and checks selectors (TC-50).
- Paste-box stays the permanent fallback.

## Store submission checklist
- [ ] Privacy policy page on the Engage+ site
- [ ] Plain-language "what this reads" screen (US-6.5)
- [ ] Single purpose described clearly
- [ ] Screenshots 1280×800
- [ ] Submit ≥ 2 weeks before final demo; keep an unpacked build as backup
