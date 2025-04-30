import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function TrackCalories() {
  const { user } = useContext(AuthContext);

  const [date, setDate]           = useState(new Date().toISOString().substr(0,10));
  const [time, setTime]           = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [description, setDesc]    = useState('');
  const [calories, setCalories]   = useState('');
  const [entries, setEntries]     = useState([]);
  const [error, setError]         = useState('');

  const load = async () => {
    try {
      const res = await axios.get(`/api/entries?date=${date}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEntries(res.data);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [date, user]);

  const add = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!time) {
      setError('Please select a time');
      return;
    }
    setError('');
    try {
      await axios.post('/api/entries', {
        date,
        time,
        description: description.trim(),
        calories: Number(calories) || 0
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCalories('');
      setDesc('');
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
      load();
    } catch {
      setError('Failed to add entry');
    }
  };

  if (!user) return <p>Please log in to track calories.</p>;

  return (
    <div className="container">
      <h1>Track Calories</h1>

      <div className="compare-inputs">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          type="time"
          className="time-input"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDesc(e.target.value)}
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={e => setCalories(e.target.value)}
        />
        <button onClick={add}>Add Entry</button>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Description</th>
            <th>Calories</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e._id}>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td>{e.time}</td>
              <td>{e.description}</td>
              <td className="text-right">{e.calories}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



