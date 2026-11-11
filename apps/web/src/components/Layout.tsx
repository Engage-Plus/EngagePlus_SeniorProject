// Mobile-first app shell (NFR1): single column, works at 375 px, widens on desktop.
import { Link, Outlet } from "react-router";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold tracking-tight text-brand-600">
            Engage+
          </Link>
          <nav aria-label="Main">
            <Link
              to="/chat"
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
            >
              Ask
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      {/* Risk P7: no implied official status until approved. */}
      <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500">
        Engage+ is a student project and is not affiliated with Anthology or Howard University.
      </footer>
    </div>
  );
}
