// client/src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput]     = useState('');
  const [query, setQuery]     = useState('');
  const [foods, setFoods]     = useState([]);
  const [count, setCount]     = useState(0);
  const [page, setPage]       = useState(1);
  const [limit]               = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // whenever the user hits “Search” (i.e. query/page changes), go fetch
  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError('');
    fetch(`/api/foods?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      .then(res => res.json())           // always parse JSON, regardless of status
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setFoods(arr);
        setCount(arr.length);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load results');
        setFoods([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [query, page, limit]);

  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
        Type any food or brand name into the box below, then hit Search.
      </p>

      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (!input.trim()) return;
            setQuery(input.trim());
            setPage(1);
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {/* if we’re done loading, no error, we did a query, but got zero results */}
      {!loading && !error && query && foods.length === 0 && (
        <p>No results for “{query}”</p>
      )}

      {/* Results grid */}
      <div className="grid">
        {foods.map(f => (
          <div
            key={f.fdcId}
            className="card"
            onClick={() => navigate(`/foods/${f.fdcId}`)}
          >
            <h3>{f.description}</h3>
            <p>{f.brandOwner || 'Unknown Brand'}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {count > limit && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}











