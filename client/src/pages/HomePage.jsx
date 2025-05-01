import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaAppleAlt,
  FaCarrot,
  FaDrumstickBite,
  FaLink,
  FaSignOutAlt,
} from 'react-icons/fa';
import LoginModal from '../components/LoginModal';
import RegistrationModal from '../components/RegistrationModal';
import { AuthContext } from '../context/AuthContext';
import nutriLogo from '../assets/profile.svg';
import reactLogo from '../assets/logo.svg';

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShowRegister(false);
      setShowLogin(true);
    }
  }, [user]);

  return (
    <div className="homepage container">
      {/* Top-right user info */}
      {user && (
        <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
          <p className="text-secondary">
            Logged in as <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</strong>
          </p>
          <button
            className="home-btn-blue"
            onClick={logout}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}

      <img src={reactLogo} alt="React logo" className="react-logo" />
      <img src={nutriLogo} alt="NutriByte logo" className="nutri-logo" />

      <h1>Welcome to NutriByte</h1>
      <div className="home-icons">
        <FaAppleAlt size={32} />
        <FaCarrot size={32} />
        <FaDrumstickBite size={32} />
      </div>

      <p>Your personal nutrition explorer powered by USDA data.</p>
      <p>Track your calories daily.</p>
      <p>
        Data sourced from{' '}
        <a
          href="https://fdc.nal.usda.gov/download-datasets"
          target="_blank"
          rel="noopener noreferrer"
          className="link-primary"
        >
          USDA Food Data <FaLink />
        </a>
      </p>
      <p className="creator">Created by Farhan Hassan</p>
      <>
      </>

      <div className="nav-buttons">
        <button className="home-btn-blue" onClick={() => navigate('/search')}>
          Search Foods
        </button>
        <button className="home-btn-blue" onClick={() => navigate('/compare')}>
          Compare Foods
        </button>
        <button
          className="home-btn-blue"
          onClick={() => user && navigate('/track')}
          disabled={!user}
          style={{
            opacity: user ? 1 : 0.5,
            cursor: user ? 'pointer' : 'not-allowed',
            position: 'relative',
          }}
        >
          Track My Calories
          {!user && (
            <span
              style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.75rem',
                color: '#999',
              }}
            >
            </span>
          )}
        </button>
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












