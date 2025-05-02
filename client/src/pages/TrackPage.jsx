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

  // state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // load entries for the selected date
  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, [date, token]);

  useEffect(() => {
    if (token) loadEntries();
  }, [loadEntries, token]);

  // compute daily totals & chart data
  const totals = entries.reduce(
    (acc, e) => {
      acc.Calories += e.calories || 0;
      acc.Protein  += e.protein  || 0;
      acc.Carbs    += e.carbs    || 0;
      acc.Fat      += e.fat      || 0;
      acc.Sugars   += e.sugars   || 0;
      return acc;
    },
    { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Sugars: 0 }
  );
  const chartData = Object.entries(totals).map(([name, value]) => ({
    name, value: Number(value.toFixed(2))
  }));

  // live suggestions as user types
  useEffect(() => {
    if (!search) return setSuggestions([]);
    fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=10`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setSuggestions(data.foods || []))
      .catch(() => setSuggestions([]));
  }, [search]);

  // add an entry (food + date + time)
  const addEntry = (food) => {
    fetch(`/api/foods/${food.fdcId}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(full => {
        const getAmt = name =>
          full.nutrients.find(n => n.nutrientName === name)?.amount || 0;

        const payload = {
          fdcId: full.fdcId,
          description: full.description,
          date,
          time,
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
          body: JSON.stringify(payload)
        });
      })
      .then(r => {
        if (!r.ok) throw new Error();
        setSearch('');
        setSuggestions([]);
        loadEntries();
      })
      .catch(() => alert('Could not add entry.'));
  };

  // delete an entry
  const deleteEntry = (_id) => {
    if (!window.confirm('Delete this entry?')) return;
    fetch(`/api/entries/${_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error();
        loadEntries();
      })
      .catch(() => alert('Could not delete entry.'));
  };

  return (
    <div className="container track-page">
      <button className="home-btn-blue" onClick={() => navigate(-1)}>← Back</button>
      <h1>Track My Calories</h1>
      <p style={{ color: 'var(--secondary)' }}>
        Logged in as <strong>{user.email}</strong>
      </p>

      {/* Nutrition summary cards */}
      <div className="nutrition-summary">
        {Object.entries(totals).map(([nutrient, amt]) => (
          <div key={nutrient} className="summary-card">
            <div className="value">{amt.toFixed(0)}</div>
            <div className="label">{nutrient}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="chart-container">
        <h2>Daily Macro Breakdown</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip />
            <Bar dataKey="value" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls: date, time, search */}
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
          value={time}
          onChange={e => setTime(e.target.value)}
        />
        <div className="input-container" style={{ flex: 1 }}>
          <input
            placeholder="Search food..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-btn"
              onClick={() => setSearch('')}
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(f => (
            <div
              key={f.fdcId}
              className="suggestion-card"
              onClick={() => addEntry(f)}
            >
              <strong>{f.description}</strong>
              <br />
              <small>{f.brandOwner}</small>
            </div>
          ))}
        </div>
      )}

      {/* Entries table */}
      <h2>Entries on {new Date(date).toLocaleDateString()}</h2>
      <table className="entries-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Food</th>
            <th>Cal</th>
            <th>Prot</th>
            <th>Carb</th>
            <th>Fat</th>
            <th>Sug</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan="8">No entries found for this date</td>
            </tr>
          ) : (
            entries.map(e => (
              <tr key={e._id}>
                <td>
                  <input
                    type="time"
                    className="time-input"
                    value={e.time || '00:00'}
                    onChange={ev => {
                      // update time inline
                      fetch(`/api/entries/${e._id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ time: ev.target.value })
                      }).then(() => loadEntries());
                    }}
                  />
                </td>
                <td>{e.description}</td>
                <td>{e.calories.toFixed(0)}</td>
                <td>{e.protein.toFixed(1)}</td>
                <td>{e.carbs.toFixed(1)}</td>
                <td>{e.fat.toFixed(1)}</td>
                <td>{e.sugars.toFixed(1)}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEntry(e._id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}





























