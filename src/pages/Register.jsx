import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { generateKeyPair } from '../utils/crypto';

const Register = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { publicKey, privateKey } = generateKeyPair();
      // Store privateKey securely in local storage or similar
      localStorage.setItem('privateKey', privateKey);

      await register({
        username,
        display_name: displayName,
        password,
        public_key: publicKey,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary-600 dark:text-primary-400">Register</h2>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-neutral-700 dark:text-neutral-300 text-sm">
          Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;