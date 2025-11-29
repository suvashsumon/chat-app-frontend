import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { encryptionConfig, setEncryptionAlgorithm } from '../utils/crypto';

const Navbar = ({ toggleTheme, theme }) => {
  const { user, logout } = useAuth();
  const { spaceId } = useParams();

  const handleAlgorithmChange = (event) => {
    setEncryptionAlgorithm(event.target.value);
  };

  return (
    <nav className="bg-primary-600 dark:bg-neutral-800 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-2xl font-bold text-white hover:text-neutral-100 transition-colors duration-200">
            ChatApp
          </Link>
          {spaceId && (
            <h2 className="text-xl font-semibold text-white">
              Chat in Space {spaceId}
            </h2>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-primary-700 dark:bg-neutral-700 hover:bg-primary-800 dark:hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-yellow-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-neutral-200" />
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-white hover:text-neutral-100 transition-colors duration-200">
                {user.display_name || user.username}
              </Link>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Logout
              </button>
              <select
                onChange={handleAlgorithmChange}
                defaultValue={encryptionConfig.algorithm}
                className="p-2 rounded bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="AES">AES</option>
                <option value="3DES">3DES</option>
                <option value="ChaCha20">ChaCha20</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-white hover:text-neutral-100 transition-colors duration-200">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-neutral-100 transition-colors duration-200">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;