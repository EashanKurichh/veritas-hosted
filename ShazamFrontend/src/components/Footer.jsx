import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <h2 className="font-['Inter'] text-2xl font-semibold tracking-tight">Veritas VI</h2>
            <p className="font-['Inter'] text-zinc-400 text-sm leading-relaxed font-light">
              Experience music like never before through our innovative concert booking platform.
            </p>
            <div className="flex space-x-5">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <i className="ri-twitter-x-line text-lg"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <i className="ri-facebook-line text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-['Inter'] text-base font-medium tracking-wide text-white mb-5">Navigate</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/charts" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  Charts
                </Link>
              </li>
              <li>
                <Link to="/concerts" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  Concerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-['Inter'] text-base font-medium tracking-wide text-white mb-5">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link to="/about#contact" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-['Inter'] text-base font-medium tracking-wide text-white mb-5">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <i className="ri-mail-line text-zinc-500"></i>
                <a href="mailto:veritas.vi.help@gmail.com" className="font-['Inter'] text-zinc-400 hover:text-white transition-colors text-sm">
                  veritas.vi.help@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-phone-line text-zinc-500"></i>
                <span className="font-['Inter'] text-zinc-400 text-sm">+91 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-map-pin-line text-zinc-500"></i>
                <span className="font-['Inter'] text-zinc-400 text-sm">123 Music Street, Mumbai, MH 400001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-['Inter'] text-zinc-500 text-sm font-light">
              © 2025 Veritas VI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="font-['Inter'] text-zinc-500 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="font-['Inter'] text-zinc-500 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 