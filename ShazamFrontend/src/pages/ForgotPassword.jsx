import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password', { email });
      setSuccess('OTP sent successfully to your email!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-900 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm"
              placeholder="Email address"
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
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </span>
            </motion.button>
          </div>

          <div className="text-center">
            <Link
              to="/signin"
              className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 