// client/src/pages/TrackPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TrackPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const token = user?.token

  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [entries, setEntries] = useState([])

  // load existing entries
  const loadEntries = useCallback(() => {
    fetch(`/api/entries?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setEntries(data))
      .catch(() => setEntries([]))
  }, [date, token])

  useEffect(() => {
    if (!token) navigate('/')
    else loadEntries()
  }, [token, loadEntries, navigate])

  // live suggestions as user types
  useEffect(() => {
    if (!search.trim()) return setSuggestions([])
    fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=10`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => setSuggestions(j.foods))
      .catch(() => setSuggestions([]))
  }, [search])

  const addEntry = food => {
    // auto-generate time HH:mm:ss
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const time = `${hh}:${mm}:${ss}`

    // pick out macros
    fetch(`/api/foods/${food.fdcId}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(full => {
        const amt = name =>
          full.nutrients.find(n => n.nutrientName === name)?.amount || 0

        return fetch('/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            date,
            time,
            description: full.description,
            calories: amt('Energy'),
            protein: amt('Protein'),
            carbs: amt('Carbohydrate, by difference'),
            fat: amt('Total lipid (fat)'),
            sugars: amt('Sugars, total')
          })
        })
      })
      .then(r => {
        if (!r.ok) throw new Error()
        setSearch('')
        setSuggestions([])
        loadEntries()
      })
      .catch(() => alert('Failed to add entry. Please try again.'))
  }

  return (
    <div className="container">
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>Track My Calories</h1>
      <p>Logged in as <strong>{user.email}</strong></p>

      {/* date picker */}
      <input
        type="date"
        className="date-picker"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {/* live search */}
      <div className="search-bar" style={{ margin: '1rem 0' }}>
        <input
          placeholder="Search food..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* suggestions */}
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

      {/* existing entries table... */}
      {/* … */}
    </div>
  )
}




























