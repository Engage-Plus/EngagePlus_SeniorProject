# API Spec (v0)

All routes under `/api`. Auth = session cookie. 401 if not signed in, 403 if not allowed.

## Auth (AD)
| Method | Path | Notes | Feature |
|---|---|---|---|
| GET | /auth/microsoft | Redirect to Microsoft | F21 |
| GET | /auth/microsoft/callback | Validate token, check `tid`, upsert user, set cookie | F21 |
| POST | /auth/dev-login | Only when `DEV_AUTH=true` | — |
| POST | /auth/logout | | F21 |
| GET | /me | Current user + managed orgs | F21 |

## Student (PF, DM, JM)
| Method | Path | Notes | Feature |
|---|---|---|---|
| POST | /users/quiz | interests, involvement, major, year | F1 |
| GET | /events/feed?category= | Ranked, filtered stack | F3, F12, F13 |
| GET | /events/trending | Fallback feed | F4 |
| POST | /events/:id/swipe | `{action: RIGHT|LEFT}` upsert | F2 |
| POST | /orgs/:id/swipe | Follow/skip | F2 |
| GET | /following | Followed orgs | F6 |
| POST | /orgs/:id/mute | `{muted: bool}` | F6 |
| POST | /users/schedule | Replace schedule blocks | F12 |
| GET | /feedback/pending | RSVP'd events that ended in the last 14 days, not yet rated (max 3) | F5 |
| POST | /feedback/:eventId | `{thumbsUp}` upsert; 403 if not RSVP'd, 409 if not ended | F5 |
| POST | /chat | `{message}` → events + reasons | F16 |
| GET | /friends · POST /friends/requests · POST /friends/:id/accept | | F17 |
| GET | /events/:id/friends-going | Accepted friends, excludes hidden | F17 |
| POST | /users/hide-rsvps | `{hidden}` | F18 |
| GET | /calendar · GET /events/export.ics | | F20 |
| GET | /referrals/me | Link + progress | F24 |

## Org (SM, AD)
| Method | Path | Notes | Feature |
|---|---|---|---|
| POST | /orgs | Student session required | F9 |
| POST | /orgs/:id/verify-email · /orgs/:id/verify-email/confirm | One-time code | F9 |
| POST | /orgs/:id/managers/invite | Founder only | F9 |
| POST | /events/parse-caption | `{caption}` → fields | F14 |
| POST | /uploads/flyer | Returns signed upload URL | F10 |
| POST | /events · PATCH /events/:id · DELETE /events/:id | Primary org managers only | F10, F19 |
| POST | /events/:id/cohosts | | F19 |
| POST | /recurrences | rrule → generates events | F22 |
| GET | /orgs/:id/analytics · /org/analytics/:eventId | Managers only (403 otherwise) | F8 |
| POST | /events/extension-submit | Token auth from extension | F15 |

## Admin (DM)
| GET | /admin/analytics | Aggregates only, no user rows | F25 |

## Jobs (cron, `x-jobs-secret` header)
| POST | /jobs/notify · /jobs/velocity · /jobs/recurrences · /jobs/digest · /jobs/semester-nudge · /jobs/health |
