import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Compass, Layers, LogOut, PlusCircle, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { actions } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";

const studentNav = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/swipe", label: "Swipe", icon: Layers },
  { to: "/orgs", label: "Orgs", icon: Users },
  { to: "/my-events", label: "My Events", icon: CalendarDays },
  { to: "/create", label: "Post", icon: PlusCircle },
] as const;

const managerNav = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/orgs", label: "Orgs", icon: Users },
  { to: "/create", label: "Post", icon: PlusCircle },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "org_manager" ? managerNav : studentNav;
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-2xl font-extrabold text-primary"
          >
            <span>
              engage<span className="text-accent">+</span>
            </span>
            <span className="rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Demo
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                activeProps={{ className: "bg-primary !text-primary-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role === "org_manager" ? "Org manager" : "Student"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Sign out"
                onClick={() => {
                  actions.signOut();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut />
              </Button>
            </div>
          ) : (
            <Button variant="bison" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid border-t bg-card md:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
      >
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
            activeProps={{ className: "!text-accent font-semibold" }}
          >
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Shown while the browser store loads, so every page has a loading state. */
export function PageLoading() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <p className="mb-4 text-muted-foreground">{message}</p>
      <Button variant="bison" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
    </div>
  );
}
