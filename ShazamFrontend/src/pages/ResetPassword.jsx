import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = '${import.meta.env.VITE_BACKEND_URL}/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If no email is provided, redirect to change password page
  if (!email) {
    navigate('/change-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword
      });

      setSuccess('Password reset successful!');
      
      // Redirect to home page after successful reset
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-['Inter']">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-25 w-auto" src="./logo.png" alt="Logo" />
          <h2 className="mt-1 text-center text-3xl font-semibold text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter the verification code sent to {email} and your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter verification code"
              className="appearance-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-800/50 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm"
            />
          </div>

          {/* New Password Input */}
          <div>
            <label htmlFor="new-password" className="sr-only">
              New Password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="appearance-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-800/50 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="appearance-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-800/50 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center">{success}</div>
          )}

          <div>
            <motion.button
              type="submit"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white overflow-hidden transition-all duration-300 ease-in-out disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <span className="relative z-10">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </span>
            </motion.button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 