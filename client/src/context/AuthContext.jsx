import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore user from sessionStorage on page load
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const email = sessionStorage.getItem('email');
    if (token && email) {
      setUser({ token, email });
    }

    // Listen for logout from other tabs
    const handleStorage = (event) => {
      if (event.key === 'logout') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('email');
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error(await res.text());
    const { token } = await res.json();

    // Store in sessionStorage
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('email', email);
    setUser({ token, email });
  };

  const register = async (info) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    setUser(null);

    // Broadcast logout to other tabs
    localStorage.setItem('logout', Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}








