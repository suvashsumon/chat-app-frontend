import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      // Assuming an endpoint for updating user profile exists
      // For now, this is a placeholder as the backend doesn't have a PUT /users/me endpoint for display_name/avatar
      // const response = await axiosInstance.put('/users/me', { display_name: displayName, avatar: avatar });
      // setUser(response.data); // Update user context
      setMessage("Profile update (display name/avatar) is not yet implemented on backend.");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters long.");
      return;
    }

    try {
      await axiosInstance.put('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage(error.response?.data?.detail || "Failed to change password.");
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-neutral-600 dark:text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-8 text-neutral-600 dark:text-neutral-400">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-primary-600 dark:text-primary-400">Your Profile</h1>

      {/* Profile Update Form */}
      <form onSubmit={handleSubmitProfile} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl mb-8 border border-neutral-200 dark:border-neutral-700 space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">Update Profile Info</h2>
        {message && <p className="text-center text-green-500 dark:text-green-400 text-sm">{message}</p>}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Avatar URL</label>
          <input
            type="text"
            id="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        >
          Update Profile
        </button>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">Change Password</h2>
        {passwordMessage && <p className="text-center text-red-500 dark:text-red-400 text-sm">{passwordMessage}</p>}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 block w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default Profile;
