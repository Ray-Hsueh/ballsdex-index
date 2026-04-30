import { useState, useEffect, useMemo } from 'react';
import type { Cog } from './types';
import { PackageCard } from './components/PackageCard';
import { SubmitPage } from './components/SubmitPage';

type Page = 'index' | 'submit';

// ── Icon ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: 'approved' | 'unapproved';
}) {
  const badge =
    variant === 'approved'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-400';

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-base font-semibold text-zinc-100">{label}</h2>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}
      >
        {count} package{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <p className="py-6 text-sm text-zinc-500">
      {query.trim() ? `No packages match "${query}".` : 'No packages yet.'}
    </p>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-28">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
      Failed to load package data: {message}
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [cogs, setCogs] = useState<Cog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<Page>('index');

  useEffect(() => {
    fetch('/data/resolved.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Cog[]) => {
        setCogs(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cogs;
    return cogs.filter(
      cog =>
        (cog.name ?? cog.id).toLowerCase().includes(q) ||
        (cog.description ?? '').toLowerCase().includes(q) ||
        cog.id.toLowerCase().includes(q),
    );
  }, [cogs, query]);

  const approved = filtered.filter(c => c.status === 'approved');
  const unapproved = filtered.filter(c => c.status === 'unapproved');
  const hasUnapproved = cogs.some(c => c.status === 'unapproved');

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-zinc-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111111]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('index')}
              className="text-base font-bold tracking-tight text-zinc-100 hover:text-white"
            >
              Ballsdex
            </button>
            <span className="text-zinc-600">/</span>
            <span className="text-sm text-zinc-400">Package Index</span>
          </div>

          <nav className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setPage('index')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                page === 'index'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setPage('submit')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                page === 'submit'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Submit
            </button>
          </nav>

          {page === 'index' && (
            <div className="ml-auto w-full max-w-xs">
              <label className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-zinc-500">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  placeholder="Search packages…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-[#1c1c1c] py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </label>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      {page === 'submit' ? (
        <SubmitPage />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}

          {!loading && !error && (
            <div className="flex flex-col gap-12">
              {/* Approved */}
              <section>
                <SectionHeader
                  label="Approved Packages"
                  count={approved.length}
                  variant="approved"
                />
                {approved.length > 0 ? (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {approved.map(c => (
                      <PackageCard key={c.id} cog={c} />
                    ))}
                  </div>
                ) : (
                  <EmptyState query={query} />
                )}
              </section>

              {/* Unapproved */}
              <section>
                <SectionHeader
                  label="Unapproved Packages"
                  count={unapproved.length}
                  variant="unapproved"
                />
                {hasUnapproved && (
                  <p className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
                    ⚠ These packages have not been reviewed. Install at your own risk.
                  </p>
                )}
                {unapproved.length > 0 ? (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {unapproved.map(c => (
                      <PackageCard key={c.id} cog={c} />
                    ))}
                  </div>
                ) : (
                  <EmptyState query={query} />
                )}
              </section>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
