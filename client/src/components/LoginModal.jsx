import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useContext(AuthContext)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)

  const handleLogin = async () => {
    try {
      await login(email, password)
      onClose()
    } catch (err) {
      setError('Login failed: ' + err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-header">
        <h1>Welcome back to Calorie Tracker</h1>
        <p>Log in to track your calories and manage your diet.</p>
      </div>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button onClick={handleLogin}>Log In</button>
        <p className="modal-footer-text">
          Don’t have an account?{' '}
          <button className="link-button" onClick={onSwitchToRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  )
}









