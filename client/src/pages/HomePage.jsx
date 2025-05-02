// client/src/pages/HomePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaAppleAlt, FaCarrot, FaDrumstickBite, FaLink } from "react-icons/fa";
import LoginModal from "../components/LoginModal";
import RegistrationModal from "../components/RegistrationModal";
import { AuthContext } from "../context/AuthContext";
import nutriLogo from "../assets/profile.svg";
import reactLogo from "../assets/logo.svg";

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // On first load, if not logged in, show the login modal
  useEffect(() => {
    if (!user) setShowLogin(true);
  }, [user]);

  return (
    <div className="homepage">
      <img src={reactLogo} alt="React logo" className="react-logo" />
      <img src={nutriLogo} alt="NutriByte logo" className="nutri-logo" />

      <h1>NutriByte</h1>
      <div className="home-icons">
        <FaAppleAlt size={32} style={{ margin: "0 .5rem" }} />
        <FaCarrot size={32} style={{ margin: "0 .5rem" }} />
        <FaDrumstickBite size={32} style={{ margin: "0 .5rem" }} />
      </div>

      {user && (
        <p style={{ marginBottom: "1rem", color: "var(--secondary)" }}>
          Logged in as <strong>{user.email}</strong>
        </p>
      )}

      <p>Your personal nutrition explorer powered by USDA data.</p>
      <p>
        Data sourced from{" "}
        <a
          href="https://fdc.nal.usda.gov/download-datasets"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--primary)" }}
        >
          USDA Food Data <FaLink style={{ verticalAlign: "middle" }} />
        </a>
      </p>
      <p className="creator">Created by Farhan Hassan</p>

      {/* nav-buttons: SEARCH and COMPARE always visible */}
      <div className="nav-buttons">
        <button
          className="home-btn-blue"
          onClick={() => navigate("/search")}
        >
          Search Foods
        </button>
        <button
          className="home-btn-blue"
          onClick={() => navigate("/compare")}
        >
          Compare Foods
        </button>

        {/* only show these if logged in */}
        {user && (
          <>
            <button
              className="home-btn-blue"
              onClick={() => navigate("/track")}
            >
              Track My Calories
            </button>
            <button
              className="home-btn-blue"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Modals for login/register */}
      {showLogin && !user && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && !user && (
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


