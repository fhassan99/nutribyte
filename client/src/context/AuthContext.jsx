// client/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore user from localStorage
  useEffect(() => {
    const token     = localStorage.getItem('token');
    const email     = localStorage.getItem('email');
    const firstName = localStorage.getItem('firstName');
    const lastName  = localStorage.getItem('lastName');

    if (token && email) {
      setUser({ token, email, firstName, lastName });
    }

    const handleStorage = (event) => {
      if (event.key === 'logout') {
        localStorage.clear();
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (credsOrEmail, maybePassword) => {
    const email    = typeof credsOrEmail === 'string' ? credsOrEmail : credsOrEmail.email;
    const password = typeof credsOrEmail === 'string' ? maybePassword : credsOrEmail.password;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error(await res.text());

    const { token, user: u } = await res.json();
    const { firstName = '', lastName = '' } = u;

    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);

    setUser({ token, email, firstName, lastName });
  };

  const register = async (info) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });

    if (!res.ok) throw new Error(await res.text());

    const { token, user: u } = await res.json();
    const { email, firstName = '', lastName = '' } = u;

    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);

    setUser({ token, email, firstName, lastName });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    localStorage.setItem('logout', Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}










