import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function TrackPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const token = user?.token;
  const [date, setDate]             = useState(new Date().toISOString().slice(0,10));
  const [entries, setEntries]       = useState([]);
  const [search, setSearch]         = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Load entries
  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [date, token]);

  useEffect(() => {
    if (token) loadEntries();
  }, [token, loadEntries]);

  // Totals
  const totals = entries.reduce((acc, e) => {
    acc.Calories += e.calories || 0;
    acc.Protein  += e.protein  || 0;
    acc.Carbs    += e.carbs    || 0;
    acc.Fat      += e.fat      || 0;
    acc.Sugars   += e.sugars   || 0;
    return acc;
  }, { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Sugars: 0 });

  const chartData = Object.entries(totals).map(
    ([name, value]) => ({ name, value: Number(value.toFixed(2)) })
  );

  // Suggestions
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=10`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [search]);

  // Add entry from suggestion
  const addEntry = async (food) => {
    try {
      const full = await fetch(`/api/foods/${food.fdcId}`).then(r => r.json());
      const getAmt = name =>
        full.nutrients.find(n => n.nutrientName === name)?.amount || 0;
      const entry = {
        fdcId: full.fdcId,
        description: full.description,
        date,
        calories: getAmt('Energy'),
        protein:  getAmt('Protein'),
        carbs:    getAmt('Carbohydrate, by difference'),
        fat:      getAmt('Total lipid (fat)'),
        sugars:   getAmt('Sugars, total')
      };
      await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(entry)
      });
      setSearch('');
      setSuggestions([]);
      loadEntries();
    } catch {
      alert('Could not add entry');
    }
  };

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Track My Calories</h1>

      {/* Chart */}
      <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Entries Table */}
      <div className="detail-container">
        <h2>Entries on {date}</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Time</th><th>Description</th><th>Cal</th>
              <th>Prot</th><th>Carb</th><th>Fat</th><th>Sug</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan="7">No entries for this date</td></tr>
            ) : (
              entries.map(e => (
                <tr key={e._id}>
                  <td>{new Date(e.createdAt).toLocaleTimeString()}</td>
                  <td>{e.description}</td>
                  <td>{e.calories}</td>
                  <td>{e.protein}</td>
                  <td>{e.carbs}</td>
                  <td>{e.fat}</td>
                  <td>{e.sugars}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <p className="totals">
          Total:&nbsp;
          Calories {totals.Calories.toFixed(1)},&nbsp;
          Protein {totals.Protein.toFixed(1)},&nbsp;
          Carbs {totals.Carbs.toFixed(1)},&nbsp;
          Fat {totals.Fat.toFixed(1)},&nbsp;
          Sugars {totals.Sugars.toFixed(1)}
        </p>
      </div>

      {/* Track controls */}
      <div className="track-controls">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <div className="search-bar">
          <input
            placeholder="Search food..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="button">Find</button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="grid">
        {suggestions.map(f => (
          <div
            key={f.fdcId}
            className="card"
            onClick={() => addEntry(f)}
          >
            <h3>{f.description}</h3>
            <p>{f.brandOwner || 'Unknown Brand'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


