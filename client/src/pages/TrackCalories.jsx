import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function TrackCalories() {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(new Date().toISOString().substr(0,10));
  const [calories, setCalories] = useState('');
  const [entries, setEntries] = useState([]);

  const load = async () => {
    const res = await axios.get('/api/entries?date='+date);
    setEntries(res.data);
  };
  useEffect(() => { if (user) load(); }, [date, user]);

  const add = async () => {
    await axios.post('/api/entries', { date, calories: Number(calories) });
    setCalories('');
    load();
  };

  if (!user) return <p>Please log in to track calories.</p>;

  return (
    <div className="container">
      <h1>Track Calories</h1>
      <div className="compare-inputs">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="number" placeholder="Calories" value={calories} onChange={e=>setCalories(e.target.value)} />
        <button onClick={add}>Add Entry</button>
      </div>
      <table className="min-w-full table-auto">
        <thead><tr><th>Date</th><th>Calories</th></tr></thead>
        <tbody>
          {entries.map(e=>(
            <tr key={e._id}><td>{new Date(e.date).toLocaleDateString()}</td><td className="text-right">{e.calories}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
