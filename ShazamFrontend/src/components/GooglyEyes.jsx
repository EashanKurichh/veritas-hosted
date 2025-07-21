import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GooglyEyes = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for eye movement
  const eyeX = useSpring(mouseX, { stiffness: 100, damping: 25 });
  const eyeY = useSpring(mouseY, { stiffness: 100, damping: 25 });

  // More reactive spring for pupil
  const pupilX = useSpring(mouseX, { stiffness: 400, damping: 15 });
  const pupilY = useSpring(mouseY, { stiffness: 400, damping: 15 });

  // Transform ranges for movement
  const eyeXRange = useTransform(eyeX, [-800, 800], [-15, 15]);
  const eyeYRange = useTransform(eyeY, [-800, 800], [-15, 15]);
  const pupilXRange = useTransform(pupilX, [-800, 800], [-30, 30]);
  const pupilYRange = useTransform(pupilY, [-800, 800], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const Eye = ({ side, text }) => (
    <motion.div
      className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-white relative overflow-hidden"
        style={{ x: eyeXRange, y: eyeYRange }}
      >
        <span className="font-['Space_Grotesk'] text-xl font-bold tracking-[0.2em] z-10 mix-blend-difference">
          {text}
        </span>
        
        <motion.div
          className="absolute w-8 h-8 bg-white rounded-full"
          style={{ 
            x: pupilXRange,
            y: pupilYRange,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden cursor-pointer"
      onClick={() => navigate('/music-facts')}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/GreenWaves.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <div className="text-center mb-20">
          <h3 className="font-['Space_Grotesk'] text-zinc-300 text-sm tracking-[0.3em] uppercase mb-3">
            Did you know?
          </h3>
          <h2 className="font-['Space_Grotesk'] text-white text-4xl sm:text-5xl font-bold leading-tight max-w-3xl">
            Discover facts you didn't know you needed.
          </h2>
        </div>

        <div className="flex items-center justify-center gap-20">
          <Eye side="left" text="FUN" />
          <Eye side="right" text="FACTS" />
        </div>
      </div>
    </motion.div>
  );
};

export default GooglyEyes; 