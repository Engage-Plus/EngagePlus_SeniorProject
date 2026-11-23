import type { ReactNode } from "react";
import { useDemo } from "./demo/store";
import { currentUser } from "./demo/logic";
import type { Person } from "./demo/types";

// Demo sign-in: one click as a fictional student or org manager. Production uses
// Microsoft sign-in limited to Howard's tenant (F21); this stands in for it on camera.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth(): { user: Person | null; loading: boolean } {
  const s = useDemo();
  return { user: s.ready ? currentUser(s) : null, loading: !s.ready };
}
