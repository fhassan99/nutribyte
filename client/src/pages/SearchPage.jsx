// client/src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchPage() {
  const [input, setInput] = useState('')
  const [foods, setFoods] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!input.trim()) {
      setFoods([])
      return
    }
    fetch(`/api/foods?search=${encodeURIComponent(input)}&page=1&limit=20`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => {
        setFoods(j.foods)
        setError('')
      })
      .catch(() => {
        setError('Failed to load results')
        setFoods([])
      })
  }, [input])

  return (
    <div className="container">
      <button onClick={() => navigate('/')}>← Home</button>
      <div className="search-bar">
        <input
          placeholder="Search food or brand…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {foods.map(f => (
          <div
            key={f.fdcId}
            className="card"
            onClick={() => navigate(`/foods/${f.fdcId}`)}
          >
            <h3>{f.description}</h3>
            <p>{f.brandOwner || 'Unknown Brand'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}




















