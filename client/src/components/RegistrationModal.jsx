import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function RegistrationModal({ onClose, onSwitchToLogin }) {
  const { register } = useContext(AuthContext)
  const [info, setInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setInfo({ ...info, [name]: value })
    setError('')
  }

  const handleRegister = async e => {
    e.preventDefault()
    // add your validations...
    try {
      await register(info)
      onClose()
    } catch (err) {
      setError('Registration failed: ' + err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h1>Welcome to Calorie Tracker</h1>
        <p>Join us to track your calories and manage your diet.</p>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input name="firstName" placeholder="First name" value={info.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last name" value={info.lastName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={info.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" value={info.password} onChange={handleChange} />
          {error && <p className="error">{error}</p>}
          <button type="submit">Create Account</button>
        </form>
        <p className="modal-footer-text">
          Already have an account?{' '}
          <button className="link-button" onClick={onSwitchToLogin}>
            Log In
          </button>
        </p>
      </div>
    </div>
  )
}





