import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import HomePage             from './pages/HomePage';
import SearchPage           from './pages/SearchPage';
import ComparePage          from './pages/ComparePage';
import FoodDetail           from './pages/FoodDetail';
import TrackPage            from './pages/TrackPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/search"        element={<SearchPage />} />
          <Route path="/compare"       element={<ComparePage />} />
          <Route path="/track"         element={<TrackPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}














