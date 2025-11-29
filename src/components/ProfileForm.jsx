import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ProfileForm = () => {
  const { user, setUser } = useAuth();
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

  return (
    <div className="space-y-6">
      {/* Profile Update Form */}
      <form onSubmit={handleSubmitProfile} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Update Profile</h2>
        {message && <p className="text-center text-green-500 dark:text-green-400">{message}</p>}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
          <input
            type="text"
            id="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Update Profile
        </button>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
        {passwordMessage && <p className="text-center text-red-500 dark:text-red-400">{passwordMessage}</p>}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;