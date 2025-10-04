import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        await login(data);
        toast.success('Successfully signed in!');
        
        // Check user role and redirect accordingly
        if (data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          // Check for redirect URL in sessionStorage for regular users
          const redirectUrl = sessionStorage.getItem('redirectAfterSignIn');
          if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterSignIn');
            navigate(redirectUrl);
          } else {
            navigate('/home');
          }
        }
      } else {
        toast.error(data.message || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred while signing in');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorize/${provider}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-['Inter']">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-25 w-auto" src="./logo.png" alt="Logo" />
          <h2 className="mt-1 text-center text-3xl font-semibold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-900 rounded-t-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(24,24,27)_inset] placeholder:[-webkit-text-fill-color:#6b7280]"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2.5 border border-gray-700 placeholder-gray-500 text-white bg-zinc-900 rounded-b-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:z-10 text-sm [-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(24,24,27)_inset] placeholder:[-webkit-text-fill-color:#6b7280]"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-700 rounded bg-zinc-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
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
                {loading ? 'Signing in...' : 'Sign in'}
              </span>
            </motion.button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              type="button"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthLogin('github')}
              className="group relative flex items-center justify-center px-4 py-2 border border-zinc-700 rounded-md shadow-sm overflow-hidden transition-all duration-300 ease-in-out w-full max-w-[200px]"
            >
              <div className="absolute inset-0 bg-zinc-900 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <img src="/github-icon.png" alt="GitHub" className="relative z-10 w-5 h-5 mr-2" />
              <span className="relative z-10 text-gray-300 group-hover:text-white transition-colors">
                GitHub
              </span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn; 