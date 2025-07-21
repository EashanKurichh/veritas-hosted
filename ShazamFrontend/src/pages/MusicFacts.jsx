import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const MusicFacts = () => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const facts = [
    {
      category: "Concert",
      fact: "The largest concert ever was Rod Stewart's 1994 New Year's Eve concert in Copacabana Beach, Rio de Janeiro, with 3.5 million attendees.",
      icon: "ri-group-line"
    },
    {
      category: "Artist",
      fact: "Michael Jackson's 'Thriller' album spent 37 non-consecutive weeks at number one on the Billboard 200, setting a record.",
      icon: "ri-album-line"
    },
    {
      category: "Concert",
      fact: "The longest concert ever was performed by a team of 8 pianists in 2009, lasting for 150 hours and 6 minutes.",
      icon: "ri-time-line"
    },
    {
      category: "Artist",
      fact: "Madonna holds the record for the highest-grossing tour by a female artist, with her Sticky & Sweet Tour earning $408 million.",
      icon: "ri-money-dollar-circle-line"
    },
    {
      category: "Concert",
      fact: "The most expensive concert ticket was for Desert Trip 2016, with VIP passes costing $1,599 per weekend.",
      icon: "ri-ticket-2-line"
    },
    {
      category: "Artist",
      fact: "Ed Sheeran's ÷ Tour is the highest-grossing tour of all time, earning over $776.2 million.",
      icon: "ri-fund-line"
    },
    {
      category: "Concert",
      fact: "The first major concert to be live-streamed on the internet was by the Rolling Stones in 1994.",
      icon: "ri-live-line"
    },
    {
      category: "Artist",
      fact: "Taylor Swift became the first artist to have four albums sell over 1 million copies in a week in the United States.",
      icon: "ri-record-circle-line"
    },
    {
      category: "Concert",
      fact: "The most viewed concert on YouTube was BTS's 'Bang Bang Con: The Live' with 756,000 concurrent viewers.",
      icon: "ri-youtube-line"
    },
    {
      category: "Artist",
      fact: "Elton John has charted at least one song on the UK Singles Chart in six different decades.",
      icon: "ri-medal-line"
    }
  ];

  const handleNextFact = () => {
    console.log('Button clicked!'); // Debug log
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * facts.length);
    } while (newIndex === currentFactIndex);
    setCurrentFactIndex(newIndex);
  };

  useEffect(() => {
    // Set initial random fact
    const randomIndex = Math.floor(Math.random() * facts.length);
    setCurrentFactIndex(randomIndex);
  }, []);

  const currentFact = facts[currentFactIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-[ClashDisplay-Semibold] text-white mb-6">Music Facts</h1>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto font-[Inter]">
            Discover fascinating facts about music artists and concerts.
          </p>
        </div>

        {/* Fact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/10 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-transparent to-transparent" />
            <div className="w-full h-full" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M0 0h20L0 20z"/%3E%3C/g%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFactIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <span className="px-4 py-1 bg-violet-500/10 text-violet-400 rounded-full text-sm font-medium">
                  {currentFact.category}
                </span>
                <i className={`${currentFact.icon} text-violet-400 text-xl`}></i>
              </div>
              
              <p className="text-xl md:text-2xl text-white font-[Inter] leading-relaxed">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center z-15">
            <button
              type="button"
              onClick={handleNextFact}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer active:transform active:scale-95 select-none z-50"
            >
              <i className="ri-refresh-line"></i>
              Show Another Fact
            </button>
          </div>
        </motion.div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-zinc-400 text-sm">
            Want to learn more about music? Check out our{' '}
            <a href="/charts" className="text-violet-400 hover:text-violet-300 transition-colors">
              music charts
            </a>
            {' '}and{' '}
            <a href="/concerts" className="text-violet-400 hover:text-violet-300 transition-colors">
              upcoming concerts
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicFacts; 