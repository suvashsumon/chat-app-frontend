import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SpaceChat from './pages/SpaceChat';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
          <Navbar toggleTheme={toggleTheme} theme={theme} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/space/:spaceId" element={<SpaceChat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Dashboard />} /> {/* Default route */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;