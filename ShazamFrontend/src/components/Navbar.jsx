import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar fixed top-0 left-0 w-full z-[20] py-2 pl-35 pr-10 transition-all duration-300 font-['Helvetica_Neue',_'Helvetica',_'Arial',_sans-serif] ${isScrolled ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent'} overflow-hidden`}>
      <div className='flex items-center'>
        {/* Logo Section */}
        <Link to="/" className='flex items-center gap-25 -ml-25 pointer-events-auto'>
          <img src="/logo.png" alt="Logo Icon" className='h-12 scale-175 transform object-contain -ml-3 pointer-events-none' />
          <img src="/logoWhite.png" alt="Logo Text" className='h-8 transform object-contain scale-725 pointer-events-none' />
        </Link>

        {/* Right Side Content */}
        <div className='flex items-center justify-end flex-1 gap-16'>
          {/* Navigation Links and Search */}
          <div className='flex items-center gap-8'>
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

          {/* Auth Buttons */}
          <div className='flex items-center gap-4'>
            <Link to="/signin" className='px-4 py-2 text-white hover:text-gray-300 font-semibold'>
              Sign In
            </Link>
            <Link to="/signup" className='px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 font-semibold'>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 