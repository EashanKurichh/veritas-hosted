import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Global200 = () => {
  const navigate = useNavigate();

  const handleVideoClick = () => {
    navigate('/charts', { state: { activeTab: 'global' } });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-zinc-900 to-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="font-['Space_Grotesk'] text-zinc-300 text-sm tracking-[0.2em] uppercase mb-4">
            Global Top 50
          </h3>
          <h2 className="font-['Space_Grotesk'] text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            Top songs being<br />discovered around the world
          </h2>
          <p className="font-['Inter'] text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-12">
            See who made it on the list of the top 50 songs worldwide on Veritas VI
          </p>
          
          <div 
            onClick={handleVideoClick}
            className="block group relative w-full aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden cursor-pointer"
            aria-label="View Global Top 50 Charts"
          >
            {/* Video Container */}
            <div className="w-full h-full">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/Global.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Bottom Info Box - Fades out on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent group-hover:opacity-0 transition-opacity duration-500 ease-in-out">
              <div className="flex items-center gap-4">
                <img 
                  src="/GlobalAlbumArt.png" 
                  alt="Global Top 50 Album Art" 
                  className="w-19 h-19 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-['Space_Grotesk'] text-zinc-300 text-base tracking-wider uppercase mb-1 -ml-164.5 font-bold">
                    Global Top 50 Chart
                  </h4>
                  <p className="font-['Inter'] text-white/80 text-sm leading-snug max-w-lg">
                    Featuring songs from Alex Warren, Eminem, Lola Young, Doechii and more
                  </p>
                </div>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-500 ease-in-out">
            </div>

            {/* View Chart Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
              <span className="font-['Space_Grotesk'] text-white text-xl sm:text-2xl font-bold tracking-wider uppercase py-3 px-8 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                View Chart
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Global200; 