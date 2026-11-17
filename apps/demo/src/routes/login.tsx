import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOWARD_EMAIL } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Engage+" },
      { name: "description", content: "Sign in to Engage+ with your Howard email." },
      { property: "og:title", content: "Sign in — Engage+" },
      { property: "og:description", content: "Sign in to Engage+ with your Howard email." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!HOWARD_EMAIL.test(email)) return setMsg("Use your Howard email (@bison.howard.edu or @howard.edu).");
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setMsg(error ? error.message : "Check your Howard inbox to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else navigate({ to: "/" });
    }
    setBusy(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-extrabold">{mode === "in" ? "Welcome back, Bison" : "Join Engage+"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Howard students only — use your university email.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "up" && <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />}
          <Input type="email" placeholder="you@bison.howard.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {msg && <p className="text-sm text-accent">{msg}</p>}
          <Button type="submit" variant="bison" className="w-full" size="lg" disabled={busy}>
            {mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button className="mt-4 text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </AppShell>
  );
}
