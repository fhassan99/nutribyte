import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore user from sessionStorage
  useEffect(() => {
    const token     = sessionStorage.getItem('token');
    const email     = sessionStorage.getItem('email');
    const firstName = sessionStorage.getItem('firstName');
    const lastName  = sessionStorage.getItem('lastName');

    if (token && email) {
      setUser({ token, email, firstName, lastName });
    }

    const handleStorage = (event) => {
      if (event.key === 'logout') {
        sessionStorage.clear();
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

    const { token, user: u } = await res.json();
    const { firstName = '', lastName = '' } = u;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('firstName', firstName);
    sessionStorage.setItem('lastName', lastName);

    setUser({ token, email, firstName, lastName });
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
    sessionStorage.clear();
    setUser(null);
    localStorage.setItem('logout', Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}










