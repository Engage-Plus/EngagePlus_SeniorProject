# Draft email to Howard IT (Enterprise Applications / Identity team)

Send only if the Step 4 consent test shows "Need admin approval", or send early to ask for Path A.

**Subject:** Admin consent request: Microsoft sign-in for a CS senior project (Engage+)

Hello,

We are a five-person Computer Science senior project team building Engage+, a mobile-friendly website that helps Howard students discover campus events and organizations. Students sign in with their Howard Microsoft accounts.

The app requests only basic sign-in: `openid`, `profile`, `email` and `User.Read`. It does not read mail, files, Teams or calendars. Our server also rejects any account that isn't in Howard's tenant.

**Fastest option — one-click admin consent.** An administrator can approve the app by opening this link and signing in:

```
https://login.microsoftonline.com/<HOWARD_TENANT_ID>/v2.0/adminconsent?client_id=<MS_CLIENT_ID>&scope=https://graph.microsoft.com/User.Read&redirect_uri=<URL-ENCODED MS_REDIRECT_URI>&state=engageplus
```

**Alternative:** register Engage+ as a single-tenant app in Howard's tenant and share the client ID and a client secret, with these redirect URIs:
- `http://localhost:4000/auth/microsoft/callback`
- `https://<our-app>.vercel.app/api/auth/microsoft/callback`

We'd also appreciate confirmation of:
- The email domains students and staff use, so we can tell them apart.
- Any policy on student projects using Howard sign-in or the Howard name.

Course: <course number> · Faculty advisor: <name, email>
Team: <names>

Thank you,
<name>

---
_Tip: CC your faculty advisor — IT requests move faster with faculty sponsorship._
