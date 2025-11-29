import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import SpaceList from '../components/SpaceList';
import { generateAesKey, exportAesKey, encryptWithPublicKey } from '../utils/crypto';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  const fetchSpaces = async () => {
    try {
      const response = await axiosInstance.get('/spaces/me');
      setSpaces(response.data);
    } catch (err) {
      console.error("Error fetching spaces:", err);
      setError("Failed to load spaces.");
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    setError('');
    if (!user || !user.public_key) {
      setError("User public key not available. Please re-register or log in again.");
      return;
    }

    try {
      // 1. Generate a new AES key for the space
      const aesKey = await generateAesKey();
      const exportedAesJwk = await exportAesKey(aesKey);

      // 2. Encrypt the AES key with the creator's own public RSA key
      const encryptedSpaceKey = encryptWithPublicKey(user.public_key, exportedAesJwk);

      if (!encryptedSpaceKey) {
        throw new Error("Failed to encrypt space key with user's public key.");
      }

      await axiosInstance.post(
        '/spaces/',
        { name: newSpaceName },
        {
          params: {
            encrypted_space_key: encryptedSpaceKey,
          },
        }
      );
      setNewSpaceName('');
      fetchSpaces();
    } catch (err) {
      console.error("Error creating space:", err);
      setError(err.response?.data?.detail || "Failed to create space.");
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-neutral-600 dark:text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-8 text-neutral-600 dark:text-neutral-400">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-primary-600 dark:text-primary-400">Welcome, {user.display_name || user.username}!</h1>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl mb-8 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Create New Space</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleCreateSpace} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            placeholder="Enter space name..."
            className="flex-1 p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
            required
          />
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            Create Space
          </button>
        </form>
      </div>

      <SpaceList spaces={spaces} />
    </div>
  );
};

export default Dashboard;
