import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrackPage() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugars: 0
  });
  const navigate = useNavigate();

  // Fetch entries for selected date
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/entries?date=${date}`);
        const data = await response.json();
        setEntries(data);
        calculateTotals(data);
      } catch (err) {
        console.error('Error fetching entries:', err);
      }
    };
    fetchEntries();
  }, [date]);

  // Calculate totals
  const calculateTotals = (entries) => {
    const newTotals = entries.reduce((acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0),
      sugars: acc.sugars + (entry.sugars || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugars: 0 });
    setTotals(newTotals);
  };

  // Handle food search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/foods?search=${encodeURIComponent(query)}&page=1&limit=5`);
      const data = await response.json();
      setSuggestions(data.foods);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Add food entry
  const addEntry = async (food) => {
    try {
      const newEntry = {
        date,
        time: new Date().toTimeString().substring(0, 5),
        description: food.description,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        sugars: food.sugars || 0
      };

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      const data = await response.json();
      setEntries([...entries, data]);
      calculateTotals([...entries, data]);
      setSearch('');
      setSuggestions([]);
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  // Delete food entry
  const deleteEntry = async (id) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      const updatedEntries = entries.filter(entry => entry._id !== id);
      setEntries(updatedEntries);
      calculateTotals(updatedEntries);
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Back
      </button>

      <h1>Track My Calories</h1>
      <p>Logged in as sharmin_38@yahoo.com</p>

      {/* Nutrition summary chart would go here */}

      <div className="nutrition-summary">
        <div className="summary-item">
          <span className="value">{totals.calories.toFixed(0)}</span>
          <span className="label">Calories</span>
        </div>
        <div className="summary-item">
          <span className="value">{totals.protein.toFixed(0)}g</span>
          <span className="label">Protein</span>
        </div>
        <div className="summary-item">
          <span className="value">{totals.carbs.toFixed(0)}g</span>
          <span className="label">Carbs</span>
        </div>
        <div className="summary-item">
          <span className="value">{totals.fat.toFixed(0)}g</span>
          <span className="label">Fat</span>
        </div>
        <div className="summary-item">
          <span className="value">{totals.sugars.toFixed(0)}g</span>
          <span className="label">Sugars</span>
        </div>
      </div>

      <h2>Entries on {new Date(date).toLocaleDateString()}</h2>

      <table className="entries-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Description</th>
            <th>Cal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry._id}>
              <td>
                <input
                  type="time"
                  className="time-input"
                  value={entry.time}
                  onChange={(e) => updateEntryTime(entry._id, e.target.value)}
                />
              </td>
              <td>{entry.description}</td>
              <td>{entry.calories.toFixed(0)}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => deleteEntry(entry._id)}
                  title="Delete entry"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        Total: Calories {totals.calories.toFixed(2)},
        Protein {totals.protein.toFixed(2)}g,
        Carbs {totals.carbs.toFixed(2)}g,
        Fat {totals.fat.toFixed(2)}g,
        Sugars {totals.sugars.toFixed(2)}g
      </div>

      <div className="track-controls">
        <input
          type="date"
          className="date-picker"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(food => (
                <div
                  key={food.fdcId}
                  className="suggestion-card"
                  onClick={() => addEntry(food)}
                >
                  <strong>{food.description}</strong>
                  <small>{food.brandOwner || 'Generic'}</small>
                  <small>{food.calories} cal</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





























