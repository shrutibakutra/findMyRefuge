import { useState } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { geocodeArea, fetchRefuges } from './services/api';
import RefugeCard from './components/RefugeCard';
import type { Refuge } from './types';
import './App.css';
import { useEffect } from 'react';

const POPULAR = ['Jura', 'Chamonix', 'Vosges', 'Écrins', 'Vanoise', 'Pyrénées'];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20L12 4L21 20H3Z" />
      <path d="M9 20V14.5C9 13.1 10.3 12 12 12C13.7 12 15 13.1 15 14.5V20" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Loading">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Search results page ──────────────────────────────────
// Receives q as a prop; mounted fresh (via key) whenever q changes,
// so initial state is always "loading" — no synchronous setState in effects.
type SearchState =
  | { status: 'loading' }
  | { status: 'success'; refuges: Refuge[]; areaName: string }
  | { status: 'error'; message: string };

function SearchPage({ q }: { q: string }) {
  const [state, setState] = useState<SearchState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    geocodeArea(q)
      .then(async (area) => {
        const refuges = await fetchRefuges(area);
        return { area, refuges };
      })
      .then(({ area, refuges }) => {
        if (!cancelled) setState({ status: 'success', refuges, areaName: area.name });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ status: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- q is stable per mount (key resets on change)

  if (state.status === 'loading') {
    return (
      <div className="state-center">
        <SpinnerIcon />
        <p className="state-text">Searching refuges in {q}…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="state-center">
        <p className="state-error">{state.message}</p>
      </div>
    );
  }

  const { refuges, areaName } = state;

  return (
    <>
      <div className="results-header">
        <p className="results-count">
          {refuges.length === 0
            ? `No refuges found in ${areaName || q}`
            : `${refuges.length} refuge${refuges.length !== 1 ? 's' : ''} in ${areaName}`}
        </p>
      </div>

      {refuges.length === 0 ? (
        <div className="state-center">
          <p className="state-text">Try a broader area like a department or mountain range.</p>
        </div>
      ) : (
        <div className="grid">
          {refuges.map((r) => (
            <RefugeCard key={r.id} refuge={r} />
          ))}
        </div>
      )}
    </>
  );
}

// ── Home / hero page ─────────────────────────────────────
function HomePage({ onSearch }: { onSearch: (term: string) => void }) {
  return (
    <div className="hero">
      <h1 className="hero-title">Find mountain refuges<br />across France &amp; the Alps</h1>
      <p className="hero-subtitle">Search any area, massif or region to discover nearby refuges, cabins and bivouacs.</p>
      <div className="popular-tags">
        {POPULAR.map((place) => (
          <button key={place} className="tag" onClick={() => onSearch(place)} type="button">
            {place}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Root layout (header always visible) ─────────────────
export default function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQ = searchParams.get('q') ?? '';

  // Sync input with URL on back/forward navigation using the
  // "adjust state during render" pattern (React docs recommendation).
  const [inputValue, setInputValue] = useState(currentQ);
  const [prevQ, setPrevQ] = useState(currentQ);
  if (prevQ !== currentQ) {
    setPrevQ(currentQ);
    setInputValue(currentQ);
  }

  const search = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    search(inputValue);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo">
            <TentIcon />
            <span>FindMyRefuge</span>
          </a>

          <form className="search-form" onSubmit={handleSubmit} role="search">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search area, massif or region…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                aria-label="Search area"
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <SearchIcon />
              </button>
            </div>
          </form>

          <div className="header-spacer" />
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage onSearch={search} />} />
          {/* key={currentQ} remounts SearchPage on each new query, resetting state cleanly */}
          <Route path="/search" element={<SearchPage key={currentQ} q={currentQ} />} />
        </Routes>
      </main>
    </div>
  );
}
