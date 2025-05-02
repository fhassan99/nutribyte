// client/components/RegistrationModal.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RegistrationModal({ onClose, onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  const [info, setInfo]   = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    password:  ''
  });
  const [error, setError] = useState('');

  const emailIsValid = email =>
    email.includes('@') && email.toLowerCase().endsWith('.com');
  const passwordIsValid = pw =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,}$/.test(pw);

  const handleChange = e => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegister = async e => {
    e.preventDefault();
    if (!info.firstName.trim() || !info.lastName.trim()) {
      setError('Please enter both first and last names.');
      return;
    }
    if (!emailIsValid(info.email)) {
      setError('Please enter a valid email (must contain @ and end in .com).');
      return;
    }
    if (!passwordIsValid(info.password)) {
      setError('Password must be ≥6 chars, include uppercase, number & special character.');
      return;
    }
    try {
      await register(info);
      onClose();
    } catch (err) {
      setError('Registration failed: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="register-heading">
        <h2 id="register-heading">Register</h2>
        <form onSubmit={handleRegister}>
          <input name="firstName" placeholder="First name" value={info.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last name" value={info.lastName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={info.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" value={info.password} onChange={handleChange} />

          <p className="text-small">
            Password must be at least 6 characters, with uppercase, number & special character.
          </p>

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
  );
}




