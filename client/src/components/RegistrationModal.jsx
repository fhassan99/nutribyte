// client/src/components/RegistrationModal.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function RegistrationModal({ onClose, onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  const [info, setInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const emailIsValid = (email) =>
    email.includes("@") && email.toLowerCase().endsWith(".com");

  const passwordIsValid = (pw) => {
    // at least 6 chars, one uppercase, one digit, one special
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,}$/;
    return re.test(pw);
  };

  const handleRegister = async () => {
    // client‐side checks
    if (!info.firstName.trim() || !info.lastName.trim()) {
      setError("Please enter both first and last names.");
      return;
    }
    if (!emailIsValid(info.email)) {
      setError("Please enter a valid email (must contain @ and end in .com).");
      return;
    }
    if (!passwordIsValid(info.password)) {
      setError(
        "Password must be ≥6 chars, include an uppercase letter, a number & a special character."
      );
      return;
    }

    // all good → call API
    try {
      await register(info);
      onClose();
    } catch (err) {
      setError("Registration failed: " + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-header-pill" />
        <h2>Register</h2>

        <input
          placeholder="First name"
          value={info.firstName}
          onChange={(e) =>
            setInfo({ ...info, firstName: e.target.value })
          }
        />
        <input
          placeholder="Last name"
          value={info.lastName}
          onChange={(e) =>
            setInfo({ ...info, lastName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={info.email}
          onChange={(e) =>
            setInfo({ ...info, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={info.password}
          onChange={(e) =>
            setInfo({ ...info, password: e.target.value })
          }
        />

        <p className="text-small">
          Password must be at least 6 characters, with uppercase, number &
          special character.
        </p>

        {error && <p className="error">{error}</p>}

        <button onClick={handleRegister}>Create Account</button>

        <p className="modal-footer-text">
          Already have an account?{" "}
          <button className="link-button" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}


