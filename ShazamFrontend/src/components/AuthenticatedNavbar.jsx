import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const AuthenticatedNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Get first name for welcome message
  const firstName = user?.fullName?.split(' ')[0] || 'User';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // If no user data, don't render the navbar
  if (!user) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-[20] py-2 px-4 md:pl-35 md:pr-10 transition-all duration-300 font-['Helvetica_Neue',_'Helvetica',_'Arial',_sans-serif] ${isScrolled ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className='flex items-center'>
        {/* Logo Section */}
        <Link to="/" className='flex items-center gap-2 md:gap-25 ml-2 md:-ml-25 pointer-events-auto'>
          <img src="/logo.png" alt="Logo Icon" className='h-10 md:h-12 scale-150 md:scale-175 transform object-contain pointer-events-none' />
          <img src="/logoWhite.png" alt="Logo Text" className='hidden md:block h-8 transform object-contain scale-725 pointer-events-none' />
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto text-white p-2"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <i className={`ri-${showMobileMenu ? 'close' : 'menu'}-line text-2xl`}></i>
        </button>

        {/* Right Side Content - Desktop */}
        <div className='hidden md:flex items-center justify-end flex-1 gap-16'>
          {/* Navigation Links and Search */}
          <div className='flex items-center gap-8'>
            <Link to="/home" className='text-white hover:text-gray-300 font-semibold'>
              Home
            </Link>
            <Link to="/charts" className='text-white hover:text-gray-300 font-semibold'>
              Charts
            </Link>
            <Link to="/concerts" className='text-white hover:text-gray-300 font-semibold'>
              Concerts
            </Link>
            <div className='ml-4'>
              <SearchBar />
            </div>
          </div>

          {/* User Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-white font-medium">Welcome, {firstName}</span>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-white/10"
              />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl py-3 z-50"
                  style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
                >
                  {/* User Profile Header */}
                  <div className="px-4 pb-3 border-b border-zinc-700">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=64`}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full border-2 border-violet-500/20"
                      />
                      <div>
                        <h3 className="text-white font-medium text-lg">{user.fullName}</h3>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="px-2 py-2">
                    <Link
                      to="/change-password"
                      className="flex items-center gap-3 px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <i className="ri-lock-password-line text-lg"></i>
                      <span>Change Password</span>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center gap-3 px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <i className="ri-question-line text-lg"></i>
                      <span>Help & Support</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                    >
                      <i className="ri-logout-box-r-line text-lg"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 pt-2 mt-2 border-t border-zinc-700">
                    <p className="text-center text-xs text-zinc-500">
                      Veritas VI v1.0.0
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 w-full h-screen bg-zinc-900/95 backdrop-blur-sm md:hidden z-50"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                  <span className="text-white font-medium">Menu</span>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="text-white p-2"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-6">
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/home"
                      className="text-white hover:text-gray-300 font-semibold py-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/charts"
                      className="text-white hover:text-gray-300 font-semibold py-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Charts
                    </Link>
                    <Link
                      to="/concerts"
                      className="text-white hover:text-gray-300 font-semibold py-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Concerts
                    </Link>
                  </div>

                  {/* Mobile Search */}
                  <div className="mt-6">
                    <SearchBar />
                  </div>

                  {/* Mobile User Profile */}
                  <div className="mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full border-2 border-white/10"
                      />
                      <div>
                        <h3 className="text-white font-medium">{user.fullName}</h3>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                      </div>
                    </div>

                    {/* Mobile Menu Items */}
                    <div className="space-y-4">
                      <Link
                        to="/change-password"
                        className="flex items-center gap-3 text-zinc-300 hover:text-white"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i className="ri-lock-password-line text-lg"></i>
                        <span>Change Password</span>
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center gap-3 text-zinc-300 hover:text-white"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i className="ri-question-line text-lg"></i>
                        <span>Help & Support</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 text-red-400 hover:text-red-300"
                      >
                        <i className="ri-logout-box-r-line text-lg"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar; 