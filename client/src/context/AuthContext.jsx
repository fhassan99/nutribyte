import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    if (token && email) {
      setUser({ token, email, firstName, lastName });
    }
    setLoading(false);

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
    const email = typeof credsOrEmail === 'string' ? credsOrEmail : credsOrEmail.email;
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
    return { token, email, firstName, lastName };
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
    return { token, email, firstName, lastName };
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    localStorage.setItem('logout', Date.now());
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}









