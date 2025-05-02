import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TrackPage() {
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const navigate = useNavigate();

  // Fetch entries for selected date
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/entries?date=${date}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data);
        calculateTotals(data);
      } catch (err) {
        console.error('Error fetching entries:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchEntries();
      fetchHistoryData();
    }
  }, [date, user?.token]);

  // Fetch historical data for the chart
  const fetchHistoryData = async () => {
    try {
      const response = await fetch(`/api/entries/history?days=7`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

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
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSuggestions(data.foods);
    } catch (err) {
      console.error('Search error:', err);
      setSuggestions([]);
    }
  };

  // Add food entry
  const addEntry = async (food) => {
    try {
      // Ensure all nutrient values are numbers
      const newEntry = {
        date,
        time: new Date().toTimeString().substring(0, 5),
        description: food.description,
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        sugars: Number(food.sugars) || 0
      };

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) throw new Error('Failed to add entry');
      const data = await response.json();
      setEntries([...entries, data]);
      calculateTotals([...entries, data]);
      setSearch('');
      setSuggestions([]);
      fetchHistoryData();
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  // Delete food entry
  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete entry');
      const updatedEntries = entries.filter(entry => entry._id !== id);
      setEntries(updatedEntries);
      calculateTotals(updatedEntries);
      fetchHistoryData();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Update entry time
  const updateEntryTime = async (id, newTime) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ time: newTime })
      });

      if (!response.ok) throw new Error('Failed to update time');
      const updatedEntry = await response.json();
      setEntries(entries.map(entry =>
        entry._id === id ? updatedEntry : entry
      ));
    } catch (err) {
      console.error('Error updating entry time:', err);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: historyData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Protein (g)',
        data: historyData.map(item => item.totals.protein),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Carbs (g)',
        data: historyData.map(item => item.totals.carbs),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Fat (g)',
        data: historyData.map(item => item.totals.fat),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Sugars (g)',
        data: historyData.map(item => item.totals.sugars),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      }
    ]
  };

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate('/')}>
        ← Back
      </button>

      <h1>Track My Calories</h1>
      {user && (
        <p>Logged in as {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}</p>
      )}

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

      {/* Nutrition History Chart */}
      <div className="chart-container" style={{ height: '300px', margin: '2rem 0' }}>
        <h2>Weekly Nutrition Overview</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>

      <h2>Entries on {new Date(date).toLocaleDateString()}</h2>

      {loading ? (
        <p>Loading entries...</p>
      ) : (
        <>
          <table className="entries-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Description</th>
                <th>Cal</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Sugars</th>
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
                  <td>{entry.protein.toFixed(1)}g</td>
                  <td>{entry.carbs.toFixed(1)}g</td>
                  <td>{entry.fat.toFixed(1)}g</td>
                  <td>{entry.sugars.toFixed(1)}g</td>
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
            <strong>Total:</strong> Calories {totals.calories.toFixed(2)},
            Protein {totals.protein.toFixed(2)}g,
            Carbs {totals.carbs.toFixed(2)}g,
            Fat {totals.fat.toFixed(2)}g,
            Sugars {totals.sugars.toFixed(2)}g
          </div>
        </>
      )}

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
                  <div className="nutrient-info">
                    <span>{food.calories || 0} cal</span>
                    <span>P: {food.protein || 0}g</span>
                    <span>C: {food.carbs || 0}g</span>
                    <span>F: {food.fat || 0}g</span>
                    <span>S: {food.sugars || 0}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




























