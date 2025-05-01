import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../App.css';

export default function TrackPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const token = user?.token;

  const [date,  setDate]  = useState(() => new Date().toISOString().slice(0, 10));
  const [time,  setTime]  = useState(() => new Date().toISOString().slice(11, 16));
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [entries, setEntries] = useState([]);
  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, [date, token]);

  useEffect(() => {
    if (token) loadEntries();
  }, [token, loadEntries]);

  const totals = entries.reduce((acc, e) => {
    acc.Calories += e.calories || 0;
    acc.Protein  += e.protein  || 0;
    acc.Carbs    += e.carbs    || 0;
    acc.Fat      += e.fat      || 0;
    acc.Sugars   += e.sugars   || 0;
    return acc;
  }, { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Sugars: 0 });

  const chartData = Object.entries(totals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }));

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/foods?search=${encodeURIComponent(query)}&page=1&limit=10`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(json => setSuggestions(json.foods))
      .catch(() => setSuggestions([]));
  }, [query]);

  const addEntry = food => {
    fetch(`/api/foods/${food.fdcId}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(full => {
        const getAmt = name => full.nutrients.find(n => n.nutrientName === name)?.amount || 0;

        const entry = {
          date,
          time,
          description: full.description,
          calories: getAmt('Energy'),
          protein:  getAmt('Protein'),
          carbs:    getAmt('Carbohydrate, by difference'),
          fat:      getAmt('Total lipid (fat)'),
          sugars:   getAmt('Sugars, total')
        };

        return fetch('/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(entry)
        });
      })
      .then(r => {
        if (!r.ok) throw new Error();
        loadEntries();
        setInput('');
        setQuery('');
        setSuggestions([]);
      })
      .catch(() => alert('Failed to add entry. Please try again.'));
  };

  if (!user) return <p>Please log in to track calories.</p>;

  return (
    <div className="container" style={{ maxWidth: "100%", overflowX: "hidden" }}>
  <button className="home-btn-blue" onClick={() => navigate(-1)}>
    ← Back
  </button>

  <h1>Track My Calories</h1>
  <p style={{ color: 'var(--secondary)' }}>
    Logged in as <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</strong>
  </p>

  {/* Chart */}
  <div style={{ width: '100%', height: 300, marginBottom: '1rem' }}>
    <ResponsiveContainer>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="var(--text-secondary)" />
        <YAxis stroke="var(--text-secondary)" />
        <Tooltip />
        <Bar dataKey="value" fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Date + Time Pickers */}
  <div
    className="track-controls"
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    }}
  >
    <input
      type="date"
      className="date-picker"
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
    <input
      type="time"
      className="time-input"
      value={time}
      onChange={(e) => setTime(e.target.value)}
    />
  </div>

  {/* Entries Table */}
  <div className="detail-container entries-table" style={{ overflowX: 'auto' }}>
    <h2>Entries on {date}</h2>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Description</th>
          <th>Cal</th>
          <th>Prot</th>
          <th>Carb</th>
          <th>Fat</th>
          <th>Sug</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr>
            <td colSpan="7">No entries for this date</td>
          </tr>
        ) : (
          entries.map((e) => (
            <tr key={e._id}>
              <td>{e.time}</td>
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
      Total for day:&nbsp;
      Calories {totals.Calories.toFixed(2)},&nbsp;
      Protein {totals.Protein.toFixed(2)},&nbsp;
      Carbs {totals.Carbs.toFixed(2)},&nbsp;
      Fat {totals.Fat.toFixed(2)},&nbsp;
      Sugars {totals.Sugars.toFixed(2)}
    </p>
  </div>

  {/* Search Input BELOW table */}
  <div className="search-bar" style={{ display: 'flex', marginTop: '1.5rem' }}>
    <input
      style={{ flex: 1 }}
      placeholder="Search food…"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
    <button
      onClick={() => {
        if (input.trim()) setQuery(input.trim());
      }}
    >
      Find
    </button>
  </div>

  {/* Suggestions Grid */}
  <div className="grid">
    {suggestions.map((f) => (
      <div key={f.fdcId} className="card" onClick={() => addEntry(f)}>
        <h3>{f.description}</h3>
        <p>{f.brandOwner || 'Unknown Brand'}</p>
      </div>
    ))}
  </div>
</div>
  );
}


























