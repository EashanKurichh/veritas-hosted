import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ChartBox = ({ title, subtitle, description, buttonText }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/charts', { state: { activeTab: 'viral' } });
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='relative w-full aspect-[3/1] my-12 rounded-2xl overflow-hidden backdrop-blur-lg bg-black/20 border border-white/10'>
        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40'></div>
        
        <img 
          src="./waves.png" 
          alt="Waves Background" 
          className='absolute top-0 left-0 w-full h-full object-cover opacity-80'
        />
        <div className='absolute inset-0 bg-black/30 backdrop-blur-[2px]'></div>
        
        {/* Logo */}
        <img 
          src="./logo.png"
          alt="Logo"
          className='absolute top-6 right-6 w-25 h-18 object-contain'
        />

        {/* Content Container */}
        <div className='absolute inset-0 flex flex-col items-center justify-center px-16 text-center'>
          <h3 className='font-[ClashDisplay-Medium] text-white/70 text-3xl mb-2 tracking-tight'>{subtitle}</h3>
          <h2 className='font-[ClashDisplay-Semibold] text-white text-6xl font-bold mb-4 tracking-tighter'>{title}</h2>
          <p className='font-[Inter] text-white/80 text-lg max-w-2xl mb-8 leading-relaxed'>
            {description}
          </p>
          
          {/* Button */}
          <button 
            onClick={handleClick}
            className='font-[ClashDisplay-Medium] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 text-lg tracking-wide'
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartBox; 