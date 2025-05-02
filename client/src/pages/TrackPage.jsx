import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TrackPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugars: 0
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/entries?date=${date}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validate and ensure all entries have required fields
        const validatedEntries = data.map(entry => ({
          ...entry,
          calories: Number(entry.calories) || 0,
          protein: Number(entry.protein) || 0,
          carbs: Number(entry.carbs) || 0,
          fat: Number(entry.fat) || 0,
          sugars: Number(entry.sugars) || 0
        }));

        setEntries(validatedEntries);
        calculateTotals(validatedEntries);

      } catch (err) {
        console.error('Error fetching entries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchEntries();
    }
  }, [date, user?.token]);

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

  if (!user) {
    return <div className="container">Please log in to track calories</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Track My Calories</h1>
      <p>Logged in as {user.firstName || user.email}</p>

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

      <div className="date-controls">
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading entries...</p>
      ) : (
        <>
          <h2>Entries for {new Date(date).toLocaleDateString()}</h2>

          <table className="entries-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Food</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Sugars</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map(entry => (
                  <tr key={entry._id}>
                    <td>{entry.time}</td>
                    <td>{entry.description}</td>
                    <td>{entry.calories.toFixed(0)}</td>
                    <td>{entry.protein.toFixed(1)}g</td>
                    <td>{entry.carbs.toFixed(1)}g</td>
                    <td>{entry.fat.toFixed(1)}g</td>
                    <td>{entry.sugars.toFixed(1)}g</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No entries found for this date</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="totals">
            <h3>Daily Totals:</h3>
            <p>Calories: {totals.calories.toFixed(0)}</p>
            <p>Protein: {totals.protein.toFixed(1)}g</p>
            <p>Carbs: {totals.carbs.toFixed(1)}g</p>
            <p>Fat: {totals.fat.toFixed(1)}g</p>
            <p>Sugars: {totals.sugars.toFixed(1)}g</p>
          </div>
        </>
      )}
    </div>
  );
}




























