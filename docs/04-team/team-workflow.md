# Team Workflow

## Git
- `main` is always deployable. Feature branches: `F10_01-posting-form`.
- PR title starts with the backlog ID; PR description lists the TC it satisfies.
- 1 reviewer minimum; schema changes reviewed by AD; AI prompts by DM.
- Squash merge. No direct pushes to `main` (branch protection).

## Definition of Done
- [ ] Acceptance test (TC-xx) written and passing in CI
- [ ] TypeScript strict, no `any`, no file over 300 lines (TR8)
- [ ] Works at 375 px and desktop (NFR1)
- [ ] Loading and error states (TR7)
- [ ] Permission checks in the API, not only the UI
- [ ] RTM row updated (status + test result)

## Rituals
- Weekly planning (30 min): pick backlog items, check risk register.
- 2× async standups (group chat): done / next / blocked.
- Sprint review every 2 weeks with a live demo on the deployed site.

## Secrets
- Never commit `.env`. Shared secrets live in a password manager vault or the course-approved channel.
- Rotate the Microsoft client secret before it expires.
