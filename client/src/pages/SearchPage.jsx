// client/src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [input, setInput]         = useState('');
  const [query, setQuery]         = useState('');
  const [foods, setFoods]         = useState([]);
  const [count, setCount]         = useState(0);
  const [page, setPage]           = useState(1);
  const [limit]                   = useState(20);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [featuredFood, setFeaturedFood] = useState(null);
  const navigate                  = useNavigate();

  // 1) Food of the Day on mount:
  useEffect(() => {
    const popularTerms = ['Apple', 'Banana', 'Bread', 'Milk', 'Rice', 'Chicken', 'Tomato', 'Yogurt'];
    const pick = popularTerms[Math.floor(Math.random() * popularTerms.length)];
    fetch(`http://localhost:4000/api/foods?search=${encodeURIComponent(pick)}&page=1&limit=5`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => {
        if (json.foods.length) {
          setFeaturedFood(
            json.foods[Math.floor(Math.random() * json.foods.length)]
          );
        }
      })
      .catch(() => {
        // silently fail featured
      });
  }, []);

  // 2) Whenever the user submits a query (or page changes):
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`http://localhost:4000/api/foods?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => {
        setFoods(json.foods);
        setCount(json.count);
        setError('');
      })
      .catch(() => {
        setError('Failed to load results');
        setFoods([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [query, page, limit]);

  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        Home
      </button>

      {/* Food of the Day */}
      {featuredFood && (
        <div className="compare-container" style={{ marginTop: '2rem' }}>
          <h2>🍽 Food of the Day</h2>
          <div
            className="card"
            style={{ cursor: 'pointer', background: 'var(--surface)' }}
            onClick={() => navigate(`/foods/${featuredFood.fdcId}`)}
          >
            <h3>{featuredFood.description}</h3>
            <p>{featuredFood.brandOwner || 'Unknown Brand'}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
        Type any food or brand name (e.g. “rice”, “kellogg”) into the box below, then hit Search.
      </p>

      {/* Search bar */}
      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          onClick={() => {
            setQuery(input);
            setPage(1);
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error   && <p className="error">{error}</p>}

      {/* Results grid */}
      <div className="grid">
        {foods.map(f => (
          <div
            key={f.fdcId}
            className="card"
            onClick={() => navigate(`/foods/${f.fdcId}`)}
          >
            <h3>{f.description}</h3>
            <p>{f.brandOwner}</p>
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









