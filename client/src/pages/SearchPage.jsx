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
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/foods?search=&page=1&limit=1');
        if (!response.ok) return;
        const data = await response.json();
        if (data.foods.length) setFeatured(data.foods[0]);
      } catch (err) {
        console.error('Featured food fetch error:', err);
      }
    };

    fetchFeatured();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (!input.trim()) {
      setFoods([]);
      setError('');
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setError('');

      fetch(`/api/foods?search=${encodeURIComponent(input)}&page=1&limit=20`)
        .then(res => res.ok ? res.json() : Promise.reject('Search failed'))
        .then(data => setFoods(data.foods))
        .catch(err => {
          console.error('Search error:', err);
          setError(err);
          setFoods([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Home
      </button>

      <h1>Food Search</h1>
      <p className="search-hint">Start typing to search foods...</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search food or brand..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </div>

      {featured && (
        <div className="featured-food">
          <h2>Food of the Day</h2>
          <div
            className="food-card"
            onClick={() => navigate(`/foods/${featured.fdcId}`)}
          >
            <h3>{featured.description}</h3>
            <p>{featured.brandOwner || 'Generic'}</p>
          </div>
        </div>
      )}

      {loading && <p className="loading">Searching...</p>}
      {error && <p className="error">{error}</p>}

      <div className="food-grid">
        {foods.map(food => (
          <div
            key={food.fdcId}
            className="food-card"
            onClick={() => navigate(`/foods/${food.fdcId}`)}
          >
            <h3>{food.description}</h3>
            <p>{food.brandOwner || 'Generic'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}






















