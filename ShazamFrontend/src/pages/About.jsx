import React from 'react';
import { FaSpotify } from 'react-icons/fa';
import { BsShieldCheck, BsCreditCard2Front } from 'react-icons/bs';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-[ClashDisplay-Semibold] text-white mb-6">About Veritas VI</h1>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto font-[Inter]">
            Revolutionizing the way you experience live music through seamless concert booking and real-time music trends.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-24">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-[ClashDisplay-Medium] text-white mb-6">Our Mission</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              At Veritas VI, we're passionate about bringing music lovers closer to their favorite artists. 
              Our platform combines cutting-edge technology with a user-friendly interface to make concert 
              ticket booking effortless while keeping you updated with the latest music trends.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8">
            <FaSpotify className="w-10 h-10 text-violet-400 mb-6" />
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-4">Real-Time Charts</h3>
            <p className="text-zinc-300">
              Stay updated with the latest music trends through our integration with Spotify's official charts.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8">
            <BsCreditCard2Front className="w-10 h-10 text-violet-400 mb-6" />
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-4">Secure Payments</h3>
            <p className="text-zinc-300">
              Book tickets with confidence using our secure payment gateway powered by Razorpay.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8">
            <BsShieldCheck className="w-10 h-10 text-violet-400 mb-6" />
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-4">Verified Events</h3>
            <p className="text-zinc-300">
              All concerts and events on our platform are verified and backed by our guarantee.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-[ClashDisplay-Medium] text-white mb-6">Get in Touch</h2>
          <p className="text-zinc-300 mb-8">
            Have questions or need assistance? We're here to help!
          </p>
          <a 
            href="mailto:veritas.vi.help@gmail.com"
            className="inline-flex items-center px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg text-lg font-medium transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default About; 