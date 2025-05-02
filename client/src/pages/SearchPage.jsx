import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input,    setInput]    = useState('');
  const [foods,    setFoods]    = useState([]);
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [featured, setFeatured] = useState(null);
  const navigate              = useNavigate();

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
      setCount(0);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    fetch(`/api/foods?search=${encodeURIComponent(input)}&page=1&limit=20`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        setFoods(data.foods);
        setCount(data.count);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load results');
        setFoods([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [input]);

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
        Start typing to search foods…
      </p>

      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {featured && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>Food of the Day</h3>
          <strong>{featured.description}</strong>
          <p>{featured.brandOwner || 'Unknown Brand'}</p>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {error   && <p className="error">{error}</p>}

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






















