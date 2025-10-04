import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        token,
        password: formData.password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
          <p>Invalid or missing reset token. Please request a new password reset link.</p>
          <Link to="/forgot-password" className="block mt-4 text-red-400 hover:text-red-300 font-medium">
            Request Password Reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-gray-400">
          Enter your new password below.
        </p>
      </div>

      {success ? (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded relative mb-6">
          <p>Your password has been successfully reset.</p>
          <Link to="/signin" className="block mt-4 text-green-400 hover:text-green-300 font-medium">
            Sign In with New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md font-medium shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </motion.button>

          <div className="text-center mt-4">
            <Link
              to="/signin"
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm; 