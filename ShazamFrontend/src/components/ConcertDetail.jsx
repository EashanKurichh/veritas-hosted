import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConcerts } from '../context/ConcertContext';
import { toast } from 'react-hot-toast';

// Placeholder images in case the artist images are not available
const placeholderImages = {
  'taylor-swift': 'https://placehold.co/1200x800/9C27B0/FFFFFF?text=Taylor+Swift',
  'the-weeknd': 'https://placehold.co/1200x800/E91E63/FFFFFF?text=The+Weeknd',
  'beyonce': 'https://placehold.co/1200x800/FF9800/FFFFFF?text=Beyoncé',
};

const ConcertDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { getConcertBySlug } = useConcerts();
  const concert = getConcertBySlug(slug);

  if (!concert) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="font-['Inter'] text-3xl font-semibold mb-4">Concert Not Found</h2>
          <p className="font-['Inter'] text-zinc-400 mb-8">We couldn't find the concert you're looking for.</p>
          <button
            onClick={() => navigate('/concerts')}
            className="font-['Inter'] px-6 py-3 bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
          >
            Back to Concerts
          </button>
        </div>
      </div>
    );
  }

  const getImageSrc = () => {
    if (imageError) {
      return placeholderImages[concert.slug] || `https://placehold.co/1200x800/374151/FFFFFF?text=${concert.name}`;
    }
    return concert.image;
  };

  const handleTicketClick = (e) => {
    e.preventDefault();
    if (!concert.ticketLink) {
      toast.error('Tickets are not available for this concert yet.');
      return;
    }

    // If it's an internal booking URL (starts with /book-ticket/)
    if (concert.ticketLink.startsWith('/book-ticket/')) {
      navigate(concert.ticketLink);
    } else if (concert.ticketLink.startsWith('http')) {
      // For external URLs (like Ticketmaster)
      window.open(concert.ticketLink, '_blank');
    } else {
      toast.error('Invalid ticket link format');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getImageSrc()}
            alt={concert.name}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-['Inter'] text-5xl font-bold mb-4">{concert.name}</h1>
            <p className="font-['Inter'] text-xl text-zinc-300">{concert.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/concerts" className="font-['Inter'] text-zinc-400 hover:text-white flex items-center gap-2">
              <i className="ri-arrow-left-line"></i> All Concerts
            </Link>
            <motion.button
              onClick={handleTicketClick}
              className="font-['Inter'] px-6 py-2 bg-white text-black rounded-full text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Tickets
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="font-['Inter'] text-3xl font-semibold mb-6">About the Concert</h2>
            <p className="font-['Inter'] text-zinc-300 leading-relaxed mb-12">
              {concert.description}
            </p>
            
            <h3 className="font-['Inter'] text-xl font-medium mb-6">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-violet-600/20 p-3 rounded-lg">
                    <i className="ri-calendar-line text-xl text-violet-500"></i>
                  </div>
                  <div>
                    <p className="font-['Inter'] text-zinc-400 text-sm">Date</p>
                    <p className="font-['Inter'] font-medium">
                      {new Date(concert.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-violet-600/20 p-3 rounded-lg">
                    <i className="ri-time-line text-xl text-violet-500"></i>
                  </div>
                  <div>
                    <p className="font-['Inter'] text-zinc-400 text-sm">Time</p>
                    <p className="font-['Inter'] font-medium">{concert.time}</p>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-violet-600/20 p-3 rounded-lg">
                    <i className="ri-map-pin-line text-xl text-violet-500"></i>
                  </div>
                  <div>
                    <p className="font-['Inter'] text-zinc-400 text-sm">Venue</p>
                    <p className="font-['Inter'] font-medium">{concert.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artists Section */}
            <h3 className="font-['Inter'] text-xl font-medium mb-6">Featured Artists</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {concert.artists.split(',').map((artist, index) => (
                <div key={index} className="bg-zinc-900 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-violet-600/20 p-3 rounded-lg">
                      <i className="ri-mic-line text-xl text-violet-500"></i>
                    </div>
                    <div>
                      <p className="font-['Inter'] font-medium">{artist.trim()}</p>
                      <p className="font-['Inter'] text-sm text-zinc-400">Performing Artist</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900 rounded-xl p-8 top-24">
              <h3 className="font-['Inter'] text-xl font-semibold mb-6">Get Your Tickets</h3>
              <motion.button
                onClick={handleTicketClick}
                className="w-full bg-white text-black rounded-lg py-3 font-medium mb-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book Now
              </motion.button>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400">
                  <i className="ri-calendar-check-line"></i>
                  <span className="font-['Inter'] text-sm">
                    {new Date(concert.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <i className="ri-time-line"></i>
                  <span className="font-['Inter'] text-sm">{concert.time}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <i className="ri-map-pin-line"></i>
                  <span className="font-['Inter'] text-sm">{concert.venue}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-zinc-900 rounded-xl p-8">
              <h3 className="font-['Inter'] text-xl font-semibold mb-4">Share Event</h3>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    const concertUrl = `${window.location.origin}/concerts/${concert.slug}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(concertUrl)}`, '_blank');
                  }}
                  className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <i className="ri-facebook-fill text-lg"></i>
                </button>
                <button 
                  onClick={() => {
                    const concertUrl = `${window.location.origin}/concerts/${concert.slug}`;
                    const text = `Check out this amazing concert: ${concert.name}!`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(concertUrl)}`, '_blank');
                  }}
                  className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                  aria-label="Share on X (Twitter)"
                >
                  <i className="ri-twitter-x-fill text-lg"></i>
                </button>
                <button 
                  onClick={() => {
                    const concertUrl = `${window.location.origin}/concerts/${concert.slug}`;
                    navigator.clipboard.writeText(concertUrl)
                      .then(() => {
                        toast.success('Link copied!', {
                          duration: 2000,
                          position: 'bottom-center'
                        });
                      })
                      .catch(() => {
                        toast.error('Failed to copy link');
                      });
                  }}
                  className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                  aria-label="Copy link"
                >
                  <i className="ri-link text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertDetail; 