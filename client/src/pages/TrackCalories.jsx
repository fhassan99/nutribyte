import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import '../App.css';

export default function TrackCalories() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const token = user?.token;
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [entries, setEntries] = useState([]);

  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, [date, token]);

  useEffect(() => {
    if (token) loadEntries();
  }, [token, loadEntries]);

  useEffect(() => {
    if (!search.trim()) return setSuggestions([]);
    fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=100`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setSuggestions(data.foods))
      .catch(() => setSuggestions([]));
  }, [search]);

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

  const addEntry = (food) => {
    fetch(`/api/foods/${food.fdcId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(full => {
        const getAmt = name => full.nutrients.find(n => n.nutrientName === name)?.amount || 0;
        const payload = {
          date,
          time: new Date().toISOString().slice(11, 16),
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
          body: JSON.stringify(payload)
        });
      })
      .then(res => {
        if (!res.ok) throw new Error();
        loadEntries();
        setSearch('');
        setSuggestions([]);
      })
      .catch(() => alert('Failed to add entry'));
  };

  if (!user) return <p>Please log in to access this page.</p>;

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>← Home</button>
      <h1>Track Calories (Alt View)</h1>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>

      <input
        type="date"
        className="date-picker"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ margin: '1rem 0' }}
      />

      <input
        className="search-bar"
        placeholder="Search food..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid">
        {suggestions.map(f => (
          <div key={f.fdcId} className="card" onClick={() => addEntry(f)}>
            <h3>{f.description}</h3>
            <p>{f.brandOwner || 'Unknown Brand'}</p>
          </div>
        ))}
      </div>

      <div className="entries-table">
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
              <tr><td colSpan="7">No entries</td></tr>
            ) : (
              entries.map(e => (
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
      </div>
    </div>
  );
}
