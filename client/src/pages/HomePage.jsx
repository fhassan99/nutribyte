import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { RegistrationModal } from '../components/RegistrationModal';
import { AuthContext } from '../context/AuthContext';
import nutriLogo from '../assets/profile.svg';
import reactLogo from '../assets/logo.svg';

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <img src={reactLogo} alt="React logo" className="react-logo" />
      <img src={nutriLogo} alt="NutriByte logo" className="nutri-logo" />

      <h1>Welcome to NutriByte</h1>

      {user && (
        <p style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
          Logged in as <strong>{user.email}</strong>
        </p>
      )}

      <p>Your personal nutrition explorer powered by USDA data.</p>
      <p>Register or Log in to compare foods and track your calories!</p>
      <p className="creator">Created by Farhan Hassan</p>

      <div className="nav-buttons">
        <button className="home-btn-blue" onClick={() => navigate('/search')}>
          Search Foods
        </button>

        {user ? (
          <>
            <button className="home-btn-blue" onClick={() => navigate('/compare')}>
              Compare Foods
            </button>
            <button className="home-btn-blue" onClick={() => navigate('/track')}>
              Track My Calories
            </button>
            <button className="home-btn-blue" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="home-btn-blue" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button className="home-btn-blue" onClick={() => setShowRegister(true)}>
              Register
            </button>
          </>
        )}
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegistrationModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}




