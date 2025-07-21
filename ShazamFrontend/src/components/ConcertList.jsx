import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useConcerts } from '../context/ConcertContext';
import { toast } from 'react-hot-toast';

// Placeholder images in case the artist images are not available
const placeholderImages = {
  'taylor-swift': 'https://placehold.co/600x800/9C27B0/FFFFFF?text=Taylor+Swift',
  'the-weeknd': 'https://placehold.co/600x800/E91E63/FFFFFF?text=The+Weeknd',
  'beyonce': 'https://placehold.co/600x800/FF9800/FFFFFF?text=Beyoncé',
};

const ConcertList = () => {
  const { concerts } = useConcerts();
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [hoveredConcert, setHoveredConcert] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  // Update selected concert when concerts change or on initial load
  useEffect(() => {
    if (concerts.length > 0 && !selectedConcert) {
      setSelectedConcert(concerts[0]);
    }
  }, [concerts, selectedConcert]);

  const handleImageError = (slug) => {
    setImageErrors(prev => ({ ...prev, [slug]: true }));
  };

  const getImageSrc = (concert) => {
    if (imageErrors[concert.slug]) {
      return placeholderImages[concert.slug] || `https://placehold.co/600x800/374151/FFFFFF?text=${concert.name}`;
    }
    return concert.image;
  };

  const handleTicketClick = (e, ticketLink) => {
    e.preventDefault();
    if (!ticketLink) {
      toast.error('Tickets are not available for this concert yet.');
      return;
    }

    // If it's an internal booking URL (starts with /book-ticket/)
    if (ticketLink.startsWith('/book-ticket/')) {
      navigate(ticketLink);
    } else if (ticketLink.startsWith('http')) {
      // For external URLs (like Ticketmaster)
      window.open(ticketLink, '_blank');
    } else {
      toast.error('Invalid ticket link format');
    }
  };

  if (!selectedConcert) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="font-['Inter'] text-4xl font-semibold mb-12">No Concerts Available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-['Inter'] text-4xl font-semibold mb-12">Upcoming Concerts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side - Artist List */}
          <div className="md:col-span-1 relative">
            <div className="bg-zinc-900/50 rounded-lg overflow-hidden">
              <h3 className="font-['Inter'] text-lg font-medium p-6 text-zinc-400 border-b border-zinc-800/50">Artists</h3>
              <div className="relative">
                {/* Top Fade */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-900/50 to-transparent z-10" />
                
                {/* Scrollable Content */}
                <div className="max-h-[calc(70vh-5rem)] overflow-y-auto scrollbar-hide">
                  <div className="space-y-2 p-4">
                    {concerts.map((concert) => (
                      <motion.div
                        key={concert.id}
                        className={`cursor-pointer p-4 rounded-lg transition-all ${
                          selectedConcert.id === concert.id 
                            ? 'bg-zinc-800 shadow-lg shadow-black/20' 
                            : 'hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setSelectedConcert(concert)}
                        onHoverStart={() => setHoveredConcert(concert.id)}
                        onHoverEnd={() => setHoveredConcert(null)}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h4 className="font-['Inter'] text-xl font-medium">{concert.name}</h4>
                        <p className="font-['Inter'] text-sm text-zinc-400 mt-1">{concert.venue}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900/50 to-transparent z-10" />
              </div>
            </div>
          </div>

          {/* Right Side - Concert Details */}
          <div className="md:col-span-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedConcert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg h-[70vh] p-8 overflow-hidden relative ${
                  hoveredConcert === selectedConcert.id
                    ? `bg-gradient-to-r ${selectedConcert.gradient[0]} ${selectedConcert.gradient[1]}`
                    : 'bg-zinc-900/50'
                }`}
              >
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center justify-between">
                      <motion.h3 
                        className="font-['Inter'] text-3xl font-bold"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {selectedConcert.name}
                      </motion.h3>
                    </div>
                    <motion.div 
                      className="mt-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="font-['Inter'] text-lg text-white/90 mb-2">{selectedConcert.shortDescription}</p>
                      <p className="font-['Inter'] text-white/70 leading-relaxed mt-6">
                        {selectedConcert.description}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-8 grid grid-cols-3 gap-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg">
                        <p className="font-['Inter'] text-sm text-zinc-400">Date</p>
                        <p className="font-['Inter'] font-medium">
                          {new Date(selectedConcert.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg">
                        <p className="font-['Inter'] text-sm text-zinc-400">Time</p>
                        <p className="font-['Inter'] font-medium">{selectedConcert.time}</p>
                      </div>
                      <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg">
                        <p className="font-['Inter'] text-sm text-zinc-400">Venue</p>
                        <p className="font-['Inter'] font-medium">{selectedConcert.venue}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Section - Buttons */}
                  <div className="mt-auto flex items-center justify-between">
                    <Link 
                      to={`/concerts/${selectedConcert.slug}`}
                      className="font-['Inter'] underline text-white/70 hover:text-white transition-colors"
                    >
                      View details
                    </Link>
                    <motion.button
                      onClick={(e) => handleTicketClick(e, selectedConcert.ticketLink)}
                      className="font-['Inter'] px-8 py-3 bg-white text-black rounded-full font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buy Tickets
                    </motion.button>
                  </div>
                </div>

                {/* Background Image */}
                <AnimatePresence>
                  {hoveredConcert === selectedConcert.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 z-0"
                    >
                      <img
                        src={getImageSrc(selectedConcert)}
                        alt={selectedConcert.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(selectedConcert.slug)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertList; 