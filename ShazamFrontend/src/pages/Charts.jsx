import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Charts = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'global');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'global', label: 'Global Top 50' },
    { id: 'india', label: 'India Top 50' },
    { id: 'punjabi', label: 'Top Punjabi Hits' },
    { id: 'viral', label: 'Viral Hits' }
  ];

  // Function to render ranking badge
  const renderRanking = (index) => {
    const rankNum = index + 1;
    
    if (rankNum <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black',
        2: 'bg-gradient-to-r from-gray-300 to-gray-400 text-black',
        3: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
      };
      
      return (
        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors[rankNum]} shadow-lg flex items-center justify-center transform -rotate-12 border-2 border-white/10`}>
          <span className="text-lg font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            #{rankNum}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-white/70 text-sm font-medium">{rankNum}</span>
      </div>
    );
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8080/api/charts/${activeTab}`);
        
        // Debug log to see the response structure
        console.log('API Response:', response.data);

        // If response.data is directly the array we need
        if (Array.isArray(response.data)) {
          setSongs(response.data);
        }
        // If response.data is the array wrapped in a property
        else if (response.data && typeof response.data === 'object') {
          // Try to find the array in the response
          const possibleArrays = Object.values(response.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            setSongs(possibleArrays[0]);
          } else {
            console.error('No array found in response:', response.data);
            setError('No chart data available');
            setSongs([]);
          }
        } else {
          console.error('Unexpected response format:', response.data);
          setError('No chart data available');
          setSongs([]);
        }
      } catch (err) {
        console.error('Chart data fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load chart data. Please try again later.');
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [activeTab]);

  // Validate song data before rendering
  const validateSong = (song) => {
    return {
      title: song.title || song.name || 'Unknown Title',
      artist: song.artist || (song.artists && song.artists[0]?.name) || 'Unknown Artist',
      image: song.image || song.albumArt || song.coverUrl || 'https://via.placeholder.com/160',
      spotifyLink: song.spotifyLink || song.externalUrl || song.url || '#'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="font-[ClashDisplay-Semibold] text-white text-5xl mb-4">Veritas Charts</h1>
          <p className="font-[Inter] text-white/70 text-lg">Discover what's trending in music right now</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/5 backdrop-blur-lg rounded-lg p-1 flex-wrap justify-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                } px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            // Loading State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-md"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            // Error State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                <i className="ri-error-warning-line text-3xl text-red-500"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Oops! Something went wrong</h3>
              <p className="text-white/70">{error}</p>
              <button
                onClick={() => setActiveTab(activeTab)}
                className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            // Songs Grid
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {songs.map((song, index) => {
                const validatedSong = validateSong(song);
                const isTopThree = index < 3;
                return (
                  <motion.div
                    key={validatedSong.title + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    className={`group ${isTopThree ? 'bg-white/10' : 'bg-white/5'} hover:bg-white/15 backdrop-blur-lg rounded-lg p-4 transition-all duration-300 relative overflow-hidden`}
                  >
                    {isTopThree && (
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-violet-500 via-transparent to-transparent pointer-events-none" />
                    )}
                    <div className="flex items-center gap-4">
                      {/* Ranking */}
                      {renderRanking(index)}
                      
                      {/* Album Art */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={validatedSong.image}
                          alt={validatedSong.title}
                          className={`w-full h-full object-cover rounded-md ${isTopThree ? 'ring-2 ring-white/20' : ''}`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <a
                            href={validatedSong.spotifyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:scale-110 transition-transform"
                          >
                            <i className="ri-spotify-fill text-2xl"></i>
                          </a>
                        </div>
                      </div>
                      
                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-white mb-1 line-clamp-1 ${isTopThree ? 'text-lg' : ''}`}>
                          {validatedSong.title}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-1">{validatedSong.artist}</p>
                        <a
                          href={validatedSong.spotifyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Listen on Spotify
                          <i className="ri-arrow-right-line"></i>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Charts; 