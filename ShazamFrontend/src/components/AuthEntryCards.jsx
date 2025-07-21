import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AuthEntryCards = () => {
  const navigate = useNavigate();

  // Animation variants for text overlay
  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  // Staggered text animation for each word
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const Card = ({ type, route }) => (
    <motion.div
      className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden cursor-pointer mx-auto backdrop-blur-[1px] bg-white/5"
      whileHover={{ scale: 0.98 }}
      onClick={() => navigate(route)}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Background Image Container */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4 }}
      >
        <div 
          className="w-full h-full transform scale-105"
          style={{
            backgroundImage: `url(/${type === 'SIGN UP' ? 'signupPic.png' : 'signinPic.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Dark overlay with backdrop blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </motion.div>

      {/* Card Border Glow */}
      <div className="absolute inset-0 rounded-xl border border-white/10" />

      {/* Text Overlay Container */}
      <motion.div
        className="relative z-10 h-full flex items-center justify-center"
        initial="hidden"
        whileHover="visible"
      >
        <motion.div
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          {type.split(' ').map((word, index) => (
            <motion.span
              key={index}
              variants={textVariants}
              className="font-['Inter'] text-5xl sm:text-6xl font-bold tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.7)]"
              style={{ 
                letterSpacing: '-0.02em',
                background: type === 'SIGN UP' 
                  ? 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
                  : 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-zinc-900 to-black py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-['Inter'] text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
            Get Started With Your Account
          </h2>
          <p className="font-['Inter'] text-zinc-300 text-lg font-light">
            Join our community or sign in to your existing account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card type="SIGN UP" route="/signup" />
          <Card type="SIGN IN" route="/signin" />
        </div>
      </div>
    </div>
  );
};

export default AuthEntryCards; 