import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">That page doesn&apos;t exist.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-brand-600 hover:underline">
        Back to home
      </Link>
    </section>
  );
}
