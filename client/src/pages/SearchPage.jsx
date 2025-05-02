import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featured, setFeatured] = useState(null);
  const navigate = useNavigate();

  // Food of the Day
  useEffect(() => {
    fetch(`/api/foods?search=&page=1&limit=1`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.foods.length) setFeatured(data.foods[0]);
      })
      .catch(() => {});
  }, []);

  // Live typeahead search on every keystroke
  useEffect(() => {
    if (!input) {
      setFoods([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    fetch(`/api/foods?search=${encodeURIComponent(input)}&page=1&limit=20`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        setFoods(data.foods);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load results');
        setFoods([]);
      })
      .finally(() => setLoading(false));
  }, [input]);

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <h1>Food Search</h1>

      {/* Food of the Day - Moved above search */}
      {featured && (
        <div className="featured-section">
          <h2>Food of the Day</h2>
          <div
            className="food-card featured-card"
            onClick={() => navigate(`/foods/${featured.fdcId}`)}
          >
            <h3>{featured.description}</h3>
            <p>{featured.brandOwner || 'Unknown Brand'}</p>
          </div>
        </div>
      )}

      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
        Start typing to search foods…
      </p>

      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
        />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {foods.map(f => (
          <div
            key={f.fdcId}
            className="food-card"
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






















