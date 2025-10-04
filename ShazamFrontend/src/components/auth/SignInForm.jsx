import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SignInForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    console.log("Env check:", import.meta.env.VITE_BACKEND_URL);
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, formData);
      // Handle successful signin
      console.log('Signin successful:', response.data);
      // You can add navigation or success message here
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorize/${provider}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(39,39,42)_inset] placeholder:[-webkit-text-fill-color:#6b7280]"
            required
            placeholder="Email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(39,39,42)_inset] placeholder:[-webkit-text-fill-color:#6b7280]"
            required
            placeholder="Password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            Forgot password?
          </Link>
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
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center px-4 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 hover:bg-zinc-700"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center px-4 py-2 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 hover:bg-zinc-700"
          >
            <img src="/github-icon.svg" alt="GitHub" className="w-5 h-5 mr-2" />
            GitHub
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm; 