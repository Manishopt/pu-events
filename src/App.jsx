import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home.jsx';
import Events from './pages/Events';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen w-full bg-gray-50 text-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
