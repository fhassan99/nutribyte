import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [foods, setFoods] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foodOfDay, setFoodOfDay] = useState(null);
  const navigate = useNavigate();

  // Fetch Food of the Day
  useEffect(() => {
    fetch('/api/foods?search=&page=1&limit=50')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const items = data?.foods || [];
        if (items.length > 0) {
          const randomFood = items[Math.floor(Math.random() * items.length)];
          setFoodOfDay(randomFood);
        }
      })
      .catch(err => console.error('Food of the Day fetch failed:', err));
  }, []);

  // Fetch search results
  useEffect(() => {
    const query = input.trim();
    if (!query) {
      setFoods([]);
      setCount(0);
      return;
    }

    setLoading(true);
    setError('');

    fetch(`/api/foods?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        setFoods(data.foods || []);
        setCount(data.count || 0);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to load results');
      })
      .finally(() => setLoading(false));
  }, [input, page]);

  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      {/* Food of the Day */}
      {foodOfDay && (
        <section className="food-of-day" style={{ marginTop: '2rem' }}>
          <h2>🍽️ Food of the Day</h2>
          <div
            className="card"
            onClick={() => navigate(`/foods/${foodOfDay.fdcId}`)}
          >
            <h3>{foodOfDay.description}</h3>
            <p>{foodOfDay.brandOwner || 'Unknown Brand'}</p>
          </div>
        </section>
      )}

      {/* Search input */}
      <div className="search-bar" style={{ marginTop: '2rem' }}>
        <input
          placeholder="Start typing to search…"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Feedback */}
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && input.trim() && foods.length === 0 && (
        <p>No results for “{input.trim()}”</p>
      )}

      {/* Food cards */}
      <div className="grid" style={{ marginTop: '1rem' }}>
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
        <div className="pagination" style={{ marginTop: '1rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

















