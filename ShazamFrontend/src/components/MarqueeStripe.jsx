import React from 'react';
import { motion } from 'framer-motion';
import { FaSpotify, FaReact } from 'react-icons/fa';
import { SiSpringboot } from 'react-icons/si';
import { BsSpeedometer, BsDatabase } from 'react-icons/bs';
import { SiRazorpay } from 'react-icons/si';

const MarqueeStripe = () => {
  const items = [
    {
      text: 'Veritas Engine v1.0',
      icon: <BsSpeedometer className="text-2xl" />
    },
    {
      text: 'Built with Spring Boot + React',
      icon: <><SiSpringboot className="text-2xl mr-2" /><FaReact className="text-2xl" /></>
    },
    {
      text: 'Spotify Integrated',
      icon: <FaSpotify className="text-2xl" />
    },
    {
      text: 'Powered by Razorpay',
      icon: <SiRazorpay className="text-2xl" />
    },
    {
      text: 'Secure ticket booking',
      icon: <BsDatabase className="text-2xl" />
    }
  ];

  const MarqueeContent = () => (
    <div className="flex shrink-0 items-center animate-marquee">
      {items.map((item, index) => (
        <div
          key={index}
          className="inline-flex items-center justify-center w-[320px] px-6 border-r border-zinc-800 h-16"
        >
          <div className="flex items-center gap-3 font-['Space_Grotesk'] text-zinc-200 whitespace-nowrap">
            {item.icon}
            <span className="text-lg">{item.text}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-black overflow-hidden py-6">
      <div className="relative flex overflow-x-hidden">
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  );
};

export default MarqueeStripe; 