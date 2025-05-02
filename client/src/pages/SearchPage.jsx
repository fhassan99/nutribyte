import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [foods, setFoods] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // live‐fetch as user types
  useEffect(() => {
    const q = input.trim();
    if (!q) {
      setFoods([]);
      return;
    }

    fetch(`/api/foods?search=${encodeURIComponent(q)}&page=1&limit=20`)
      .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(data => {
        setFoods(data.foods);   // <-- pull out `.foods`
        setError('');
      })
      .catch(() => {
        setError('Failed to load results');
        setFoods([]);
      });
  }, [input]);

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
        Start typing to see food suggestions…
      </p>

      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

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





















