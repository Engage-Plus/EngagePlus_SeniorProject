import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Compass, PlusCircle, Users, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/orgs", label: "Orgs", icon: Users },
  { to: "/my-events", label: "My Events", icon: CalendarDays },
  { to: "/create", label: "Create", icon: PlusCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-display text-2xl font-extrabold text-primary">
            engage<span className="text-accent">+</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button variant="bison" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card md:hidden">
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
