// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';    // React 18+
import App from './App';
import './index.css';                      // Global styles


const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
