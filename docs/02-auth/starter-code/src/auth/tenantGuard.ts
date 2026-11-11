// Howard-only check (NFR2, TC-17). Pure function so it is easy to unit test.

export interface IdClaims {
  tid?: string;
  oid?: string;
  iss?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
}

export type GuardResult =
  | { ok: true; oid: string; email: string; name: string }
  | { ok: false; reason: "WRONG_TENANT" | "MISSING_CLAIMS" | "BAD_ISSUER" };

export function checkHowardTenant(claims: IdClaims, howardTenantId: string): GuardResult {
  const tid = claims.tid?.toLowerCase();
  const expected = howardTenantId.toLowerCase();
  if (!tid || !claims.oid) return { ok: false, reason: "MISSING_CLAIMS" };
  if (tid !== expected) return { ok: false, reason: "WRONG_TENANT" };
  if (claims.iss && !claims.iss.toLowerCase().includes(expected)) {
    return { ok: false, reason: "BAD_ISSUER" };
  }
  const email = (claims.email ?? claims.preferred_username ?? "").toLowerCase();
  if (!email) return { ok: false, reason: "MISSING_CLAIMS" };
  return { ok: true, oid: claims.oid, email, name: claims.name ?? email };
}
