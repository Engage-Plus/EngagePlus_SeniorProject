// Run: npm run test:guard   (TC-17 unit level)
import assert from "node:assert/strict";
import { checkHowardTenant } from "./tenantGuard.js";

const HOWARD = "11111111-2222-3333-4444-555555555555";
const OTHER = "99999999-8888-7777-6666-555555555555";

const ok = checkHowardTenant(
  { tid: HOWARD, oid: "abc", preferred_username: "Student@Howard.edu", name: "Test Student",
    iss: `https://login.microsoftonline.com/${HOWARD}/v2.0` },
  HOWARD,
);
assert.equal(ok.ok, true);
if (ok.ok) assert.equal(ok.email, "student@howard.edu");

assert.deepEqual(checkHowardTenant({ tid: OTHER, oid: "abc", preferred_username: "x@gmail.com" }, HOWARD),
  { ok: false, reason: "WRONG_TENANT" });
assert.deepEqual(checkHowardTenant({ oid: "abc" }, HOWARD), { ok: false, reason: "MISSING_CLAIMS" });
assert.deepEqual(
  checkHowardTenant({ tid: HOWARD, oid: "abc", preferred_username: "a@howard.edu",
    iss: `https://login.microsoftonline.com/${OTHER}/v2.0` }, HOWARD),
  { ok: false, reason: "BAD_ISSUER" });

console.log("TC-17 tenant guard: 4/4 checks passed");
