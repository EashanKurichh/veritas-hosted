import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const SignUpForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Sign up
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signup successful:', signupResponse.data);

      // 2. Automatically sign in
      try {
        const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
          email: formData.email,
          password: formData.password
        });

        if (!signinResponse.data || !signinResponse.data.token) {
          throw new Error('Invalid response from server: missing token');
        }

        // 3. Set authentication state
        await login(signinResponse.data);
        console.log('Auto-login successful, navigating to home...');
        navigate('/home');
      } catch (signinErr) {
        console.error('Auto-login failed:', signinErr);
        setError('Account created successfully, but auto-login failed. Please sign in manually.');
        navigate('/signin');
      }
    } catch (err) {
      // Enhanced error handling
      if (err.response) {
        // Server responded with an error
        const errorMessage = err.response.data.error || err.response.data.message;
        console.log('Backend error response:', err.response.data);
        setError(errorMessage || 'An error occurred during signup');
      } else if (err.request) {
        // Request was made but no response received
        setError('Unable to connect to the server. Please try again later.');
      } else {
        // Something else went wrong
        setError('An unexpected error occurred. Please try again.');
      }
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
          <label className="block text-sm font-medium text-gray-200">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(39,39,42)_inset] placeholder:[-webkit-text-fill-color:#6b7280]"
            required
            placeholder="Full name"
          />
        </div>

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
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md font-medium shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
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

export default SignUpForm; 