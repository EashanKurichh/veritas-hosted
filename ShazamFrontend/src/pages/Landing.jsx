import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import ChartBox from '../components/ChartBox';
import MarqueeStripe from '../components/MarqueeStripe';
import Global200 from '../components/Global200';
import GooglyEyes from '../components/GooglyEyes';
import AuthEntryCards from '../components/AuthEntryCards';
import ConcertList from '../components/ConcertList';
import Footer from '../components/Footer';

const useAnimations = () => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Reset transforms first
    gsap.set(".main", { rotate: -10, scale: 1.7 });
    gsap.set(".sky", { scale: 1.2 });
    gsap.set(".buildings", { scale: 1.8, rotate: -4 });
    gsap.set(".text", { scale: 1.4, rotate: -10 });
    gsap.set(".girl", { scale: 2, rotate: -20, bottom: "120%" });

    // Create timeline for animations
    const tl = gsap.timeline();

    tl.to(".main", {
      scale: 1,
      rotate: 0,
      duration: 0.7,
      ease: "Expo.easeInOut",
    })
    .to(".sky", {
      scale: 1.2,
      rotate: 0,
      duration: 0.7,
      ease: "Expo.easeInOut",
    }, "-=0.6")
    .to(".buildings", {
      scale: 1.1,
      rotate: 0,
      duration: 0.5,
      ease: "Expo.easeInOut",
    }, "-=0.6")
    .to(".text", {
      scale: 1,
      rotate: 0,
      duration: 0.4,
      ease: "Expo.easeInOut",
    }, "-=0.6")
    .to(".girl", {
      scale: 0.5,
      x: "-50%",
      bottom: 0,
      rotate: 0,
      duration: 0.4,
      ease: "Expo.easeInOut",
    }, "-=0.6");

    setHasAnimated(true);

    // Mouse move effect
    const main = document.querySelector(".main");
    const handleMouseMove = (e) => {
      if (!main) return;
      const xMove = (e.clientX / window.innerWidth - 0.5) * 40;
      gsap.to(".main .text", {
        x: `${xMove * 0.4}%`,
        duration: 0.15,
      });
      gsap.to(".main .sky", {
        x: xMove,
        duration: 0.15,
      });
      gsap.to(".main .buildings", {
        x: xMove * 1.3,
        duration: 0.15,
      });
    };

    main?.addEventListener("mousemove", handleMouseMove);

    return () => {
      main?.removeEventListener("mousemove", handleMouseMove);
      tl.kill();
    };
  }, []); // Empty dependency array means this runs once on mount

  return hasAnimated;
};

const Landing = () => {
  const hasAnimated = useAnimations();

  return (
    <div className='w-full'>
      <div className='main w-full h-screen overflow-hidden bg-black'>
        <div className='landing overflow-hidden relative w-full h-screen'>
          <div className='imagesdiv relative w-full h-screen overflow-hidden'>
            <img className='sky absolute top-0 left-0 w-full h-full object-cover origin-top' src="./clouds.png" alt="" />
            <img className='buildings absolute top-0 left-0 w-full h-full object-cover' src="./buildings.png" alt="" />
            <div className='text text-white flex flex-col gap-3 absolute top-30 left-1/2 -translate-x-1/2'>
              <h1 className='text-8xl ml-65 leading-none'>Veritas</h1>
              <h1 className='text-8xl ml-20 leading-none'>in</h1>
              <h1 className='text-8xl ml-95 leading-none'>Sound</h1>
            </div>
            <img className='girl absolute left-1/2 origin-bottom object-fit' src="face2.png" alt="" />
          </div>
          <div className='btmbar text-white absolute bottom-0 left-0 w-full py-10 px-10 bg-gradient-to-t from-black to-transparent'>
            <div className='flex items-center gap-4'>
              <i className="ri-corner-left-down-fill mt-1"></i>
              <h3 className='font-[Helvetica_Now_Display] text-2xl'>Scroll Down</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Stripe */}
      <MarqueeStripe />

      {/* Test Section */}
      <div className='min-h-screen w-full bg-gradient-to-b from-black via-zinc-900 to-black'>
        <div className='max-w-7xl mx-auto pt-20 px-8'>
          <ChartBox 
            subtitle="Veritas VI"
            title="Viral Charts"
            description="The fastest-growing songs this week, as discovered on screens and socials."
            buttonText="See the Charts"
            buttonLink="/charts"
          />
        </div>
      </div>

      {/* Global 200 Section */}
      <Global200 />

      {/* Googly Eyes Section */}
      <div className="w-full h-screen overflow-hidden">
        <GooglyEyes />
      </div>
      {/* Auth Entry Cards Section */}
      <AuthEntryCards />

      {/* Concert List Section */}
      <ConcertList />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing; 