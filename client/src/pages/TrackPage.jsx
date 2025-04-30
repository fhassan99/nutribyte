// client/src/pages/TrackPage.jsx
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

  // redirect to home if not logged in
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const token = user?.token;

  // --- STATE ---
  const [date, setDate]               = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries]         = useState([]);
  const [search, setSearch]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [entryTime, setEntryTime]     = useState(() => new Date().toISOString().slice(11, 16)); // "HH:MM"
  const [entryDesc, setEntryDesc]     = useState('');

  // load existing entries
  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [date, token]);

  useEffect(() => {
    if (token) loadEntries();
  }, [loadEntries, token]);

  // compute daily totals
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

  // fetch suggestions when “search” changes
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=10`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(result => {
        // result = { foods: [...], count: N }
        const items = Array.isArray(result) ? result : result.foods;
        setSuggestions(items || []);
      })
      .catch(() => setSuggestions([]));
  }, [search]);

  // when user clicks on a suggestion
  const addEntry = (food) => {
    // require both time & description
    if (!entryTime || !entryDesc.trim()) {
      return alert('Please pick a time and enter a description before adding.');
    }

    fetch(`/api/foods/${food.fdcId}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(full => {
        const getAmt = name =>
          full.nutrients.find(n => n.nutrientName === name)?.amount || 0;

        const entry = {
          date,
          time: entryTime,
          description: entryDesc.trim(),
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
        // reset inputs
        setSearch('');
        setSuggestions([]);
        setEntryDesc('');
      })
      .catch(() => alert('Could not add entry. Please make sure you’re logged in.'));
  };

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate(-1)}>← Back</button>

      <h1>Track My Calories</h1>

      {/* Logged‐in status */}
      {user && (
        <p style={{ color: 'var(--secondary)' }}>
          Logged in as <strong>{user.email}</strong>
        </p>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
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

      {/* Entries table */}
      <div className="detail-container entries-table">
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
          Total for day:&nbsp;
          Calories {totals.Calories.toFixed(2)},&nbsp;
          Protein {totals.Protein.toFixed(2)},&nbsp;
          Carbs {totals.Carbs.toFixed(2)},&nbsp;
          Fat {totals.Fat.toFixed(2)},&nbsp;
          Sugars {totals.Sugars.toFixed(2)}
        </p>
      </div>

      {/* Controls: date, time & description */}
      <div className="track-controls">
        <input
          type="date"
          className="date-picker"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          type="time"
          className="time-input"
          value={entryTime}
          onChange={e => setEntryTime(e.target.value)}
        />
        <input
          placeholder="Entry description…"
          className="compare-input"
          value={entryDesc}
          onChange={e => setEntryDesc(e.target.value)}
        />
        <div style={{ flex: 1, display: 'flex' }}>
          <input
            placeholder="Search food…"
            className="compare-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="compare-btn"
            onClick={() => setSearch(s => s.trim())}
          >
            Find
          </button>
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






















