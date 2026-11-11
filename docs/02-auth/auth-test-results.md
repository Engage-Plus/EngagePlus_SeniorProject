# Auth Test Results Log (F21, TC-15, TC-17)

Add a row every time someone tests sign-in. Keep this file updated for the RTM test results column.

| Date | Tester | Environment | Account type | What happened | Error code (if any) | Pass/Fail | Notes |
|---|---|---|---|---|---|---|---|
| 2026-11-11 | Claude | Unit (CI) | Fake Howard tenant claims | Accepted | — | ✅ Pass | `tenantGuard.test.ts` |
| 2026-11-11 | Claude | Unit (CI) | Fake non-Howard tenant | Rejected | WRONG_TENANT | ✅ Pass | TC-17 unit level |
| 2026-11-11 | Claude | Unit (CI) | Missing `tid` / `oid` | Rejected | MISSING_CLAIMS | ✅ Pass | |
| 2026-11-11 | Claude | Unit (CI) | Issuer from another tenant | Rejected | BAD_ISSUER | ✅ Pass | |
| | AD | Local | Howard student (first login) | | | | Step 4 consent test |
| | Teammate 2 | Local | Howard student (first login) | | | | |
| | Teammate 3 | Local | Personal Outlook account | | | | Should fail (TC-17) |
| | AD | Production | Howard student | | | | After deploy (TC-57) |
| | AD | Production | Non-manager → `/orgs/:id/analytics` | | | | Should return 403 (TC-15) |

## Decision outcome
- Howard allows user consent for basic sign-in: ☐ Yes ☐ No
- If No — IT email sent on: ____ · Approved on: ____
- Final path used: ☐ A ☐ B ☐ C
