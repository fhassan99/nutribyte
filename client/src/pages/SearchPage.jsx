import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput]     = useState('');
  const [query, setQuery]     = useState('');
  const [foods, setFoods]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // Fetch on query change
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');
    fetch(`/api/foods?search=${encodeURIComponent(query)}&page=1&limit=20`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setFoods(data))
      .catch(() => {
        setError('Failed to load results');
        setFoods([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <p className="text-secondary" style={{ marginTop: '2rem' }}>
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
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error   && <p className="error">{error}</p>}
      {!loading && !error && query && foods.length === 0 && (
        <p>No results for “{query}”</p>
      )}

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
    </div>
  );
}













