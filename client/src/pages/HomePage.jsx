import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAppleAlt, FaCarrot, FaDrumstickBite, FaLink } from 'react-icons/fa';
import LoginModal from '../components/LoginModal';
import RegistrationModal from '../components/RegistrationModal';
import { AuthContext } from '../context/AuthContext';
import nutriLogo from '../assets/profile.svg';
import reactLogo from '../assets/logo.svg';

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin]       = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // On mount: log out and show login modal
  useEffect(() => {
    if (user) {
      logout(); // Ensure no one is logged in
    }
    setShowRegister(false);
    setShowLogin(true); // Show login modal by default
  }, []); // Only runs once on initial load

  return (
    <div className="homepage container">
      <img src={reactLogo} alt="React logo" className="react-logo" />
      <img src={nutriLogo} alt="NutriByte logo" className="nutri-logo" />

      <h1>Welcome to NutriByte</h1>
      <div className="home-icons">
        <FaAppleAlt size={32} />
        <FaCarrot size={32} />
        <FaDrumstickBite size={32} />
      </div>

      <p>Your personal nutrition explorer powered by USDA data.</p>
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

      <div className="nav-buttons">
        <button className="home-btn-blue" onClick={() => navigate('/search')}>
          Search Foods
        </button>
        <button className="home-btn-blue" onClick={() => navigate('/compare')}>
          Compare Foods
        </button>
        <button
          className="home-btn-blue"
          onClick={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        >
          Login
        </button>
        <button
          className="home-btn-blue"
          onClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        >
          Register
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








