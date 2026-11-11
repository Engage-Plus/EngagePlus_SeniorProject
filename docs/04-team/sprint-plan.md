# Sprint Plan (2-week sprints)

| Sprint | DM (AI) | AD (Auth/Trust) | PF (Discovery FE) | SM (Org posting) | JM (Social/Notify) |
|---|---|---|---|---|---|
| **S1** (wk 1–2) Foundation | TR1 setup, TR6 deploy skeleton, NFR5 | TR2 Docker, TR3 schema, TR5 CI, **auth path + dev login**, IT email | TR4 Jest/Playwright, NFR1 layout shell, seed script | Seed 30+ real events, org dashboard shell | D2/D7/D8 decisions, notification skeleton |
| **S2** (wk 3–4) Core loop | F3_01 ranking (deterministic first) | F21_02 Microsoft login, F21_01 analytics guard, F9_01 org gate | F1_01, F2_01, F2_03, F2_04, F4_01 | F10_01 event form, F8_01 analytics | F6_01, F6_02, F2_02 support |
| **S3** (wk 5–6) Posting + AI | F14_01 caption parser, F5_01 feedback | F9_02 manager invites, org email OTP | F12_01, F12_02, F13_01, F1_02 | F10_02 flyer upload, F10_03 review, F8_02 | F7_01 notifications |
| **S4** (wk 7–8) MVP + Should | F16_01–03 chat | NFR3 privacy audit, F11_01 velocity | F2_05 RSVP from chat, TR7 polish | F15_01–03 extension, NFR4 | F17_01, F17_02, F18_01 |
| **S5** (wk 9–10) Should/Could | F25_01 admin view (after D6) | F24_01 referrals | NFR1 test (TC-49) | F19_01, F19_02, F8_03, F22_01 | F20_01–03, F7_02, F23_01, F23_02 |
| **S6** (wk 11–12) Harden | Gemini fallbacks, demo script | Security review | User testing | Chrome Web Store follow-up | Email deliverability |

Gate: don't start S5 Could items until every Must test (R1–R6, R11) passes.
